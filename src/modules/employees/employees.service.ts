import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../../database/entities/employee.entity';
import { CompanyUser } from '../../database/entities/company-user.entity';
import { TaxRelief } from '../../database/entities/tax-relief.entity';
import { PayrollItem } from '../../database/entities/payroll-item.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(CompanyUser)
    private companyUserRepository: Repository<CompanyUser>,
    @InjectRepository(TaxRelief)
    private taxReliefRepository: Repository<TaxRelief>,
    @InjectRepository(PayrollItem)
    private payrollItemRepository: Repository<PayrollItem>,
  ) {}

  /**
   * Create a new employee
   */
  async create(
    companyId: string,
    createEmployeeDto: CreateEmployeeDto,
    userId: string,
  ) {
    // Check permission
    const hasAccess = await this.companyUserRepository.findOne({
      where: {
        company: { id: companyId },
        user: { id: userId },
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const employee = new Employee();
    Object.assign(employee, createEmployeeDto);
    employee.companyId = companyId;

    const saved = await this.employeeRepository.save(employee);

    return {
      id: saved.id,
      employeeCode: saved.employeeCode,
      firstName: saved.firstName,
      lastName: saved.lastName,
      jobTitle: saved.jobTitle,
      department: saved.department,
      grossSalary: saved.grossSalary,
      createdAt: saved.createdAt,
    };
  }

  /**
   * Get all employees in a company
   */
  async findAll(
    companyId: string,
    userId: string,
    skip: number = 0,
    take: number = 10,
  ) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: {
        company: { id: companyId },
        user: { id: userId },
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const employees = await this.employeeRepository.find({
      where: { company: { id: companyId } },
      skip,
      take,
    });

    const total = await this.employeeRepository.count({
      where: { company: { id: companyId } },
    });

    return {
      data: employees.map((e) => ({
        id: e.id,
        employeeCode: e.employeeCode,
        firstName: e.firstName,
        lastName: e.lastName,
        jobTitle: e.jobTitle,
        department: e.department,
        grossSalary: e.grossSalary,
        employmentType: e.employmentType,
      })),
      total,
      skip,
      take,
    };
  }

  /**
   * Get a specific employee
   */
  async findOne(companyId: string, employeeId: string, userId: string) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: {
        company: { id: companyId },
        user: { id: userId },
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId, company: { id: companyId } },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return {
      id: employee.id,
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      dateOfBirth: employee.dateOfBirth,
      jobTitle: employee.jobTitle,
      department: employee.department,
      employmentType: employee.employmentType,
      employmentStartDate: employee.employmentStartDate,
      employmentEndDate: employee.employmentEndDate,
      grossSalary: employee.grossSalary,
      salaryFrequency: employee.salaryFrequency,
      bankName: employee.bankName,
      accountNumber: employee.accountNumber,
      accountName: employee.accountName,
      taxId: employee.taxId,
      pensionPin: employee.pensionPin,
      pensionProvider: employee.pensionProvider,
      allowances: employee.allowances,
    };
  }

  /**
   * Update an employee
   */
  async update(
    companyId: string,
    employeeId: string,
    updateEmployeeDto: UpdateEmployeeDto,
    userId: string,
  ) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: {
        company: { id: companyId },
        user: { id: userId },
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId, company: { id: companyId } },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    Object.assign(employee, updateEmployeeDto);
    const updated = await this.employeeRepository.save(employee);

    return {
      id: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      grossSalary: updated.grossSalary,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Soft delete an employee
   */
  async remove(companyId: string, employeeId: string, userId: string) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: {
        company: { id: companyId },
        user: { id: userId },
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId, company: { id: companyId } },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Soft delete by setting employmentEndDate
    employee.employmentEndDate = new Date();
    await this.employeeRepository.save(employee);

    return { message: 'Employee removed' };
  }

  /**
   * Get employee tax relief information
   */
  async getTaxRelief(companyId: string, employeeId: string, userId: string) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: {
        company: { id: companyId },
        user: { id: userId },
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const reliefs = await this.taxReliefRepository.find({
      where: {
        employee: { id: employeeId },
        company: { id: companyId },
      },
    });

    return {
      employeeId,
      reliefs: reliefs.map((r) => ({
        id: r.id,
        reliefType: r.reliefType,
        reliefName: r.reliefName,
        taxYear: r.taxYear,
        annualReliefAmount: r.annualReliefAmount,
        monthlyReliefAmount: r.monthlyReliefAmount,
        verified: r.verified,
      })),
    };
  }

  /**
   * Get employee payroll history
   */
  async getPayrollHistory(
    companyId: string,
    employeeId: string,
    userId: string,
    limit: number = 12,
  ) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: {
        company: { id: companyId },
        user: { id: userId },
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const payrollItems = await this.payrollItemRepository.find({
      where: {
        employee: { id: employeeId },
        company: { id: companyId },
      },
      relations: ['payrollRun'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return {
      employeeId,
      payrolls: payrollItems.map((p) => ({
        id: p.id,
        period: p.payrollRun?.payrollPeriod,
        basicSalary: p.basicSalary,
        grossSalary: p.grossSalary,
        totalDeductions: p.totalDeductions,
        netSalary: p.netSalary,
        paye: p.paye,
        status: p.paymentStatus,
        paymentDate: p.paymentDate,
      })),
    };
  }
}
