import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

export const JOIN_REQUEST_STATUS = {
  NEW: 'NEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CONVERTED: 'CONVERTED',
} as const;

@Entity('join_requests')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'createdAt'])
export class JoinRequest extends BaseEntity {
  @Column({ length: 120 })
  name: string;

  @Column({ length: 160 })
  email: string;

  @Column({ length: 32, nullable: true })
  phone?: string;

  @Column({ length: 60, default: 'Forge' })
  plan: string = 'Forge';

  @Column({ length: 200, default: '' })
  goal: string = '';

  @Column({ length: 30, default: 'NEW' })
  status: string = JOIN_REQUEST_STATUS.NEW;

  @Column({ length: 60, nullable: true })
  source?: string;

  @Column({ type: 'text', nullable: true })
  staffNote?: string;

  @Column({ length: 36, nullable: true })
  reviewedBy?: string;

  @Column({ type: 'datetime', nullable: true })
  reviewedAt?: Date;

  @Column({ length: 36, nullable: true })
  memberId?: string;
}