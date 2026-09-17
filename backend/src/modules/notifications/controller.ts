import { Body, Controller, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { Roles } from '../../auth/decorators';
import { NotificationService, NotificationTemplateService, CommunicationEngine } from './service';
import { buildPageQuery, reqContext } from '../../common/helpers';
import { Role } from '../../common/constants';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly svc: NotificationService,
    private readonly engine: CommunicationEngine,
  ) {}

  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    const filters: any = {};
    if (q.recipientId) filters.recipientId = q.recipientId;
    return this.svc.findAll(reqContext(req.user), buildPageQuery(q), filters).then(async (res: any) => {
      const items = await Promise.all(res.items.map(async (n: any) => ({ ...n, read: n.isRead })));
      return { ...res, items };
    });
  }

  @Get('mine')
  mine(@Req() req: any, @Query() q: any) {
    return this.svc.findAll(reqContext(req.user), buildPageQuery(q), { recipientId: req.user.id });
  }

  @Put(':id/read')
  markRead(@Req() req: any, @Param('id') id: string) {
    return this.engine.markRead(req.user.tenantId, id);
  }

  @Post('send')
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  send(@Req() req: any, @Body() body: { recipientId: string; subject: string; body?: string; channel?: string; templateName?: string; variables?: any }) {
    return this.engine.send(req.user.tenantId, body.recipientId, body.subject, body.body, body.channel, body.templateName, body.variables);
  }
}

@Controller('notification-templates')
export class NotificationTemplateController {
  constructor(private readonly svc: NotificationTemplateService) {}
  @Post()
  @Roles(Role.OWNER, Role.MANAGER)
  create(@Req() req: any, @Body() body: any) { return this.svc.create(reqContext(req.user), body, 'NotificationTemplate'); }
  @Get()
  findAll(@Req() req: any, @Query() q: any) { return this.svc.findAll(reqContext(req.user), buildPageQuery(q)); }
  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) { return this.svc.update(reqContext(req.user), id, body, 'NotificationTemplate'); }
}