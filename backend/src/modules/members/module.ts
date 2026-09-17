import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member, MembershipPlan, Membership, Waiver, MemberNote, MemberGoal } from '../../entities/member.entities';
import { MemberService, MembershipPlanService, MembershipService, WaiverService, MemberNoteService, MemberGoalService } from './service';
import { MemberController, MembershipPlanController, MembershipController, WaiverController, MemberNoteController, MemberGoalController } from './controller';

@Module({
  imports: [TypeOrmModule.forFeature([Member, MembershipPlan, Membership, Waiver, MemberNote, MemberGoal])],
  controllers: [MemberController, MembershipPlanController, MembershipController, WaiverController, MemberNoteController, MemberGoalController],
  providers: [MemberService, MembershipPlanService, MembershipService, WaiverService, MemberNoteService, MemberGoalService],
  exports: [MemberService, MembershipPlanService, MembershipService],
})
export class MembersModule {}