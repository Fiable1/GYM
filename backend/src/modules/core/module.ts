import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant, Location } from '../../entities/core.entities';
import { User } from '../../entities/user.entity';
import { TenantService, LocationService, UserService } from './service';
import { TenantController, LocationController, StaffController } from './controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, Location, User])],
  controllers: [TenantController, LocationController, StaffController],
  providers: [TenantService, LocationService, UserService],
  exports: [TenantService, LocationService, UserService],
})
export class CoreModule {}