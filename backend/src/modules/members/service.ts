import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member, MembershipPlan, Membership, Waiver, MemberNote, MemberGoal } from '../../entities/member.entities';
import { ApiBaseService, AuditService } from '../../common/services';

@Injectable()
export class MemberService extends ApiBaseService<Member> {
  constructor(@InjectRepository(Member) repo: Repository<Member>, audit: AuditService) { super(repo, audit); }
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