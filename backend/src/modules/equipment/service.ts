import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EquipmentAsset, EquipmentSensor, EquipmentUsageLog, MaintenanceSchedule, WorkOrder } from '../../entities/equipment.entities';
import { ApiBaseService, AuditService } from '../../common/services';
import { EventsGateway } from '../../gateway/events.gateway';

@Injectable()
export class EquipmentAssetService extends ApiBaseService<EquipmentAsset> {
  constructor(@InjectRepository(EquipmentAsset) r: Repository<EquipmentAsset>, a: AuditService) { super(r, a); }
}

@Injectable()
export class EquipmentSensorService extends ApiBaseService<EquipmentSensor> {
  constructor(@InjectRepository(EquipmentSensor) r: Repository<EquipmentSensor>, a: AuditService) { super(r, a); }
}

@Injectable()
export class EquipmentUsageLogService extends ApiBaseService<EquipmentUsageLog> {
  constructor(@InjectRepository(EquipmentUsageLog) r: Repository<EquipmentUsageLog>, a: AuditService) { super(r, a); }
}

@Injectable()
export class MaintenanceScheduleService extends ApiBaseService<MaintenanceSchedule> {
  constructor(@InjectRepository(MaintenanceSchedule) r: Repository<MaintenanceSchedule>, a: AuditService) { super(r, a); }
}

@Injectable()
export class WorkOrderService extends ApiBaseService<WorkOrder> {
  constructor(@InjectRepository(WorkOrder) r: Repository<WorkOrder>, a: AuditService) { super(r, a); }
}

@Injectable()
export class EquipmentEngine {
  constructor(
    @InjectRepository(EquipmentAsset) private readonly assetRepo: Repository<EquipmentAsset>,
    @InjectRepository(EquipmentSensor) private readonly sensorRepo: Repository<EquipmentSensor>,
    @InjectRepository(EquipmentUsageLog) private readonly logRepo: Repository<EquipmentUsageLog>,
    @InjectRepository(MaintenanceSchedule) private readonly maintRepo: Repository<MaintenanceSchedule>,
    @InjectRepository(WorkOrder) private readonly woRepo: Repository<WorkOrder>,
    private readonly gateway: EventsGateway,
  ) {}

  getAssetRepo() { return this.assetRepo; }

  async ingestSensorData(tenantId: string, payload: {
    deviceId: string;
    assetId?: string;
    sensorType?: string;
    temperature?: number;
    vibration?: number;
    powerWatts?: number;
    errorCode?: string;
    errorMessage?: string;
    batteryLevel?: number;
    durationMinutes?: number;
  }) {
    const sensor = payload.assetId
      ? await this.sensorRepo.findOne({ where: { tenantId, assetId: payload.assetId } })
      : await this.sensorRepo.findOne({ where: { tenantId, deviceId: payload.deviceId } });
    if (!sensor) throw new Error('SensorNotFound');

    const asset = await this.assetRepo.findOne({ where: { id: sensor.assetId, tenantId } });
    const data = {
      tenantId,
      assetId: sensor.assetId,
      timestamp: new Date(),
      durationMinutes: payload.durationMinutes || 0,
      powerWatts: payload.powerWatts,
      vibration: payload.vibration,
      errorCode: payload.errorCode,
      errorMessage: payload.errorMessage,
    };
    const saved = await this.logRepo.save(this.logRepo.create(data));

    sensor.lastSeenAt = new Date();
    sensor.messageCount += 1;
    if (payload.batteryLevel !== undefined) sensor.batteryLevel = payload.batteryLevel;
    if (payload.temperature !== undefined) sensor.temperature = payload.temperature;
    if (payload.vibration !== undefined) sensor.vibration = payload.vibration;
    sensor.status = 'ONLINE';
    await this.sensorRepo.save(sensor);

    if (asset) {
      asset.usageHours += payload.durationMinutes ? payload.durationMinutes / 60 : 0;
      asset.usageSessions += 1;
      if (payload.powerWatts) asset.energyKwh += (payload.powerWatts / 1000) * (payload.durationMinutes / 60 || 1 / 60);
      if (payload.errorCode) {
        asset.status = 'ERROR';
        const workOrder = await this.createAutoWorkOrder(tenantId, asset, payload.errorCode, payload.errorMessage);
        this.gateway.broadcast('equipment.alert', { assetId: asset.id, workOrderId: workOrder.id, errorCode: payload.errorCode });
      } else {
        asset.status = 'ONLINE';
      }
      asset.lastDiagnostics = JSON.stringify(payload);
      await this.assetRepo.save(asset);
    }

    this.gateway.broadcast('equipment.telemetry', saved);
    return saved;
  }

  private async createAutoWorkOrder(tenantId: string, asset: EquipmentAsset, errorCode: string, errorMessage?: string) {
    return this.woRepo.save(this.woRepo.create({
      tenantId,
      assetId: asset.id,
      source: 'IOT_AUTO',
      title: `Auto-generated work order: ${asset.name}`,
      description: `IoT sensor reported error ${errorCode}${errorMessage ? ' — ' + errorMessage : ''}`,
      status: 'OPEN',
      priority: 'HIGH',
    }));
  }

  async createAsset(tenantId: string, body: any) {
    const asset = await this.assetRepo.save(this.assetRepo.create({
      tenantId,
      createdBy: body.createdBy,
      name: body.name, brand: body.brand, model: body.model,
      serialNumber: body.serialNumber, locationId: body.locationId,
      category: body.category || 'CARDIO', status: body.status || 'ONLINE',
      purchaseDate: body.purchaseDate, purchasePrice: body.purchasePrice || 0,
      currentValue: body.currentValue ?? body.purchasePrice ?? 0,
      floorX: body.floorX, floorY: body.floorY,
      qrCodeValue: body.qrCodeValue || `PF-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      warrantyExpiry: body.warrantyExpiry, vendorInfo: body.vendorInfo,
    }));

    if (body.sensor) {
      await this.sensorRepo.save(this.sensorRepo.create({
        tenantId, assetId: asset.id,
        deviceId: body.sensor.deviceId, sensorType: body.sensor.sensorType || 'USAGE',
        protocol: body.sensor.protocol || 'BLE', status: 'ONLINE',
      }));
    }
    return asset;
  }

  async reportIssue(tenantId: string, body: any) {
    const asset = await this.assetRepo.findOne({ where: { id: body.assetId, tenantId } });
    if (!asset) return { error: 'Asset not found' };
    const wo = await this.woRepo.save(this.woRepo.create({
      tenantId,
      assetId: asset.id,
      reportedById: body.reportedById,
      title: body.title || `${asset.name} issue reported`,
      description: body.description || 'Member-reported issue via QR scan',
      priority: body.priority || 'MEDIUM',
      status: 'OPEN',
      source: body.source || 'QR',
    }));
    this.gateway.broadcast('workorder.created', wo);
    return wo;
  }

  async completeWorkOrder(tenantId: string, id: string, body: any) {
    const wo = await this.woRepo.findOne({ where: { id, tenantId } });
    if (!wo) return { error: 'Work order not found' };
    wo.status = body.status || 'RESOLVED';
    wo.completedAt = body.completedAt ? new Date(body.completedAt) : new Date();
    wo.partsCost = body.partsCost || 0;
    wo.laborCost = body.laborCost || 0;
    wo.resolutionNotes = body.resolutionNotes;
    const saved = await this.woRepo.save(wo);

    if (saved.status === 'RESOLVED') {
      const asset = await this.assetRepo.findOne({ where: { id: wo.assetId, tenantId } });
      if (asset) {
        asset.status = 'ONLINE';
        asset.lastServiceDate = new Date();
        await this.assetRepo.save(asset);
      }
    }
    return saved;
  }

  async getDashboard(tenantId: string) {
    const assets = await this.assetRepo.find({ where: { tenantId } as any });
    const online = assets.filter((a) => a.status === 'ONLINE').length;
    const offline = assets.filter((a) => a.status === 'OFFLINE').length;
    const error = assets.filter((a) => a.status === 'ERROR').length;
    const maintenance = assets.filter((a) => a.status === 'MAINTENANCE').length;

    const openWorkOrders = await this.woRepo.count({ where: { tenantId, status: 'OPEN' } as any });
    const totalUsageHours = assets.reduce((s, a) => s + (a.usageHours || 0), 0);
    const totalEnergy = assets.reduce((s, a) => s + (a.energyKwh || 0), 0);

    const dueMaintenance = await this.maintRepo.createQueryBuilder('m')
      .where('m.tenantId = :t', { t: tenantId })
      .andWhere("m.status = 'ACTIVE'")
      .andWhere('m.nextDueAt <= :now', { now: new Date().toISOString() })
      .getCount();

    const categoryUsage = assets.reduce((acc: any, a) => {
      acc[a.category] = (acc[a.category] || 0) + (a.usageHours || 0);
      return acc;
    }, {});

    return {
      totalAssets: assets.length,
      online, offline, error, maintenance,
      openWorkOrders, dueMaintenance,
      totalUsageHours: Math.round(totalUsageHours),
      totalEnergyKwh: Math.round(totalEnergy),
      categoryUsage,
      assetHealthScore: assets.length ? Math.round(((online + maintenance) / assets.length) * 100) : 0,
    };
  }

  async usageTrend(tenantId: string, days: number = 14) {
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const rows = await this.logRepo.createQueryBuilder('l')
      .where('l.tenantId = :t', { t: tenantId })
      .andWhere('l.timestamp >= :since', { since })
      .select("date(l.timestamp)", 'day')
      .addSelect('SUM(l.durationMinutes)', 'minutes')
      .addSelect('COUNT(*)', 'events')
      .groupBy("date(l.timestamp)")
      .orderBy('day', 'ASC')
      .getRawMany();
    return rows.map((r) => ({ day: r.day, minutes: Number(r.minutes || 0), events: Number(r.events || 0) }));
  }

  async utilizationHeatmap(tenantId: string) {
    const assets = await this.assetRepo.find({ where: { tenantId } as any, select: ['id', 'name', 'category', 'floorX', 'floorY', 'usageHours'] as any });
    return assets.map((a: any) => ({
      id: a.id, name: a.name, category: a.category,
      x: a.floorX, y: a.floorY,
      usageHours: a.usageHours,
      utilization: a.usageHours ? Math.min(100, Math.round((a.usageHours / 24) * 100)) : 0,
    }));
  }
}