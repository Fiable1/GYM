import { Body, Controller, Delete, Get, Param, Post, Query, Req } from '@nestjs/common';
import { Roles } from '../../auth/decorators';
import { AccessCredentialService, CheckInService, CheckInEngine } from './service';
import { buildPageQuery, reqContext } from '../../common/helpers';
import { Role } from '../../common/constants';

@Controller('access-credentials')
export class AccessCredentialController {
  constructor(private readonly svc: AccessCredentialService) {}
  @Post()
  create(@Req() req: any, @Body() body: any) { return this.svc.create(reqContext(req.user), body, 'AccessCredential'); }
  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    const filters: any = {};
    if (q.memberId) filters.memberId = q.memberId;
    return this.svc.findAll(reqContext(req.user), buildPageQuery(q), filters);
  }
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) { return this.svc.remove(reqContext(req.user), id, 'AccessCredential'); }
}

@Controller('check-ins')
export class CheckInController {
  constructor(
    private readonly svc: CheckInService,
    private readonly engine: CheckInEngine,
  ) {}

  @Post()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF, Role.TRAINER)
  checkIn(@Req() req: any, @Body() body: any) {
    return this.engine.processCheckIn(req.user.tenantId, body);
  }

  @Post(':id/checkout')
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  checkOut(@Req() req: any, @Param('id') id: string) {
    return this.engine.processCheckOut(req.user.tenantId, id);
  }

  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    const filters: any = {};
    if (q.memberId) filters.memberId = q.memberId;
    return this.svc.findAll(reqContext(req.user), buildPageQuery(q), filters);
  }

  @Get('recent')
  recent(@Req() req: any) {
    return this.engine.getRecentCheckins(req.user.tenantId, 50);
  }

  @Get('stats')
  stats(@Req() req: any, @Query('range') range: string) {
    return this.engine.getStats(req.user.tenantId, range || 'day');
  }
}