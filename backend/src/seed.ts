import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcryptjs';
import { AppDataSource as dataSource } from './data-source';
import {
  Tenant,
  Location,
  User,
  Member,
  MembershipPlan,
  Membership,
  Waiver,
  MemberNote,
  MemberGoal,
  Invoice,
  Transaction,
  PaymentMethod,
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
} from './entities/seed-export';
import { Role } from './common/constants';
import { randomUUID } from 'crypto';

dotenv.config();

function daysAgo(days: number, hour = 12): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d;
}
function daysAhead(days: number, hour = 12): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}
const uuid = () => randomUUID();

async function seed() {
  await dataSource.initialize();
  console.log('DB initialized');

  const r = (name: any) => dataSource.getRepository(name);
  const tenant = await r(Tenant).save({
    id: uuid(), name: 'PulseForge HQ', legalName: 'PulseForge Fitness Ltd',
    defaultLanguage: 'en', locale: 'en', timezone: 'UTC', currency: 'USD',
    address: '241 Momentum Blvd, Fitness City', isActive: true,
  } as any);
  const t = tenant.id;

  const loc = await r(Location).save({ id: uuid(), tenantId: t, name: 'PulseForge Downtown', address: '241 Momentum Blvd, Fitness City', city: 'Fitness City', country: 'USA', isActive: true, openingHour: '05:00', closingHour: '23:00' } as any);
  await r(Location).save({ id: uuid(), tenantId: t, name: 'PulseForge Eastside', address: '88 Athletic Ave, Fitness City', city: 'Fitness City', country: 'USA', isActive: true, openingHour: '06:00', closingHour: '22:00' } as any);

  const userRepo = r(User);
  const hash = (p: string) => bcrypt.hashSync(p, 10);

  await userRepo.save({ id: uuid(), tenantId: t, firstName: 'Ava', lastName: 'Sterling', email: 'owner@pulseforge.io', password: hash('Pulse@123'), role: Role.OWNER, language: 'en', isActive: true } as any);
  await userRepo.save({ id: uuid(), tenantId: t, firstName: 'Marcus', lastName: 'Reed', email: 'manager@pulseforge.io', password: hash('Pulse@123'), role: Role.MANAGER, language: 'en', locationId: loc.id, isActive: true } as any);
  await userRepo.save({ id: uuid(), tenantId: t, firstName: 'Lena', lastName: 'Torres', email: 'staff@pulseforge.io', password: hash('Pulse@123'), role: Role.STAFF, language: 'es', locationId: loc.id, isActive: true } as any);
  await userRepo.save({ id: uuid(), tenantId: t, firstName: 'Pulse', lastName: 'Admin', email: 'admin@pulseforge.io', password: hash('Pulse@123'), role: Role.SUPER_ADMIN, language: 'en', isActive: true } as any);
  await userRepo.save({ id: uuid(), tenantId: t, firstName: 'Owen', lastName: 'Peterson', email: 'tech@pulseforge.io', password: hash('Pulse@123'), role: Role.MAINTENANCE_TECH, language: 'en', locationId: loc.id, isActive: true } as any);

  const trainers = [];
  const trainerNames = [['Diego', 'Ramirez'], ['Sofia', 'Lopez'], ['James', 'Whitfield'], ['Aisha', 'Noor']];
  for (const [fn, ln] of trainerNames) {
    trainers.push(await userRepo.save({ id: uuid(), tenantId: t, firstName: fn, lastName: ln, email: `${fn.toLowerCase()}.${ln.toLowerCase()}@pulseforge.io`, password: hash('Pulse@123'), role: Role.TRAINER, language: 'en', locationId: loc.id, isActive: true } as any));
  }

  // Members
  const memberRepo = r(Member);
  const memberNames: Array<[string, string, string, string, number, number]> = [
    ['Ethan', 'Brooks', 'ethan@pulseforge.io', 'Lose weight & build cardio', 34, 3],
    ['Mia', 'Chen', 'mia@pulseforge.io', 'Build strength', 41, 1],
    ['Lucas', 'Petrov', 'lucas@pulseforge.io', 'Marathon prep', 9, 20],
    ['Emma', 'Davis', 'emma@pulseforge.io', 'General fitness', 27, 6],
    ['Noah', 'Ali', 'noah@pulseforge.io', 'Muscle gain', 18, 35],
    ['Isabella', 'Nguyen', 'isabella@pulseforge.io', 'Recovery & mobility', 56, 2],
    ['Liam', 'O\'Brien', 'liam@pulseforge.io', 'HIIT conditioning', 3, 40],
    ['Olivia', 'Garcia', 'olivia@pulseforge.io', 'Weight loss', 10, 50],
    ['Mason', 'Kim', 'mason@pulseforge.io', 'Bodybuilding', 88, 1],
    ['Amelia', 'Rossi', 'amelia@pulseforge.io', 'General fitness', 45, 4],
  ];

  const members: any[] = [];
  for (const [fn, ln, email, goals, visits, daysLast] of memberNames) {
    const u = await userRepo.save({ id: uuid(), tenantId: t, firstName: fn, lastName: ln, email, password: hash('Member@123'), role: Role.MEMBER, language: 'en', isActive: true } as any);
    const m = await memberRepo.save({
      id: uuid(), tenantId: t, userId: u.id, goals, totalVisits: visits,
      status: daysLast > 14 ? 'AT_RISK' : 'ACTIVE',
      lastVisitAt: daysAgo(daysLast),
      emergencyContact: JSON.stringify({ name: 'Family', phone: '+1 555 9999' }),
    } as any);
    members.push(m);
  }
  await r(AccessCredential).save(members.map((m, i) => ({ id: uuid(), tenantId: t, memberId: m.id, type: 'QR', credentialValue: `PF-MEMBER-${100 + i}`, isActive: true })) as any);
  await r(Waiver).save(members.map((m, i) => ({ id: uuid(), tenantId: t, memberId: m.id, title: '2026 Gym Membership Waiver', version: '1.0', language: 'EN', content: 'By signing this waiver I agree to participate at my own risk and understand the facility rules.', isSigned: true, signedAt: daysAgo(30 - i) })) as any);
  await r(MemberGoal).save(members.map((m, i) => ({ id: uuid(), tenantId: t, memberId: m.id, title: memberNames[i][3].split('&')[0]?.trim() || 'General fitness', description: memberNames[i][3], targetValue: 180, currentValue: 90, unit: 'days', targetDate: daysAhead(90), status: 'ACTIVE' })) as any);

  // Plans
  const plans: any[] = [];
  const planDefs: Array<[string, number, string, number, number, number]> = [
    ['Core Monthly', 49, 'RECURRING', 30, 1, 8],
    ['Unlimited All-Access', 89, 'RECURRING', 30, 3, 99],
    ['Class Pack (10)', 129, 'CLASS_PACK', 180, 3, 10],
    ['Drop-In Day Pass', 15, 'DROP_IN', 1, 1, 0],
    ['Family Bundle', 140, 'FAMILY', 30, 3, 99],
    ['Corporate Platinum', 120, 'CORPORATE', 30, 5, 99],
  ];
  for (const [name, price, type, duration, locs, classes] of planDefs) {
    plans.push(await r(MembershipPlan).save({ id: uuid(), tenantId: t, name, price, type, durationDays: duration, maxLocations: locs, maxClassBookings: classes, isActive: true, features: JSON.stringify(['All facilities', 'Fitness assessment', 'Mobile app access']) } as any));
  }

  // Memberships + invoices + payments
  const memberStatuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'AT_RISK', 'AT_RISK', 'AT_RISK', 'ACTIVE', 'ACTIVE'];
  const invoiceRows: any[] = [];
  const txRows: any[] = [];
  const payRows: any[] = [];
  const memRows: any[] = [];
  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    const plan = plans[i % plans.length];
    const mem = await r(Membership).save({
      id: uuid(), tenantId: t, memberId: m.id, planId: plan.id, locationId: loc.id, type: plan.type,
      price: plan.price, status: memberStatuses[i], startDate: daysAgo(60 + i), endDate: daysAhead(270 - i * 20),
      nextBillingDate: daysAhead(3),
    } as any);
    memRows.push(mem);
    payRows.push({ id: uuid(), tenantId: t, memberId: m.id, type: 'CARD', lastFour: `${1000 + i * 137}`.slice(-4), brand: 'VISA', token: `tok_${uuid()}`.slice(0, 28), isDefault: true });
    for (let k = 2; k >= 0; k--) {
      const inv = {
        id: uuid(), tenantId: t, memberId: m.id, membershipId: mem.id, status: 'PAID',
        amount: plan.price, tax: +(plan.price * 0.08).toFixed(2), total: +(plan.price * 1.08).toFixed(2),
        currency: 'USD', issuedAt: daysAgo(30 * k), paidAt: daysAgo(30 * k - 1), dueDate: daysAgo(30 * k - 5),
        invoiceNumber: `INV-2026-${100 + i * 3 + (2 - k)}`,
      };
      invoiceRows.push(inv);
      txRows.push({ id: uuid(), tenantId: t, memberId: m.id, invoiceId: inv.id, status: 'SUCCEEDED', amount: inv.total, currency: 'USD', gateway: 'STRIPE', netAmount: inv.total });
    }
    if (i % 3 === 0) {
      invoiceRows.push({
        id: uuid(), tenantId: t, memberId: m.id, membershipId: mem.id, status: i % 2 ? 'OPEN' : 'OVERDUE',
        amount: plan.price, tax: +(plan.price * 0.08).toFixed(2), total: +(plan.price * 1.08).toFixed(2),
        currency: 'USD', issuedAt: daysAgo(1), dueDate: daysAhead(27), invoiceNumber: `INV-2026-${1000 + i}`,
      });
    }
  }
  await r(Invoice).save(invoiceRows as any);
  await r(Transaction).save(txRows as any);
  await r(PaymentMethod).save(payRows as any);

  // Equipment
  const assets: any[] = [];
  const equipmentDefs: Array<[string, string, string, string, number, number, number]> = [
    ['TechnoGym Excite Run 700', 'TechnoGym', 'Excite Run 700', 'CARDIO', 3, 8, 32],
    ['Life Fitness Signature Treadmill', 'Life Fitness', 'Signature', 'CARDIO', 1, 4, 28],
    ['Matrix T5x Treadmill', 'Matrix', 'T5x', 'CARDIO', 2, 1, 5],
    ['Precor AMT 885', 'Precor', 'AMT 885', 'CARDIO', 4, 6, 41],
    ['Concept2 Model D Rower', 'Concept2', 'Model D', 'CARDIO', 5, 9, 55],
    ['Hammer Strength Iso Lateral Chest', 'Hammer Strength', 'Iso-Lateral', 'STRENGTH', 6, 3, 26],
    ['TechnoGym Selection Leg Press', 'TechnoGym', 'Selection 700', 'STRENGTH', 7, 5, 33],
    ['Life Fitness Cable Crossover', 'Life Fitness', 'Cable Crossover', 'STRENGTH', 8, 2, 9],
    ['Matrix Multi-Station Functional Trainer', 'Matrix', 'S7', 'STRENGTH', 9, 7, 47],
    ['Peloton Bike+', 'Peloton', 'Bike+', 'CARDIO', 10, 4, 38],
  ];
  const sensorRows: any[] = [];
  const maintRows: any[] = [];
  for (const [name, brand, model, cat, x, y, usageHours] of equipmentDefs) {
    const asset = await r(EquipmentAsset).save({
      id: uuid(), tenantId: t, name, brand, model, category: cat, locationId: loc.id,
      serialNumber: `SN-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      status: 'ONLINE', purchaseDate: daysAgo(400), purchasePrice: Math.round(8000 + Math.random() * 12000),
      currentValue: Math.round(5000 + Math.random() * 7000), usageHours, usageSessions: Math.round(usageHours * 3),
      qrCodeValue: `PF-EQ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, floorX: x, floorY: y,
      warrantyExpiry: '2027-09-01',
    } as any);
    assets.push(asset);
    sensorRows.push({ id: uuid(), tenantId: t, assetId: asset.id, deviceId: `DEV-${uuid().slice(0, 8).toUpperCase()}`, sensorType: 'USAGE', protocol: 'BLE', status: 'ONLINE', lastSeenAt: new Date(), batteryLevel: 80 + Math.round(Math.random() * 15), messageCount: Math.round(Math.random() * 500) });
    maintRows.push({ id: uuid(), tenantId: t, assetId: asset.id, taskName: 'Quarterly belt & incline service', scheduleType: 'TIME_BASED', intervalDays: 90, nextDueAt: daysAhead(2 + Math.floor(Math.random() * 20)), status: 'ACTIVE', priority: 'MEDIUM', assignedTo: 'Owen Peterson', checklist: JSON.stringify(['Check belt tension', 'Lubricate rollers', 'Reset odometer', 'Clean deck']) });
  }
  await r(EquipmentSensor).save(sensorRows as any);
  await r(MaintenanceSchedule).save(maintRows as any);

  const usageRows: any[] = [];
  for (let i = 0; i < 80; i++) {
    const asset = assets[i % assets.length];
    usageRows.push({ id: uuid(), tenantId: t, assetId: asset.id, timestamp: daysAgo(Math.floor(Math.random() * 14), Math.floor(Math.random() * 14) + 6), durationMinutes: Math.floor(Math.random() * 45) + 10, powerWatts: 180 + Math.floor(Math.random() * 220), source: 'AUTO' });
  }
  await r(EquipmentUsageLog).save(usageRows as any);

  await r(WorkOrder).save([
    { id: uuid(), tenantId: t, assetId: assets[2].id, assigneeId: trainers[0].id || undefined, title: 'Treadmill belt slipping', description: 'Member reported excessive belt friction during run intervals.', status: 'ASSIGNED', priority: 'HIGH', source: 'QR' },
    { id: uuid(), tenantId: t, assetId: assets[1].id, title: 'Display flickering', description: 'Console display intermittently flickers.', status: 'IN_PROGRESS', priority: 'MEDIUM', source: 'STAFF' },
    { id: uuid(), tenantId: t, assetId: assets[6].id, title: 'Rust on weight stack guide', description: 'Cleaning required on leg press guide rods.', status: 'OPEN', priority: 'LOW', source: 'QR' },
  ] as any);

  // Class types + sessions
  const classDefs: Array<[string, string, number, number]> = [
    ['Morning HIIT Burn', 'CARDIO', 45, 24],
    ['Power Yoga Flow', 'YOGA', 60, 20],
    ['Strength Fundamentals', 'STRENGTH', 50, 16],
    ['Spin Express', 'CARDIO', 45, 20],
    ['Boxing Conditioning', 'COMBAT', 50, 16],
    ['Mobility & Recovery', 'RECOVERY', 45, 20],
  ];
  const classTypes: any[] = [];
  for (let i = 0; i < classDefs.length; i++) {
    const [name, cat, dur, cap] = classDefs[i];
    classTypes.push(await r(ClassType).save({ id: uuid(), tenantId: t, name, category: cat, durationMinutes: dur, maxCapacity: cap, price: 0, isActive: true, defaultTrainerId: trainers[i % trainers.length].id, color: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'][i] } as any));
  }

  const sessionRows: any[] = [];
  const bookingRows: any[] = [];
  for (let d = -1; d < 10; d++) {
    for (let idx = 0; idx < classTypes.length; idx++) {
      const ct = classTypes[idx];
      const trainer = trainers[idx % trainers.length];
      const start = daysAhead(d);
      start.setHours((6 + idx) % 20, (idx % 2) * 30, 0, 0);
      const end = new Date(start.getTime() + ct.durationMinutes * 60000);
      const s = { id: uuid(), tenantId: t, classTypeId: ct.id, trainerId: trainer.id, locationId: loc.id, startTime: start, endTime: end, maxCapacity: ct.maxCapacity, currentBookings: Math.floor(Math.random() * ct.maxCapacity * 0.8), sessionType: 'CLASS', status: 'SCHEDULED', price: ct.price };
      sessionRows.push(s);
    }
  }
  await r(Session).save(sessionRows as any);

  for (let i = 0; i < 16; i++) {
    const srow = sessionRows[i];
    const member = members[i % members.length];
    bookingRows.push({ id: uuid(), tenantId: t, sessionId: srow.id, memberId: member.id, status: 'CONFIRMED', checkInStatus: i % 4 === 0 ? 'CHECKED_IN' : 'PENDING', amountPaid: srow.price });
  }
  await r(Booking).save(bookingRows as any);

  // Check-ins
  const ciRows: any[] = [];
  for (let i = 0; i < 60; i++) {
    const member = members[i % members.length];
    const day = Math.floor(Math.random() * 14);
    const hour = Math.floor(Math.random() * 12) + 5;
    ciRows.push({ id: uuid(), tenantId: t, memberId: member.id, locationId: loc.id, checkInTime: daysAgo(day, hour), method: ['QR', 'RFID', 'MOBILE', 'FACE'][i % 4], status: 'VALID' });
  }
  ciRows.push({ id: uuid(), tenantId: t, memberId: members[0].id, locationId: loc.id, checkInTime: daysAgo(0, 7), method: 'QR', status: 'VALID' });
  ciRows.push({ id: uuid(), tenantId: t, memberId: members[1].id, locationId: loc.id, checkInTime: daysAgo(0, 8), method: 'FACE', status: 'VALID' });
  await r(CheckIn).save(ciRows as any);

  // Trainer availability
  const availRows: any[] = [];
  for (const tr of trainers) {
    for (let d = 1; d <= 5; d++) {
      availRows.push({ id: uuid(), tenantId: t, trainerId: tr.id, locationId: loc.id, dayOfWeek: d, startTime: '06:00', endTime: '12:00', isActive: true, recurrenceId: uuid() });
    }
  }
  await r(TrainerAvailability).save(availRows as any);

  // Personalization
  const wearableRows: any[] = [];
  const planRows: any[] = [];
  const churnRows: any[] = [];
  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    for (let k = 0; k < 6; k++) {
      wearableRows.push({ id: uuid(), tenantId: t, memberId: m.id, source: ['APPLE_HEALTH', 'GARMIN', 'OURA'][i % 3], date: daysAgo(k * 2), hrv: 40 + Math.round(Math.random() * 40), restingHeartRate: 48 + Math.round(Math.random() * 12), sleepMinutes: 360 + Math.round(Math.random() * 90), steps: 6000 + Math.round(Math.random() * 8000), activeCalories: 250 + Math.round(Math.random() * 400), trainingReadiness: +(60 + Math.round(Math.random() * 35)).toFixed(1) });
    }
    const readiness = m.status === 'AT_RISK' ? 45 : 78;
    planRows.push({ id: uuid(), tenantId: t, memberId: m.id, title: 'Adaptive Strength Builder', source: 'AI', status: 'ACTIVE', progressPercent: Math.round(Math.random() * 80), totalSessions: 4, completedSessions: 1 + Math.round(Math.random() * 3), weeklySchedule: JSON.stringify({ mon: 'Upper push', tue: 'Cardio', wed: 'Rest', thu: 'Lower', fri: 'Full body', sat: 'Active recovery', sun: 'Rest' }), exercises: JSON.stringify([{ name: 'Bench Press', sets: 3, reps: 8, order: 1 }, { name: 'Rows', sets: 3, reps: 10, order: 2 }, { name: 'Squat', sets: 3, reps: 12, order: 3 }, { name: 'Planks', sets: 3, reps: 0, duration_sec: 60, order: 4 }]), description: `AI generated based on readiness ${readiness}.` });
    const churnScore = m.status === 'AT_RISK' ? 62 + Math.round(Math.random() * 28) : 10 + Math.round(Math.random() * 20);
    churnRows.push({ id: uuid(), tenantId: t, memberId: m.id, date: new Date(), score: churnScore, riskLevel: churnScore >= 70 ? 'HIGH' : churnScore >= 40 ? 'MEDIUM' : 'LOW', factors: JSON.stringify(['Days since last visit', 'Goal progress', 'Plan engagement']) });
  }
  await r(WearableSnapshot).save(wearableRows as any);
  await r(WorkoutPlan).save(planRows as any);
  await r(ChurnScore).save(churnRows as any);

  // POS
  const products: any[] = [];
  const productDefs: Array<[string, string, number, number, number]> = [
    ['Whey Isolate 1kg', 'NUTRITION', 45, 28, 12],
    ['Pre-Workout 30 servings', 'NUTRITION', 38, 22, 9],
    ['BCAA Powder', 'NUTRITION', 32, 18, 7],
    ['Creatine Monohydrate', 'NUTRITION', 29, 15, 10],
    ['PulseForge Performance Shirt', 'APPAREL', 25, 14, 24],
    ['PulseForge Gym Towel', 'APPAREL', 18, 8, 30],
    ['Resistance Bands Set', 'ACCESSORIES', 22, 12, 8],
    ['Recovery Massage Gun', 'ACCESSORIES', 129, 70, 4],
    ['Insulated Water Bottle', 'ACCESSORIES', 24, 10, 18],
    ['Energy Drink', 'DRINKS', 3, 1.5, 60],
  ];
  for (const [name, cat, price, cost, stock] of productDefs) {
    products.push(await r(Product).save({ id: uuid(), tenantId: t, name, category: cat, price, cost, stockQuantity: stock, lowStockThreshold: 6, sku: `SKU-${cat.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}` } as any));
  }
  const saleRows: any[] = [];
  const saleItemRows: any[] = [];
  for (let i = 0; i < 8; i++) {
    const p1 = products[i % products.length];
    const p2 = products[(i + 2) % products.length];
    const sale = await r(Sale).save({ id: uuid(), tenantId: t, memberId: members[i].id, soldById: null, locationId: loc.id, soldAt: daysAgo(Math.floor(Math.random() * 20), 14), saleType: 'POS', subtotal: p1.price + p2.price, tax: +((p1.price + p2.price) * 0.08).toFixed(2), total: +((p1.price + p2.price) * 1.08).toFixed(2), paymentMethod: ['CASH', 'CARD', 'APPLE_PAY'][i % 3], status: 'COMPLETED' } as any);
    saleRows.push(sale);
    saleItemRows.push({ id: uuid(), tenantId: t, saleId: sale.id, productId: p1.id, productName: p1.name, quantity: 1, unitPrice: p1.price, total: p1.price });
    saleItemRows.push({ id: uuid(), tenantId: t, saleId: sale.id, productId: p2.id, productName: p2.name, quantity: 1, unitPrice: p2.price, total: p2.price });
  }
  await r(SaleItem).save(saleItemRows as any);

  // Community
  const c1 = await r(Challenge).save({ id: uuid(), tenantId: t, name: '10K Steps September', description: 'Hit 10,000 steps daily for 21 days.', metric: 'STEPS', targetValue: 210000, startDate: daysAgo(5), endDate: daysAhead(16), status: 'ACTIVE', reward: 'PulseForge Hoodie' } as any);
  const c2 = await r(Challenge).save({ id: uuid(), tenantId: t, name: 'Sweat League 2026', description: 'Team-based workouts challenge.', metric: 'WORKOUTS', targetValue: 3000, startDate: daysAgo(2), endDate: daysAhead(28), status: 'ACTIVE', isTeam: true, reward: 'Free month membership' } as any);
  const sortedMembers = [...members].sort((a: any, b: any) => b.totalVisits - a.totalVisits);
  const ceRows1: any[] = [];
  const ceRows2: any[] = [];
  for (let i = 0; i < sortedMembers.length; i++) {
    ceRows1.push({ id: uuid(), tenantId: t, challengeId: c1.id, memberId: sortedMembers[i].id, score: Math.floor(Math.random() * 150000) + 30000, rank: i + 1 });
    ceRows2.push({ id: uuid(), tenantId: t, challengeId: c2.id, memberId: sortedMembers[i].id, score: Math.floor(Math.random() * 40) + 5, rank: i + 1 });
  }
  await r(ChallengeEntry).save([...ceRows1, ...ceRows2] as any);

  // Notifications
  await r(NotificationTemplate).save([
    { id: uuid(), tenantId: t, name: 'welcome_email', channel: 'EMAIL', triggerEvent: 'member.created', subject: 'Welcome to PulseForge, {{first_name}}!', bodyTemplate: 'Hi {{first_name}}, we are thrilled to have you. Your journey starts now.', isActive: true },
    { id: uuid(), tenantId: t, name: 'class_reminder', channel: 'PUSH', triggerEvent: 'booking.created', subject: 'Get ready: {{class_name}} in 24h', bodyTemplate: 'Your {{class_name}} starts in 24 hours. Tap to view or cancel.', isActive: true },
    { id: uuid(), tenantId: t, name: 'birthday_offer', channel: 'EMAIL', triggerEvent: 'birthday', subject: 'Happy birthday {{first_name}}!', bodyTemplate: 'Enjoy a free guest pass on us this week.', isActive: true },
    { id: uuid(), tenantId: t, name: 'win_back', channel: 'PUSH', triggerEvent: 'churn.high', subject: 'We miss you, {{first_name}}', bodyTemplate: 'Here is 2 free classes to get you back on track.', isActive: true },
  ] as any);

  const notifRows: any[] = [];
  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    notifRows.push({ id: uuid(), tenantId: t, recipientId: m.userId, channel: 'PUSH', subject: 'Class reminder: Morning HIIT', body: 'Your class starts in 2 hours. See you there!', status: 'SENT', sentAt: daysAgo(0, 9), isRead: i % 3 === 0 });
    if (m.status === 'AT_RISK') {
      notifRows.push({ id: uuid(), tenantId: t, recipientId: m.userId, channel: 'PUSH', subject: 'We miss you', body: 'How about a recovery class this week?', status: 'SENT', sentAt: daysAgo(1), isRead: false });
    }
  }
  await r(Notification).save(notifRows as any);

  await r(MemberNote).save([
    { id: uuid(), tenantId: t, memberId: members[1].id, authorId: trainers[0].id, content: 'Great progress on the bench press — added 10kg this month.', category: 'TRAINING' },
    { id: uuid(), tenantId: t, memberId: members[5].id, authorId: trainers[1].id, content: 'Prefers 8:00 AM classes. Has mild knee sensitivity.', category: 'PREFERENCE' },
  ] as any);

  console.log('====================== SEED COMPLETE ======================');
  console.log('Tenant:     ', t);
  console.log('Location:   ', loc.name);
  console.log('Sign-in credentials:');
  console.log('  Super Admin  ->  admin@pulseforge.io  /  Pulse@123');
  console.log('  Owner        ->  owner@pulseforge.io  /  Pulse@123');
  console.log('  Manager      ->  manager@pulseforge.io / Pulse@123');
  console.log('  Staff        ->  staff@pulseforge.io  /  Pulse@123');
  console.log('  Trainer      ->  diego.ramirez@pulseforge.io / Pulse@123');
  console.log('  Tech         ->  tech@pulseforge.io  /  Pulse@123');
  console.log('  Member       ->  ethan@pulseforge.io  /  Member@123');
  console.log('============================================================');

  await dataSource.destroy();
  process.exit(0);
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});