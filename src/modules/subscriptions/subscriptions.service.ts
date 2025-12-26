import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../database/entities/company.entity';
import { Subscription } from '../../database/entities/subscription.entity';
import { PaymentTransaction } from '../../database/entities/payment-transaction.entity';
import { CompanyUser } from '../../database/entities/company-user.entity';
import { Employee } from '../../database/entities/employee.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(PaymentTransaction)
    private paymentTransactionRepository: Repository<PaymentTransaction>,
    @InjectRepository(CompanyUser)
    private companyUserRepository: Repository<CompanyUser>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  /**
   * Get current subscription
   */
  async getCurrentSubscription(companyId: string, userId: string) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: {
        company: { id: companyId },
        user: { id: userId },
        role: 'super_admin',
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Only admins can view subscription');
    }

    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return {
      companyId,
      subscriptionTier: company.subscriptionTier,
      subscriptionStatus: company.subscriptionStatus,
      billingCycle: company.billingPeriodStart ? 'monthly' : null,
      billingPeriodStart: company.billingPeriodStart,
      billingPeriodEnd: company.billingPeriodEnd,
      nextBillingDate: company.nextBillingDate,
      trialEndAt: company.trialEndAt,
      pricing: this.getPricingForTier(company.subscriptionTier),
    };
  }

  /**
   * Get subscription history
   */
  async getSubscriptionHistory(companyId: string, userId: string) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: {
        company: { id: companyId },
        user: { id: userId },
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const subscriptions = await this.subscriptionRepository.find({
      where: { company: { id: companyId } },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      companyId,
      subscriptions: subscriptions.map((s) => ({
        id: s.id,
        planName: s.planName,
        billingCycle: s.billingCycle,
        amount: s.amount,
        currency: s.currency,
        periodStart: s.periodStart,
        periodEnd: s.periodEnd,
        status: s.status,
        paidAt: s.paidAt,
      })),
    };
  }

  /**
   * Upgrade subscription
   */
  async upgradeSubscription(
    companyId: string,
    newPlan: string,
    billingCycle: string,
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
      throw new ForbiddenException('Only admins can upgrade subscription');
    }

    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // TODO: Integrate with Paystack
    // 1. Calculate amount based on billing cycle
    // 2. Create payment transaction
    // 3. Return payment link
    // 4. Handle webhook on successful payment

    const amount = this.getAmountForPlan(newPlan, billingCycle);

    return {
      companyId,
      newPlan,
      amount,
      currency: 'NGN',
      billingCycle,
      paymentLink: 'https://checkout.paystack.com/...',
      message: 'Upgrade initiated. Complete payment to activate Pro features.',
    };
  }

  /**
   * Downgrade subscription
   */
  async downgradeSubscription(companyId: string, userId: string) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: {
        company: { id: companyId },
        user: { id: userId },
        role: 'super_admin',
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Only admins can downgrade subscription');
    }

    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Downgrade to free
    company.subscriptionTier = 'free';
    company.subscriptionStatus = 'active';
    // Don't clear billing dates on downgrade - keep history

    const updated = await this.companyRepository.save(company);

    return {
      companyId,
      newTier: updated.subscriptionTier,
      message: 'Downgraded to Free tier. Pro features disabled.',
    };
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    companyId: string,
    cancellationReason: string,
    cancelAtPeriodEnd: boolean = true,
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
      throw new ForbiddenException('Only admins can cancel subscription');
    }

    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (cancelAtPeriodEnd) {
      // Cancel at end of billing period
      company.subscriptionStatus = 'pending_cancellation';
    } else {
      // Cancel immediately
      company.subscriptionStatus = 'cancelled';
      company.subscriptionTier = 'free';
    }

    const updated = await this.companyRepository.save(company);

    return {
      companyId,
      status: updated.subscriptionStatus,
      cancellationDate: cancelAtPeriodEnd
        ? company.billingPeriodEnd
        : new Date(),
      message: cancelAtPeriodEnd
        ? 'Subscription scheduled for cancellation at end of billing period'
        : 'Subscription cancelled immediately',
    };
  }

  /**
   * Get available plans
   */
  getPlans() {
    return {
      plans: [
        {
          id: 'free',
          name: 'Starter',
          price: 0,
          currency: 'NGN',
          billingCycle: 'free',
          description: 'Perfect for solo entrepreneurs',
          features: [
            'Up to 5 employees',
            'Basic PAYE calculation',
            'Payroll processing (1 month history)',
            'Compliance calendar view',
            'Email reminders',
            'Document storage (100MB)',
            'Learning resources',
          ],
          limitations: [
            'No automatic filing',
            'No multi-user access',
            'No API access',
          ],
        },
        {
          id: 'pro',
          name: 'Growth',
          priceMonthly: 15000,
          priceAnnually: 150000,
          currency: 'NGN',
          description: 'For growing SMEs',
          features: [
            'Up to 50 employees',
            'Automated PAYE, WHT calculations',
            'Pension remittance automation',
            'NSITF & ITF compliance',
            'VAT filing assistance',
            'Unlimited payroll history',
            'Multi-user access (3 users)',
            'Advanced reminders',
            'Document storage (5GB)',
            'Audit trail & reports',
            'Priority support (12hr response)',
            'White-label payslips',
            'API access (1,000 calls/month)',
          ],
        },
        {
          id: 'enterprise',
          name: 'Scale',
          priceMonthly: 75000,
          currency: 'NGN',
          description: 'For established companies and agencies',
          features: [
            'Unlimited employees',
            'Everything in Pro +',
            'Multi-company management',
            'Custom compliance workflows',
            'Dedicated account manager',
            'Advanced analytics',
            'Custom integrations',
            'Unlimited API access',
            'Priority phone support (2hr)',
            '99.9% uptime SLA',
          ],
          customPricing: true,
        },
      ],
    };
  }

  /**
   * Get billing information
   */
  async getBillingInfo(companyId: string, userId: string) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: { company: { id: companyId }, user: { id: userId } },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const transactions = await this.paymentTransactionRepository.find({
      where: { company: { id: companyId } },
      order: { initiatedAt: 'DESC' },
      take: 5,
    });

    return {
      companyId,
      currentPlan: company.subscriptionTier,
      status: company.subscriptionStatus,
      nextBillingDate: company.nextBillingDate,
      recentTransactions: transactions.map((t) => ({
        id: t.id,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        date: t.completedAt || t.initiatedAt,
        reference: t.providerReference,
      })),
    };
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(
    companyId: string,
    paymentDto: { paymentMethod: string; paymentReference: string },
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
      throw new ForbiddenException('Only admins can update payment method');
    }

    // TODO: Store payment method securely (tokenize with Paystack)

    return {
      companyId,
      message: 'Payment method updated successfully',
      lastFour: paymentDto.paymentReference.slice(-4),
    };
  }

  /**
   * Get usage metrics
   */
  async getUsageMetrics(companyId: string, userId: string) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: { company: { id: companyId }, user: { id: userId } },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const employeeCount = await this.employeeRepository.count({
      where: { company: { id: companyId } },
    });

    // Get limits based on tier
    const tierLimits = {
      free: { employees: 5, storage: 100 },
      pro: { employees: 50, storage: 5000 },
      enterprise: { employees: Infinity, storage: Infinity },
    };

    const limits = tierLimits[company.subscriptionTier];

    return {
      companyId,
      tier: company.subscriptionTier,
      usage: {
        employees: {
          current: employeeCount,
          limit: limits.employees,
          percentage: (employeeCount / limits.employees) * 100,
        },
        storage: {
          current: 1200, // TODO: Calculate from actual documents
          limit: limits.storage,
          percentage: (1200 / limits.storage) * 100,
        },
        apiCalls: {
          current: 450, // TODO: Get from actual API logs
          limit: company.subscriptionTier === 'pro' ? 1000 : Infinity,
          percentage:
            company.subscriptionTier === 'pro'
              ? (450 / 1000) * 100
              : 0,
        },
      },
    };
  }

  /**
   * Helper: Get pricing for plan
   */
  private getPricingForTier(tier: string) {
    const pricing = {
      free: { monthly: 0, annually: 0 },
      pro: { monthly: 15000, annually: 150000 },
      enterprise: { monthly: 75000, annually: null },
    };
    return pricing[tier] || pricing.free;
  }

  /**
   * Helper: Get amount for plan
   */
  private getAmountForPlan(plan: string, billingCycle: string): number {
    const pricing = {
      pro: { monthly: 15000, annually: 150000 },
      enterprise: { monthly: 75000, annually: null },
    };
    return pricing[plan]?.[billingCycle] || 0;
  }
}
