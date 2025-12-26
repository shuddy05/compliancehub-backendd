import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  /**
   * Get current subscription for a company
   * GET /api/v1/subscriptions/current
   */
  @Get('current')
  async getCurrentSubscription(
    @Request() req,
    @Body() body: { companyId: string },
  ) {
    return this.subscriptionsService.getCurrentSubscription(
      body.companyId,
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
