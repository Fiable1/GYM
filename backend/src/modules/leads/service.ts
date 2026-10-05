import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JoinRequest, JOIN_REQUEST_STATUS } from '../../entities/leads.entities';
import { Member } from '../../entities/member.entities';
import { User } from '../../entities/user.entity';
import { Tenant } from '../../entities/core.entities';
import { PageQuery } from '../../common/services';
import { LeadMessagingService } from './messaging.service';
import { AuditService } from '../../common/services';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(JoinRequest) private readonly leadRepo: Repository<JoinRequest>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Member) private readonly memberRepo: Repository<Member>,
    @InjectRepository(Tenant) private readonly tenantRepo: Repository<Tenant>,
    private readonly messaging: LeadMessagingService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Public entry point used by the join form. No auth required.
   * Resolves the tenant, stores the request, alerts staff, and confirms to the visitor.
   */
  async submitPublic(body: {
    name?: string;
    email?: string;
    phone?: string;
    plan?: string;
    goal?: string;
    source?: string;
  }) {
    const name = (body.name || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    const phone = (body.phone || '').trim();

    if (name.length < 2) throw new BadRequestException('Please provide your full name');
    if (!EMAIL_RE.test(email)) throw new BadRequestException('Please provide a valid email address');
    if (phone.length < 6) throw new BadRequestException('Please provide a contact number');

    const tenantId = await this.resolveTenantId();

    const existing = await this.leadRepo.findOne({
      where: { tenantId, email, status: JOIN_REQUEST_STATUS.NEW } as any,
    });
    if (existing) {
      return {
        id: existing.id,
        status: existing.status,
        duplicate: true,
        message: 'You are already on our list. We will be in touch shortly.',
      };
    }

    const lead = await this.leadRepo.save(
      this.leadRepo.create({
        tenantId,
        name,
        email,
        phone: phone || undefined,
        plan: body.plan || 'Forge',
        goal: body.goal || '',
        status: JOIN_REQUEST_STATUS.NEW,
        source: body.source || 'website',
      }),
    );

    // Staff alert. Never let a mail failure surface as a failed submission.
    const staffResults = await this.messaging
      .notifyStaffOfNewRequest(tenantId, lead)
      .catch(() => []);

    // Confirmation to the address the visitor supplied.
    const prospect = await this.messaging
      .notifyProspect(tenantId, lead.id, lead.email, { name: lead.name, plan: lead.plan }, 'received')
      .catch(() => null);

    return {
      id: lead.id,
      status: lead.status,
      emailConfirmed: !!prospect?.email?.delivered,
      staffNotified: staffResults.length,
      message: 'Request received',
    };
  }

  async findAll(tenantId: string, q: PageQuery, filters: { status?: string; search?: string }) {
    const qb = this.leadRepo.createQueryBuilder('l');
    qb.where('l.tenantId = :t', { t: tenantId });
    qb.andWhere('l.deletedAt IS NULL');

    if (filters.status) {
      qb.andWhere('l.status = :s', { s: filters.status });
    }
    if (filters.search) {
      qb.andWhere('(l.name LIKE :q OR l.email LIKE :q OR l.phone LIKE :q)', { q: `%${filters.search}%` });
    }

    const total = await qb.getCount();
    qb.orderBy(filters.status === JOIN_REQUEST_STATUS.NEW ? 'l.createdAt' : `l.${q.sortBy || 'createdAt'}`, q.sortDir);
    qb.skip((q.page - 1) * q.limit).take(q.limit);

    const items = await qb.getMany();
    return {
      items,
      total,
      page: q.page,
      limit: q.limit,
      totalPages: Math.ceil(total / q.limit) || 1,
    };
  }

  async counts(tenantId: string) {
    const rows = await this.leadRepo
      .createQueryBuilder('l')
      .select('l.status', 'status')
      .addSelect('COUNT(1)', 'count')
      .where('l.tenantId = :t', { t: tenantId })
      .andWhere('l.deletedAt IS NULL')
      .groupBy('l.status')
      .getRawMany();

    const base: Record<string, number> = {
      NEW: 0, APPROVED: 0, REJECTED: 0, CONVERTED: 0,
    };
    for (const r of rows) base[r.status] = Number(r.count);
    return base;
  }

  async findOne(tenantId: string, id: string) {
    const lead = await this.leadRepo.findOne({ where: { id, tenantId } as any });
    if (!lead) throw new NotFoundException('Join request not found');
    return lead;
  }

  /**
   * Staff review. Approving optionally provisions a real Member + login so the
   * prospect can use the app, and emails them the outcome either way.
   */
  async review(
    tenantId: string,
    id: string,
    decision: 'APPROVED' | 'REJECTED',
    actorId: string,
    opts: { staffNote?: string; createAccount?: boolean } = {},
  ) {
    const lead = await this.findOne(tenantId, id);
    if (lead.status !== JOIN_REQUEST_STATUS.NEW) {
      throw new BadRequestException(`Request already ${lead.status.toLowerCase()}`);
    }

    lead.status = decision;
    lead.staffNote = opts.staffNote || lead.staffNote;
    lead.reviewedBy = actorId;
    lead.reviewedAt = new Date();

    if (decision === 'APPROVED' && opts.createAccount) {
      const created = await this.provisionMember(tenantId, lead);
      lead.memberId = created.memberId;
      lead.status = JOIN_REQUEST_STATUS.CONVERTED;
    }

    const saved = await this.leadRepo.save(lead);

    const email = await this.messaging
      .notifyProspect(
        tenantId,
        saved.id,
        saved.email,
        { name: saved.name, plan: saved.plan },
        decision === 'APPROVED' ? 'approved' : 'rejected',
        opts.staffNote,
      )
      .catch(() => null);

    await this.audit.log(
      { tenantId, actorId },
      'JoinRequest',
      saved.id,
      decision,
      null,
      { status: saved.status, staffNote: saved.staffNote, memberId: saved.memberId },
    );

    return {
      ...saved,
      emailDelivered: !!email?.email?.delivered,
    };
  }

  private async provisionMember(tenantId: string, lead: JoinRequest) {
    const existingUser = await this.userRepo.findOne({ where: { email: lead.email } as any });
    if (existingUser) {
      const existingMember = await this.memberRepo.findOne({ where: { userId: existingUser.id } as any });
      if (existingMember) return { memberId: existingMember.id, userId: existingUser.id, reused: true };
    }

    const [firstName, ...rest] = lead.name.split(/\s+/);
    const lastName = rest.join(' ');

    const user = await this.userRepo.save(
      this.userRepo.create({
        tenantId,
        firstName,
        lastName: lastName || undefined,
        email: lead.email,
        phone: lead.phone,
        password: await bcrypt.hash(`PulseForge@${Math.floor(100000 + Math.random() * 899999)}`, 10),
        role: 'MEMBER',
        language: 'en',
        isActive: true,
      }),
    );

    const member = await this.memberRepo.save(
      this.memberRepo.create({
        tenantId,
        userId: user.id,
        goals: lead.goal || undefined,
        status: 'ACTIVE',
        totalVisits: 0,
      }),
    );

    return { memberId: member.id, userId: user.id, reused: false };
  }

  async resolveTenantId(): Promise<string> {
    if (process.env.PUBLIC_TENANT_ID) return process.env.PUBLIC_TENANT_ID;

    const tenant = await this.tenantRepo.findOne({
      where: { isActive: true, deletedAt: null },
      order: { createdAt: 'ASC' },
    });
    if (!tenant) throw new BadRequestException('No active tenant is configured');
    return tenant.id;
  }
}