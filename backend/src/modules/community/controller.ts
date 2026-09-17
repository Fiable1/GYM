import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { Roles } from '../../auth/decorators';
import { ChallengeService, ChallengeEngine } from './service';
import { buildPageQuery, reqContext } from '../../common/helpers';
import { Role } from '../../common/constants';

@Controller('challenges')
export class ChallengeController {
  constructor(
    private readonly svc: ChallengeService,
    private readonly engine: ChallengeEngine,
  ) {}

  @Post()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  create(@Req() req: any, @Body() body: any) { return this.svc.create(reqContext(req.user), body, 'Challenge'); }

  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    const filters: any = {};
    if (q.status) filters.status = q.status;
    return this.svc.findAll(reqContext(req.user), buildPageQuery(q), filters);
  }

  @Get(':id/leaderboard')
  leaderboard(@Req() req: any, @Param('id') id: string) { return this.engine.leaderboard(req.user.tenantId, id); }

  @Post(':id/progress')
  @Roles(Role.MEMBER, Role.TRAINER, Role.OWNER, Role.MANAGER)
  progress(@Req() req: any, @Param('id') id: string, @Body() body: { memberId?: string; delta: number }) {
    const memberId = body.memberId || req.user.id;
    return this.engine.updateProgress(req.user.tenantId, id, memberId, body.delta);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) { return this.svc.findOne(reqContext(req.user), id); }

  @Put(':id')
  @Roles(Role.OWNER, Role.MANAGER)
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) { return this.svc.update(reqContext(req.user), id, body, 'Challenge'); }

  @Delete(':id')
  @Roles(Role.OWNER, Role.MANAGER)
  remove(@Req() req: any, @Param('id') id: string) { return this.svc.remove(reqContext(req.user), id, 'Challenge'); }
}