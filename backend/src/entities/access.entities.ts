import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity('access_credentials')
@Index(['tenantId', 'memberId'])
export class AccessCredential extends BaseEntity {
  @Column({ length: 36 })
  memberId: string;

  @Column({ length: 40 })
  type: string = 'QR';

  @Column({ length: 255 })
  credentialValue: string;

  @Column({ length: 36, nullable: true })
  locationId?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'datetime', nullable: true })
  expiresAt?: Date;
}

@Entity('check_ins')
@Index(['tenantId', 'checkInTime'])
@Index(['tenantId', 'memberId'])
export class CheckIn extends BaseEntity {
  @Column({ length: 36 })
  memberId: string;

  @Column({ length: 36, nullable: true })
  locationId?: string;

  @Column({ type: 'datetime' })
  checkInTime: Date;

  @Column({ type: 'datetime', nullable: true })
  checkOutTime?: Date;

  @Column({ length: 20, default: 'QR' })
  method: string = 'QR';

  @Column({ length: 40, default: 'VALID' })
  status: string = 'VALID';

  @Column({ default: false })
  isTailgate: boolean = false;

  @Column({ length: 36, nullable: true })
  sessionId?: string;
}