import { Tenant, Location } from './core.entities';
import { User } from './user.entity';
import {
  Member,
  MembershipPlan,
  Membership,
  Waiver,
  MemberNote,
  MemberGoal,
} from './member.entities';
import {
  PaymentMethod,
  Invoice,
  Transaction,
  DunningEvent,
} from './billing.entities';
import {
  ClassType,
  Session,
  Booking,
  TrainerAvailability,
} from './scheduling.entities';
import { AccessCredential, CheckIn } from './access.entities';
import {
  EquipmentAsset,
  EquipmentSensor,
  EquipmentUsageLog,
  MaintenanceSchedule,
  WorkOrder,
} from './equipment.entities';
import {
  WorkoutPlan,
  WearableSnapshot,
  ChurnScore,
} from './personalization.entities';
import {
  Product,
  Sale,
  SaleItem,
  Challenge,
  ChallengeEntry,
} from './pos.entities';
import {
  NotificationTemplate,
  Notification,
  AuditLog,
} from './communication.entities';

export const ENTITIES = [
  Tenant,
  Location,
  User,
  Member,
  MembershipPlan,
  Membership,
  Waiver,
  MemberNote,
  MemberGoal,
  PaymentMethod,
  Invoice,
  Transaction,
  DunningEvent,
  ClassType,
  Session,
  Booking,
  TrainerAvailability,
  AccessCredential,
  CheckIn,
  EquipmentAsset,
  EquipmentSensor,
  EquipmentUsageLog,
  MaintenanceSchedule,
  WorkOrder,
  WorkoutPlan,
  WearableSnapshot,
  ChurnScore,
  Product,
  Sale,
  SaleItem,
  Challenge,
  ChallengeEntry,
  NotificationTemplate,
  Notification,
  AuditLog,
];