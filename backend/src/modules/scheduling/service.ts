import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassType, Session, Booking, TrainerAvailability } from '../../entities/scheduling.entities';
import { ApiBaseService, AuditService } from '../../common/services';

@Injectable()
export class ClassTypeService extends ApiBaseService<ClassType> {
  constructor(@InjectRepository(ClassType) r: Repository<ClassType>, a: AuditService) { super(r, a); }
}

@Injectable()
export class SessionService extends ApiBaseService<Session> {
  constructor(@InjectRepository(Session) r: Repository<Session>, a: AuditService) { super(r, a); }
}

@Injectable()
export class BookingService extends ApiBaseService<Booking> {
  constructor(@InjectRepository(Booking) r: Repository<Booking>, a: AuditService) { super(r, a); }
}

@Injectable()
export class TrainerAvailabilityService extends ApiBaseService<TrainerAvailability> {
  constructor(@InjectRepository(TrainerAvailability) r: Repository<TrainerAvailability>, a: AuditService) { super(r, a); }
}

@Injectable()
export class SchedulingEngine {
  constructor(
    @InjectRepository(Session) private readonly sessionRepo: Repository<Session>,
    @InjectRepository(Booking) private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(ClassType) private readonly classRepo: Repository<ClassType>,
  ) {}

  async createSession(tenantId: string, actorId: string, body: any): Promise<Session> {
    const classType = body.classTypeId
      ? await this.classRepo.findOne({ where: { id: body.classTypeId } })
      : null;
    const start = new Date(body.startTime);
    const duration = body.durationMinutes || classType?.durationMinutes || 60;
    const end = new Date(start.getTime() + duration * 60000);
    const maxCapacity = body.maxCapacity || classType?.maxCapacity || 20;

    const session = await this.sessionRepo.save(this.sessionRepo.create({
      tenantId,
      createdBy: actorId,
      classTypeId: body.classTypeId,
      trainerId: body.trainerId,
      locationId: body.locationId,
      startTime: start,
      endTime: end,
      maxCapacity,
      currentBookings: 0,
      price: body.price ?? classType?.price ?? 0,
      sessionType: body.sessionType || 'CLASS',
      status: body.status || 'SCHEDULED',
      isLivestream: body.isLivestream || false,
      livestreamUrl: body.livestreamUrl,
      notes: body.notes,
    }));
    return session;
  }

  async createBooking(tenantId: string, actorId: string, memberId: string, body: any): Promise<Booking> {
    const session = await this.sessionRepo.findOne({ where: { id: body.sessionId } });
    if (!session) throw new BadRequestException('Session not found');
    if (session.status !== 'SCHEDULED') throw new BadRequestException('Session is not open for booking');

    const exists = await this.bookingRepo.findOne({ where: { sessionId: session.id, memberId } });
    if (exists && exists.status !== 'CANCELLED') throw new BadRequestException('Already booked into this session');

    const confirmedCount = await this.bookingRepo.count({
      where: { sessionId: session.id, status: 'CONFIRMED' as any },
    });

    const isWaitlist = confirmedCount >= session.maxCapacity;
    if (!isWaitlist) session.currentBookings = confirmedCount + 1;

    const booking = await this.bookingRepo.save(this.bookingRepo.create({
      tenantId,
      createdBy: actorId,
      sessionId: session.id,
      memberId,
      status: isWaitlist ? 'WAITLIST' : 'CONFIRMED',
      checkInStatus: 'PENDING',
      amountPaid: body.amountPaid || 0,
    }));

    await this.sessionRepo.save(session);
    return booking;
  }

  async cancelBooking(tenantId: string, bookingId: string, actorId: string, reason?: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({ where: { id: bookingId, tenantId } });
    if (!booking) throw new BadRequestException('Booking not found');
    const wasConfirmed = booking.status === 'CONFIRMED';
    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason;
    const saved = await this.bookingRepo.save(booking);

    const session = await this.sessionRepo.findOne({ where: { id: booking.sessionId } });
    if (session && wasConfirmed) {
      session.currentBookings = Math.max(0, session.currentBookings - 1);
      await this.sessionRepo.save(session);
      await this.promoteWaitlist(session.id, tenantId);
    }
    return saved;
  }

  private async promoteWaitlist(sessionId: string, tenantId: string): Promise<void> {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId, tenantId } });
    if (!session) return;
    const waitlist = await this.bookingRepo.find({
      where: { sessionId, status: 'WAITLIST' as any },
      order: { createdAt: 'ASC' },
    });
    for (const w of waitlist) {
      if (session.currentBookings > session.maxCapacity) break;
      w.status = 'CONFIRMED';
      w.checkInStatus = 'PENDING';
      session.currentBookings += 1;
      await this.bookingRepo.save(w);
    }
    await this.sessionRepo.save(session);
  }

  async checkInBooking(tenantId: string, bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({ where: { id: bookingId, tenantId } });
    if (!booking) throw new BadRequestException('Booking not found');
    booking.checkInStatus = 'CHECKED_IN';
    booking.status = booking.status === 'WAITLIST' ? 'CONFIRMED' : booking.status;
    const saved = await this.bookingRepo.save(booking);
    const session = await this.sessionRepo.findOne({ where: { id: booking.sessionId } });
    if (session && session.currentBookings < session.maxCapacity) {
      session.currentBookings += 1;
      await this.sessionRepo.save(session);
    }
    return saved;
  }
}