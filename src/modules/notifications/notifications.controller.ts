import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  /**
   * Get all notifications for the current user
   * GET /api/v1/notifications
   */
  @Get()
  async getNotifications(
    @Request() req,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
    @Query('filter') filter?: string, // 'unread' | 'all'
  ) {
    return this.notificationsService.getNotifications(
      req.user.id,
      skip,
      take,
      filter,
    );
  }

  /**
   * Get a specific notification
   * GET /api/v1/notifications/:id
   */
  @Get(':id')
  async getNotification(@Param('id') id: string, @Request() req) {
    return this.notificationsService.getNotification(id, req.user.id);
  }

  /**
   * Mark a notification as read
   * PATCH /api/v1/notifications/:id/read
   */
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  /**
   * Mark all notifications as read
   * PATCH /api/v1/notifications/read-all
   */
  @Patch('read-all')
  async markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  /**
   * Archive a notification
   * PATCH /api/v1/notifications/:id/archive
   */
  @Patch(':id/archive')
  async archiveNotification(@Param('id') id: string, @Request() req) {
    return this.notificationsService.archiveNotification(id, req.user.id);
  }

  /**
   * Delete a notification
   * DELETE /api/v1/notifications/:id
   */
  @Delete(':id')
  async deleteNotification(@Param('id') id: string, @Request() req) {
    return this.notificationsService.deleteNotification(id, req.user.id);
  }

  /**
   * Get notification preferences for a company
   * GET /api/v1/notifications/company/:companyId/preferences
   */
  @Get('company/:companyId/preferences')
  async getPreferences(@Param('companyId') companyId: string, @Request() req) {
    return this.notificationsService.getPreferences(companyId, req.user.id);
  }

  /**
   * Get unread notification count
   * GET /api/v1/notifications/unread-count
   */
  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }
}
