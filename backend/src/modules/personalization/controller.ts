import { Body, Controller, Delete, Get, Param, Post, Query, Req } from '@nestjs/common';
import { Roles } from '../../auth/decorators';
import { WorkoutPlanService, WearableSnapshotService, ChurnScoreService, PersonalizationEngine } from './service';
import { buildPageQuery, reqContext } from '../../common/helpers';
import { Role } from '../../common/constants';

@Controller('workout-plans')
export class WorkoutPlanController {
  constructor(private readonly svc: WorkoutPlanService) {}
  @Post()
  create(@Req() req: any, @Body() body: any) { return this.svc.create(reqContext(req.user), body, 'WorkoutPlan'); }
  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    const filters: any = {};
    if (q.memberId) filters.memberId = q.memberId;
    return this.svc.findAll(reqContext(req.user), buildPageQuery(q), filters);
  }
  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) { return this.svc.findOne(reqContext(req.user), id); }
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) { return this.svc.remove(reqContext(req.user), id, 'WorkoutPlan'); }
}

@Controller('wearables')
export class WearableController {
  constructor(
    private readonly svc: WearableSnapshotService,
    private readonly engine: PersonalizationEngine,
  ) {}

  @Post()
  create(@Req() req: any, @Body() body: any) { return this.svc.create(reqContext(req.user), body, 'WearableSnapshot'); }
  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    const filters: any = {};
    if (q.memberId) filters.memberId = q.memberId;
    return this.svc.findAll(reqContext(req.user), buildPageQuery(q), filters);
  }
  @Get('readiness/:memberId')
  readiness(@Req() req: any, @Param('memberId') memberId: string) {
    return this.engine.readinessSnapshot(req.user.tenantId, memberId);
  }
}

@Controller('churn')
export class ChurnController {
  constructor(private readonly svc: ChurnScoreService) {}
  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    const filters: any = {};
    if (q.memberId) filters.memberId = q.memberId;
    return this.svc.findAll(reqContext(req.user), buildPageQuery(q), filters);
  }
}

@Controller('ai')
export class AiController {
  constructor(
    private readonly engine: PersonalizationEngine,
    private readonly churnSvc: ChurnScoreService,
    private readonly planSvc: WorkoutPlanService,
  ) {}

  @Post('generate-plan')
  @Roles(Role.OWNER, Role.MANAGER, Role.TRAINER)
  generatePlan(@Req() req: any, @Body() body: { memberId: string }) {
    return this.engine.generateWorkoutPlan(req.user.tenantId, body.memberId);
  }

  @Post('churn-risk')
  @Roles(Role.OWNER, Role.MANAGER)
  churnRisk(@Req() req: any, @Body() body: { memberId: string }) {
    return this.engine.computeChurnRisk(req.user.tenantId, body.memberId);
  }

  @Post('coach')
  @Roles(Role.MEMBER, Role.TRAINER, Role.OWNER, Role.MANAGER)
  coach(@Req() req: any, @Body() body: { memberId?: string; message: string }) {
    const memberId = body.memberId || req.user.id;
    return this.engine.aiCoachReply(req.user.tenantId, memberId, body.message);
  }
}