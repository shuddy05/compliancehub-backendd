import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { Employee } from '../../database/entities/employee.entity';
import { CompanyUser } from '../../database/entities/company-user.entity';
import { TaxRelief } from '../../database/entities/tax-relief.entity';
import { PayrollItem } from '../../database/entities/payroll-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, CompanyUser, TaxRelief, PayrollItem]),
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
