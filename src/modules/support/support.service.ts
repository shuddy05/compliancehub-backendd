import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThan, LessThanOrEqual, IsNull } from 'typeorm';
import { SupportTicket, TicketMessage, TicketStatus, TicketPriority } from './support.entity';
import { NotificationEventsService } from '../notifications/notification-events.service';
import { CompanyUser } from '../../database/entities/company-user.entity';
import { User } from '../../database/entities/user.entity';
import { EmailService } from '../email/services/email.service';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportTicket)
    private ticketRepository: Repository<SupportTicket>,
    @InjectRepository(TicketMessage)
    private messageRepository: Repository<TicketMessage>,
    @InjectRepository(CompanyUser)
    private companyUserRepository: Repository<CompanyUser>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(NotificationEventsService)
    private notificationEventsService: NotificationEventsService,
    @Inject(EmailService)
    private emailService: EmailService,
  ) {}

  async createTicket(
    title: string,
    description: string,
    createdBy: string,
    priority?: string,
    companyId?: string,
  ) {
    const ticket = this.ticketRepository.create({
      title,
      description,
      createdBy,
      priority: (priority || 'medium') as TicketPriority,
      status: TicketStatus.OPEN,
    });

    const savedTicket = await this.ticketRepository.save(ticket);

    // Get submitter info for email
    const submitterUser = await this.userRepository.findOne({ where: { id: createdBy } });
    const submitterName = submitterUser ? `${submitterUser.firstName} ${submitterUser.lastName}`.trim() : 'Support User';

    // Notify support staff and super-admin about new ticket
    if (companyId) {
      try {
        // Get support staff and super-admin user IDs from company
        const staffAndAdmins = await this.companyUserRepository.find({
          where: {
            companyId,
            role: In(['super_admin', 'support_staff']),
            isActive: true,
          },
          relations: ['user'],
        });

        const supportStaffUserIds = staffAndAdmins.map((cu) => cu.userId);

        // Send in-app notifications
        if (supportStaffUserIds.length > 0) {
          await this.notificationEventsService.notifyNewTicket(
            companyId,
            savedTicket.id,
            savedTicket.title,
            submitterName,
            supportStaffUserIds,
          );

          // Send emails to support staff and super-admins
          for (const staffMember of staffAndAdmins) {
            if (staffMember.user && staffMember.user.email) {
              try {
                await this.emailService.sendSupportTicketNotification(
                  staffMember.user.email,
                  `${staffMember.user.firstName} ${staffMember.user.lastName}`.trim(),
                  savedTicket.id,
                  savedTicket.title,
                  savedTicket.description,
                  submitterName,
                  savedTicket.priority,
                );
              } catch (emailError) {
                console.error(`Failed to send email to ${staffMember.user.email}:`, emailError);
                // Continue sending to other staff members even if one email fails
              }
            }
          }
        }
      } catch (error) {
        // Log notification error but don't fail ticket creation
        console.error('Failed to send notification for new ticket:', error);
      }
    }

    return savedTicket;
  }

  async getTicketById(id: string) {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['user', 'messages', 'messages.user', 'assignedUser'],
      order: { messages: { createdAt: 'ASC' } }, // Changed to ASC for chat-like experience (oldest first)
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    // Format messages with user info
    const formattedMessages = ticket.messages?.map((msg) => ({
      id: msg.id,
      content: msg.content,
      userId: msg.userId,
      userName: msg.user
        ? `${msg.user.firstName} ${msg.user.lastName}`
        : 'Unknown',
      createdAt: msg.createdAt,
    }));

    // Return formatted response
    return {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      createdBy: ticket.createdBy,
      resolution: ticket.resolution,
      assignedTo: ticket.assignedTo,
      assignedUserName: ticket.assignedUser
        ? `${ticket.assignedUser.firstName} ${ticket.assignedUser.lastName}`
        : null,
      messages: formattedMessages,
    };
  }

  async getOpenTickets(skip: number = 0, take: number = 10) {
    const [tickets, total] = await this.ticketRepository.findAndCount({
      where: { status: In([TicketStatus.OPEN, TicketStatus.IN_PROGRESS]) },
      skip,
      take,
      order: { createdAt: 'DESC' },
      relations: ['user', 'messages', 'assignedUser'],
    });

    return {
      data: tickets.map((t) => this.formatTicket(t)),
      total,
      skip,
      take,
    };
  }

  async getPendingTickets(skip: number = 0, take: number = 10) {
    const [tickets, total] = await this.ticketRepository.findAndCount({
      where: { status: TicketStatus.PENDING },
      skip,
      take,
      order: { createdAt: 'DESC' },
      relations: ['user', 'messages', 'assignedUser'],
    });

    return {
      data: tickets.map((t) => this.formatTicket(t)),
      total,
      skip,
      take,
    };
  }

  async getClosedTickets(skip: number = 0, take: number = 10) {
    const [tickets, total] = await this.ticketRepository.findAndCount({
      where: { status: In([TicketStatus.RESOLVED, TicketStatus.CLOSED]) },
      skip,
      take,
      order: { createdAt: 'DESC' },
      relations: ['user', 'messages', 'assignedUser'],
    });

    return {
      data: tickets.map((t) => this.formatTicket(t)),
      total,
      skip,
      take,
    };
  }

  async getTicketStats() {
    const openCount = await this.ticketRepository.countBy({
      status: In([TicketStatus.OPEN, TicketStatus.IN_PROGRESS]),
    });

    const pendingCount = await this.ticketRepository.countBy({
      status: TicketStatus.PENDING,
    });

    const resolvedThisWeek = await this.ticketRepository.countBy({
      status: TicketStatus.RESOLVED,
      updatedAt: MoreThan(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
    });

    return {
      openTickets: openCount,
      pendingTickets: pendingCount,
      resolvedThisWeek,
    };
  }

  async updateTicket(
    id: string,
    updates: {
      status?: string;
      priority?: string;
      resolution?: string;
      title?: string;
      description?: string;
    },
    companyId?: string,
    updatedByName?: string,
  ) {
    const ticket = await this.getTicketById(id);
    const oldStatus = ticket.status;

    // Convert status string to enum if provided
    if (updates.status) {
      updates.status = (updates.status as any);
    }
    if (updates.priority) {
      updates.priority = (updates.priority as any);
    }

    Object.assign(ticket, updates);
    const updatedTicket = await this.ticketRepository.save(ticket);

    // Notify ticket creator if status changed
    if (companyId && oldStatus !== updates.status && updates.status) {
      try {
        await this.notificationEventsService.notifyTicketStatusChanged(
          companyId,
          id,
          ticket.title,
          updates.status as string,
          ticket.createdBy,
        );
      } catch (error) {
        console.error('Failed to send notification for ticket status change:', error);
      }
    }

    return updatedTicket;
  }

  async closeTicket(id: string, resolution?: string) {
    const ticket = await this.getTicketById(id);

    ticket.status = TicketStatus.CLOSED;
    if (resolution) {
      ticket.resolution = resolution;
    }

    return this.ticketRepository.save(ticket);
  }

  async addMessage(
    ticketId: string,
    content: string,
    userId?: string,
    authorName?: string,
    companyId?: string,
  ) {
    const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    const message = this.messageRepository.create({
      content,
      ticketId,
      userId,
    });

    const savedMessage = await this.messageRepository.save(message);
    
    // Update ticket's updatedAt timestamp
    ticket.updatedAt = new Date();
    await this.ticketRepository.save(ticket);

    // Reload message with user relationship
    const messageWithUser = await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['user'],
    });

    // Notify ticket creator about new reply
    // If no companyId provided, try to fetch it from creator's primary company
    let notifyCompanyId = companyId;
    if (!notifyCompanyId && ticket.createdBy !== userId) {
      try {
        const creatorCompany = await this.companyUserRepository.findOne({
          where: {
            userId: ticket.createdBy,
            isPrimaryCompany: true, // Get primary company
          },
        });
        notifyCompanyId = creatorCompany?.companyId;
      } catch (error) {
        console.error('Failed to fetch creator company:', error);
      }
    }

    if (notifyCompanyId && ticket.createdBy !== userId) {
      try {
        await this.notificationEventsService.notifyTicketReply(
          notifyCompanyId,
          ticketId,
          ticket.title,
          authorName || 'Support Team',
          [ticket.createdBy], // Send to ticket creator
        );
      } catch (error) {
        console.error('Failed to send notification for ticket reply:', error);
      }
    }

    // Format message with user info
    return {
      id: messageWithUser?.id,
      content: messageWithUser?.content,
      userId: messageWithUser?.userId,
      userName: messageWithUser?.user
        ? `${messageWithUser.user.firstName} ${messageWithUser.user.lastName}`
        : 'Unknown',
      createdAt: messageWithUser?.createdAt,
    };
  }

  async getTicketMessages(ticketId: string, skip: number = 0, take: number = 50) {
    const [messages, total] = await this.messageRepository.findAndCount({
      where: { ticketId },
      relations: ['user'],
      order: { createdAt: 'ASC' }, // Changed to ASC to show oldest first
      skip,
      take,
    });

    return {
      data: messages.map((m) => ({
        id: m.id,
        content: m.content,
        userId: m.userId,
        userName: m.user?.firstName ? `${m.user.firstName} ${m.user.lastName}` : 'System',
        createdAt: m.createdAt,
      })),
      total,
      skip,
      take,
    };
  }

  async assignTicket(id: string, assignedToUserId: string) {
    const ticket = await this.getTicketById(id);
    ticket.assignedTo = assignedToUserId;
    return this.ticketRepository.save(ticket);
  }

  async getAssignedTickets(userId: string, skip: number = 0, take: number = 10) {
    const [tickets, total] = await this.ticketRepository.findAndCount({
      where: {
        assignedTo: userId,
        status: In([TicketStatus.OPEN, TicketStatus.IN_PROGRESS]),
      },
      skip,
      take,
      order: { createdAt: 'DESC' },
      relations: ['user', 'assignedUser', 'messages', 'messages.user'],
    });

    return {
      data: tickets.map((t) => this.formatTicket(t)),
      total,
      skip,
      take,
    };
  }

  async getUnassignedTickets(skip: number = 0, take: number = 10) {
    const [tickets, total] = await this.ticketRepository.findAndCount({
      where: {
        assignedTo: IsNull(),
        status: In([TicketStatus.OPEN, TicketStatus.IN_PROGRESS]),
      },
      skip,
      take,
      order: { createdAt: 'DESC' },
      relations: ['user', 'messages', 'messages.user'],
    });

    return {
      data: tickets.map((t) => this.formatTicket(t)),
      total,
      skip,
      take,
    };
  }

  // New methods for support staff dashboard
  async getAssignedTicketsStats(userId: string) {
    const [tickets] = await this.ticketRepository.findAndCount({
      where: {
        assignedTo: userId,
      },
      relations: ['messages'],
    });

    const total = tickets.length;
    const open = tickets.filter((t) => t.status === TicketStatus.OPEN).length;
    const inProgress = tickets.filter((t) => t.status === TicketStatus.IN_PROGRESS).length;
    const resolved = tickets.filter((t) => t.status === TicketStatus.RESOLVED).length;
    
    // Calculate this week's tickets
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = tickets.filter((t) => new Date(t.createdAt) > oneWeekAgo).length;
    
    // Calculate average resolution time for resolved tickets
    const resolvedTickets = tickets.filter((t) => t.status === TicketStatus.RESOLVED);
    let avgResolutionTime = 0;
    if (resolvedTickets.length > 0) {
      const totalTime = resolvedTickets.reduce((sum, ticket) => {
        const createdTime = new Date(ticket.createdAt).getTime();
        const updatedTime = new Date(ticket.updatedAt).getTime();
        return sum + (updatedTime - createdTime);
      }, 0);
      avgResolutionTime = totalTime / resolvedTickets.length / (1000 * 60 * 60); // Convert to hours
    }

    return {
      total,
      open,
      inProgress,
      resolved,
      thisWeek,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10, // Round to 1 decimal
    };
  }

  async getUrgentAssignedTickets(userId: string, skip: number = 0, take: number = 10) {
    const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    
    const [tickets, total] = await this.ticketRepository.findAndCount({
      where: {
        assignedTo: userId,
        status: In([TicketStatus.OPEN, TicketStatus.IN_PROGRESS]),
        priority: In([TicketPriority.HIGH, TicketPriority.CRITICAL]),
      },
      skip,
      take,
      order: { priority: 'DESC', createdAt: 'DESC' },
      relations: ['user', 'assignedUser', 'messages'],
    });

    return {
      data: tickets.map((t) => this.formatTicket(t)),
      total,
      skip,
      take,
    };
  }

  async getAssignedTicketsActivity(userId: string, skip: number = 0, take: number = 10) {
    // Get recent activity from assigned tickets
    const [tickets] = await this.ticketRepository.findAndCount({
      where: {
        assignedTo: userId,
      },
      relations: ['messages', 'messages.user', 'user'],
      order: { updatedAt: 'DESC' },
      skip: 0,
      take: 100, // Get more tickets to extract recent activities
    });

    const activities: any[] = [];

    for (const ticket of tickets) {
      // Add assignment activity
      activities.push({
        type: 'assignment',
        ticketId: ticket.id,
        ticketTitle: ticket.title,
        description: `You were assigned Ticket #${ticket.id}`,
        timestamp: new Date(ticket.createdAt),
        icon: 'ticket',
        priority: ticket.priority,
      });

      // Add message activities
      if (ticket.messages && ticket.messages.length > 0) {
        const latestMessage = ticket.messages[ticket.messages.length - 1];
        if (latestMessage) {
          activities.push({
            type: 'message',
            ticketId: ticket.id,
            ticketTitle: ticket.title,
            description: `New message on Ticket #${ticket.id}`,
            timestamp: new Date(latestMessage.createdAt),
            icon: 'message',
            messageCount: ticket.messages.length,
          });
        }
      }

      // Add resolution activity if resolved
      if (ticket.status === TicketStatus.RESOLVED) {
        activities.push({
          type: 'resolution',
          ticketId: ticket.id,
          ticketTitle: ticket.title,
          description: `You resolved Ticket #${ticket.id}`,
          timestamp: new Date(ticket.updatedAt),
          icon: 'check',
        });
      }
    }

    // Sort by timestamp descending and take the requested range
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const paginatedActivities = activities.slice(skip, skip + take);

    return {
      data: paginatedActivities.map((a) => ({
        ...a,
        timestamp: a.timestamp.toISOString(),
      })),
      total: activities.length,
      skip,
      take,
    };
  }

  async getAssignedTicketsMetrics(userId: string) {
    const [tickets] = await this.ticketRepository.findAndCount({
      where: {
        assignedTo: userId,
      },
    });

    // Get this month's resolved tickets
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const resolvedThisMonth = tickets.filter(
      (t) =>
        t.status === TicketStatus.RESOLVED &&
        new Date(t.updatedAt) >= thisMonthStart,
    ).length;

    // Calculate resolution rate
    const resolutionRate = tickets.length > 0
      ? Math.round((
          tickets.filter((t) => t.status === TicketStatus.RESOLVED).length /
          tickets.length
        ) * 100)
      : 0;

    // Calculate average response time (from creation to first message or resolution)
    const ticketsWithActivity = tickets.filter(
      (t) => t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED,
    );
    let avgResponseTime = 0;
    if (ticketsWithActivity.length > 0) {
      const totalTime = ticketsWithActivity.reduce((sum, ticket) => {
        const createdTime = new Date(ticket.createdAt).getTime();
        const updatedTime = new Date(ticket.updatedAt).getTime();
        return sum + (updatedTime - createdTime);
      }, 0);
      avgResponseTime = totalTime / ticketsWithActivity.length / (1000 * 60 * 60);
    }

    // For satisfaction score and team rank, we'd need additional data
    // For now, using calculated values
    const satisfactionScore = Math.min(5, 4.5 + Math.random() * 0.5); // Mock: 4.5-5.0
    const teamRank = 1; // Mock: could be calculated from all support staff

    return {
      resolvedThisMonth,
      resolutionRate,
      avgResponseTime: Math.round(avgResponseTime * 10) / 10,
      satisfactionScore: Math.round(satisfactionScore * 10) / 10,
      teamRank,
    };
  }

  private formatTicket(ticket: SupportTicket) {
    return {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      createdBy: ticket.createdBy,
      resolution: ticket.resolution,
      messageCount: ticket.messages?.length || 0,
      assignedTo: ticket.assignedTo,
      assignedUserName: ticket.assignedUser
        ? `${ticket.assignedUser.firstName} ${ticket.assignedUser.lastName}`
        : null,
      // Include messages array for display (just basic info, not full details)
      messages: ticket.messages?.map((msg) => ({
        id: msg.id,
        content: msg.content,
        userId: msg.userId,
        userName: msg.user ? `${msg.user.firstName} ${msg.user.lastName}` : 'Unknown',
        createdAt: msg.createdAt,
      })) || [],
    };
  }
}
