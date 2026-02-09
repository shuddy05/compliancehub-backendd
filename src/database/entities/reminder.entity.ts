import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from './company.entity';

@Entity('reminders')
export class Reminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (c) => c.reminders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'varchar', length: 100 })
  reminderType: string; // deadline, subscription_renewal, payroll_due

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  relatedEntityType: string; // compliance_filing, payroll_run, subscription

  @Column({ type: 'uuid', nullable: true })
  relatedEntityId: string;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'integer', default: 3 })
  remindDaysBefore: number;

  @Column({ type: 'datetime' })
  scheduledFor: Date;

  @Column({ type: 'simple-json', nullable: true })
  recipients: string[]; // user_ids or 'all_admins'

  @Column({ type: 'simple-json', nullable: true })
  channels: { email: boolean; sms: boolean; push: boolean };

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string; // pending, sent, failed, cancelled

  @Column({ type: 'datetime', nullable: true })
  sentAt: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;
}

