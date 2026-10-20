import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Member, MembershipPlan, Membership, Waiver, MemberNote, MemberGoal } from '../../entities/member.entities';
import { User } from '../../entities/user.entity';
import { ApiBaseService, AuditService } from '../../common/services';
import { PageQuery } from '../../common/services';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member) private readonly memberRepo: Repository<Member>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly audit: AuditService,
  ) {}

  private async attachUser(member: any) {
    if (!member) return member;
    const user = await this.userRepo.findOne({ where: { id: member.userId } });
    return {
      ...member,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      phone: user?.phone,
      isActive: user?.isActive,
      user,
    };
  }

  async findAll(ctx: { tenantId: string }, q: PageQuery, extraFilters: any = {}) {
    const qb = this.memberRepo.createQueryBuilder('e');
    qb.where({ tenantId: ctx.tenantId, ...extraFilters } as any);
    qb.andWhere('e.deletedAt IS NULL');
    if (q.search) {
      qb.andWhere(`(CAST(e.id AS TEXT) LIKE :q)`, { q: `%${q.search}%` });
    }
    const total = await qb.getCount();
    if (q.sortBy) qb.orderBy(`e.${q.sortBy}`, q.sortDir);
    else qb.orderBy('e.createdAt', 'DESC');
    qb.skip((q.page - 1) * q.limit).take(q.limit);
    const items = await qb.getMany();

    const users = await this.userRepo.find({ where: { id: In(items.map((m: any) => m.userId)) } as any });
    const userMap = new Map(users.map((u: any) => [u.id, u]));
    const enriched = items.map((m: any) => {
      const u = userMap.get(m.userId);
      return {
        ...m,
        firstName: u?.firstName,
        lastName: u?.lastName,
        email: u?.email,
        phone: u?.phone,
        isActive: u?.isActive,
      };
    });

    return { items: enriched, total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) || 1 };
  }

  async findOne(ctx: { tenantId: string }, id: string) {
    const member = await this.memberRepo.findOne({ where: { id, tenantId: ctx.tenantId } as any });
    if (!member) throw new NotFoundException('Member not found');
    return this.attachUser(member);
  }

  async create(ctx: { tenantId: string; actorId?: string }, dto: any, entityName: string) {
    if (!dto.email) throw new BadRequestException('Email is required');
    const existing = await this.userRepo.findOne({ where: { email: dto.email.toLowerCase().trim() } as any });
    if (existing) throw new BadRequestException('Email already registered');

    const password = dto.password || 'Member@123';
    const user = await this.userRepo.save(this.userRepo.create({
      tenantId: ctx.tenantId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email.toLowerCase().trim(),
      phone: dto.phone,
      password: await bcrypt.hash(password, 10),
      role: 'MEMBER',
      language: 'en',
      isActive: true,
      createdBy: ctx.actorId,
    } as any)) as any;

    const member = await this.memberRepo.save(this.memberRepo.create({
      tenantId: ctx.tenantId,
      userId: user.id,
      status: dto.status || 'ACTIVE',
      totalVisits: 0,
      goals: dto.goals,
      createdBy: ctx.actorId,
    } as any)) as any;

    await this.audit.log(ctx, entityName, member.id, 'CREATE', null, dto);
    return this.attachUser(member);
  }

  async update(ctx: { tenantId: string; actorId?: string }, id: string, dto: any, entityName: string) {
    const member = await this.memberRepo.findOne({ where: { id, tenantId: ctx.tenantId } as any });
    if (!member) throw new NotFoundException('Member not found');

    const oldValues = { ...member };
    if (dto.status !== undefined) member.status = dto.status;
    if (dto.totalVisits !== undefined) member.totalVisits = dto.totalVisits;
    if (dto.goals !== undefined) member.goals = dto.goals;
    const savedMember = await this.memberRepo.save(member);

    const user = await this.userRepo.findOne({ where: { id: member.userId } as any });
    if (user) {
      if (dto.firstName !== undefined) user.firstName = dto.firstName;
      if (dto.lastName !== undefined) user.lastName = dto.lastName;
      if (dto.email !== undefined) user.email = dto.email.toLowerCase().trim();
      if (dto.phone !== undefined) user.phone = dto.phone;
      if (dto.isActive !== undefined) user.isActive = dto.isActive;
      await this.userRepo.save(user);
    }

    await this.audit.log(ctx, entityName, id, 'UPDATE', oldValues, dto);
    return this.attachUser(savedMember);
  }

  async remove(ctx: { tenantId: string; actorId?: string }, id: string, entityName: string) {
    const member = await this.memberRepo.findOne({ where: { id, tenantId: ctx.tenantId } as any });
    if (!member) throw new NotFoundException('Member not found');
    member.deletedAt = new Date();
    await this.memberRepo.save(member);

    const user = await this.userRepo.findOne({ where: { id: member.userId } as any });
    if (user) {
      user.deletedAt = new Date();
      user.isActive = false;
      await this.userRepo.save(user);
    }

    await this.audit.log(ctx, entityName, id, 'DELETE', member, null);
    return { success: true };
  }
}

@Injectable()
export class MembershipPlanService extends ApiBaseService<MembershipPlan> {
  constructor(@InjectRepository(MembershipPlan) repo: Repository<MembershipPlan>, audit: AuditService) { super(repo, audit); }
}

@Injectable()
export class MembershipService extends ApiBaseService<Membership> {
  constructor(@InjectRepository(Membership) repo: Repository<Membership>, audit: AuditService) { super(repo, audit); }
}

@Injectable()
export class WaiverService extends ApiBaseService<Waiver> {
  constructor(@InjectRepository(Waiver) repo: Repository<Waiver>, audit: AuditService) { super(repo, audit); }
}

@Injectable()
export class MemberNoteService extends ApiBaseService<MemberNote> {
  constructor(@InjectRepository(MemberNote) repo: Repository<MemberNote>, audit: AuditService) { super(repo, audit); }
}

@Injectable()
export class MemberGoalService extends ApiBaseService<MemberGoal> {
  constructor(@InjectRepository(MemberGoal) repo: Repository<MemberGoal>, audit: AuditService) { super(repo, audit); }
}