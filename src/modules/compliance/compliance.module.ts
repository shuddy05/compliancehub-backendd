import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';
import { ComplianceObligation } from '../../database/entities/compliance-obligation.entity';
import { ComplianceFiling } from '../../database/entities/compliance-filing.entity';
import { CompanyUser } from '../../database/entities/company-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ComplianceObligation, ComplianceFiling, CompanyUser]),
  ],
  controllers: [ComplianceController],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {}
