import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequiredRoles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { SupportService } from './support.service';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private supportService: SupportService) {}

  @Post()
  async createTicket(
    @Body() data: { title: string; description: string; priority?: string; companyId?: string },
    @GetUser() user: JwtPayload,
  ) {
    return this.supportService.createTicket(
      data.title,
      data.description,
      user.sub,
      data.priority,
      data.companyId,
    );
  }

  @Get(':id')
  async getTicket(@Param('id') id: string) {
    return this.supportService.getTicketById(id);
  }

  @Get()
  async getOpenTickets(
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
  ) {
    return this.supportService.getOpenTickets(skip, take);
  }

  @Get('admin/closed')
  @UseGuards(RolesGuard)
  @RequiredRoles('super_admin', 'support_staff')
  async getClosedTickets(
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
  ) {
    return this.supportService.getClosedTickets(skip, take);
  }

  @Get('admin/stats')
  @UseGuards(RolesGuard)
  @RequiredRoles('super_admin', 'support_staff')
  async getTicketStats() {
    return this.supportService.getTicketStats();
  }

  @Get('admin/pending')
  @UseGuards(RolesGuard)
  @RequiredRoles('super_admin', 'support_staff')
  async getPendingTickets(
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
  ) {
    return this.supportService.getPendingTickets(skip, take);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @RequiredRoles('company_admin', 'super_admin', 'support_staff')
  async updateTicket(
    @Param('id') id: string,
    @Body()
    updates: {
      status?: string;
      priority?: string;
      resolution?: string;
      title?: string;
      description?: string;
      companyId?: string;
    },
    @GetUser() user: JwtPayload,
  ) {
    return this.supportService.updateTicket(
      id,
      updates,
      updates.companyId,
      user.email,
    );
  }

  @Post(':id/close')
  @UseGuards(RolesGuard)
  @RequiredRoles('company_admin', 'super_admin', 'support_staff')
  async closeTicket(
    @Param('id') id: string,
    @Body() data: { resolution?: string },
  ) {
    return this.supportService.closeTicket(id, data?.resolution);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @RequiredRoles('super_admin')
  async deleteTicket(@Param('id') id: string) {
    const ticket = await this.supportService.getTicketById(id);
    // Soft delete by marking as closed
    return this.supportService.closeTicket(id);
  }

  @Post(':id/messages')
  async addMessage(
    @Param('id') id: string,
    @Body() data: { content: string; companyId?: string },
    @GetUser() user: JwtPayload,
  ) {
    return this.supportService.addMessage(
      id,
      data.content,
      user.sub,
      user.email,
      data.companyId,
    );
  }

  @Get(':id/messages')
  async getTicketMessages(
    @Param('id') id: string,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 50,
  ) {
    return this.supportService.getTicketMessages(id, skip, take);
  }

  @Put(':id/assign')
  @UseGuards(RolesGuard)
  @RequiredRoles('support_staff', 'super_admin')
  async assignTicket(
    @Param('id') id: string,
    @Body() data: { assignedToUserId: string },
    @GetUser() user: JwtPayload,
  ) {
    return this.supportService.assignTicket(id, data.assignedToUserId);
  }

  @Get('assigned/me')
  @UseGuards(RolesGuard)
  @RequiredRoles('support_staff', 'super_admin')
  async getMyAssignedTickets(
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
    @GetUser() user: JwtPayload,
  ) {
    return this.supportService.getAssignedTickets(user.sub, skip, take);
  }

  @Get('unassigned')
  @UseGuards(RolesGuard)
  @RequiredRoles('support_staff', 'super_admin')
  async getUnassignedTickets(
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
  ) {
    return this.supportService.getUnassignedTickets(skip, take);
  }

  // Support staff dashboard endpoints
  @Get('assigned/stats')
  @UseGuards(RolesGuard)
  @RequiredRoles('support_staff', 'super_admin')
  async getAssignedTicketsStats(@GetUser() user: JwtPayload) {
    return this.supportService.getAssignedTicketsStats(user.sub);
  }

  @Get('assigned/urgent')
  @UseGuards(RolesGuard)
  @RequiredRoles('support_staff', 'super_admin')
  async getUrgentAssignedTickets(
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
    @GetUser() user: JwtPayload,
  ) {
    return this.supportService.getUrgentAssignedTickets(user.sub, skip, take);
  }

  @Get('assigned/activity')
  @UseGuards(RolesGuard)
  @RequiredRoles('support_staff', 'super_admin')
  async getAssignedTicketsActivity(
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
    @GetUser() user: JwtPayload,
  ) {
    return this.supportService.getAssignedTicketsActivity(user.sub, skip, take);
  }

  @Get('assigned/metrics')
  @UseGuards(RolesGuard)
  @RequiredRoles('support_staff', 'super_admin')
  async getAssignedTicketsMetrics(@GetUser() user: JwtPayload) {
    return this.supportService.getAssignedTicketsMetrics(user.sub);
  }
}
