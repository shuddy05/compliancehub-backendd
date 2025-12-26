import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { User } from './user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (c) => c.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => User, (u) => u.notifications)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 50 })
  notificationType: string; // deadline_reminder, payment_overdue, payroll_ready, subscription_expiry

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text', nullable: true })
  actionUrl: string;

  @Column({ type: 'simple-json', nullable: true })
  channels: { email: boolean; sms: boolean; push: boolean; whatsapp: boolean };

  @Column({ type: 'timestamp', nullable: true })
  emailSentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  smsSentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  pushSentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  whatsappSentAt: Date;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @Column({ type: 'varchar', length: 20, default: 'normal' })
  priority: string; // low, normal, high, critical

  @CreateDateColumn()
  createdAt: Date;
}
