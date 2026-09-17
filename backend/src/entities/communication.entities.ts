import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity('notification_templates')
export class NotificationTemplate extends BaseEntity {
  @Column({ length: 120 })
  name: string;

  @Column({ length: 40 })
  channel: string = 'EMAIL';

  @Column({ length: 60 })
  triggerEvent: string;

  @Column({ length: 200 })
  subject: string;

  @Column({ type: 'text' })
  bodyTemplate: string;

  @Column({ type: 'text', nullable: true })
  variables?: string;

  @Column({ default: true })
  isActive: boolean;
}

@Entity('notifications')
@Index(['tenantId', 'recipientId'])
export class Notification extends BaseEntity {
  @Column({ length: 36 })
  recipientId: string;

  @Column({ length: 40 })
  channel: string;

  @Column({ length: 120 })
  subject: string;

  @Column({ type: 'text', nullable: true })
  body?: string;

  @Column({ type: 'text', nullable: true })
  metadata?: string;

  @Column({ length: 40, default: 'PENDING' })
  status: string = 'PENDING';

  @Column({ type: 'datetime', nullable: true })
  sentAt?: Date;

  @Column({ type: 'datetime', nullable: true })
  readAt?: Date;

  @Column({ default: false })
  isRead: boolean = false;
}

@Entity('audit_logs')
@Index(['tenantId', 'createdAt'])
@Index(['tenantId', 'entityName'])
export class AuditLog extends BaseEntity {
  @Column({ length: 60 })
  entityName: string;

  @Column({ length: 36 })
  entityId: string;

  @Column({ length: 20 })
  action: string;

  @Column({ type: 'text', nullable: true })
  oldValues?: string;

  @Column({ type: 'text', nullable: true })
  newValues?: string;

  @Column({ length: 120, nullable: true })
  userAgent?: string;

  @Column({ length: 60, nullable: true })
  ipAddress?: string;
}