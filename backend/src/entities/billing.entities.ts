import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity('payment_methods')
export class PaymentMethod extends BaseEntity {
  @Column({ length: 36 })
  memberId: string;

  @Column({ length: 40 })
  type: string = 'CARD';

  @Column({ length: 40, nullable: true })
  lastFour?: string;

  @Column({ length: 60, nullable: true })
  brand?: string;

  @Column({ length: 8, nullable: true })
  expiryMonth?: string;

  @Column({ length: 4, nullable: true })
  expiryYear?: string;

  @Column({ length: 255 })
  token: string;

  @Column({ default: true })
  isDefault: boolean;
}

@Entity('invoices')
@Index(['tenantId', 'status'])
export class Invoice extends BaseEntity {
  @Column({ length: 36 })
  memberId: string;

  @Column({ length: 36, nullable: true })
  membershipId?: string;

  @Column({ length: 40, default: 'OPEN' })
  status: string;

  @Column({ length: 50, nullable: true })
  invoiceNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax: number = 0;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number = 0;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  lineItems?: string;

  @Column({ type: 'datetime' })
  issuedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  paidAt?: Date;

  @Column({ type: 'datetime', nullable: true })
  dueDate?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}

@Entity('transactions')
@Index(['tenantId', 'status'])
export class Transaction extends BaseEntity {
  @Column({ length: 36, nullable: true })
  memberId?: string;

  @Column({ length: 36, nullable: true })
  invoiceId?: string;

  @Column({ length: 40 })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ length: 60 })
  gateway: string;

  @Column({ length: 255, nullable: true })
  gatewayTransactionId?: string;

  @Column({ type: 'text', nullable: true })
  failureReason?: string;

  @Column({ length: 36, nullable: true })
  paymentMethodId?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  netAmount?: number;
}

@Entity('dunning_events')
export class DunningEvent extends BaseEntity {
  @Column({ length: 36 })
  invoiceId: string;

  @Column({ length: 36 })
  memberId: string;

  @Column({ length: 60 })
  type: string = 'EMAIL_SENT';

  @Column({ length: 40, default: 'ATTEMPTED' })
  status: string;

  @Column({ type: 'int', default: 1 })
  attemptNumber: number = 1;

  @Column({ type: 'text', nullable: true })
  details?: string;

  @Column({ type: 'datetime', nullable: true })
  nextRetryAt?: Date;
}