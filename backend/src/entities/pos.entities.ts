import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity('products')
@Index(['tenantId', 'category'])
export class Product extends BaseEntity {
  @Column({ length: 120 })
  name: string;

  @Column({ length: 200, nullable: true })
  description?: string;

  @Column({ length: 120, default: 'NUTRITION' })
  category: string = 'NUTRITION';

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cost: number = 0;

  @Column({ type: 'int', default: 0 })
  stockQuantity: number = 0;

  @Column({ type: 'int', default: 5 })
  lowStockThreshold: number = 5;

  @Column({ length: 3, default: 'USD' })
  currency: string = 'USD';

  @Column({ length: 60, nullable: true })
  sku?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  barcodeData?: string;
}

@Entity('sales')
@Index(['tenantId', 'soldAt'])
export class Sale extends BaseEntity {
  @Column({ length: 36, nullable: true })
  memberId?: string;

  @Column({ length: 36, nullable: true })
  soldById?: string;

  @Column({ length: 36, nullable: true })
  locationId?: string;

  @Column({ length: 60, default: 'POS' })
  saleType: string = 'POS';

  @Column({ type: 'datetime' })
  soldAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax: number = 0;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number = 0;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ length: 40, default: 'COMPLETED' })
  status: string = 'COMPLETED';

  @Column({ length: 20, default: 'CASH' })
  paymentMethod: string = 'CASH';
}

@Entity('sale_items')
export class SaleItem extends BaseEntity {
  @Column({ length: 36 })
  saleId: string;

  @Column({ length: 36 })
  productId: string;

  @Column({ length: 120 })
  productName: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;
}

@Entity('challenges')
@Index(['tenantId', 'status'])
export class Challenge extends BaseEntity {
  @Column({ length: 120 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 60, default: 'STEPS' })
  metric: string = 'STEPS';

  @Column({ type: 'int', default: 0 })
  targetValue: number = 0;

  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  @Column({ length: 40, default: 'ACTIVE' })
  status: string = 'ACTIVE';

  @Column({ length: 40, nullable: true })
  reward?: string;

  @Column({ default: false })
  isTeam: boolean = false;

  @Column({ length: 36, nullable: true })
  createdById?: string;
}

@Entity('challenge_entries')
@Index(['tenantId', 'challengeId'])
export class ChallengeEntry extends BaseEntity {
  @Column({ length: 36 })
  challengeId: string;

  @Column({ length: 36 })
  memberId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  score: number = 0;

  @Column({ type: 'datetime', nullable: true })
  lastUpdatedAt?: Date;

  @Column({ type: 'int', default: 0 })
  rank: number = 0;
}