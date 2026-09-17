import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { Public, CurrentUser, Roles, AuthUser } from '../../auth/decorators';
import { TenantService, LocationService, UserService } from './service';
import { buildPageQuery, reqContext } from '../../common/helpers';
import * as bcrypt from 'bcryptjs';

@Controller()
export class TenantController {
  constructor(private readonly svc: TenantService) {}

  @Post('tenants')
  @Roles('SUPER_ADMIN')
  create(@Req() req: any, @Body() body: any) {
    return this.svc.create(reqContext(req.user), body, 'Tenant');
  }

  @Get('tenants')
  @Roles('SUPER_ADMIN')
  findAll(@Req() req: any, @Query() q: any) {
    return this.svc.findAll(reqContext(req.user), buildPageQuery(q));
  }

  @Get('tenants/:id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.svc.findOne(reqContext(req.user), id);
  }

  @Put('tenants/:id')
  @Roles('SUPER_ADMIN', 'OWNER')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.svc.update(reqContext(req.user), id, body, 'Tenant');
  }

  @Delete('tenants/:id')
  @Roles('SUPER_ADMIN')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.svc.remove(reqContext(req.user), id, 'Tenant');
  }
}

@Controller('locations')
export class LocationController {
  constructor(private readonly svc: LocationService) {}

  @Post()
  create(@Req() req: any, @Body() body: any) {
    return this.svc.create(reqContext(req.user), body, 'Location');
  }

  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    return this.svc.findAll(reqContext(req.user), buildPageQuery(q));
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.svc.findOne(reqContext(req.user), id);
  }

  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.svc.update(reqContext(req.user), id, body, 'Location');
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.svc.remove(reqContext(req.user), id, 'Location');
  }
}

@Controller('staff')
export class StaffController {
  constructor(private readonly svc: UserService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'OWNER', 'MANAGER')
  async create(@Req() req: any, @Body() body: any) {
    body.password = await bcrypt.hash(body.password || 'PulseForge@123', 10);
    return this.svc.create(reqContext(req.user), body, 'User');
  }

  @Get()
  @Roles('SUPER_ADMIN', 'OWNER', 'MANAGER', 'STAFF')
  findAll(@Req() req: any, @Query() q: any) {
    const pq = buildPageQuery(q);
    const filters: any = {};
    if (q.role) filters.role = q.role;
    return this.svc.findAll(reqContext(req.user), pq, filters);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.svc.findOne(reqContext(req.user), id);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'OWNER', 'MANAGER')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    if (body.password) body.password = await bcrypt.hash(body.password, 10);
    return this.svc.update(reqContext(req.user), id, body, 'User');
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'OWNER')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.svc.remove(reqContext(req.user), id, 'User');
  }
}