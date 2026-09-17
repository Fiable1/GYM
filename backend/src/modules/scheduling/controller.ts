import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { CurrentUser, Roles, AuthUser } from '../../auth/decorators';
import { ClassTypeService, SessionService, BookingService, TrainerAvailabilityService, SchedulingEngine } from './service';
import { buildPageQuery, reqContext } from '../../common/helpers';
import { Role } from '../../common/constants';
import { EventsGateway } from '../../gateway/events.gateway';

@Controller('class-types')
export class ClassTypeController {
  constructor(private readonly svc: ClassTypeService) {}

  @Post()
  @Roles(Role.OWNER, Role.MANAGER, Role.TRAINER)
  create(@Req() req: any, @Body() body: any) { return this.svc.create(reqContext(req.user), body, 'ClassType'); }
  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    const filters: any = {};
    if (q.category) filters.category = q.category;
    return this.svc.findAll(reqContext(req.user), buildPageQuery(q), filters);
  }
  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) { return this.svc.findOne(reqContext(req.user), id); }
  @Put(':id')
  @Roles(Role.OWNER, Role.MANAGER, Role.TRAINER)
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) { return this.svc.update(reqContext(req.user), id, body, 'ClassType'); }
  @Delete(':id')
  @Roles(Role.OWNER, Role.MANAGER)
  remove(@Req() req: any, @Param('id') id: string) { return this.svc.remove(reqContext(req.user), id, 'ClassType'); }
}

@Controller('sessions')
export class SessionController {
  constructor(
    private readonly svc: SessionService,
    private readonly engine: SchedulingEngine,
  ) {}

  @Post()
  @Roles(Role.OWNER, Role.MANAGER, Role.TRAINER)
  async create(@Req() req: any, @Body() body: any) {
    return this.engine.createSession(req.user.tenantId, req.user.id, body);
  }

  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    const pq = buildPageQuery(q);
    const filters: any = {};
    if (q.classTypeId) filters.classTypeId = q.classTypeId;
    if (q.trainerId) filters.trainerId = q.trainerId;
    if (q.sessionType) filters.sessionType = q.sessionType;
    return this.svc.findAll(reqContext(req.user), pq, filters);
  }

  @Post(':id/cancel')
  @Roles(Role.OWNER, Role.MANAGER)
  cancel(@Req() req: any, @Param('id') id: string) {
    return this.svc.update(reqContext(req.user), id, { status: 'CANCELLED' }, 'Session');
  }

  @Get('upcoming/next')
  async upcoming(@Req() req: any, @CurrentUser() user: AuthUser) {
    const now = new Date();
    const qb = await (await this.svc.rawRepository()).createQueryBuilder('s');
    qb.where('s.tenantId = :t', { t: req.user.tenantId })
      .andWhere('s.deletedAt IS NULL')
      .andWhere('s.startTime >= :now', { now: now.toISOString() })
      .andWhere("s.status = 'SCHEDULED'")
      .orderBy('s.startTime', 'ASC')
      .take(user.role === Role.MEMBER ? 50 : 300);
    return qb.getMany();
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) { return this.svc.findOne(reqContext(req.user), id); }

  @Put(':id')
  @Roles(Role.OWNER, Role.MANAGER, Role.TRAINER)
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) { return this.svc.update(reqContext(req.user), id, body, 'Session'); }

  @Delete(':id')
  @Roles(Role.OWNER, Role.MANAGER)
  remove(@Req() req: any, @Param('id') id: string) { return this.svc.remove(reqContext(req.user), id, 'Session'); }
}

@Controller('bookings')
export class BookingController {
  constructor(
    private readonly svc: BookingService,
    private readonly engine: SchedulingEngine,
    private readonly gateway: EventsGateway,
  ) {}

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    const memberId = body.memberId || (req.user.role === Role.MEMBER ? req.user.id : undefined);
    if (!memberId) return { error: 'memberId required' };
    const booking = await this.engine.createBooking(req.user.tenantId, req.user.id, memberId, body);
    this.gateway.broadcast('booking.created', booking);
    return booking;
  }

  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    const filters: any = {};
    if (q.memberId) filters.memberId = q.memberId;
    if (q.sessionId) filters.sessionId = q.sessionId;
    if (q.status) filters.status = q.status;
    return this.svc.findAll(reqContext(req.user), buildPageQuery(q), filters);
  }

  @Get('mine/:memberId')
  async mine(@Req() req: any, @Param('memberId') memberId: string, @Query() q: any) {
    return this.svc.findAll(reqContext(req.user), buildPageQuery(q), { memberId });
  }

  @Post(':id/cancel')
  async cancel(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const result = await this.engine.cancelBooking(req.user.tenantId, id, req.user.id, body?.reason);
    this.gateway.broadcast('booking.cancelled', { id });
    return result;
  }

  @Post(':id/check-in')
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF, Role.TRAINER)
  checkIn(@Req() req: any, @Param('id') id: string) {
    const result = this.engine.checkInBooking(req.user.tenantId, id);
    this.gateway.broadcast('booking.checked_in', { id });
    return result;
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) { return this.svc.findOne(reqContext(req.user), id); }
}

@Controller('trainer-availability')
export class TrainerAvailabilityController {
  constructor(private readonly svc: TrainerAvailabilityService) {}
  @Post()
  @Roles(Role.OWNER, Role.MANAGER, Role.TRAINER)
  create(@Req() req: any, @Body() body: any) { return this.svc.create(reqContext(req.user), body, 'TrainerAvailability'); }
  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    const filters: any = {};
    if (q.trainerId) filters.trainerId = q.trainerId;
    return this.svc.findAll(reqContext(req.user), buildPageQuery(q), filters);
  }
  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) { return this.svc.update(reqContext(req.user), id, body, 'TrainerAvailability'); }
}