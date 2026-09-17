import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethod, Invoice, Transaction, DunningEvent } from '../../entities/billing.entities';
import { Membership } from '../../entities/member.entities';
import { Notification } from '../../entities/communication.entities';
import { PaymentMethodService, InvoiceService, TransactionService, DunningService } from './service';
import { PaymentMethodController, InvoiceController, TransactionController, DunningController } from './controller';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod, Invoice, Transaction, DunningEvent, Membership, Notification])],
  controllers: [PaymentMethodController, InvoiceController, TransactionController, DunningController],
  providers: [PaymentMethodService, InvoiceService, TransactionService, DunningService],
  exports: [InvoiceService, TransactionService],
})
export class BillingModule {}