import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassType, Session, Booking, TrainerAvailability } from '../../entities/scheduling.entities';
import { ClassTypeService, SessionService, BookingService, TrainerAvailabilityService, SchedulingEngine } from './service';
import { ClassTypeController, SessionController, BookingController, TrainerAvailabilityController } from './controller';
import { GatewayModule } from '../../gateway/gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassType, Session, Booking, TrainerAvailability]),
    GatewayModule,
  ],
  controllers: [ClassTypeController, SessionController, BookingController, TrainerAvailabilityController],
  providers: [ClassTypeService, SessionService, BookingService, TrainerAvailabilityService, SchedulingEngine],
  exports: [SchedulingEngine, ClassTypeService, SessionService, BookingService],
})
export class SchedulingModule {}