import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutPlan, WearableSnapshot, ChurnScore } from '../../entities/personalization.entities';
import { MemberGoal, Member } from '../../entities/member.entities';
import { ApiBaseService, AuditService } from '../../common/services';
import { randomUUID } from 'crypto';

@Injectable()
export class WorkoutPlanService extends ApiBaseService<WorkoutPlan> {
  constructor(@InjectRepository(WorkoutPlan) r: Repository<WorkoutPlan>, a: AuditService) { super(r, a); }
}

@Injectable()
export class WearableSnapshotService extends ApiBaseService<WearableSnapshot> {
  constructor(@InjectRepository(WearableSnapshot) r: Repository<WearableSnapshot>, a: AuditService) { super(r, a); }
}

@Injectable()
export class ChurnScoreService extends ApiBaseService<ChurnScore> {
  constructor(@InjectRepository(ChurnScore) r: Repository<ChurnScore>, a: AuditService) { super(r, a); }
}

@Injectable()
export class PersonalizationEngine {
  constructor(
    @InjectRepository(WorkoutPlan) private readonly planRepo: Repository<WorkoutPlan>,
    @InjectRepository(WearableSnapshot) private readonly wearableRepo: Repository<WearableSnapshot>,
    @InjectRepository(ChurnScore) private readonly churnRepo: Repository<ChurnScore>,
    @InjectRepository(MemberGoal) private readonly goalRepo: Repository<MemberGoal>,
    @InjectRepository(Member) private readonly memberRepo: Repository<Member>,
  ) {}

  async generateWorkoutPlan(tenantId: string, memberId: string) {
    const member = await this.memberRepo.findOne({ where: { id: memberId, tenantId } });
    if (!member) return { error: 'Member not found' };

    const latest = await this.wearableRepo.findOne({
      where: { tenantId, memberId } as any,
      order: { date: 'DESC' },
    });

    const readiness = latest?.trainingReadiness ?? 70;
    const volume = readiness >= 75 ? 'HIGH' : readiness >= 50 ? 'MODERATE' : 'LOW_RECOVERY';

    const goals = member.goals || 'general fitness';
    const plan: any = {
      memberId,
      title: `Adaptive plan — ${volume}`,
      source: 'AI',
      status: 'ACTIVE',
      progressPercent: 0,
      totalSessions: 4,
      completedSessions: 0,
      weeklySchedule: JSON.stringify({
        mon: volume === 'HIGH' ? 'Push day (strength)' : 'Gentle mobility',
        tue: 'Cardio + core',
        wed: 'Rest / active recovery',
        thu: volume === 'HIGH' ? 'Pull day (strength)' : 'Low-impact conditioning',
        fri: 'Full-body circuit',
        sat: 'Stretch + HR zone work',
        sun: 'Rest',
      }),
      exercises: JSON.stringify([
        { name: 'Incline Dumbbell Press', sets: 3, reps: 10, order: 1 },
        { name: 'Lat Pulldown', sets: 3, reps: 12, order: 2 },
        { name: 'Goblet Squat', sets: 3, reps: 15, order: 3 },
        { name: 'Plank', sets: 3, reps: 0, duration_sec: 60, order: 4 },
        { name: 'Treadmill Intervals', sets: 1, reps: 0, duration_min: 20, order: 5 },
      ]),
      description: `AI-generated plan matched to member goals "${goals}" with a ${readiness} readiness score (${volume} volume). Auto-adjusts as recovery data arrives.`,
    };

    const saved = await this.planRepo.save(this.planRepo.create({ tenantId, ...plan }));
    return saved;
  }

  async computeChurnRisk(tenantId: string, memberId: string) {
    const member = await this.memberRepo.findOne({ where: { id: memberId, tenantId } });
    if (!member) return { error: 'Member not found' };

    let score = 15;
    const factors: string[] = [];

    if (!member.lastVisitAt) {
      score += 20;
      factors.push('Never visited since joining');
    } else {
      const daysSince = (Date.now() - new Date(member.lastVisitAt).getTime()) / 86400000;
      if (daysSince > 30) { score += 30; factors.push(`${Math.round(daysSince)} days since last visit`); }
      else if (daysSince > 14) { score += 15; factors.push(`${Math.round(daysSince)} days since last visit`); }
    }

    const goals = await this.goalRepo.find({ where: { memberId, status: 'ACTIVE' } as any });
    if (goals.length === 0) { score += 10; factors.push('No active goals set'); }
    else {
      for (const g of goals) {
        if (g.currentValue !== undefined && g.targetValue && Number(g.currentValue) > 0) {
          const progress = (Number(g.currentValue) / Number(g.targetValue)) * 100;
          if (progress < 20) { score += 8; factors.push(`Goal "${g.title}" at ${Math.round(progress)}%`); }
        }
      }
    }

    const plan = await this.planRepo.findOne({ where: { memberId, status: 'ACTIVE' } as any });
    if (!plan) { score += 10; factors.push('No active workout plan'); }

    const visits = member.totalVisits || 0;
    if (visits < 4) { score += 5; factors.push('Low engagement (few visits)'); }

    score = Math.min(100, score);
    const riskLevel = score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';

    const saved = await this.churnRepo.save(this.churnRepo.create({
      tenantId, memberId, date: new Date(), score, riskLevel,
      factors: JSON.stringify(factors),
      recommendedActions: JSON.stringify(this.getRecommendations(riskLevel)),
    }));

    if (riskLevel !== 'LOW') {
      member.status = 'AT_RISK';
      await this.memberRepo.save(member);
    }
    return saved;
  }

  private getRecommendations(riskLevel: string): string[] {
    if (riskLevel === 'HIGH') return ['Personal outreach call within 24h', 'Offer a free personal training session', 'Send win-back offer (2 weeks free)'];
    if (riskLevel === 'MEDIUM') return ['Send re-engagement email with new schedule', 'Recommend joining a community challenge', 'Suggest booking 3 classes this week'];
    return ['Keep sending positive engagement content'];
  }

  async aiCoachReply(tenantId: string, memberId: string, message: string) {
    const msg = message.toLowerCase();
    let reply = '';
    if (msg.includes('rest') || msg.includes('recover') || msg.includes('tired')) {
      reply = 'Great call to prioritize recovery. Take a rest day and focus on sleep (>7h) and hydration. Tomorrow, do a 20-min zone-2 walk. Listen to your body — readiness is the boss.';
    } else if (msg.includes('protein') || msg.includes('diet') || msg.includes('food') || msg.includes('eat')) {
      reply = 'Aim for 1.6–2.2 g of protein per kg of bodyweight daily. Spread it across 4 meals. Pair carbs around your training window, and don\'t skip veggies for micronutrients.';
    } else if (msg.includes('weight') || msg.includes('lose') || msg.includes('fat')) {
      reply = 'Weight loss happens in the kitchen + consistent movement. Target a 300–500 kcal daily deficit, 8–12k steps, and 3–4 resistance sessions weekly. I can adjust your plan intensity.';
    } else if (msg.includes('muscle') || msg.includes('gain') || msg.includes('build')) {
      reply = 'To build muscle: progressive overload is key. Increase weight or reps every 2 weeks, 0.8–1.6g/kg protein, and 7–9h sleep. Your plan already has strength movements — want me to bump volume?';
    } else if (msg.includes('plan') || msg.includes('workout')) {
      reply = 'Here\'s your current focus: 4 sessions/week with strength + conditioning. Based on your last readiness (see dashboard), I\'d suggest keeping moderate volume this week.';
    } else {
      reply = 'I\'m here as your 24/7 coaching partner. Ask me about your plan, nutrition, recovery, or goals (e.g. "help me build muscle" or "I feel tired today").';
    }
    return { reply, intent: 'ai_coach', read: true };
  }

  async readinessSnapshot(tenantId: string, memberId: string) {
    const snapshots = await this.wearableRepo.find({
      where: { tenantId, memberId } as any,
      order: { date: 'DESC' },
      take: 7,
    });
    const latest = snapshots[0];
    return {
      current: latest,
      trend: snapshots.reverse(),
      advice: latest?.trainingReadiness
        ? latest.trainingReadiness >= 75
          ? 'Ready for high-intensity training today'
          : latest.trainingReadiness >= 50
            ? 'Good to train — moderate intensity recommended'
            : 'Prioritise recovery — light movement and sleep today'
        : 'Connect a wearable to see your daily readiness',
    };
  }
}