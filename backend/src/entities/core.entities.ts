import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity('tenants')
export class Tenant extends BaseEntity {
  @Column({ length: 120 })
  name: string;

  @Column({ length: 120, nullable: true })
  legalName?: string;

  @Column({ length: 255, nullable: true })
  logoUrl?: string;

  @Column({ length: 20, default: 'en' })
  defaultLanguage: string;

  @Column({ length: 20, default: 'en' })
  locale: string;

  @Column({ length: 8, default: 'UTC' })
  timezone: string;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'text', nullable: true })
  subscriptionPlan?: string;

  @Column({ default: true })
  isActive: boolean;
}

@Entity('locations')
@Index(['tenantId', 'name'])
export class Location extends BaseEntity {
  @Column({ length: 120 })
  name: string;

  @Column({ length: 255, nullable: true })
  address?: string;

  @Column({ length: 60, nullable: true })
  city?: string;

  @Column({ length: 60, nullable: true })
  country?: string;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  lat?: number;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  lng?: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ length: 20, default: '07:00' })
  openingHour: string;

  @Column({ length: 20, default: '22:00' })
  closingHour: string;

  @Column({ default: false })
  is24Hours: boolean;
}