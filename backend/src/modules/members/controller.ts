import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { Roles, AuthUser } from '../../auth/decorators';
import { MemberService, MembershipPlanService, MembershipService, WaiverService, MemberNoteService, MemberGoalService } from './service';
import { buildPageQuery, reqContext } from '../../common/helpers';

@Controller('members')
export class MemberController {
  constructor(private readonly svc: MemberService) {}

  @Post()
  create(@Req() req: any, @Body() body: any) { return this.svc.create(reqContext(req.user), body, 'Member'); }
  @Get()
  findAll(@Req() req: any, @Query() q: any) { return this.svc.findAll(reqContext(req.user), buildPageQuery(q)); }
  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) { return this.svc.findOne(reqContext(req.user), id); }
  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) { return this.svc.update(reqContext(req.user), id, body, 'Member'); }
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) { return this.svc.remove(reqContext(req.user), id, 'Member'); }
}

@Controller('membership-plans')
export class MembershipPlanController {
  constructor(private readonly svc: MembershipPlanService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'OWNER', 'MANAGER')
  create(@Req() req: any, @Body() body: any) { return this.svc.create(reqContext(req.user), body, 'MembershipPlan'); }
  @Get()
  findAll(@Req() req: any, @Query() q: any) { return this.svc.findAll(reqContext(req.user), buildPageQuery(q)); }
  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) { return this.svc.findOne(reqContext(req.user), id); }
  @Put(':id')
  @Roles('SUPER_ADMIN', 'OWNER', 'MANAGER')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) { return this.svc.update(reqContext(req.user), id, body, 'MembershipPlan'); }
  @Delete(':id')
  @Roles('SUPER_ADMIN', 'OWNER')
  remove(@Req() req: any, @Param('id') id: string) { return this.svc.remove(reqContext(req.user), id, 'MembershipPlan'); }
}

@Controller('memberships')
export class MembershipController {
  constructor(private readonly svc: MembershipService) {}

  @Post()
  create(@Req() req: any, @Body() body: any) { return this.svc.create(reqContext(req.user), body, 'Membership'); }
  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    const pq = buildPageQuery(q);
    const filters: any = {};
    if (q.status) filters.status = q.status;
    if (q.type) filters.type = q.type;
    return this.svc.findAll(reqContext(req.user), pq, filters);
  }
  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) { return this.svc.findOne(reqContext(req.user), id); }
  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) { return this.svc.update(reqContext(req.user), id, body, 'Membership'); }
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) { return this.svc.remove(reqContext(req.user), id, 'Membership'); }
}

@Controller('waivers')
export class WaiverController {
  constructor(private readonly svc: WaiverService) {}

  @Post()
  create(@Req() req: any, @Body() body: any) { return this.svc.create(reqContext(req.user), body, 'Waiver'); }
  @Get()
  findAll(@Req() req: any, @Query() q: any) { return this.svc.findAll(reqContext(req.user), buildPageQuery(q)); }
  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) { return this.svc.findOne(reqContext(req.user), id); }
  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) { return this.svc.update(reqContext(req.user), id, body, 'Waiver'); }
}

@Controller('member-notes')
export class MemberNoteController {
  constructor(private readonly svc: MemberNoteService) {}

  @Post()
  create(@Req() req: any, @Body() body: any) { return this.svc.create(reqContext(req.user), body, 'MemberNote'); }
  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    const filters: any = {};
    if (q.memberId) filters.memberId = q.memberId;
    return this.svc.findAll(reqContext(req.user), buildPageQuery(q), filters);
  }
}

@Controller('member-goals')
export class MemberGoalController {
  constructor(private readonly svc: MemberGoalService) {}

  @Post()
  create(@Req() req: any, @Body() body: any) { return this.svc.create(reqContext(req.user), body, 'MemberGoal'); }
  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    const filters: any = {};
    if (q.memberId) filters.memberId = q.memberId;
    return this.svc.findAll(reqContext(req.user), buildPageQuery(q), filters);
  }
  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) { return this.svc.findOne(reqContext(req.user), id); }
  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) { return this.svc.update(reqContext(req.user), id, body, 'MemberGoal'); }
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) { return this.svc.remove(reqContext(req.user), id, 'MemberGoal'); }
}