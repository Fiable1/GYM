import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Session, ClassType, Booking, TrainerAvailability } from '../../entities/scheduling.entities';
import { MembershipPlan } from '../../entities/member.entities';
import { Location } from '../../entities/core.entities';
import { LeadService } from '../leads/service';

interface Action {
  label: string;
  payload: Record<string, any>;
}

export interface CoachReply {
  reply: string;
  intent: string;
  read: boolean;
  actions?: Action[];
}

const fmtTime = (d: Date) =>
  d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

const fmtDay = (d: Date) =>
  d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

@Injectable()
export class ConciergeEngine {
  private readonly logger = new Logger(ConciergeEngine.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Session) private readonly sessionRepo: Repository<Session>,
    @InjectRepository(ClassType) private readonly classTypeRepo: Repository<ClassType>,
    @InjectRepository(Booking) private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(TrainerAvailability) private readonly availabilityRepo: Repository<TrainerAvailability>,
    @InjectRepository(MembershipPlan) private readonly planRepo: Repository<MembershipPlan>,
    @InjectRepository(Location) private readonly locationRepo: Repository<Location>,
    private readonly leads: LeadService,
  ) {}

  async handle(tenantId: string, message: string, opts: { email?: string; name?: string; memberId?: string } = {}): Promise<CoachReply> {
    const raw = (message || '').trim();
    const q = raw.toLowerCase();

    if (!raw) {
      return { reply: 'Ask me anything about coaches, classes, plans, or hours.', intent: 'help', read: true };
    }

    if (this.isGreeting(q)) {
      return {
        reply: this.greeting(),
        intent: 'greeting',
        read: true,
        actions: [
          { label: 'Show me the coaches', payload: { kind: 'coaches' } },
          { label: 'What classes are on?', payload: { kind: 'classes' } },
          { label: 'Membership plans', payload: { kind: 'plans' } },
        ],
      };
    }

    if (this.matches(q, ['book', 'reserve', 'schedule', 'sign me up', 'appointment'])) {
      return this.handleBooking(tenantId, raw, opts);
    }

    if (this.matches(q, ['coach', 'trainer', 'instructor'])) {
      return this.listCoaches(tenantId);
    }

    if (this.matches(q, ['class', 'session', 'schedule', 'yoga', 'boxing', 'spin', 'hiit', 'strength'])) {
      return this.listClasses(tenantId);
    }

    if (this.matches(q, ['plan', 'price', 'pricing', 'membership', 'cost', 'how much', 'monthly'])) {
      return this.listPlans(tenantId);
    }

    if (this.matches(q, ['email', 'contact', 'phone'])) {
      return {
        reply: 'Leave your email in the Join form and every update goes to that address. Staff see new requests the moment they land, and you get a confirmation right away.',
        intent: 'contact',
        read: true,
        actions: [{ label: 'Open the Join form', payload: { kind: 'navigate', to: '/join' } }],
      };
    }

    if (this.matches(q, ['open', 'hours', 'location', 'where', 'address', 'parking'])) {
      return this.listLocations(tenantId);
    }

    if (this.matches(q, ['join', 'sign up', 'membership', 'start', 'trial', 'first session'])) {
      return this.handleJoin(tenantId, opts);
    }

    if (this.matches(q, ['tired', 'sore', 'recovery', 'rest', 'sleep', 'hurt', 'pain'])) {
      return {
        reply: 'Recovery is training too. Rest days are when the adaptation actually lands. If something is sharp or persistent pain, stop and see a coach rather than pushing through it. Meanwhile: sleep, water, gentle mobility.',
        intent: 'recovery',
        read: true,
      };
    }

    if (this.matches(q, ['protein', 'diet', 'food', 'eat', 'nutrition', 'weight', 'lose', 'fat'])) {
      return {
        reply: 'Keep it simple: protein around 1.6-2.2 g per kg of bodyweight, most of it spread across the day, and vegetables in every meal. For fat loss, a modest calorie deficit plus daily steps does more than any macro split. Our coaches can build you a plan that fits your actual week.',
        intent: 'nutrition',
        read: true,
      };
    }

    if (this.matches(q, ['beginner', 'start', 'first time', 'never', 'new to'])) {
      return {
        reply: 'Perfect place to start. Book a coach intro session: we assess where you are, then build a plan you can actually keep. Nothing fancy, no judgment.',
        intent: 'beginner',
        read: true,
        actions: [{ label: 'Show me the coaches', payload: { kind: 'coaches' } }],
      };
    }

    if (this.matches(q, ['hi', 'hey', 'hello', 'yo'])) {
      return { reply: 'Hey. Coaches, classes, plans, or hours?', intent: 'greeting', read: true };
    }

    return {
      reply: 'I can help with coaches, class times, membership plans, opening hours, and booking a session with a coach. Try: "who are the coaches", "classes this week", "book me with Diego on Friday at 6pm", or "how much is Forge".',
      intent: 'fallback',
      read: true,
      actions: [
        { label: 'Coaches', payload: { kind: 'coaches' } },
        { label: 'Classes', payload: { kind: 'classes' } },
        { label: 'Plans', payload: { kind: 'plans' } },
      ],
    };
  }

  private async listCoaches(tenantId: string): Promise<CoachReply> {
    const trainers = await this.userRepo.find({
      where: { tenantId, role: In(['TRAINER', 'STAFF', 'MANAGER']), isActive: true, deletedAt: null } as any,
      take: 8,
    });

    if (!trainers.length) {
      return { reply: 'No coach profiles are published right now. Send a join request and we will assign you one directly.', intent: 'coaches', read: true };
    }

    const sessions = await this.sessionRepo.find({
      where: { tenantId, trainerId: In(trainers.map((t) => t.id)), status: 'SCHEDULED' } as any,
      order: { startTime: 'ASC' },
      take: 40,
    });

    const nextByTrainer = new Map<string, Session>();
    for (const s of sessions) {
      if (s.startTime > new Date() && !nextByTrainer.has(s.trainerId!)) {
        nextByTrainer.set(s.trainerId!, s);
      }
    }

    const lines = trainers.map((t) => {
      const next = nextByTrainer.get(t.id);
      const slot = next ? `next open ${fmtDay(next.startTime)} at ${fmtTime(next.startTime)}` : 'no sessions on the calendar';
      return `- ${t.firstName} ${t.lastName || ''}`.trim() + ` (${slot})`;
    });

    return {
      reply: `Our coaching team:\n${lines.join('\n')}\n\nName anyone and a time and I can hold a session for you.`,
      intent: 'coaches',
      read: true,
      actions: trainers.slice(0, 4).map((t) => ({
        label: `Book ${t.firstName}`,
        payload: { kind: 'book', trainerId: t.id, trainerName: t.firstName },
      })),
    };
  }

  private async listClasses(tenantId: string): Promise<CoachReply> {
    const sessions = await this.sessionRepo.find({
      where: { tenantId, status: 'SCHEDULED' } as any,
      order: { startTime: 'ASC' },
      take: 8,
    });

    if (!sessions.length) {
      return { reply: 'Nothing is on the public calendar yet. Ask me for coaches instead and I will set you up directly.', intent: 'classes', read: true };
    }

    const types = await this.classTypeRepo.find({ where: { id: In(sessions.map((s) => s.classTypeId)) } as any });
    const typeMap = new Map(types.map((t) => [t.id, t]));
    const trainers = await this.userRepo.find({ where: { id: In(sessions.map((s) => s.trainerId).filter(Boolean)) } as any });
    const trainerMap = new Map(trainers.map((t) => [t.id, t]));

    const lines = sessions.map((s) => {
      const type = typeMap.get(s.classTypeId);
      const trainer = s.trainerId ? trainerMap.get(s.trainerId) : null;
      const seats = s.maxCapacity - (s.currentBookings || 0);
      return `- ${type?.name || 'Session'} on ${fmtDay(s.startTime)} at ${fmtTime(s.startTime)}${trainer ? ` with ${trainer.firstName}` : ''} (${seats > 0 ? `${seats} spots left` : 'full'})`;
    });

    return {
      reply: `Next on the floor:\n${lines.join('\n')}`,
      intent: 'classes',
      read: true,
      actions: [{ label: 'Book a coach session', payload: { kind: 'book' } }],
    };
  }

  private async listPlans(tenantId: string): Promise<CoachReply> {
    const plans = await this.planRepo.find({ where: { tenantId, isActive: true } as any, take: 6 });
    if (!plans.length) {
      return { reply: 'Plans are being updated. Send a join request with the plan you want and we will sort it out.', intent: 'plans', read: true };
    }

    const lines = plans.map((p) => {
      const features = p.features ? safeParse(p.features) : null;
      const extra = Array.isArray(features) && features.length ? ` - ${features.slice(0, 2).join(', ')}` : '';
      return `- ${p.name}: $${Number(p.price).toFixed(0)}${p.durationDays ? ` / ${p.durationDays} days` : ''}${extra}`;
    });

    return {
      reply: `Membership plans:\n${lines.join('\n')}\n\nAll of them include a first session and a coach intro.`,
      intent: 'plans',
      read: true,
      actions: [{ label: 'Sign me up', payload: { kind: 'join' } }],
    };
  }

  private async listLocations(tenantId: string): Promise<CoachReply> {
    const locations = await this.locationRepo.find({ where: { tenantId, isActive: true } as any, take: 6 });
    if (!locations.length) {
      return { reply: 'Location details are not published yet. Send a join request and we will confirm the address for you.', intent: 'hours', read: true };
    }

    const lines = locations.map((l) =>
      `- ${l.name}${l.address ? `, ${l.address}` : ''}${l.city ? ` (${l.city})` : ''} - open ${l.is24Hours ? '24 hours' : `${l.openingHour} to ${l.closingHour}`}`,
    );

    return { reply: `Where we are:\n${lines.join('\n')}`, intent: 'hours', read: true };
  }

  private async handleJoin(tenantId: string, opts: { email?: string; name?: string }): Promise<CoachReply> {
    if (opts.email) {
      return {
        reply: `Good. I already have ${opts.email} on file, so a coach will reach out there. If you want to speed it up, use the Join form and we will confirm by email within the day.`,
        intent: 'join',
        read: true,
      };
    }
    return {
      reply: 'Fill in the Join form with your name and email. A coach confirms within one business day and every update goes straight to your inbox.',
      intent: 'join',
      read: true,
      actions: [{ label: 'Open the Join form', payload: { kind: 'navigate', to: '/join' } }],
    };
  }

  private async handleBooking(
    tenantId: string,
    raw: string,
    opts: { email?: string; name?: string; memberId?: string },
  ): Promise<CoachReply> {
    const trainers = await this.userRepo.find({
      where: { tenantId, role: In(['TRAINER', 'STAFF']), isActive: true, deletedAt: null } as any,
    });

    const trainer = this.matchTrainer(raw, trainers);
    const when = this.parseWhen(raw);

    if (!trainer && !when) {
      return {
        reply: `Happy to set that up. Tell me which coach and roughly when, for example "book me with Diego on Friday at 6pm".\n\nOur coaches: ${trainers.slice(0, 6).map((t) => t.firstName).join(', ')}.`,
        intent: 'book_prompt',
        read: true,
        actions: trainers.slice(0, 4).map((t) => ({
          label: `Book ${t.firstName}`,
          payload: { kind: 'book', trainerId: t.id, trainerName: t.firstName },
        })),
      };
    }

    if (!trainer) {
      return {
        reply: `I could not match a coach to that. Our coaches are ${trainers.map((t) => t.firstName).join(', ')}. Which one, and what day works?`,
        intent: 'book_prompt',
        read: true,
        actions: trainers.slice(0, 4).map((t) => ({
          label: `Book ${t.firstName}`,
          payload: { kind: 'book', trainerId: t.id, trainerName: t.firstName },
        })),
      };
    }

    const next = await this.findNextSlotFor(tenantId, trainer.id);

    if (when) {
      return {
        reply: `Requested: ${trainer.firstName} ${trainer.lastName || ''} around ${when.label}. ${next ? `Their next open slot is ${fmtDay(next.startTime)} at ${fmtTime(next.startTime)}.` : 'Their calendar is open that week.'} Leave your email in the Join form and the front desk will confirm that slot and email you the details.`,
        intent: 'booking_draft',
        read: true,
        actions: [{ label: 'Open the Join form', payload: { kind: 'navigate', to: '/join' } }],
      };
    }

    return {
      reply: `${trainer.firstName} is ${next ? `free ${fmtDay(next.startTime)} at ${fmtTime(next.startTime)}` : 'open this week'}. What day and time suits you?`,
      intent: 'booking_draft',
      read: true,
      actions: next ? [{
        label: `Confirm ${fmtDay(next.startTime)} ${fmtTime(next.startTime)}`,
        payload: { kind: 'book_confirm', sessionId: next.id },
      }] : [],
    };
  }

  private async findNextSlotFor(tenantId: string, trainerId: string): Promise<Session | null> {
    const sessions = await this.sessionRepo.find({
      where: { tenantId, trainerId, status: 'SCHEDULED' } as any,
      order: { startTime: 'ASC' },
      take: 20,
    });
    return sessions.find((s) => s.startTime > new Date()) || null;
  }

  private matchTrainer(raw: string, trainers: User[]): User | null {
    const lower = raw.toLowerCase();
    for (const t of trainers) {
      const first = t.firstName?.toLowerCase() || '';
      const last = t.lastName?.toLowerCase() || '';
      if (first && new RegExp(`\\b${escapeRe(first)}\\b`).test(lower)) return t;
      if (last && new RegExp(`\\b${escapeRe(last)}\\b`).test(lower)) return t;
    }
    return null;
  }

  private parseWhen(raw: string): { label: string; date?: Date } | null {
    const lower = raw.toLowerCase();

    const timeMatch = lower.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/);
    let hour: number | null = null;
    let minute = 0;
    if (timeMatch) {
      hour = parseInt(timeMatch[1], 10);
      minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const meridiem = timeMatch[3];
      if (meridiem === 'pm' && hour < 12) hour += 12;
      if (meridiem === 'am' && hour === 12) hour = 0;
      if (hour > 23) hour = null;
    }

    let dayOffset: number | null = null;
    let dayLabel = '';
    if (lower.includes('today') || lower.includes('tonight')) { dayOffset = 0; dayLabel = 'today'; }
    else if (lower.includes('tomorrow')) { dayOffset = 1; dayLabel = 'tomorrow'; }
    else {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const idx = days.findIndex((d) => lower.includes(d));
      if (idx !== -1) {
        const now = new Date().getDay();
        dayOffset = (idx - now + 7) % 7 || 7;
        dayLabel = days[idx];
      }
    }

    if (dayOffset === null && hour === null) return null;

    const d = new Date();
    if (dayOffset !== null) d.setDate(d.getDate() + dayOffset);
    if (hour !== null) d.setHours(hour, minute, 0, 0);
    else d.setHours(18, 0, 0, 0);

    const parts: string[] = [];
    if (dayLabel) parts.push(dayLabel);
    if (hour !== null) parts.push(fmtTime(d));

    return { label: parts.join(' at ') || d.toDateString(), date: d };
  }

  private isGreeting(q: string) {
    return /^(hi|hey|hello|yo|sup|good (morning|afternoon|evening))\b/.test(q.trim());
  }

  private greeting() {
    const h = new Date().getHours();
    const part = h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
    return `Good ${part}. I can pull up coaches, class times, plans, and hours, and hold a session for you. What do you need?`;
  }

  private matches(q: string, words: string[]) {
    return words.some((w) => q.includes(w));
  }
}

function safeParse(value: string): any {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}