import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { Company } from '../../database/entities/company.entity';
import { CompanyUser } from '../../database/entities/company-user.entity';
import { CompanySettings } from '../../database/entities/company-settings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company, CompanyUser, CompanySettings])],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
