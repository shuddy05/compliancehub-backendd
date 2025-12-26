import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { PayrollRun } from '../../database/entities/payroll-run.entity';
import { PayrollItem } from '../../database/entities/payroll-item.entity';
import { Employee } from '../../database/entities/employee.entity';
import { CompanyUser } from '../../database/entities/company-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PayrollRun, PayrollItem, Employee, CompanyUser]),
  ],
  controllers: [PayrollController],
  providers: [PayrollService],
  exports: [PayrollService],
})
export class PayrollModule {}
