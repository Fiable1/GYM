import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutPlan, WearableSnapshot, ChurnScore } from '../../entities/personalization.entities';
import { MemberGoal, Member, MembershipPlan } from '../../entities/member.entities';
import { Session, ClassType, Booking, TrainerAvailability } from '../../entities/scheduling.entities';
import { User } from '../../entities/user.entity';
import { Location } from '../../entities/core.entities';
import { WorkoutPlanService, WearableSnapshotService, ChurnScoreService, PersonalizationEngine } from './service';
import { ConciergeEngine } from './concierge.service';
import { WorkoutPlanController, WearableController, ChurnController, AiController } from './controller';
import { LeadsModule } from '../leads/module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkoutPlan, WearableSnapshot, ChurnScore, MemberGoal, Member, MembershipPlan,
      Session, ClassType, Booking, TrainerAvailability, User, Location,
    ]),
    LeadsModule,
  ],
  controllers: [WorkoutPlanController, WearableController, ChurnController, AiController],
  providers: [WorkoutPlanService, WearableSnapshotService, ChurnScoreService, PersonalizationEngine, ConciergeEngine],
  exports: [PersonalizationEngine, ConciergeEngine],
})
export class PersonalizationModule {}