import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JoinRequest } from '../../entities/leads.entities';
import { Member } from '../../entities/member.entities';
import { AccessCredential } from '../../entities/access.entities';
import { User } from '../../entities/user.entity';
import { Tenant } from '../../entities/core.entities';
import { NotificationsModule } from '../notifications/module';
import { LeadService } from './service';
import { LeadMessagingService } from './messaging.service';
import { LeadController } from './controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([JoinRequest, Member, User, Tenant, AccessCredential]),
    NotificationsModule,
  ],
  controllers: [LeadController],
  providers: [LeadService, LeadMessagingService],
  exports: [LeadService, LeadMessagingService],
})
export class LeadsModule {}