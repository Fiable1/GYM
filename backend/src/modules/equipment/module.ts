import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipmentAsset, EquipmentSensor, EquipmentUsageLog, MaintenanceSchedule, WorkOrder } from '../../entities/equipment.entities';
import { EquipmentAssetService, EquipmentSensorService, EquipmentUsageLogService, MaintenanceScheduleService, WorkOrderService, EquipmentEngine } from './service';
import { EquipmentController, SensorController, UsageLogController, MaintenanceController, WorkOrderController } from './controller';
import { GatewayModule } from '../../gateway/gateway.module';

@Module({
  imports: [TypeOrmModule.forFeature([EquipmentAsset, EquipmentSensor, EquipmentUsageLog, MaintenanceSchedule, WorkOrder]), GatewayModule],
  controllers: [EquipmentController, SensorController, UsageLogController, MaintenanceController, WorkOrderController],
  providers: [EquipmentAssetService, EquipmentSensorService, EquipmentUsageLogService, MaintenanceScheduleService, WorkOrderService, EquipmentEngine],
  exports: [EquipmentEngine],
})
export class EquipmentModule {}