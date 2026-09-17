import { Column, Entity, Index, Unique } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity('users')
@Index(['tenantId', 'role'])
@Unique(['email'])
export class User extends BaseEntity {
  @Column({ length: 120 })
  firstName: string;

  @Column({ length: 120, nullable: true })
  lastName?: string;

  @Column({ length: 160 })
  email: string;

  @Column({ length: 255, select: false })
  password: string;

  @Column({ length: 40 })
  role: string;

  @Column({ length: 24 })
  language: string = 'en';

  @Column({ length: 32, nullable: true })
  phone?: string;

  @Column({ length: 36, nullable: true })
  locationId?: string;

  @Column({ length: 255, nullable: true })
  avatarUrl?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isMfaEnabled: boolean;

  @Column({ type: 'datetime', nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'text', nullable: true })
  preferences?: string;
}