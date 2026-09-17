import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessCredential, CheckIn } from '../../entities/access.entities';
import { Member } from '../../entities/member.entities';
import { AccessCredentialService, CheckInService, CheckInEngine } from './service';
import { AccessCredentialController, CheckInController } from './controller';
import { GatewayModule } from '../../gateway/gateway.module';

@Module({
  imports: [TypeOrmModule.forFeature([AccessCredential, CheckIn, Member]), GatewayModule],
  controllers: [AccessCredentialController, CheckInController],
  providers: [AccessCredentialService, CheckInService, CheckInEngine],
  exports: [CheckInEngine],
})
export class AccessModule {}