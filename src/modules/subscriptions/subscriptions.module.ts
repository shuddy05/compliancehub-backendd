import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { Company } from '../../database/entities/company.entity';
import { Subscription } from '../../database/entities/subscription.entity';
import { PaymentTransaction } from '../../database/entities/payment-transaction.entity';
import { CompanyUser } from '../../database/entities/company-user.entity';
import { Employee } from '../../database/entities/employee.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      Subscription,
      PaymentTransaction,
      CompanyUser,
      Employee,
    ]),
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
