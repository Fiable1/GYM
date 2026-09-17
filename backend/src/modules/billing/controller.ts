import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { Roles } from '../../auth/decorators';
import { PaymentMethodService, InvoiceService, TransactionService, DunningService } from './service';
import { buildPageQuery, reqContext } from '../../common/helpers';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, Transaction } from '../../entities/billing.entities';
import { Membership } from '../../entities/member.entities';
import { Notification } from '../../entities/communication.entities';

@Controller('invoices')
export class InvoiceController {
  constructor(
    private readonly svc: InvoiceService,
    @InjectRepository(Invoice) private readonly repo: Repository<Invoice>,
    @InjectRepository(Transaction) private readonly txRepo: Repository<Transaction>,
    @InjectRepository(Membership) private readonly memRepo: Repository<Membership>,
    @InjectRepository(Notification) private readonly notifRepo: Repository<Notification>,
  ) {}

  @Post()
  @Roles('SUPER_ADMIN', 'OWNER', 'MANAGER', 'STAFF')
  async create(@Req() req: any, @Body() body: any) {
    const total = Number(body.amount || 0) + Number(body.tax || 0) - Number(body.discount || 0);
    const invoice = await this.svc.create(reqContext(req.user), { ...body, total, status: body.status || 'OPEN' }, 'Invoice');

    // Auto-create a transaction for immediate payments (cash/pos) or RECURRING billing runs
    if (body.autoCharge) {
      await this.txRepo.save(this.txRepo.create({
        tenantId: req.user.tenantId, memberId: body.memberId, invoiceId: invoice.id,
        status: 'SUCCEEDED', amount: total, currency: body.currency || 'USD',
        gateway: body.gateway || 'STRIPE', paymentMethodId: body.paymentMethodId || null,
        netAmount: total,
      }));
      invoice.status = 'PAID';
      invoice.paidAt = new Date();
      await this.repo.save(invoice);
    }
    return invoice;
  }

  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    const pq = buildPageQuery(q);
    const filters: any = {};
    if (q.status) filters.status = q.status;
    if (q.memberId) filters.memberId = q.memberId;
    return this.svc.findAll(reqContext(req.user), pq, filters);
  }

  @Get('stats/summary')
  async summary(@Req() req: any) {
    const ctx = reqContext(req.user);
    const [revenue, open, overdue, paid] = await Promise.all([
      this.repo.createQueryBuilder('i').where('i.tenantId = :t', { t: ctx.tenantId }).andWhere("i.status IN ('PAID','PARTIAL')").select('COALESCE(SUM(i.total),0)', 'total').getRawOne(),
      this.repo.createQueryBuilder('i').where('i.tenantId = :t', { t: ctx.tenantId }).andWhere("i.status = 'OPEN'").select('COALESCE(SUM(i.total),0)', 'total').getRawOne(),
      this.repo.createQueryBuilder('i').where('i.tenantId = :t', { t: ctx.tenantId }).andWhere("i.status = 'OVERDUE'").select('COALESCE(SUM(i.total),0)', 'total').getRawOne(),
      this.repo.createQueryBuilder('i').where('i.tenantId = :t', { t: ctx.tenantId }).andWhere("i.status = 'PAID'").getCount(),
    ]);
    const monthly = await this.repo.createQueryBuilder('i')
      .where('i.tenantId = :t', { t: ctx.tenantId })
      .select("strftime('%Y-%m', i.paidAt)", 'month')
      .addSelect('COALESCE(SUM(i.total),0)', 'total')
      .andWhere("i.paidAt IS NOT NULL")
      .groupBy("strftime('%Y-%m', i.paidAt)")
      .orderBy('month', 'DESC')
      .limit(6)
      .getRawMany();
    return {
      totalRevenue: Number(revenue?.total || 0),
      openBalance: Number(open?.total || 0),
      overdueBalance: Number(overdue?.total || 0),
      paidInvoices: paid,
      monthly: monthly.reverse(),
    };
  }

  @Post(':id/pay')
  @Roles('SUPER_ADMIN', 'OWNER', 'MANAGER', 'STAFF', 'MEMBER')
  async pay(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const invoice = await this.svc.findOne(reqContext(req.user), id);
    if (invoice.status === 'PAID') throw new BadRequestException('Invoice already paid');
    invoice.status = 'PAID';
    invoice.paidAt = new Date();
    await this.repo.save(invoice);
    await this.txRepo.save(this.txRepo.create({
      tenantId: req.user.tenantId, memberId: invoice.memberId, invoiceId: id,
      status: 'SUCCEEDED', amount: invoice.total, currency: invoice.currency || body.currency || 'USD',
      gateway: body.gateway || 'CASH', netAmount: invoice.total,
    }));

    if (invoice.membershipId) {
      const mem = await this.memRepo.findOne({ where: { id: invoice.membershipId } });
      if (mem) {
        const next = invoice.dueDate || new Date();
        const dt = new Date(next.getTime() + 30 * 24 * 3600 * 1000);
        mem.nextBillingDate = dt;
        await this.memRepo.save(mem);
      }
    }
    return invoice;
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) { return this.svc.findOne(reqContext(req.user), id); }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'OWNER', 'MANAGER')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.svc.update(reqContext(req.user), id, body, 'Invoice');
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'OWNER')
  remove(@Req() req: any, @Param('id') id: string) { return this.svc.remove(reqContext(req.user), id, 'Invoice'); }
}

@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly svc: TransactionService,
    @InjectRepository(Transaction) private readonly repo: Repository<Transaction>,
  ) {}

  @Post()
  @Roles('SUPER_ADMIN', 'OWNER', 'MANAGER', 'STAFF')
  create(@Req() req: any, @Body() body: any) { return this.svc.create(reqContext(req.user), body, 'Transaction'); }

  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    const filters: any = {};
    if (q.status) filters.status = q.status;
    if (q.memberId) filters.memberId = q.memberId;
    return this.svc.findAll(reqContext(req.user), buildPageQuery(q), filters);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) { return this.svc.findOne(reqContext(req.user), id); }
}

@Controller('payment-methods')
export class PaymentMethodController {
  constructor(private readonly svc: PaymentMethodService) {}
  @Post()
  @Roles('SUPER_ADMIN', 'OWNER', 'MANAGER', 'STAFF')
  create(@Req() req: any, @Body() body: any) { return this.svc.create(reqContext(req.user), body, 'PaymentMethod'); }
  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    const filters: any = {};
    if (q.memberId) filters.memberId = q.memberId;
    return this.svc.findAll(reqContext(req.user), buildPageQuery(q), filters);
  }
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) { return this.svc.remove(reqContext(req.user), id, 'PaymentMethod'); }
}

@Controller('dunning-events')
export class DunningController {
  constructor(private readonly svc: DunningService) {}
  @Post()
  create(@Req() req: any, @Body() body: any) { return this.svc.create(reqContext(req.user), body, 'DunningEvent'); }
  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    const filters: any = {};
    if (q.invoiceId) filters.invoiceId = q.invoiceId;
    return this.svc.findAll(reqContext(req.user), buildPageQuery(q), filters);
  }
}