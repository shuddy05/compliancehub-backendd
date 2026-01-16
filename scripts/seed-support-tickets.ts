import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { databaseConfig } from '../src/config/database.config';
import { SupportTicket, TicketMessage, TicketStatus, TicketPriority } from '../src/modules/support/support.entity';
import { User } from '../src/database/entities/user.entity';

async function seedSupportTickets() {
  const dataSource = new DataSource(databaseConfig() as DataSourceOptions);

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    // Get a test user (super_admin or first user)
    const userRepository = dataSource.getRepository(User);
    let testUser = await userRepository.findOne({
      where: { email: 'ifeanyireed@gmail.com' },
    });

    if (!testUser) {
      testUser = await userRepository.findOne({
        where: { email: 'aegiscompliancehub@gmail.com' },
      });
    }

    if (!testUser) {
      // Just find the first user
      testUser = await userRepository.findOneBy({});
    }

    if (!testUser) {
      console.log('No test user found. Please create a user first.');
      await dataSource.destroy();
      return;
    }

    const ticketRepository = dataSource.getRepository(SupportTicket);
    const messageRepository = dataSource.getRepository(TicketMessage);

    // Create test tickets
    const tickets = [
      {
        title: 'Cannot access payroll module',
        description: 'User reports being unable to access the payroll module after login. Error message shows "Access Denied"',
        status: TicketStatus.OPEN,
        priority: TicketPriority.HIGH,
        createdBy: testUser.id,
      },
      {
        title: 'Compliance filing deadline incorrect',
        description: 'The system shows wrong deadline for VAT filing. Expected: Jan 15, 2025. Actual: Jan 10, 2025',
        status: TicketStatus.IN_PROGRESS,
        priority: TicketPriority.HIGH,
        createdBy: testUser.id,
      },
      {
        title: 'Integration request - Slack notifications',
        description: 'Client wants to integrate Slack notifications for compliance alerts. Need to discuss implementation timeline.',
        status: TicketStatus.PENDING,
        priority: TicketPriority.MEDIUM,
        createdBy: testUser.id,
      },
      {
        title: 'Payslip download not working',
        description: 'Staff members unable to download payslips in PDF format. The export button is greyed out.',
        status: TicketStatus.RESOLVED,
        priority: TicketPriority.MEDIUM,
        createdBy: testUser.id,
        resolution: 'Updated PDF generation library. Issue resolved in version 2.1.0',
      },
    ];

    console.log('Creating test support tickets...');
    const savedTickets: SupportTicket[] = [];

    for (const ticketData of tickets) {
      const ticket = ticketRepository.create(ticketData);
      const savedTicket = await ticketRepository.save(ticket);
      savedTickets.push(savedTicket);
      console.log(`✓ Created ticket: ${savedTicket.title}`);
    }

    // Add messages to the first ticket
    console.log('Adding test messages to first ticket...');
    const firstTicket = savedTickets[0];

    const messages = [
      {
        content: 'I have checked the user account and permissions. The user is assigned to the Payroll role but still cannot access.',
        userId: testUser.id,
        ticketId: firstTicket.id,
      },
      {
        content: 'This might be a caching issue. Let me clear the browser cache and try again.',
        userId: testUser.id,
        ticketId: firstTicket.id,
      },
      {
        content: 'Still not working after clearing cache. Have tried on different browsers too.',
        userId: testUser.id,
        ticketId: firstTicket.id,
      },
    ];

    for (const messageData of messages) {
      const message = messageRepository.create(messageData);
      await messageRepository.save(message);
      console.log('✓ Added message');
    }

    console.log('\n✅ Successfully seeded support tickets!');
    console.log(`   - Total tickets: ${savedTickets.length}`);
    console.log(`   - Messages added: ${messages.length}`);
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await dataSource.destroy();
  }
}

seedSupportTickets();
