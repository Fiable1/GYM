import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutPlan, WearableSnapshot, ChurnScore } from '../../entities/personalization.entities';
import { MemberGoal, Member } from '../../entities/member.entities';
import { WorkoutPlanService, WearableSnapshotService, ChurnScoreService, PersonalizationEngine } from './service';
import { WorkoutPlanController, WearableController, ChurnController, AiController } from './controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkoutPlan, WearableSnapshot, ChurnScore, MemberGoal, Member])],
  controllers: [WorkoutPlanController, WearableController, ChurnController, AiController],
  providers: [WorkoutPlanService, WearableSnapshotService, ChurnScoreService, PersonalizationEngine],
  exports: [PersonalizationEngine],
})
export class PersonalizationModule {}