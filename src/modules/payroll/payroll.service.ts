import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollRun } from '../../database/entities/payroll-run.entity';
import { PayrollItem } from '../../database/entities/payroll-item.entity';
import { Employee } from '../../database/entities/employee.entity';
import { CompanyUser } from '../../database/entities/company-user.entity';
import { CreatePayrollRunDto } from './dto/create-payroll-run.dto';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(PayrollRun)
    private payrollRunRepository: Repository<PayrollRun>,
    @InjectRepository(PayrollItem)
    private payrollItemRepository: Repository<PayrollItem>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(CompanyUser)
    private companyUserRepository: Repository<CompanyUser>,
  ) {}

  /**
   * Create a new payroll run
   */
  async createPayrollRun(
    companyId: string,
    createPayrollRunDto: CreatePayrollRunDto,
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

    const payrollRun = this.payrollRunRepository.create({
      ...createPayrollRunDto,
      company: { id: companyId },
      status: 'draft',
    });

    const saved = await this.payrollRunRepository.save(payrollRun);

    // TODO: Auto-generate payroll items for all active employees
    // For now, return the created payroll run

    return {
      id: saved.id,
      payrollPeriod: saved.payrollPeriod,
      payrollStartDate: saved.payrollStartDate,
      payrollEndDate: saved.payrollEndDate,
      status: saved.status,
      createdAt: saved.createdAt,
    };
  }

  /**
   * Get all payroll runs for a company
   */
  async getPayrollRuns(
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

    const payrollRuns = await this.payrollRunRepository.find({
      where: { company: { id: companyId } },
      order: { payrollPeriod: 'DESC' },
      skip,
      take,
    });

    const total = await this.payrollRunRepository.count({
      where: { company: { id: companyId } },
    });

    return {
      data: payrollRuns.map((p) => ({
        id: p.id,
        payrollPeriod: p.payrollPeriod,
        payrollStartDate: p.payrollStartDate,
        payrollEndDate: p.payrollEndDate,
        status: p.status,
        totalGross: p.totalGross,
        totalNet: p.totalNet,
        employeeCount: p.employeeCount,
        createdAt: p.createdAt,
      })),
      total,
      skip,
      take,
    };
  }

  /**
   * Get a specific payroll run
   */
  async getPayrollRun(companyId: string, payrollRunId: string, userId: string) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: {
        company: { id: companyId },
        user: { id: userId },
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const payrollRun = await this.payrollRunRepository.findOne({
      where: { id: payrollRunId, company: { id: companyId } },
      relations: ['payrollItems'],
    });

    if (!payrollRun) {
      throw new NotFoundException('Payroll run not found');
    }

    return {
      id: payrollRun.id,
      payrollPeriod: payrollRun.payrollPeriod,
      payrollStartDate: payrollRun.payrollStartDate,
      payrollEndDate: payrollRun.payrollEndDate,
      paymentDate: payrollRun.paymentDate,
      status: payrollRun.status,
      totalGross: payrollRun.totalGross,
      totalDeductions: payrollRun.totalDeductions,
      totalNet: payrollRun.totalNet,
      totalPaye: payrollRun.totalPaye,
      totalPensionEmployee: payrollRun.totalPensionEmployee,
      totalPensionEmployer: payrollRun.totalPensionEmployer,
      totalNhf: payrollRun.totalNhf,
      totalNsitf: payrollRun.totalNsitf,
      totalItf: payrollRun.totalItf,
      employeeCount: payrollRun.employeeCount,
      approvedBy: payrollRun.approvedBy,
      approvedAt: payrollRun.approvedAt,
      createdAt: payrollRun.createdAt,
      updatedAt: payrollRun.updatedAt,
    };
  }

  /**
   * Get payroll run items
   */
  async getPayrollRunItems(companyId: string, payrollRunId: string, userId: string) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: {
        company: { id: companyId },
        user: { id: userId },
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const items = await this.payrollItemRepository.find({
      where: {
        payrollRun: { id: payrollRunId },
        company: { id: companyId },
      },
      relations: ['employee'],
    });

    return {
      payrollRunId,
      itemCount: items.length,
      items: items.map((item) => ({
        id: item.id,
        employeeName: `${item.employee.firstName} ${item.employee.lastName}`,
        basicSalary: item.basicSalary,
        allowances: item.allowances,
        grossSalary: item.grossSalary,
        paye: item.paye,
        pensionEmployee: item.pensionEmployee,
        pensionEmployer: item.pensionEmployer,
        nhf: item.nhf,
        otherDeductions: item.otherDeductions,
        totalDeductions: item.totalDeductions,
        netSalary: item.netSalary,
        paymentStatus: item.paymentStatus,
      })),
    };
  }

  /**
   * Approve a payroll run
   */
  async approvePayrollRun(companyId: string, payrollRunId: string, userId: string) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: {
        company: { id: companyId },
        user: { id: userId },
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const payrollRun = await this.payrollRunRepository.findOne({
      where: { id: payrollRunId, company: { id: companyId } },
    });

    if (!payrollRun) {
      throw new NotFoundException('Payroll run not found');
    }

    payrollRun.status = 'approved';
    payrollRun.approvedById = userId;
    payrollRun.approvedAt = new Date();

    const updated = await this.payrollRunRepository.save(payrollRun);

    return {
      id: updated.id,
      status: updated.status,
      approvedAt: updated.approvedAt,
    };
  }

  /**
   * Reject a payroll run
   */
  async rejectPayrollRun(companyId: string, payrollRunId: string, userId: string) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: {
        company: { id: companyId },
        user: { id: userId },
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const payrollRun = await this.payrollRunRepository.findOne({
      where: { id: payrollRunId, company: { id: companyId } },
    });

    if (!payrollRun) {
      throw new NotFoundException('Payroll run not found');
    }

    payrollRun.status = 'draft';

    const updated = await this.payrollRunRepository.save(payrollRun);

    return {
      id: updated.id,
      status: updated.status,
      message: 'Payroll run rejected and reverted to draft',
    };
  }

  /**
   * Delete a payroll run
   */
  async deletePayrollRun(companyId: string, payrollRunId: string, userId: string) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: {
        company: { id: companyId },
        user: { id: userId },
        role: 'super_admin',
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Only admins can delete payroll runs');
    }

    const payrollRun = await this.payrollRunRepository.findOne({
      where: { id: payrollRunId, company: { id: companyId } },
    });

    if (!payrollRun) {
      throw new NotFoundException('Payroll run not found');
    }

    await this.payrollRunRepository.remove(payrollRun);

    return { message: 'Payroll run deleted' };
  }

  /**
   * Get payroll summary
   */
  async getPayrollSummary(
    companyId: string,
    userId: string,
    year?: number,
    month?: number,
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

    // TODO: Implement aggregated payroll summary
    // - Total paid out this year/month
    // - Total deductions
    // - Compliance obligations calculated

    return {
      companyId,
      year: year || new Date().getFullYear(),
      month: month || new Date().getMonth() + 1,
      totalGrossPaid: 0,
      totalDeductions: 0,
      totalNetPaid: 0,
      totalPAYE: 0,
      totalPension: 0,
    };
  }
}
