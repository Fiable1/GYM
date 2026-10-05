import { Global, Module } from '@nestjs/common';
import { AuditService } from './services';
import { MailService } from './mail.service';

@Global()
@Module({
  providers: [AuditService, MailService],
  exports: [AuditService, MailService],
})
export class CommonModule {}