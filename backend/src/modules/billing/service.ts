import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod, Invoice, Transaction, DunningEvent } from '../../entities/billing.entities';
import { ApiBaseService, AuditService } from '../../common/services';

@Injectable()
export class PaymentMethodService extends ApiBaseService<PaymentMethod> {
  constructor(@InjectRepository(PaymentMethod) r: Repository<PaymentMethod>, a: AuditService) { super(r, a); }
}

@Injectable()
export class InvoiceService extends ApiBaseService<Invoice> {
  constructor(@InjectRepository(Invoice) r: Repository<Invoice>, a: AuditService) { super(r, a); }
}

@Injectable()
export class TransactionService extends ApiBaseService<Transaction> {
  constructor(@InjectRepository(Transaction) r: Repository<Transaction>, a: AuditService) { super(r, a); }
}

@Injectable()
export class DunningService extends ApiBaseService<DunningEvent> {
  constructor(@InjectRepository(DunningEvent) r: Repository<DunningEvent>, a: AuditService) { super(r, a); }
}