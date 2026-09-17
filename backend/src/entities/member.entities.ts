import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { MEMBERSHIP_TYPES } from '../common/constants';

@Entity('members')
export class Member extends BaseEntity {
  @Column({ length: 36, unique: true })
  userId: string;

  @Column({ type: 'text', nullable: true })
  goals?: string;

  @Column({ type: 'text', nullable: true })
  injuries?: string;

  @Column({ type: 'text', nullable: true })
  preferences?: string;

  @Column({ type: 'text', nullable: true })
  emergencyContact?: string;

  @Column({ type: 'int', default: 0 })
  totalVisits: number;

  @Column({ type: 'datetime', nullable: true })
  lastVisitAt?: Date;

  @Column({ type: 'varchar', default: 'ACTIVE' })
  status: string = 'ACTIVE';
}

@Entity('membership_plans')
@Index(['tenantId', 'isActive'])
export class MembershipPlan extends BaseEntity {
  @Column({ length: 120 })
  name: string;

  @Column({ length: 500, nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ length: 40, default: 'RECURRING' })
  type: string;

  @Column({ type: 'int', nullable: true })
  durationDays?: number;

  @Column({ type: 'int', default: 0 })
  maxLocations: number = 1;

  @Column({ type: 'int', default: 0 })
  maxClassBookings: number = 0;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  features?: string;
}

@Entity('memberships')
@Index(['tenantId', 'status'])
export class Membership extends BaseEntity {
  @Column({ length: 36 })
  memberId: string;

  @Column({ length: 36 })
  planId: string;

  @Column({ length: 36, nullable: true })
  locationId?: string;

  @Column({ length: 40, default: 'RECURRING' })
  type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ length: 40, default: 'ACTIVE' })
  status: string = 'ACTIVE';

  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime', nullable: true })
  endDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  nextBillingDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  freezeDate?: Date;

  @Column({ type: 'int', default: 0 })
  remainingClassCredits: number = 0;
}

@Entity('waivers')
export class Waiver extends BaseEntity {
  @Column({ length: 36 })
  memberId: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ length: 60, default: 'EN' })
  language: string;

  @Column({ length: 36, default: '1' })
  version: string;

  @Column({ type: 'text', nullable: true })
  signatureData?: string;

  @Column({ type: 'datetime', nullable: true })
  signedAt?: Date;

  @Column({ default: false })
  isSigned: boolean;
}

@Entity('member_notes')
export class MemberNote extends BaseEntity {
  @Column({ length: 36 })
  memberId: string;

  @Column({ length: 36, nullable: true })
  authorId?: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ length: 40, default: 'GENERAL' })
  category: string = 'GENERAL';
}

@Entity('member_goals')
export class MemberGoal extends BaseEntity {
  @Column({ length: 36 })
  memberId: string;

  @Column({ length: 120 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  targetValue?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  currentValue?: number;

  @Column({ length: 30, nullable: true })
  unit?: string;

  @Column({ type: 'datetime', nullable: true })
  targetDate?: Date;

  @Column({ length: 40, default: 'ACTIVE' })
  status: string = 'ACTIVE';
}