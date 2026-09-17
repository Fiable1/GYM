import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Challenge, ChallengeEntry } from '../../entities/pos.entities';
import { Member } from '../../entities/member.entities';
import { ChallengeService, ChallengeEngine } from './service';
import { ChallengeController } from './controller';

@Module({
  imports: [TypeOrmModule.forFeature([Challenge, ChallengeEntry, Member])],
  controllers: [ChallengeController],
  providers: [ChallengeService, ChallengeEngine],
  exports: [ChallengeService],
})
export class CommunityModule {}