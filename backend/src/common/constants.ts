export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  OWNER: 'OWNER',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
  TRAINER: 'TRAINER',
  MEMBER: 'MEMBER',
  MAINTENANCE_TECH: 'MAINTENANCE_TECH',
  GUEST: 'GUEST',
} as const;

export type RoleType = (typeof Role)[keyof typeof Role];

export const STAFF_ROLES: RoleType[] = [
  Role.SUPER_ADMIN,
  Role.OWNER,
  Role.MANAGER,
  Role.STAFF,
  Role.TRAINER,
  Role.MAINTENANCE_TECH,
];

export const FITNESS_ROLES: RoleType[] = [Role.TRAINER, Role.MEMBER];

export const ACCESS_METHODS = ['QR', 'BARCODE', 'RFID', 'MOBILE', 'BIOMETRIC', 'MANUAL'] as const;
export const MEMBERSHIP_TYPES = [
  'RECURRING',
  'CLASS_PACK',
  'FAMILY',
  'CORPORATE',
  'DROP_IN',
  'FREEZE',
  'TRANSFER',
] as const;
export const BOOKING_STATUS = ['CONFIRMED', 'WAITLIST', 'CANCELLED', 'CHECKED_IN', 'NO_SHOW'] as const;
export const WORK_ORDER_STATUS = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;
export const WORK_ORDER_PRIORITY = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export const SESSION_TYPES = ['CLASS', 'PERSONAL_TRAINING', 'RENTAL', 'OPEN_GYM', 'LIVESTREAM', 'FACILITY'] as const;
export const INVOICE_STATUS = ['DRAFT', 'OPEN', 'PAID', 'OVERDUE', 'VOID', 'PARTIAL'] as const;
export const TRANSACTION_STATUS = ['SUCCEEDED', 'FAILED', 'PENDING', 'REFUNDED'] as const;
export const CHALLENGE_STATUS = ['ACTIVE', 'UPCOMING', 'COMPLETED'] as const;
export const LANGUAGE_CODES = ['en', 'es', 'fr', 'pt', 'ar', 'hi', 'sw', 'zh'] as const;