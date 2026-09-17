import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { BOOKING_STATUS, SESSION_TYPES } from '../common/constants';

@Entity('class_types')
@Index(['tenantId', 'isActive'])
export class ClassType extends BaseEntity {
  @Column({ length: 120 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 60, default: 'GENERAL' })
  category: string = 'GENERAL';

  @Column({ type: 'int', default: 60 })
  durationMinutes: number = 60;

  @Column({ type: 'int', default: 20 })
  maxCapacity: number = 20;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number = 0;

  @Column({ type: 'text', nullable: true })
  color?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ length: 36, nullable: true })
  defaultTrainerId?: string;

  @Column({ length: 60, nullable: true })
  difficulty?: string;

  @Column({ type: 'text', nullable: true })
  equipment?: string;
}

@Entity('sessions')
@Index(['tenantId', 'startTime'])
@Index(['tenantId', 'classTypeId'])
export class Session extends BaseEntity {
  @Column({ length: 36 })
  classTypeId: string;

  @Column({ length: 36, nullable: true })
  trainerId?: string;

  @Column({ length: 36, nullable: true })
  locationId?: string;

  @Column({ type: 'datetime' })
  startTime: Date;

  @Column({ type: 'datetime' })
  endTime: Date;

  @Column({ type: 'int', default: 20 })
  maxCapacity: number = 20;

  @Column({ type: 'int', default: 0 })
  currentBookings: number = 0;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number = 0;

  @Column({ length: 60, default: 'CLASS' })
  sessionType: string;

  @Column({ length: 40, default: 'SCHEDULED' })
  status: string = 'SCHEDULED';

  @Column({ default: false })
  isLivestream: boolean = false;

  @Column({ length: 255, nullable: true })
  livestreamUrl?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}

@Entity('bookings')
@Index(['tenantId', 'sessionId'])
export class Booking extends BaseEntity {
  @Column({ length: 36 })
  sessionId: string;

  @Column({ length: 36 })
  memberId: string;

  @Column({ length: 20, default: 'CONFIRMED' })
  status: string = 'CONFIRMED';

  @Column({ length: 20, default: 'SCHEDULED' })
  checkInStatus: string = 'PENDING';

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountPaid: number = 0;

  @Column({ type: 'datetime', nullable: true })
  cancelledAt?: Date;

  @Column({ length: 200, nullable: true })
  cancellationReason?: string;
}

@Entity('trainer_availability')
export class TrainerAvailability extends BaseEntity {
  @Column({ length: 36 })
  trainerId: string;

  @Column({ length: 36, nullable: true })
  locationId?: string;

  @Column({ type: 'int' })
  dayOfWeek: number;

  @Column({ length: 20 })
  startTime: string;

  @Column({ length: 20 })
  endTime: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ length: 36, nullable: true })
  recurrenceId?: string;
}