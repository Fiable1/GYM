import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Notification, NotificationTemplate } from '../../entities/communication.entities';
import { User } from '../../entities/user.entity';
import { ApiBaseService, AuditService } from '../../common/services';
import { MailService } from '../../common/mail.service';

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
    private readonly mail: MailService,
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

  /**
   * Records an in-app notification and, when the recipient has an email address
   * on file, attempts real SMTP delivery. Email failures never break the caller.
   */
  async sendWithEmail(
    tenantId: string,
    recipientId: string,
    email: string | null | undefined,
    subject: string,
    body: string,
    templateName?: string,
    variables: any = {},
  ) {
    const inApp = await this.send(tenantId, recipientId, subject, body, 'IN_APP', templateName, variables);

    if (!email) {
      return { notification: inApp, email: { delivered: false, reason: 'NO_EMAIL_ON_FILE' } };
    }

    let mailSubject = subject;
    let mailBody = body;
    if (templateName) {
      const tpl = await this.templateRepo.findOne({ where: { tenantId, name: templateName } as any });
      if (tpl) {
        mailSubject = this.render(tpl.subject, variables);
        mailBody = this.render(tpl.bodyTemplate, variables);
      }
    }

    const result = await this.mail.send({
      to: email,
      subject: mailSubject,
      text: mailBody,
      html: this.wrapHtml(mailSubject, mailBody),
    });

    if (result.delivered) {
      await this.notifRepo.save(
        this.notifRepo.create({
          tenantId,
          recipientId,
          channel: 'EMAIL',
          subject: mailSubject,
          body: mailBody,
          status: 'SENT',
          sentAt: new Date(),
        }),
      );
    }

    return { notification: inApp, email: result };
  }

  /** Fan out a message to every staff address in a tenant. */
  async broadcastToStaff(
    tenantId: string,
    staff: Array<{ id: string; email?: string }>,
    subject: string,
    body: string,
  ) {
    const results: any[] = [];
    for (const member of staff) {
      const r = await this.sendWithEmail(tenantId, member.id, member.email, subject, body);
      results.push({ recipientId: member.id, email: member.email, ...r.email });
    }
    return results;
  }

  async notifyStaffRole(
    tenantId: string,
    roles: string[],
    subject: string,
    body: string,
  ): Promise<any[]> {
    const users = await this.notifRepo.manager
      .getRepository(User)
      .find({
        where: { tenantId, role: In(roles), isActive: true, deletedAt: null } as any,
      });
    return this.broadcastToStaff(
      tenantId,
      users.map((u: any) => ({ id: u.id, email: u.email })),
      subject,
      body,
    );
  }

  private wrapHtml(subject: string, body: string) {
    const escaped = (body || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br />');
    return `<div style="font-family:Arial,Helvetica,sans-serif;background:#050505;color:#f4f1ea;padding:32px;border-radius:12px;border:1px solid rgba(255,77,28,0.35);max-width:560px">
  <h2 style="margin:0 0 16px;font-family:Arial Black,Arial,sans-serif;text-transform:uppercase;letter-spacing:0.02em;color:#ff4d1c">${subject}</h2>
  <div style="font-size:15px;line-height:1.6;color:#d8d3c8">${escaped}</div>
  <hr style="border:none;border-top:1px solid rgba(244,241,234,0.12);margin:24px 0" />
  <p style="margin:0;font-size:12px;color:#9a958c">PulseForge Athletic Club</p>
</div>`;
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