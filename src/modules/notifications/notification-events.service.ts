import { Injectable, Inject } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';

/**
 * Notification Events Service
 * Handles sending notifications to various user types based on system events
 * 
 * Notification Types:
 * - Support: ticket_created, ticket_replied, ticket_status_changed
 * - Compliance: deadline_reminder, filing_overdue, filing_completed
 * - Payroll: payroll_ready, payroll_approved, payroll_processed
 * - Subscription: subscription_expiry, payment_failed, upgrade_recommended
 * - System: user_invited, settings_changed
 */

export interface NotificationEvent {
  type: string;
  companyId: string;
  userId?: string;
  userIds?: string[];
  title: string;
  message: string;
  actionUrl?: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  relatedEntityId?: string;
  relatedEntityType?: string;
}

@Injectable()
export class NotificationEventsService {
  constructor(
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Send notification to multiple users
   */
  private async sendToMultipleUsers(
    userIds: string[],
    notificationType: string,
    title: string,
    message: string,
    actionUrl?: string,
    priority?: string,
  ) {
    const promises = userIds.map(userId =>
      this.notificationsService.createNotification(
        userId,
        notificationType,
        title,
        message,
        actionUrl,
        ['push', 'email'],
        priority || 'normal',
      ).catch(error => {
        console.error(`Failed to create notification for user ${userId}:`, error);
      }),
    );
    await Promise.all(promises);
  }

  /**
   * SUPPORT TICKET NOTIFICATIONS
   */

  async notifyNewTicket(
    companyId: string,
    ticketId: string,
    ticketTitle: string,
    createdByName: string,
    supportStaffUserIds: string[],
  ) {
    // Notify support staff about new ticket
    await this.sendToMultipleUsers(
      supportStaffUserIds,
      'support_ticket_created',
      '🎫 New Support Ticket',
      `${createdByName} submitted a ticket: "${ticketTitle}"`,
      `/support/staff?ticket=${ticketId}`,
      'high',
    );
  }

  async notifyTicketReply(
    companyId: string,
    ticketId: string,
    ticketTitle: string,
    replyAuthorName: string,
    recipientUserIds: string[],
  ) {
    // Notify ticket creator/staff about replies
    await this.sendToMultipleUsers(
      recipientUserIds,
      'support_ticket_reply',
      '💬 New Reply on Your Ticket',
      `${replyAuthorName} replied to: "${ticketTitle}"`,
      `/support?ticket=${ticketId}`,
      'normal',
    );
  }

  async notifyTicketStatusChanged(
    companyId: string,
    ticketId: string,
    ticketTitle: string,
    newStatus: string,
    creatorUserId: string,
  ) {
    // Notify ticket creator about status change
    await this.notificationsService.createNotification(
      creatorUserId,
      'support_ticket_status_changed',
      '✅ Ticket Status Updated',
      `Your ticket "${ticketTitle}" is now ${newStatus}`,
      `/support?ticket=${ticketId}`,
      ['push', 'email'],
      'normal',
    );
  }

  /**
   * COMPLIANCE NOTIFICATIONS
   */

  async notifyComplianceDeadlineReminder(
    companyId: string,
    obligationType: string,
    dueDate: Date,
    daysUntilDue: number,
    accountantUserIds: string[],
  ) {
    const priority =
      daysUntilDue <= 1 ? 'critical' : daysUntilDue <= 3 ? 'high' : 'normal';

    await this.sendToMultipleUsers(
      accountantUserIds,
      'compliance_deadline_reminder',
      `⏰ ${obligationType} Filing Due`,
      `${obligationType} filing is due on ${dueDate.toLocaleDateString()}. ${daysUntilDue} days remaining.`,
      `/compliance`,
      priority,
    );
  }

  async notifyComplianceOverdue(
    companyId: string,
    obligationType: string,
    daysOverdue: number,
    adminUserIds: string[],
  ) {
    await this.sendToMultipleUsers(
      adminUserIds,
      'compliance_overdue',
      `🚨 ${obligationType} Overdue!`,
      `${obligationType} filing is ${daysOverdue} days overdue. Penalties may apply.`,
      `/compliance`,
      'critical',
    );
  }

  async notifyComplianceCompleted(
    companyId: string,
    obligationType: string,
    adminUserIds: string[],
  ) {
    await this.sendToMultipleUsers(
      adminUserIds,
      'compliance_completed',
      `✅ ${obligationType} Filed Successfully`,
      `Your ${obligationType} filing has been completed and confirmed.`,
      `/compliance`,
      'normal',
    );
  }

  /**
   * PAYROLL NOTIFICATIONS
   */

  async notifyPayrollReady(
    companyId: string,
    payrollPeriod: string,
    totalNetPay: number,
    employeeCount: number,
    accountantUserIds: string[],
  ) {
    await this.sendToMultipleUsers(
      accountantUserIds,
      'payroll_ready',
      `💰 Payroll Ready for ${payrollPeriod}`,
      `Payroll calculated for ${employeeCount} employees. Total net pay: ₦${totalNetPay.toLocaleString()}`,
      `/payroll`,
      'high',
    );
  }

  async notifyPayrollApprovalNeeded(
    companyId: string,
    payrollPeriod: string,
    adminUserIds: string[],
  ) {
    await this.sendToMultipleUsers(
      adminUserIds,
      'payroll_approval_needed',
      `⏳ Payroll Approval Needed`,
      `${payrollPeriod} payroll is ready for your approval.`,
      `/payroll`,
      'high',
    );
  }

  async notifyPayslipReady(
    companyId: string,
    employeeUserId: string,
    payrollPeriod: string,
  ) {
    await this.notificationsService.createNotification(
      employeeUserId,
      'payslip_ready',
      `📄 Your Payslip for ${payrollPeriod} is Ready`,
      'Download your payslip from the dashboard.',
      `/payroll/payslips`,
      ['push', 'email'],
      'normal',
    );
  }

  /**
   * SUBSCRIPTION NOTIFICATIONS
   */

  async notifySubscriptionExpiryWarning(
    companyId: string,
    adminUserId: string,
    daysRemaining: number,
  ) {
    const priority = daysRemaining <= 3 ? 'high' : 'normal';

    await this.notificationsService.createNotification(
      adminUserId,
      'subscription_expiry_warning',
      `⚠️ Subscription Expiring Soon`,
      `Your subscription will expire in ${daysRemaining} days. Renew now to avoid service interruption.`,
      `/settings/subscription`,
      ['push', 'email'],
      priority,
    );
  }

  async notifyPaymentFailed(
    companyId: string,
    adminUserId: string,
    amount: number,
  ) {
    await this.notificationsService.createNotification(
      adminUserId,
      'payment_failed',
      `❌ Payment Failed`,
      `We couldn't process your payment of ₦${amount.toLocaleString()}. Please update your payment method.`,
      `/settings/subscription/payment`,
      ['push', 'email'],
      'high',
    );
  }

  async notifyUpgradeRecommended(
    companyId: string,
    adminUserId: string,
    recommendedPlan: string,
  ) {
    await this.notificationsService.createNotification(
      adminUserId,
      'upgrade_recommended',
      `📈 Upgrade Your Plan`,
      `Based on your usage, we recommend upgrading to ${recommendedPlan} for better features and support.`,
      `/settings/subscription/plans`,
      ['push', 'email'],
      'normal',
    );
  }

  /**
   * USER MANAGEMENT NOTIFICATIONS
   */

  async notifyUserInvited(
    companyId: string,
    invitedUserEmail: string,
    inviterName: string,
    role: string,
  ) {
    // Invitation email sent separately, this is for records
    console.log(
      `[Notification] User ${invitedUserEmail} invited as ${role} by ${inviterName}`,
    );
  }

  async notifyRoleChanged(
    companyId: string,
    userId: string,
    newRole: string,
    adminName: string,
  ) {
    await this.notificationsService.createNotification(
      userId,
      'role_changed',
      `👤 Your Role Was Updated`,
      `${adminName} changed your role to ${newRole}.`,
      `/settings`,
      ['push', 'email'],
      'normal',
    );
  }

  /**
   * SYSTEM NOTIFICATIONS
   */

  async notifySystemAlert(
    companyId: string,
    adminUserIds: string[],
    alertTitle: string,
    alertMessage: string,
  ) {
    await this.sendToMultipleUsers(
      adminUserIds,
      'system_alert',
      `🔔 ${alertTitle}`,
      alertMessage,
      undefined,
      'high',
    );
  }

  /**
   * DOCUMENT NOTIFICATIONS
   */

  async notifyDocumentUploadRequired(
    companyId: string,
    userId: string,
    documentType: string,
    dueDate: Date,
  ) {
    await this.notificationsService.createNotification(
      userId,
      'document_upload_required',
      `📋 Document Upload Required`,
      `Please upload your ${documentType} by ${dueDate.toLocaleDateString()}`,
      `/documents`,
      ['push', 'email'],
      'high',
    );
  }

  async notifyDocumentAvailable(
    companyId: string,
    userId: string,
    documentType: string,
  ) {
    await this.notificationsService.createNotification(
      userId,
      'document_available',
      `📄 New Document Available`,
      `A new ${documentType} document is available for you to review.`,
      `/documents`,
      ['push', 'email'],
      'normal',
    );
  }
}
