import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessCredential, CheckIn } from '../../entities/access.entities';
import { ApiBaseService, AuditService } from '../../common/services';
import { EventsGateway } from '../../gateway/events.gateway';
import { Member } from '../../entities/member.entities';

@Injectable()
export class AccessCredentialService extends ApiBaseService<AccessCredential> {
  constructor(@InjectRepository(AccessCredential) r: Repository<AccessCredential>, a: AuditService) { super(r, a); }
}

@Injectable()
export class CheckInService extends ApiBaseService<CheckIn> {
  constructor(@InjectRepository(CheckIn) r: Repository<CheckIn>, a: AuditService) { super(r, a); }
}

@Injectable()
export class CheckInEngine {
  constructor(
    @InjectRepository(CheckIn) private readonly checkInRepo: Repository<CheckIn>,
    private readonly gateway: EventsGateway,
    @InjectRepository(Member) private readonly memberRepo: Repository<Member>,
  ) {}

  async processCheckIn(tenantId: string, body: { memberId: string; locationId?: string; method?: string }) {
    const member = await this.memberRepo.findOne({ where: { id: body.memberId, tenantId } });
    if (!member) throw new BadRequestException('Member not found');
    if (member.status !== 'ACTIVE') throw new BadRequestException('Member status is not ACTIVE');

    const lastCheckIn = await this.checkInRepo.findOne({
      where: { tenantId, memberId: body.memberId } as any,
      order: { createdAt: 'DESC' },
    });

    // Check for tailgating (two check-ins within 15s)
    const isTailgate = lastCheckIn && (Date.now() - new Date(lastCheckIn.checkInTime).getTime() < 15000);

    const checkIn = await this.checkInRepo.save(this.checkInRepo.create({
      tenantId,
      memberId: body.memberId,
      locationId: body.locationId,
      checkInTime: new Date(),
      method: body.method || 'QR',
      status: isTailgate ? 'SUSPECTED_TAILGATE' : 'VALID',
      isTailgate,
    }));

    member.totalVisits = (member.totalVisits || 0) + 1;
    member.lastVisitAt = new Date();
    await this.memberRepo.save(member);

    this.gateway.broadcast('checkin.new', { tenantId, memberId: body.memberId, timestamp: checkIn.checkInTime });

    return {
      ...checkIn,
      member: { name: `${member.userId} (id:${member.userId})`, totalVisits: member.totalVisits },
      alert: isTailgate ? 'Potential tailgate detected' : null,
    };
  }

  async processCheckOut(tenantId: string, checkInId: string) {
    const checkIn = await this.checkInRepo.findOne({ where: { id: checkInId, tenantId } as any });
    if (!checkIn) throw new BadRequestException('Check-in not found');
    if (checkIn.checkOutTime) throw new BadRequestException('Already checked out');
    checkIn.checkOutTime = new Date();
    return this.checkInRepo.save(checkIn);
  }

  async getRecentCheckins(tenantId: string, limit: number = 50) {
    return this.checkInRepo
      .createQueryBuilder('c')
      .where('c.tenantId = :t', { t: tenantId })
      .orderBy('c.checkInTime', 'DESC')
      .limit(limit)
      .getMany();
  }

  async getStats(tenantId: string, range: string = 'day') {
    const now = new Date();
    let since: Date;
    if (range === 'week') since = new Date(now.getTime() - 7 * 86400000);
    else if (range === 'month') since = new Date(now.getTime() - 30 * 86400000);
    else since = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const count = await this.checkInRepo
      .createQueryBuilder('c')
      .where('c.tenantId = :t', { t: tenantId })
      .andWhere('c.checkInTime >= :since', { since: since.toISOString() })
      .getCount();

    const peakHours = await this.checkInRepo
      .createQueryBuilder('c')
      .where('c.tenantId = :t', { t: tenantId })
      .andWhere('c.checkInTime >= :since', { since: since.toISOString() })
      .select("strftime('%H', c.checkInTime)", 'hour')
      .addSelect('COUNT(*)', 'count')
      .groupBy("strftime('%H', c.checkInTime)")
      .orderBy('count', 'DESC')
      .getRawMany();

    return { totalCheckins: count, peakHours: peakHours.slice(0, 5) };
  }
}