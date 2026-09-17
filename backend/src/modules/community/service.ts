import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Challenge, ChallengeEntry } from '../../entities/pos.entities';
import { ApiBaseService, AuditService } from '../../common/services';
import { Member } from '../../entities/member.entities';

@Injectable()
export class ChallengeService extends ApiBaseService<Challenge> {
  constructor(@InjectRepository(Challenge) r: Repository<Challenge>, a: AuditService) { super(r, a); }
}

@Injectable()
export class ChallengeEngine {
  constructor(
    @InjectRepository(Challenge) private readonly challengeRepo: Repository<Challenge>,
    @InjectRepository(ChallengeEntry) private readonly entryRepo: Repository<ChallengeEntry>,
    @InjectRepository(Member) private readonly memberRepo: Repository<Member>,
  ) {}

  async updateProgress(tenantId: string, challengeId: string, memberId: string, delta: number) {
    let entry = await this.entryRepo.findOne({ where: { tenantId, challengeId, memberId } as any });
    if (!entry) {
      entry = await this.entryRepo.save(this.entryRepo.create({ tenantId, challengeId, memberId, score: 0 }));
    }
    entry.score = Number((Number(entry.score) + Number(delta)).toFixed(2));
    entry.lastUpdatedAt = new Date();
    await this.entryRepo.save(entry);
    await this.refreshRanks(tenantId, challengeId);
    return entry;
  }

  async refreshRanks(tenantId: string, challengeId: string) {
    const entries = await this.entryRepo
      .createQueryBuilder('e')
      .where('e.tenantId = :t', { t: tenantId })
      .andWhere('e.challengeId = :c', { c: challengeId })
      .orderBy('e.score', 'DESC')
      .getMany();
    for (let i = 0; i < entries.length; i++) {
      entries[i].rank = i + 1;
    }
    await this.entryRepo.save(entries);
    return entries;
  }

  async leaderboard(tenantId: string, challengeId: string) {
    const challenge = await this.challengeRepo.findOne({ where: { id: challengeId, tenantId } });
    const entries = await this.entryRepo
      .createQueryBuilder('e')
      .where('e.tenantId = :t', { t: tenantId })
      .andWhere('e.challengeId = :c', { c: challengeId })
      .orderBy('e.rank', 'ASC')
      .limit(20)
      .getMany();
    return { challenge, entries };
  }

  async autoCreateFromEngagement(tenantId: string, memberIds: string[], metric: string) {
    const start = new Date();
    const end = new Date(start.getTime() + 7 * 86400000);
    const challenge = await this.challengeRepo.save(this.challengeRepo.create({
      tenantId, name: `Re-engagement push — ${metric}`,
      description: 'Automatically created to win back at-risk members',
      metric, startDate: start, endDate: end, status: 'ACTIVE',
    }));
    for (const m of memberIds) {
      await this.entryRepo.save(this.entryRepo.create({ tenantId, challengeId: challenge.id, memberId: m, score: 0 }));
    }
    return challenge;
  }
}