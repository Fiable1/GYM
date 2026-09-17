import { Controller, Get, Query, Req } from '@nestjs/common';
import { ReportsService } from './service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  @Get('dashboard')
  dashboard(@Req() req: any) { return this.svc.dashboard(req.user.tenantId); }

  @Get('revenue')
  revenue(@Req() req: any, @Query('months') months: string) { return this.svc.revenueTrend(req.user.tenantId, parseInt(months) || 6); }

  @Get('retention')
  retention(@Req() req: any) { return this.svc.computeRetention(req.user.tenantId); }

  @Get('demographics')
  demographics(@Req() req: any) { return this.svc.demographics(req.user.tenantId); }

  @Get('visits')
  visits(@Req() req: any, @Query('days') days: string) { return this.svc.visitsTrend(req.user.tenantId, parseInt(days) || 14); }

  @Get('lifeline')
  lifeline(@Req() req: any) { return this.svc.lifeline(req.user.tenantId); }
}