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
    // Allow any user in the company to view subscription (not just super_admin)
    const hasAccess = await this.companyUserRepository.findOne({
      where: {
        company: { id: companyId },
        user: { id: userId },
      },
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

    // Fetch latest subscription record if available
    const latestSubscription = await this.subscriptionRepository.findOne({
      where: { company: { id: companyId } },
      order: { createdAt: 'DESC' },
    });

    return {
      id: latestSubscription?.id || null,
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
   * Create a new subscription for a company
   */
  async createSubscription(
    companyId: string,
    planId: string,
    billingCycle: string,
    userId: string,
  ) {
    // Verify user has access to this company
    const hasAccess = await this.companyUserRepository.findOne({
      where: {
        company: { id: companyId },
        user: { id: userId },
      },
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

    // Create subscription record
    const subscription = this.subscriptionRepository.create({
      company,
      planName: planId,
      billingCycle: billingCycle,
      status: 'active',
      periodStart: new Date(),
      periodEnd: this.calculatePeriodEnd(billingCycle),
      amount: planId === 'free' ? 0 : this.getAmountForPlan(planId, billingCycle),
      currency: 'NGN',
    });

    await this.subscriptionRepository.save(subscription);

    // Update company subscription tier
    company.subscriptionTier = planId === 'free' ? 'free' : planId;
    company.subscriptionStatus = 'active';
    await this.companyRepository.save(company);

    return {
      id: subscription.id,
      companyId,
      planId,
      billingCycle,
      status: 'active',
      message: 'Subscription created successfully',
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
   * Initiate a payment for a subscription: create pending subscription + payment transaction
   */
  async initiatePayment(
    companyId: string,
    planName: string,
    billingCycle: string,
    userId: string,
    customerEmail?: string,
    customerFirstName?: string,
    customerLastName?: string,
    customerPhone?: string,
  ) {
    // permission check
    const hasAccess = await this.companyUserRepository.findOne({
      where: {
        company: { id: companyId },
        user: { id: userId },
        role: 'super_admin',
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Only admins can initiate payments');
    }

    const company = await this.companyRepository.findOne({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const amount = this.getAmountForPlan(planName, billingCycle);
    // Include VAT (configurable via env); default 7.5%
    const VAT_RATE = parseFloat(process.env.VAT_RATE || '0.075');
    const vatAmount = +(amount * VAT_RATE);
    const totalAmount = +(amount + vatAmount);
    // amount should be > 0 for paid plans
    if (!amount || amount <= 0) {
      throw new Error('Invalid plan or billing cycle');
    }

    // generate unique payment reference (regenerate if collision detected)
    const makeRef = () =>
      typeof (global as any).crypto?.randomUUID === 'function'
        ? (global as any).crypto.randomUUID()
        : `${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    let reference = makeRef();
    // Ensure we don't accidentally reuse an existing providerReference
    let attempts = 0;
    while (
      attempts < 5 &&
      (await this.paymentTransactionRepository.findOne({ where: { providerReference: reference } }))
    ) {
      attempts += 1;
      console.warn('Payment reference collision detected, regenerating reference (attempt', attempts, ')');
      reference = makeRef();
    }
    if (attempts >= 5) {
      throw new Error('Unable to generate unique payment reference, please try again');
    }

    // determine period range (start now, end after month/year)
    const periodStart = new Date();
    const periodEnd = new Date(periodStart.getTime());
    if (billingCycle === 'annual' || billingCycle === 'annually') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      // monthly
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // create subscription record with pending status
    const subscription = this.subscriptionRepository.create({
      companyId: company.id,
      planName,
      billingCycle,
      amount: totalAmount,
      currency: 'NGN',
      periodStart,
      periodEnd,
      status: 'pending',
      cancelAtPeriodEnd: false,
      paymentProvider: 'paystack',
      paymentReference: reference,
    });

    const savedSubscription = await this.subscriptionRepository.save(subscription);

    // create payment transaction record
    const paymentTx = this.paymentTransactionRepository.create({
      companyId: company.id,
      subscriptionId: savedSubscription.id,
      transactionType: 'subscription',
      amount: totalAmount,
      currency: 'NGN',
      provider: 'paystack',
      providerReference: reference,
      // default to inline; will be interpreted as server-init when server initializes Paystack
      paymentMethod: 'paystack_inline',
      status: 'pending',
      metadata: { planName, billingCycle, vatRate: VAT_RATE, vatAmount },
      initiatedAt: new Date(),
    });

    await this.paymentTransactionRepository.save(paymentTx);

    // If paystack secret present, initialize transaction with Paystack.
    // If Paystack reports a duplicate reference, regenerate and retry a few times.
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    let paystackInit: any = null;
    if (paystackSecret) {
      // mark the payment method as server-init when we have a secret configured
      if (paymentTx) {
        paymentTx.paymentMethod = 'paystack_server';
        await this.paymentTransactionRepository.save(paymentTx);
      }
      const axios = await import('axios');
      const maxInitAttempts = 5;
      let initAttempts = 0;
      let lastError: any = null;

      while (initAttempts < maxInitAttempts) {
        try {
          initAttempts += 1;
          const frontendBase =
            process.env.FRONTEND_BASE_URL || process.env.FRONTEND_URL ||
            (process.env.NODE_ENV === 'production' ? 'https://compliancehub.ng' : 'http://localhost:5173');

          const initRes = await axios.default.post(
            'https://api.paystack.co/transaction/initialize',
            {
              email: customerEmail || '',
              amount: Math.round(totalAmount * 100),
              reference: reference,
              callback_url: `${frontendBase.replace(/\/$/, '')}/payment-success?reference=${reference}`,
              metadata: {
                companyId: company.id,
                planName,
                billingCycle,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${paystackSecret}`,
                'Content-Type': 'application/json',
              },
            },
          );

          paystackInit = initRes.data;
          lastError = null;
          break;
        } catch (err: any) {
          lastError = err;
          const errMsg = err?.response?.data?.message || err?.message || String(err);
          // If duplicate reference error, regenerate and update DB records then retry
          if (/duplicate transaction reference/i.test(errMsg) || /Duplicate Transaction Reference/i.test(errMsg) || (err?.response?.status === 400 && /reference/i.test(errMsg))) {
            // regenerate reference
            const oldRef = reference;
            reference = makeRef();
            // update saved subscription and payment transaction with new reference
            try {
              savedSubscription.paymentReference = reference;
              await this.subscriptionRepository.save(savedSubscription);
              const existingTx = await this.paymentTransactionRepository.findOne({ where: { providerReference: oldRef } });
              if (existingTx) {
                existingTx.providerReference = reference;
                existingTx.metadata = { ...(existingTx.metadata || {}), duplicateRefRetry: true };
                await this.paymentTransactionRepository.save(existingTx);
              } else {
                // if not found, update the previously created paymentTx by subscriptionId
                const txBySub = await this.paymentTransactionRepository.findOne({ where: { subscriptionId: savedSubscription.id } });
                if (txBySub) {
                  txBySub.providerReference = reference;
                  txBySub.metadata = { ...(txBySub.metadata || {}), duplicateRefRetry: true };
                  await this.paymentTransactionRepository.save(txBySub);
                }
              }
              // continue to next attempt
              continue;
            } catch (dbErr) {
              console.error('Failed to update reference after duplicate error:', dbErr);
              break;
            }
          }

          // for other errors, break and log
          console.error('Paystack initialize error (attempt', initAttempts, '):', errMsg);
          break;
        }
      }

      if (lastError && !paystackInit) {
        console.error('Paystack initialize ultimately failed after retries:', lastError?.message || lastError);
      }
    }

    const authorizationUrl = paystackInit?.data?.authorization_url || paystackInit?.authorization_url || null;

    return {
      paymentReference: reference,
      amount,
      currency: 'NGN',
      subscriptionId: savedSubscription.id,
      paystackInit,
      authorizationUrl,
    };
  }

  /**
   * Handle successful payment callback from provider.
   * Find payment transaction and subscription by reference and mark them successful.
   */
  async handlePaymentSuccess(reference: string, providerData: any) {
    // Find payment transaction
    const tx = await this.paymentTransactionRepository.findOne({
      where: { providerReference: reference },
    });

    if (!tx) {
      throw new NotFoundException('Payment transaction not found');
    }

    // Update transaction
    tx.status = 'successful';
    tx.completedAt = new Date();
    tx.metadata = { ...(tx.metadata || {}), providerData };
    await this.paymentTransactionRepository.save(tx);

    // Update subscription
    if (tx.subscriptionId) {
      const sub = await this.subscriptionRepository.findOne({ where: { id: tx.subscriptionId } });
      if (sub) {
        sub.status = 'active';
        sub.paidAt = new Date();
        // Ensure billing dates are sensible
        if (!sub.periodStart) sub.periodStart = new Date();
        if (!sub.periodEnd) {
          const pe = new Date(sub.periodStart.getTime());
          if (sub.billingCycle === 'annual' || sub.billingCycle === 'annually') pe.setFullYear(pe.getFullYear() + 1);
          else pe.setMonth(pe.getMonth() + 1);
          sub.periodEnd = pe;
        }
        sub.paymentReference = reference;
        await this.subscriptionRepository.save(sub);

        // Also update the company record's subscription tier/status
        const company = await this.companyRepository.findOne({ where: { id: sub.companyId } });
        if (company) {
          company.subscriptionTier = sub.planName;
          company.subscriptionStatus = 'active';
          company.billingPeriodStart = sub.periodStart;
          company.billingPeriodEnd = sub.periodEnd;
          company.nextBillingDate = sub.periodEnd;
          await this.companyRepository.save(company);
        }
      }
    }

    return { ok: true };
  }

  /**
   * Get payment / subscription status by provider reference.
   * This is used by the frontend callback page to verify payment state.
   */
  async getPaymentStatus(reference: string) {
    const tx = await this.paymentTransactionRepository.findOne({ where: { providerReference: reference } });
    if (!tx) {
      return { found: false };
    }

    const subscription = tx.subscriptionId
      ? await this.subscriptionRepository.findOne({ where: { id: tx.subscriptionId } })
      : null;

    return {
      found: true,
      transaction: {
        id: tx.id,
        status: tx.status,
        providerReference: tx.providerReference,
        amount: tx.amount,
        currency: tx.currency,
      },
      subscription: subscription
        ? {
            id: subscription.id,
            status: subscription.status,
            planName: subscription.planName,
            billingCycle: subscription.billingCycle,
          }
        : null,
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

  /**
   * Helper: Calculate period end date based on billing cycle
   */
  private calculatePeriodEnd(billingCycle: string): Date {
    const now = new Date();
    if (billingCycle === 'annually') {
      return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    } else {
      // Default to monthly
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }
  }
}
