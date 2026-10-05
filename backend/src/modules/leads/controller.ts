import { BadRequestException, Body, Controller, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { Public, Roles } from '../../auth/decorators';
import { Role } from '../../common/constants';
import { buildPageQuery } from '../../common/helpers';
import { LeadService } from './service';

@Controller('join-requests')
export class LeadController {
  constructor(private readonly svc: LeadService) {}

  /** Public. Used by the join form on the marketing site. */
  @Public()
  @Post()
  submit(@Body() body: any) {
    return this.svc.submitPublic(body);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.OWNER, Role.MANAGER, Role.STAFF)
  findAll(@Req() req: any, @Query() q: any) {
    const filters = { status: q.status || undefined, search: q.search || undefined };
    return this.svc.findAll(req.user.tenantId, buildPageQuery(q), filters);
  }

  @Get('counts')
  @Roles(Role.SUPER_ADMIN, Role.OWNER, Role.MANAGER, Role.STAFF)
  counts(@Req() req: any) {
    return this.svc.counts(req.user.tenantId);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.OWNER, Role.MANAGER, Role.STAFF)
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.svc.findOne(req.user.tenantId, id);
  }

  @Put(':id/review')
  @Roles(Role.SUPER_ADMIN, Role.OWNER, Role.MANAGER)
  async review(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const decision = body?.decision;
    if (decision !== 'APPROVED' && decision !== 'REJECTED') {
      throw new BadRequestException('decision must be APPROVED or REJECTED');
    }
    return this.svc.review(req.user.tenantId, id, decision, req.user.id, {
      staffNote: body.staffNote,
      createAccount: !!body.createAccount,
    });
  }
}