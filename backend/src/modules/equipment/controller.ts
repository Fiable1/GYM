import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { Roles } from '../../auth/decorators';
import { EquipmentAssetService, EquipmentSensorService, EquipmentUsageLogService, MaintenanceScheduleService, WorkOrderService, EquipmentEngine } from './service';
import { buildPageQuery, reqContext } from '../../common/helpers';
import { Role } from '../../common/constants';

@Controller('equipment')
export class EquipmentController {
  constructor(
    private readonly svc: EquipmentAssetService,
    private readonly engine: EquipmentEngine,
  ) {}

  @Post()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  create(@Req() req: any, @Body() body: any) { return this.engine.createAsset(req.user.tenantId, body); }

  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    const filters: any = {};
    if (q.category) filters.category = q.category;
    if (q.status) filters.status = q.status;
    if (q.locationId) filters.locationId = q.locationId;
    return this.svc.findAll(reqContext(req.user), buildPageQuery(q), filters);
  }

  @Get('dashboard')
  dashboard(@Req() req: any) { return this.engine.getDashboard(req.user.tenantId); }

  @Get('usage-trend')
  usageTrend(@Req() req: any, @Query('days') days: string) { return this.engine.usageTrend(req.user.tenantId, parseInt(days) || 14); }

  @Get('heatmap')
  heatmap(@Req() req: any) { return this.engine.utilizationHeatmap(req.user.tenantId); }

  @Post('report-issue')
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF, Role.MEMBER, Role.MAINTENANCE_TECH)
  reportIssue(@Req() req: any, @Body() body: any) { return this.engine.reportIssue(req.user.tenantId, { ...body, reportedById: req.user.id }); }

  @Post('ingest')
  @Roles(Role.OWNER, Role.MANAGER, Role.MAINTENANCE_TECH)
  ingest(@Req() req: any, @Body() body: any) { return this.engine.ingestSensorData(req.user.tenantId, body); }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) { return this.svc.findOne(reqContext(req.user), id); }

  @Put(':id')
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) { return this.svc.update(reqContext(req.user), id, body, 'EquipmentAsset'); }

  @Delete(':id')
  @Roles(Role.OWNER, Role.MANAGER)
  remove(@Req() req: any, @Param('id') id: string) { return this.svc.remove(reqContext(req.user), id, 'EquipmentAsset'); }
}

@Controller('sensors')
export class SensorController {
  constructor(private readonly svc: EquipmentSensorService) {}
  @Post()
  @Roles(Role.OWNER, Role.MANAGER, Role.MAINTENANCE_TECH)
  create(@Req() req: any, @Body() body: any) { return this.svc.create(reqContext(req.user), body, 'EquipmentSensor'); }
  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    const filters: any = {};
    if (q.assetId) filters.assetId = q.assetId;
    return this.svc.findAll(reqContext(req.user), buildPageQuery(q), filters);
  }
}

@Controller('usage-logs')
export class UsageLogController {
  constructor(private readonly svc: EquipmentUsageLogService) {}
  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    const filters: any = {};
    if (q.assetId) filters.assetId = q.assetId;
    return this.svc.findAll(reqContext(req.user), buildPageQuery(q), filters);
  }
}

@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly svc: MaintenanceScheduleService) {}

  @Post()
  @Roles(Role.OWNER, Role.MANAGER, Role.MAINTENANCE_TECH)
  create(@Req() req: any, @Body() body: any) { return this.svc.create(reqContext(req.user), body, 'MaintenanceSchedule'); }

  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    const filters: any = {};
    if (q.assetId) filters.assetId = q.assetId;
    return this.svc.findAll(reqContext(req.user), buildPageQuery(q), filters);
  }

  @Put(':id')
  @Roles(Role.OWNER, Role.MANAGER, Role.MAINTENANCE_TECH)
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) { return this.svc.update(reqContext(req.user), id, body, 'MaintenanceSchedule'); }
}

@Controller('work-orders')
export class WorkOrderController {
  constructor(
    private readonly svc: WorkOrderService,
    private readonly engine: EquipmentEngine,
  ) {}

  @Post()
  @Roles(Role.OWNER, Role.MANAGER, Role.MAINTENANCE_TECH, Role.STAFF, Role.MEMBER, Role.TRAINER)
  create(@Req() req: any, @Body() body: any) { return this.svc.create(reqContext(req.user), body, 'WorkOrder'); }

  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    const filters: any = {};
    if (q.assetId) filters.assetId = q.assetId;
    if (q.status) filters.status = q.status;
    if (q.assigneeId) filters.assigneeId = q.assigneeId;
    return this.svc.findAll(reqContext(req.user), buildPageQuery(q), filters);
  }

  @Post(':id/complete')
  @Roles(Role.OWNER, Role.MANAGER, Role.MAINTENANCE_TECH)
  complete(@Req() req: any, @Param('id') id: string, @Body() body: any) { return this.engine.completeWorkOrder(req.user.tenantId, id, body); }

  @Put(':id')
  @Roles(Role.OWNER, Role.MANAGER, Role.MAINTENANCE_TECH)
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) { return this.svc.update(reqContext(req.user), id, body, 'WorkOrder'); }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) { return this.svc.findOne(reqContext(req.user), id); }

  @Delete(':id')
  @Roles(Role.OWNER, Role.MANAGER)
  remove(@Req() req: any, @Param('id') id: string) { return this.svc.remove(reqContext(req.user), id, 'WorkOrder'); }
}