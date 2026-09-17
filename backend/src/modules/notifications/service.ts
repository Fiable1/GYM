import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationTemplate } from '../../entities/communication.entities';
import { ApiBaseService, AuditService } from '../../common/services';

@Injectable()
export class NotificationService extends ApiBaseService<Notification> {
  constructor(@InjectRepository(Notification) r: Repository<Notification>, a: AuditService) { super(r, a); }
}

@Injectable()
export class NotificationTemplateService extends ApiBaseService<NotificationTemplate> {
  constructor(@InjectRepository(NotificationTemplate) r: Repository<NotificationTemplate>, a: AuditService) { super(r, a); }
}

@Injectable()
export class CommunicationEngine {
  constructor(
    @InjectRepository(Notification) private readonly notifRepo: Repository<Notification>,
    @InjectRepository(NotificationTemplate) private readonly templateRepo: Repository<NotificationTemplate>,
  ) {}

  async send(tenantId: string, recipientId: string, subject: string, body?: string, channel: string = 'IN_APP', templateName?: string, variables: any = {}) {
    let finalSubject = subject;
    let finalBody = body;
    if (templateName) {
      const tpl = await this.templateRepo.findOne({ where: { tenantId, name: templateName } as any });
      if (tpl) {
        finalSubject = this.render(tpl.subject, variables);
        finalBody = this.render(tpl.bodyTemplate, variables);
      }
    }
    const notif = await this.notifRepo.save(this.notifRepo.create({
      tenantId, recipientId, channel: channel.toUpperCase(), subject: finalSubject,
      body: finalBody, status: 'SENT', sentAt: new Date(),
    }));
    return notif;
  }

  private render(template: string, vars: any) {
    return template.replace(/\{\{(\w+)\}\}/g, (_m, k) => (vars[k] !== undefined ? String(vars[k]) : `{{${k}}}`));
  }

  async sendScheduledReminders(tenantId: string, reminders: Array<{ recipientId: string; subject: string; body: string; channel?: string }>) {
    const results = [];
    for (const r of reminders) {
      results.push(await this.send(tenantId, r.recipientId, r.subject, r.body, r.channel || 'PUSH'));
    }
    return results;
  }

  async markRead(tenantId: string, id: string) {
    const n = await this.notifRepo.findOne({ where: { id, tenantId } as any });
    if (!n) return { error: 'Notification not found' };
    n.isRead = true;
    n.readAt = new Date();
    return this.notifRepo.save(n);
  }
}