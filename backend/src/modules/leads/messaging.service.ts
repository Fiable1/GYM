import { Injectable } from '@nestjs/common';
import { CommunicationEngine } from '../notifications/service';

export const JOIN_REQUEST_TEMPLATE = 'JoinRequestReceived';
export const JOIN_APPROVED_TEMPLATE = 'JoinRequestApproved';
export const JOIN_REJECTED_TEMPLATE = 'JoinRequestRejected';

@Injectable()
export class LeadMessagingService {
  constructor(private readonly comms: CommunicationEngine) {}

  /** Staff are notified the moment a public join request lands. */
  async notifyStaffOfNewRequest(tenantId: string, lead: {
    id: string; name: string; email: string; phone?: string; plan: string; goal?: string;
  }) {
    const subject = `New join request: ${lead.name}`;
    const body = [
      `${lead.name} just requested membership at PulseForge.`,
      '',
      `Plan: ${lead.plan}`,
      `Goal: ${lead.goal || 'Not provided'}`,
      `Email: ${lead.email}`,
      `Phone: ${lead.phone || 'Not provided'}`,
      '',
      'Review and respond from the staff dashboard under Join Requests.',
    ].join('\n');

    return this.comms.notifyStaffRole(
      tenantId,
      ['SUPER_ADMIN', 'OWNER', 'MANAGER', 'STAFF'],
      subject,
      body,
    );
  }

  /** Confirmation + status updates always go to the address the visitor typed in. */
  async notifyProspect(tenantId: string, recipientId: string, email: string, lead: {
    name: string; plan: string;
  }, kind: 'received' | 'approved' | 'rejected', staffNote?: string) {
    const firstName = lead.name.split(' ')[0];

    if (kind === 'received') {
      return this.comms.sendWithEmail(
        tenantId,
        recipientId,
        email,
        'We received your request',
        [
          `Hi ${firstName},`,
          '',
          'Your PulseForge request is in. A coach will contact you within one business day to set up your first session.',
          '',
          `Plan you asked about: ${lead.plan}`,
          '',
          'Bring water and comfortable shoes. We will handle the rest.',
          '— PulseForge Athletic Club',
        ].join('\n'),
      );
    }

    if (kind === 'approved') {
      return this.comms.sendWithEmail(
        tenantId,
        recipientId,
        email,
        'You are in',
        [
          `Hi ${firstName},`,
          '',
          'Good news: your membership request has been approved.',
          staffNote ? `A note from our team: ${staffNote}` : '',
          '',
          'Reply to this email or stop by the front desk to book your first session.',
          '— PulseForge Athletic Club',
        ].filter(Boolean).join('\n'),
      );
    }

    return this.comms.sendWithEmail(
      tenantId,
      recipientId,
      email,
      'About your PulseForge request',
      [
        `Hi ${firstName},`,
        '',
        'Thank you for your interest. We are not able to move forward with this request at the moment.',
        staffNote ? `Reason: ${staffNote}` : '',
        '',
        'If you have questions, reply to this email and a manager will get back to you.',
        '— PulseForge Athletic Club',
      ].filter(Boolean).join('\n'),
    );
  }
}