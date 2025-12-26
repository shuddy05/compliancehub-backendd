import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../database/entities/notification.entity';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Get all notifications for a user
   */
  async getNotifications(
    userId: string,
    skip: number = 0,
    take: number = 20,
    filter?: string,
  ) {
    const query = this.notificationRepository.createQueryBuilder('n');
    query.where('n.userId = :userId', { userId });

    if (filter === 'unread') {
      query.andWhere('n.isRead = false');
    }

    const notifications = await query
      .orderBy('n.createdAt', 'DESC')
      .skip(skip)
      .take(take)
      .getMany();

    const total = await query.getCount();

    return {
      data: notifications.map((n) => ({
        id: n.id,
        notificationType: n.notificationType,
        title: n.title,
        message: n.message,
        actionUrl: n.actionUrl,
        isRead: n.isRead,
        readAt: n.readAt,
        isArchived: n.isArchived,
        priority: n.priority,
        createdAt: n.createdAt,
      })),
      total,
      skip,
      take,
    };
  }

  /**
   * Get a specific notification
   */
  async getNotification(notificationId: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, user: { id: userId } },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return {
      id: notification.id,
      notificationType: notification.notificationType,
      title: notification.title,
      message: notification.message,
      actionUrl: notification.actionUrl,
      channels: notification.channels,
      isRead: notification.isRead,
      readAt: notification.readAt,
      isArchived: notification.isArchived,
      priority: notification.priority,
      createdAt: notification.createdAt,
    };
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, user: { id: userId } },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();

    const updated = await this.notificationRepository.save(notification);

    return {
      id: updated.id,
      isRead: updated.isRead,
      readAt: updated.readAt,
    };
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    const result = await this.notificationRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    return {
      message: 'All notifications marked as read',
      updated: result.affected,
    };
  }

  /**
   * Archive a notification
   */
  async archiveNotification(notificationId: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, user: { id: userId } },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isArchived = true;
    const updated = await this.notificationRepository.save(notification);

    return {
      id: updated.id,
      isArchived: updated.isArchived,
    };
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, user: { id: userId } },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepository.remove(notification);

    return { message: 'Notification deleted' };
  }

  /**
   * Get notification preferences (currently returns default)
   */
  async getPreferences(companyId: string, userId: string) {
    // TODO: Implement notification preference system
    // For now, return defaults

    return {
      companyId,
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        whatsappNotifications: false,
        digestFrequency: 'daily', // daily, weekly, never
        notificationTypes: {
          complianceDeadline: true,
          payrollReady: true,
          subscriptionExpiry: true,
          paymentFailed: true,
          documentUploaded: true,
          employeeAdded: true,
          featureAnnouncement: true,
        },
      },
    };
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string) {
    const unreadCount = await this.notificationRepository.count({
      where: { user: { id: userId }, isRead: false, isArchived: false },
    });

    return {
      unreadCount,
    };
  }

  /**
   * Create a notification (internal method, called by other services)
   */
  async createNotification(
    userId: string,
    notificationType: string,
    title: string,
    message: string,
    actionUrl?: string,
    channels?: string[],
    priority?: string,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const notification = new Notification();
    notification.userId = userId;
    notification.notificationType = notificationType;
    notification.title = title;
    notification.message = message;
    if (actionUrl) {
      notification.actionUrl = actionUrl;
    }
    notification.channels = {
      email: true,
      sms: false,
      push: true,
      whatsapp: false,
    };
    notification.priority = priority || 'normal';
    notification.isRead = false;
    notification.isArchived = false;
    if (actionUrl) {
      notification.actionUrl = actionUrl;
    }

    return this.notificationRepository.save(notification);
  }
}
