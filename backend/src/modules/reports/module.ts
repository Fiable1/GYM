import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member, Membership } from '../../entities/member.entities';
import { Invoice, Transaction } from '../../entities/billing.entities';
import { CheckIn } from '../../entities/access.entities';
import { Session, Booking } from '../../entities/scheduling.entities';
import { ChurnScore } from '../../entities/personalization.entities';
import { ReportsService } from './service';
import { ReportsController } from './controller';

@Module({
  imports: [TypeOrmModule.forFeature([Member, Membership, Invoice, Transaction, CheckIn, Session, Booking, ChurnScore])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}