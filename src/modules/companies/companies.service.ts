import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../database/entities/company.entity';
import { CompanyUser } from '../../database/entities/company-user.entity';
import { CompanySettings } from '../../database/entities/company-settings.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(CompanyUser)
    private companyUserRepository: Repository<CompanyUser>,
    @InjectRepository(CompanySettings)
    private companySettingsRepository: Repository<CompanySettings>,
  ) {}

  /**
   * Create a new company
   */
  async create(createCompanyDto: CreateCompanyDto, userId: string) {
    const company = this.companyRepository.create({
      ...createCompanyDto,
      createdById: userId,
    });

    const savedCompany = await this.companyRepository.save(company);

    // Add creator as super_admin
    const companyUser = this.companyUserRepository.create({
      companyId: savedCompany.id,
      userId: userId,
      role: 'super_admin',
      isPrimaryCompany: true,
      acceptedAt: new Date(),
    });

    await this.companyUserRepository.save(companyUser);

    // Create default company settings
    const settings = new CompanySettings();
    settings.companyId = savedCompany.id;
    settings.payrollDay = 25;
    settings.payrollApprovalRequired = true;
    settings.autoGeneratePayslips = true;
    settings.autoFilePaye = false;
    settings.autoCalculatePension = true;
    settings.deadlineReminderDays = [7, 3, 1];

    await this.companySettingsRepository.save(settings);

    return {
      id: savedCompany.id,
      name: savedCompany.name,
      tin: savedCompany.tin,
      rcNumber: savedCompany.rcNumber,
      subscriptionTier: savedCompany.subscriptionTier,
      subscriptionStatus: savedCompany.subscriptionStatus,
      isActive: savedCompany.isActive,
      createdAt: savedCompany.createdAt,
    };
  }

  /**
   * Get all companies for a user with pagination
   */
  async findAllForUser(userId: string, skip: number = 0, take: number = 10) {
    const companies = await this.companyRepository
      .createQueryBuilder('c')
      .innerJoinAndSelect(
        'c.companyUsers',
        'cu',
        'cu.userId = :userId',
        { userId },
      )
      .skip(skip)
      .take(take)
      .getMany();

    return {
      data: companies.map((c) => ({
        id: c.id,
        name: c.name,
        tin: c.tin,
        industry: c.industry,
        subscriptionTier: c.subscriptionTier,
        subscriptionStatus: c.subscriptionStatus,
        isActive: c.isActive,
      })),
      total: companies.length,
      skip,
      take,
    };
  }

  /**
   * Get all companies in the system (admin only)
   */
  async findAll(skip: number = 0, take: number = 10) {
    const [companies, total] = await this.companyRepository.findAndCount({
      skip,
      take,
      order: { createdAt: 'DESC' },
    });

    return {
      data: companies.map((c) => ({
        id: c.id,
        name: c.name,
        tin: c.tin,
        industry: c.industry,
        subscriptionTier: c.subscriptionTier,
        subscriptionStatus: c.subscriptionStatus,
        isActive: c.isActive,
        createdAt: c.createdAt,
      })),
      total,
      skip,
      take,
    };
  }

  /**
   * Get a specific company (with permission check)
   */
  async findOne(companyId: string, userId: string) {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['companyUsers', 'employees', 'payrollRuns'],
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Check if user has access to this company
    const hasAccess = await this.companyUserRepository.findOne({
      where: { company: { id: companyId }, user: { id: userId } },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this company');
    }

    return {
      id: company.id,
      name: company.name,
      tin: company.tin,
      rcNumber: company.rcNumber,
      industry: company.industry,
      employeeCount: company.employeeCount,
      address: company.address,
      state: company.state,
      lga: company.lga,
      email: company.email,
      subscriptionTier: company.subscriptionTier,
      subscriptionStatus: company.subscriptionStatus,
      defaultCurrency: company.defaultCurrency,
      timezone: company.timezone,
      isActive: company.isActive,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }

  /**
   * Update a company
   */
  async update(
    companyId: string,
    updateCompanyDto: UpdateCompanyDto,
    userId: string,
  ) {
    // Check permission
    const hasAccess = await this.companyUserRepository.findOne({
      where: {
        company: { id: companyId },
        user: { id: userId },
        role: 'super_admin',
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Only admins can update company');
    }

    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    Object.assign(company, updateCompanyDto);
    const updated = await this.companyRepository.save(company);

    return {
      id: updated.id,
      name: updated.name,
      tin: updated.tin,
      rcNumber: updated.rcNumber,
      subscriptionTier: updated.subscriptionTier,
      isActive: updated.isActive,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Soft delete a company
   */
  async remove(companyId: string, userId: string) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: {
        company: { id: companyId },
        user: { id: userId },
        role: 'super_admin',
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Only admins can delete company');
    }

    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    company.isActive = false;
    await this.companyRepository.save(company);

    return { message: 'Company deactivated successfully' };
  }

  /**
   * Get company settings
   */
  async getSettings(companyId: string, userId: string) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: { company: { id: companyId }, user: { id: userId } },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const settings = await this.companySettingsRepository.findOne({
      where: { company: { id: companyId } },
    });

    return settings || {};
  }

  /**
   * Update company settings
   */
  async updateSettings(
    companyId: string,
    settingsDto: any,
    userId: string,
  ) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: {
        company: { id: companyId },
        user: { id: userId },
        role: 'super_admin',
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Only admins can update settings');
    }

    let settings = await this.companySettingsRepository.findOne({
      where: { company: { id: companyId } },
    });

    if (!settings) {
      settings = this.companySettingsRepository.create({
        company: { id: companyId },
      });
    }

    Object.assign(settings, settingsDto);
    return this.companySettingsRepository.save(settings);
  }

  /**
   * Get company subscription
   */
  async getSubscription(companyId: string, userId: string) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: { company: { id: companyId }, user: { id: userId } },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['subscriptions'],
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return {
      subscriptionTier: company.subscriptionTier,
      subscriptionStatus: company.subscriptionStatus,
      billingPeriodStart: company.billingPeriodStart,
      billingPeriodEnd: company.billingPeriodEnd,
      nextBillingDate: company.nextBillingDate,
      trialEndAt: company.trialEndAt,
    };
  }

  /**
   * Get company users
   */
  async getCompanyUsers(companyId: string, userId: string) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: { company: { id: companyId }, user: { id: userId } },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const users = await this.companyUserRepository.find({
      where: { company: { id: companyId } },
      relations: ['user'],
    });

    return users.map((u) => ({
      id: u.user.id,
      email: u.user.email,
      firstName: u.user.firstName,
      lastName: u.user.lastName,
      role: u.role,
      acceptedAt: u.acceptedAt,
      isPrimaryCompany: u.isPrimaryCompany,
    }));
  }

  /**
   * Invite user to company
   */
  async inviteUser(
    companyId: string,
    inviteDto: { email: string; role: string },
    userId: string,
  ) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: {
        company: { id: companyId },
        user: { id: userId },
        role: 'super_admin',
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Only admins can invite users');
    }

    // TODO: Implement user invitation logic
    // 1. Check if user exists by email
    // 2. If exists, create company_user record
    // 3. If not, send invite with signup link

    return { message: 'Invitation sent' };
  }

  /**
   * Remove user from company
   */
  async removeUser(
    companyId: string,
    targetUserId: string,
    userId: string,
  ) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: {
        company: { id: companyId },
        user: { id: userId },
        role: 'super_admin',
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Only admins can remove users');
    }

    await this.companyUserRepository.delete({
      company: { id: companyId },
      user: { id: targetUserId },
    });

    return { message: 'User removed from company' };
  }

  /**
   * Get compliance summary dashboard
   */
  async getComplianceSummary(companyId: string, userId: string) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: { company: { id: companyId }, user: { id: userId } },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    // TODO: Aggregate compliance data
    // 1. Get pending compliance obligations
    // 2. Get overdue filings
    // 3. Calculate upcoming deadlines

    return {
      companyId,
      pendingObligations: 0,
      overdueFilings: 0,
      upcomingDeadlines: [],
    };
  }

  /**
   * Get payroll summary dashboard
   */
  async getPayrollSummary(companyId: string, userId: string) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: { company: { id: companyId }, user: { id: userId } },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    // TODO: Aggregate payroll data
    // 1. Get latest payroll run
    // 2. Get pending payroll runs
    // 3. Calculate total deductions

    return {
      companyId,
      latestPayrollRun: null,
      pendingPayrollRuns: 0,
      totalEmployees: 0,
    };
  }
}
