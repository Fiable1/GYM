import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity('equipment_assets')
@Index(['tenantId', 'locationId'])
export class EquipmentAsset extends BaseEntity {
  @Column({ length: 120 })
  name: string;

  @Column({ length: 120 })
  brand: string;

  @Column({ length: 120 })
  model: string;

  @Column({ length: 60, nullable: true })
  serialNumber?: string;

  @Column({ length: 36, nullable: true })
  locationId?: string;

  @Column({ length: 60, default: 'CARDIO' })
  category: string = 'CARDIO';

  @Column({ length: 40, default: 'ONLINE' })
  status: string = 'ONLINE';

  @Column({ type: 'datetime', nullable: true })
  purchaseDate?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  purchasePrice: number = 0;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentValue: number = 0;

  @Column({ type: 'int', default: 0 })
  usageHours: number = 0;

  @Column({ type: 'int', default: 0 })
  usageSessions: number = 0;

  @Column({ type: 'text', nullable: true })
  firmwareVersion?: string;

  @Column({ length: 255, nullable: true })
  qrCodeValue?: string;

  @Column({ type: 'int', nullable: true })
  floorX?: number;

  @Column({ type: 'int', nullable: true })
  floorY?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  energyKwh: number = 0;

  @Column({ length: 120, nullable: true })
  warrantyExpiry?: string;

  @Column({ length: 200, nullable: true })
  vendorInfo?: string;

  @Column({ type: 'text', nullable: true })
  lastDiagnostics?: string;

  @Column({ type: 'datetime', nullable: true })
  lastServiceDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  nextServiceDate?: Date;
}

@Entity('equipment_sensors')
@Index(['tenantId', 'assetId'])
export class EquipmentSensor extends BaseEntity {
  @Column({ length: 36 })
  assetId: string;

  @Column({ length: 120, nullable: true })
  deviceId?: string;

  @Column({ length: 40, default: 'USAGE' })
  sensorType: string = 'USAGE';

  @Column({ length: 40, default: 'ONLINE' })
  status: string = 'ONLINE';

  @Column({ length: 40, default: 'BLE' })
  protocol: string = 'BLE';

  @Column({ type: 'datetime', nullable: true })
  lastSeenAt?: Date;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  batteryLevel?: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  temperature?: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  vibration?: number;

  @Column({ type: 'int', default: 0 })
  messageCount: number = 0;
}

@Entity('equipment_usage_logs')
@Index(['tenantId', 'assetId'])
@Index(['tenantId', 'timestamp'])
export class EquipmentUsageLog extends BaseEntity {
  @Column({ length: 36 })
  assetId: string;

  @Column({ type: 'datetime' })
  timestamp: Date;

  @Column({ type: 'int', default: 0 })
  durationMinutes: number = 0;

  @Column({ type: 'int', nullable: true })
  powerWatts?: number;

  @Column({ length: 60, nullable: true })
  errorCode?: string;

  @Column({ length: 200, nullable: true })
  errorMessage?: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  vibration?: number;

  @Column({ length: 36, nullable: true })
  memberId?: string;

  @Column({ length: 40, default: 'AUTO' })
  source: string = 'AUTO';
}

@Entity('maintenance_schedules')
export class MaintenanceSchedule extends BaseEntity {
  @Column({ length: 36 })
  assetId: string;

  @Column({ length: 120 })
  taskName: string;

  @Column({ length: 40, default: 'TIME_BASED' })
  scheduleType: string = 'TIME_BASED';

  @Column({ type: 'int', nullable: true })
  intervalDays?: number;

  @Column({ type: 'int', nullable: true })
  intervalUsageHours?: number;

  @Column({ type: 'datetime', nullable: true })
  lastExecutedAt?: Date;

  @Column({ type: 'datetime' })
  nextDueAt: Date;

  @Column({ length: 40, default: 'ACTIVE' })
  status: string = 'ACTIVE';

  @Column({ length: 100, nullable: true })
  assignedTo?: string;

  @Column({ type: 'text', nullable: true })
  checklist?: string;

  @Column({ length: 40, default: 'MEDIUM' })
  priority: string = 'MEDIUM';
}

@Entity('work_orders')
@Index(['tenantId', 'status'])
export class WorkOrder extends BaseEntity {
  @Column({ length: 36 })
  assetId: string;

  @Column({ length: 36, nullable: true })
  assigneeId?: string;

  @Column({ length: 120 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 20, default: 'OPEN' })
  status: string = 'OPEN';

  @Column({ length: 20, default: 'MEDIUM' })
  priority: string = 'MEDIUM';

  @Column({ length: 40, default: 'REPORTED' })
  source: string = 'REPORTED';

  @Column({ length: 36, nullable: true })
  reportedById?: string;

  @Column({ type: 'datetime', nullable: true })
  scheduledAt?: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  partsCost: number = 0;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  laborCost: number = 0;

  @Column({ type: 'text', nullable: true })
  resolutionNotes?: string;

  @Column({ type: 'text', nullable: true })
  photos?: string;
}