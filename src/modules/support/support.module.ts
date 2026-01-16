import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportTicket, TicketMessage } from './support.entity';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';
import { User } from '../../database/entities/user.entity';
import { CompanyUser } from '../../database/entities/company-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupportTicket, TicketMessage, User, CompanyUser]),
    NotificationsModule,
    EmailModule,
  ],
  controllers: [SupportController],
  providers: [SupportService],
  exports: [SupportService],
})
export class SupportModule {}
