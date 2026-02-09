import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Company } from './company.entity';

@Entity('company_settings')
export class CompanySettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  companyId: string;

  @ManyToOne(() => Company, (c) => c.settings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'integer', default: 25 })
  payrollDay: number;

  @Column({ type: 'boolean', default: true })
  payrollApprovalRequired: boolean;

  @Column({ type: 'boolean', default: true })
  autoGeneratePayslips: boolean;

  @Column({ type: 'boolean', default: false })
  autoFilePaye: boolean;

  @Column({ type: 'boolean', default: true })
  autoCalculatePension: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  complianceOfficerEmail: string;

  @Column({ type: 'simple-json', nullable: true })
  deadlineReminderDays: number[];

  @Column({ type: 'boolean', default: false })
  sendSmsReminders: boolean;

  @Column({ type: 'boolean', default: true })
  sendWhatsappReminders: boolean;

  @Column({ type: 'varchar', length: 7, default: '#10B981' })
  primaryColor: string;

  @Column({ type: 'text', nullable: true })
  logoUrl: string;

  @Column({ type: 'text', nullable: true })
  companyLetterheadUrl: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  accountingSoftware: string; // quickbooks, sage, xero

  @Column({ type: 'boolean', default: false })
  accountingIntegrationActive: boolean;

  @Column({ type: 'boolean', default: false })
  bankIntegrationActive: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}

