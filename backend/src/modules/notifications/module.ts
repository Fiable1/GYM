import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification, NotificationTemplate } from '../../entities/communication.entities';
import { NotificationService, NotificationTemplateService, CommunicationEngine } from './service';
import { NotificationController, NotificationTemplateController } from './controller';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, NotificationTemplate])],
  controllers: [NotificationController, NotificationTemplateController],
  providers: [NotificationService, NotificationTemplateService, CommunicationEngine],
  exports: [NotificationService, CommunicationEngine],
})
export class NotificationsModule {}