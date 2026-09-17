import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../../entities/communication.entities';
import { User } from '../../entities/user.entity';
import { AuditServiceView, LocalizationService } from './service';
import { AuditController, LocalizationController, SettingsController } from './controller';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, User])],
  controllers: [AuditController, LocalizationController, SettingsController],
  providers: [AuditServiceView, LocalizationService],
  exports: [LocalizationService],
})
export class SystemModule {}