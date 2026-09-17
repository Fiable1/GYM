import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENTITIES } from './entities';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './modules/core/module';
import { MembersModule } from './modules/members/module';
import { BillingModule } from './modules/billing/module';
import { SchedulingModule } from './modules/scheduling/module';
import { AccessModule } from './modules/access/module';
import { EquipmentModule } from './modules/equipment/module';
import { PersonalizationModule } from './modules/personalization/module';
import { PosModule } from './modules/pos/module';
import { CommunityModule } from './modules/community/module';
import { NotificationsModule } from './modules/notifications/module';
import { ReportsModule } from './modules/reports/module';
import { SystemModule } from './modules/system/module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forRoot({
      type: (process.env.DB_TYPE as any) || 'sqljs',
      database: process.env.DB_PATH || 'data/pulseforge.db',
      location: process.env.DB_PATH || 'data/pulseforge.db',
      autoSave: true,
      useLocalForage: false,
      entities: ENTITIES,
      synchronize: true,
      logging: false,
    }),
    AuthModule,
    CoreModule,
    MembersModule,
    BillingModule,
    SchedulingModule,
    AccessModule,
    EquipmentModule,
    PersonalizationModule,
    PosModule,
    CommunityModule,
    NotificationsModule,
    ReportsModule,
    SystemModule,
    GatewayModule,
  ],
})
export class AppModule {}