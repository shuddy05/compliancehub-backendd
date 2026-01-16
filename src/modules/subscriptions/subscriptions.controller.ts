import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  Request,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import * as crypto from 'crypto';
import { Query } from '@nestjs/common';

import { CanActivate, ExecutionContext } from '@nestjs/common';

// Public guard used for webhook endpoints
class PublicGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  /**
   * Create a new subscription for a company
   * POST /api/v1/subscriptions
   */
  @Post()
  async createSubscription(
    @Body()
    createDto: {
      companyId: string;
      planId: string;
      billingCycle: string;
    },
    @Request() req,
  ) {
    return this.subscriptionsService.createSubscription(
      createDto.companyId,
      createDto.planId,
      createDto.billingCycle,
      req.user.id,
    );
  }

  /**
   * Get current subscription for a company
   * GET /api/v1/subscriptions/current?companyId=<companyId>
   */
  @Get('current')
  async getCurrentSubscription(
    @Request() req,
    @Query('companyId') companyId: string,
  ) {
    return this.subscriptionsService.getCurrentSubscription(
      companyId,
      req.user.id,
    );
  }

  /**
   * Get subscription history for a company
   * GET /api/v1/companies/:companyId/subscriptions/history
   */
  @Get(':companyId/history')
  async getSubscriptionHistory(
    @Param('companyId') companyId: string,
    @Request() req,
  ) {
    return this.subscriptionsService.getSubscriptionHistory(
      companyId,
      req.user.id,
    );
  }

  /**
   * Upgrade subscription
   * POST /api/v1/subscriptions/upgrade
   */
  @Post('upgrade')
  async upgradeSubscription(
    @Body()
    upgradeDto: {
      companyId: string;
      newPlan: string; // 'pro' | 'enterprise'
      billingCycle: string; // 'monthly' | 'annually'
    },
    @Request() req,
  ) {
    return this.subscriptionsService.upgradeSubscription(
      upgradeDto.companyId,
      upgradeDto.newPlan,
      upgradeDto.billingCycle,
      req.user.id,
    );
  }

  /**
   * Downgrade subscription
   * POST /api/v1/subscriptions/downgrade
   */
  @Post('downgrade')
  async downgradeSubscription(
    @Body() downgradeDto: { companyId: string },
    @Request() req,
  ) {
    return this.subscriptionsService.downgradeSubscription(
      downgradeDto.companyId,
      req.user.id,
    );
  }

  /**
   * Cancel subscription
   * POST /api/v1/subscriptions/cancel
   */
  @Post('cancel')
  async cancelSubscription(
    @Body()
    cancelDto: {
      companyId: string;
      cancellationReason?: string;
      cancelAtPeriodEnd?: boolean;
    },
    @Request() req,
  ) {
    return this.subscriptionsService.cancelSubscription(
      cancelDto.companyId,
      cancelDto.cancellationReason || 'No reason provided',
      cancelDto.cancelAtPeriodEnd,
      req.user.id,
    );
  }

  /**
   * Get available plans
   * GET /api/v1/subscriptions/plans
   */
  @Get('plans')
  async getPlans() {
    return this.subscriptionsService.getPlans();
  }

  /**
   * Initiate payment: create pending subscription + payment transaction and return reference
   * POST /api/v1/subscriptions/initiate-payment
   */
  @Post('initiate-payment')
  async initiatePayment(@Body() dto: InitiatePaymentDto, @Req() req) {
    return this.subscriptionsService.initiatePayment(
      dto.companyId,
      dto.planName,
      dto.billingCycle,
      req.user.id,
      dto.customerEmail,
      dto.customerFirstName,
      dto.customerLastName,
      dto.customerPhone,
    );
  }

  /**
   * Webhook endpoint for Paystack (unprotected)
   * POST /api/v1/subscriptions/webhook
   */
  @Post('webhook')
  @UseGuards(PublicGuard)
  async handleWebhook(@Req() req) {
    // raw body should be available as req.rawBody if express raw middleware is configured.
    // Fallback to stringified body for signature verification.
    const paystackSignature = req.headers['x-paystack-signature'] as string;
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      // Log and return 400 so maintainers know config is missing
      return { ok: false, message: 'PAYSTACK_SECRET_KEY not configured' };
    }

    const raw = (req as any).rawBody
      ? (req as any).rawBody
      : JSON.stringify(req.body);

    const hash = crypto.createHmac('sha512', secret).update(raw).digest('hex');

    if (hash !== paystackSignature) {
      return { ok: false, message: 'Invalid signature' };
    }

    const event = req.body?.event;
    const data = req.body?.data;

    // For transaction success events, update payment and subscription
    if (event === 'charge.success' || event === 'transaction.success' || (data && data.status === 'success')) {
      const reference = data?.reference || data?.trxref || data?.reference_no;
      if (reference) {
        // let service handle update
        try {
          await this.subscriptionsService.handlePaymentSuccess(reference, data);
          return { ok: true };
        } catch (err) {
          return { ok: false, message: (err as Error).message };
        }
      }
    }

    return { ok: true };
  }

  /**
   * Public endpoint to check payment/subscription status by reference.
   * GET /api/v1/subscriptions/status?reference=<ref>
   */
  @Get('status')
  @UseGuards(PublicGuard)
  async getStatus(@Query('reference') reference: string) {
    if (!reference) return { ok: false, message: 'reference required' };
    try {
      const result = await this.subscriptionsService.getPaymentStatus(reference);
      return { ok: true, ...result };
    } catch (err) {
      return { ok: false, message: (err as Error).message };
    }
  }

  /**
   * Get billing information
   * GET /api/v1/subscriptions/:companyId/billing
   */
  @Get(':companyId/billing')
  async getBillingInfo(@Param('companyId') companyId: string, @Request() req) {
    return this.subscriptionsService.getBillingInfo(companyId, req.user.id);
  }

  /**
   * Update payment method
   * PATCH /api/v1/subscriptions/:companyId/payment-method
   */
  @Patch(':companyId/payment-method')
  async updatePaymentMethod(
    @Param('companyId') companyId: string,
    @Body() paymentDto: { paymentMethod: string; paymentReference: string },
    @Request() req,
  ) {
    return this.subscriptionsService.updatePaymentMethod(
      companyId,
      paymentDto,
      req.user.id,
    );
  }

  /**
   * Get usage metrics (for display)
   * GET /api/v1/subscriptions/:companyId/usage
   */
  @Get(':companyId/usage')
  async getUsageMetrics(@Param('companyId') companyId: string, @Request() req) {
    return this.subscriptionsService.getUsageMetrics(companyId, req.user.id);
  }
}
