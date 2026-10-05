import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private readonly enabled: boolean;

  constructor() {
    this.enabled = !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASS;
    if (this.enabled) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      this.logger.log('SMTP mail transport configured');
    } else {
      this.logger.warn(
        'SMTP not configured (SMTP_HOST/SMTP_USER/SMTP_PASS). Emails will be logged instead of sent.',
      );
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async send(options: MailOptions): Promise<{ delivered: boolean; reason?: string }> {
    const from = process.env.MAIL_FROM || 'PulseForge <no-reply@pulseforge.io>';

    if (!this.transporter) {
      this.logger.log(
        `[mail:logged] to=${options.to} subject="${options.subject}"\n${options.text}`,
      );
      return { delivered: false, reason: 'SMTP_NOT_CONFIGURED' };
    }

    try {
      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      this.logger.log(`[mail:sent] to=${options.to} subject="${options.subject}"`);
      return { delivered: true };
    } catch (err: any) {
      this.logger.error(`[mail:failed] to=${options.to} error=${err?.message || err}`);
      return { delivered: false, reason: 'SEND_FAILED' };
    }
  }
}