import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { ComplianceObligation } from '../../database/entities/compliance-obligation.entity';
import { ComplianceFiling } from '../../database/entities/compliance-filing.entity';
import { CompanyUser } from '../../database/entities/company-user.entity';
import { CreateComplianceFilingDto } from './dto/create-compliance-filing.dto';

@Injectable()
export class ComplianceService {
  constructor(
    @InjectRepository(ComplianceObligation)
    private obligationRepository: Repository<ComplianceObligation>,
    @InjectRepository(ComplianceFiling)
    private filingRepository: Repository<ComplianceFiling>,
    @InjectRepository(CompanyUser)
    private companyUserRepository: Repository<CompanyUser>,
  ) {}

  /**
   * Get all compliance obligations
   */
  async getObligations(companyId: string, userId: string) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: { company: { id: companyId }, user: { id: userId } },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const obligations = await this.obligationRepository.find({
      where: { isActive: true },
    });

    return {
      companyId,
      obligations: obligations.map((o) => ({
        id: o.id,
        obligationType: o.obligationType,
        obligationName: o.obligationName,
        description: o.description,
        agency: o.agency,
        frequency: o.frequency,
        dueDay: o.dueDay,
        dueMonth: o.dueMonth,
      })),
    };
  }

  /**
   * Get compliance filings for a company
   */
  async getFilings(
    companyId: string,
    userId: string,
    skip: number = 0,
    take: number = 10,
    status?: string,
  ) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: { company: { id: companyId }, user: { id: userId } },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const query = this.filingRepository.createQueryBuilder('cf');
    query.where('cf.companyId = :companyId', { companyId });

    if (status) {
      query.andWhere('cf.status = :status', { status });
    }

    const filings = await query
      .orderBy('cf.dueDate', 'ASC')
      .skip(skip)
      .take(take)
      .getMany();

    const total = await query.getCount();

    return {
      data: filings.map((f) => ({
        id: f.id,
        obligationType: f.obligation?.obligationType || 'UNKNOWN',
        filingPeriod: f.filingPeriod,
        dueDate: f.dueDate,
        status: f.status,
        calculatedAmount: f.calculatedAmount,
        paidAmount: f.paidAmount,
        filedDate: f.filedDate,
      })),
      total,
      skip,
      take,
    };
  }

  /**
   * Get a specific filing
   */
  async getFiling(companyId: string, filingId: string, userId: string) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: { company: { id: companyId }, user: { id: userId } },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const filing = await this.filingRepository.findOne({
      where: { id: filingId, company: { id: companyId } },
    });

    if (!filing) {
      throw new NotFoundException('Filing not found');
    }

    return {
      id: filing.id,
      obligationType: filing.obligation?.obligationType || 'UNKNOWN',
      filingPeriod: filing.filingPeriod,
      filingYear: filing.filingYear,
      filingMonth: filing.filingMonth,
      dueDate: filing.dueDate,
      status: filing.status,
      calculatedAmount: filing.calculatedAmount,
      paidAmount: filing.paidAmount,
      penaltyAmount: filing.penaltyAmount,
      filingReference: filing.filingReference,
      paymentReference: filing.paymentReference,
      filedDate: filing.filedDate,
      paymentDate: filing.paymentDate,
      filingDocumentUrl: filing.filingDocumentUrl,
      paymentReceiptUrl: filing.paymentReceiptUrl,
    };
  }

  /**
   * Create a compliance filing
   */
  async createFiling(
    companyId: string,
    createFilingDto: CreateComplianceFilingDto,
    userId: string,
  ) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: { company: { id: companyId }, user: { id: userId } },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const filing = this.filingRepository.create({
      ...createFilingDto,
      company: { id: companyId },
      status: 'pending',
    });

    const saved = await this.filingRepository.save(filing);

    return {
      id: saved.id,
      obligationType: saved.obligation?.obligationType || 'UNKNOWN',
      filingPeriod: saved.filingPeriod,
      status: saved.status,
      createdAt: saved.createdAt,
    };
  }

  /**
   * Update a compliance filing
   */
  async updateFiling(
    companyId: string,
    filingId: string,
    updateDto: any,
    userId: string,
  ) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: { company: { id: companyId }, user: { id: userId } },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const filing = await this.filingRepository.findOne({
      where: { id: filingId, company: { id: companyId } },
    });

    if (!filing) {
      throw new NotFoundException('Filing not found');
    }

    Object.assign(filing, updateDto);
    const updated = await this.filingRepository.save(filing);

    return {
      id: updated.id,
      status: updated.status,
      calculatedAmount: updated.calculatedAmount,
    };
  }

  /**
   * Submit a filing
   */
  async submitFiling(
    companyId: string,
    filingId: string,
    submitDto: { filingReference?: string; filingMethod: string },
    userId: string,
  ) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: { company: { id: companyId }, user: { id: userId } },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const filing = await this.filingRepository.findOne({
      where: { id: filingId, company: { id: companyId } },
    });

    if (!filing) {
      throw new NotFoundException('Filing not found');
    }

    filing.status = 'filed';
    filing.filedDate = new Date();
    if (submitDto.filingReference) {
      filing.filingReference = submitDto.filingReference;
    }

    const updated = await this.filingRepository.save(filing);

    return {
      id: updated.id,
      status: updated.status,
      filedDate: updated.filedDate,
      filingReference: updated.filingReference,
    };
  }

  /**
   * Mark filing as paid
   */
  async markPaid(
    companyId: string,
    filingId: string,
    paymentDto: { paidAmount: number; paymentReference: string },
    userId: string,
  ) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: { company: { id: companyId }, user: { id: userId } },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const filing = await this.filingRepository.findOne({
      where: { id: filingId, company: { id: companyId } },
    });

    if (!filing) {
      throw new NotFoundException('Filing not found');
    }

    filing.status = 'paid';
    filing.paidAmount = paymentDto.paidAmount;
    filing.paymentReference = paymentDto.paymentReference;
    filing.paymentDate = new Date();

    const updated = await this.filingRepository.save(filing);

    return {
      id: updated.id,
      status: updated.status,
      paidAmount: updated.paidAmount,
      paymentDate: updated.paymentDate,
    };
  }

  /**
   * Delete a filing
   */
  async deleteFiling(companyId: string, filingId: string, userId: string) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: { company: { id: companyId }, user: { id: userId } },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const filing = await this.filingRepository.findOne({
      where: { id: filingId, company: { id: companyId } },
    });

    if (!filing) {
      throw new NotFoundException('Filing not found');
    }

    if (filing.status !== 'pending') {
      throw new ForbiddenException('Can only delete pending filings');
    }

    await this.filingRepository.remove(filing);

    return { message: 'Filing deleted' };
  }

  /**
   * Get compliance calendar
   */
  async getComplianceCalendar(
    companyId: string,
    userId: string,
    year?: number,
    month?: number,
  ) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: { company: { id: companyId }, user: { id: userId } },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    // TODO: Get filings for the specified month
    // Filter by dueDate between month start and end

    return {
      companyId,
      year: currentYear,
      month: currentMonth,
      deadlines: [],
    };
  }

  /**
   * Get compliance summary
   */
  async getComplianceSummary(companyId: string, userId: string) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: { company: { id: companyId }, user: { id: userId } },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const pendingFilings = await this.filingRepository.count({
      where: { company: { id: companyId }, status: 'pending' },
    });

    const overdueFilings = await this.filingRepository.count({
      where: {
        company: { id: companyId },
        dueDate: LessThanOrEqual(new Date()),
        status: 'pending',
      },
    });

    return {
      companyId,
      pendingFilings,
      overdueFilings,
      completionRate: 0, // TODO: Calculate
      upcomingDeadlines: [],
    };
  }
}
