import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity('workout_plans')
@Index(['tenantId', 'memberId'])
export class WorkoutPlan extends BaseEntity {
  @Column({ length: 36 })
  memberId: string;

  @Column({ length: 120 })
  title: string;

  @Column({ length: 40, default: 'AI' })
  source: string = 'AI';

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 40, default: 'ACTIVE' })
  status: string = 'ACTIVE';

  @Column({ type: 'text', nullable: true })
  weeklySchedule?: string;

  @Column({ type: 'text', nullable: true })
  exercises?: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  progressPercent: number = 0;

  @Column({ type: 'datetime', nullable: true })
  startDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  endDate?: Date;

  @Column({ type: 'int', default: 0 })
  totalSessions: number = 0;

  @Column({ type: 'int', default: 0 })
  completedSessions: number = 0;
}

@Entity('wearable_snapshots')
@Index(['tenantId', 'memberId'])
export class WearableSnapshot extends BaseEntity {
  @Column({ length: 36 })
  memberId: string;

  @Column({ length: 60, default: 'APPLE_HEALTH' })
  source: string = 'APPLE_HEALTH';

  @Column({ type: 'datetime' })
  date: Date;

  @Column({ type: 'int', nullable: true })
  hrv?: number;

  @Column({ type: 'int', nullable: true })
  restingHeartRate?: number;

  @Column({ type: 'int', nullable: true })
  sleepMinutes?: number;

  @Column({ type: 'int', nullable: true })
  steps?: number;

  @Column({ type: 'int', nullable: true })
  activeCalories?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  trainingReadiness?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}

@Entity('churn_scores')
export class ChurnScore extends BaseEntity {
  @Column({ length: 36 })
  memberId: string;

  @Column({ type: 'datetime' })
  date: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({ length: 40, default: 'LOW' })
  riskLevel: string = 'LOW';

  @Column({ type: 'text', nullable: true })
  factors?: string;

  @Column({ type: 'text', nullable: true })
  recommendedActions?: string;
}