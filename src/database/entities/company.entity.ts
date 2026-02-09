import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { CompanyUser } from './company-user.entity';
import { Employee } from './employee.entity';
import { PayrollRun } from './payroll-run.entity';
import { ComplianceObligation } from './compliance-obligation.entity';
import { ComplianceFiling } from './compliance-filing.entity';
import { Document } from './document.entity';
import { Notification } from './notification.entity';
import { Subscription } from './subscription.entity';
import { AuditLog } from './audit-log.entity';
import { TaxRelief } from './tax-relief.entity';
import { Reminder } from './reminder.entity';
import { ApiKey } from './api-key.entity';
import { CompanySettings } from './company-settings.entity';
import { PaymentTransaction } from './payment-transaction.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  tin: string; // Tax Identification Number

  @Column({ type: 'varchar', length: 20, nullable: true })
  rcNumber: string; // Corporate Affairs Commission number

  @Column({ type: 'varchar', length: 100, nullable: true })
  industry: string;

  @Column({ type: 'integer', default: 0 })
  employeeCount: number;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lga: string; // Local Government Area

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  logoUrl: string;

  // Subscription
  @Column({ type: 'varchar', length: 20, default: 'free' })
  subscriptionTier: string; // free, pro, enterprise

  @Column({ type: 'varchar', length: 20, default: 'active' })
  subscriptionStatus: string; // active, trial, suspended, cancelled

  @Column({ type: 'datetime', nullable: true })
  trialEndAt: Date;

  @Column({ type: 'datetime', nullable: true })
  billingPeriodStart: Date;

  @Column({ type: 'datetime', nullable: true })
  billingPeriodEnd: Date;

  @Column({ type: 'datetime', nullable: true })
  nextBillingDate: Date;

  @Column({ type: 'integer', default: 0 })
  paymentRetryCount: number;

  @Column({ type: 'datetime', nullable: true })
  gracePeriodEnd: Date;

  // Settings
  @Column({ type: 'date', default: '2024-12-31' })
  fiscalYearEnd: string;

  @Column({ type: 'varchar', length: 3, default: 'NGN' })
  defaultCurrency: string;

  @Column({ type: 'varchar', length: 50, default: 'Africa/Lagos' })
  timezone: string;

  // Metadata
  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => CompanyUser, (cu) => cu.company, { cascade: true })
  companyUsers: CompanyUser[];

  @OneToMany(() => Employee, (e) => e.company, { cascade: true })
  employees: Employee[];

  @OneToMany(() => PayrollRun, (pr) => pr.company, { cascade: true })
  payrollRuns: PayrollRun[];

  @OneToMany(() => ComplianceObligation, (co) => co.company, { cascade: true })
  complianceObligations: ComplianceObligation[];

  @OneToMany(() => ComplianceFiling, (cf) => cf.company, { cascade: true })
  complianceFilings: ComplianceFiling[];

  @OneToMany(() => Document, (d) => d.company, { cascade: true })
  documents: Document[];

  @OneToMany(() => Notification, (n) => n.company, { cascade: true })
  notifications: Notification[];

  @OneToMany(() => Subscription, (s) => s.company, { cascade: true })
  subscriptions: Subscription[];

  @OneToMany(() => AuditLog, (al) => al.company, { cascade: true })
  auditLogs: AuditLog[];

  @OneToMany(() => TaxRelief, (tr) => tr.company, { cascade: true })
  taxReliefs: TaxRelief[];

  @OneToMany(() => Reminder, (r) => r.company, { cascade: true })
  reminders: Reminder[];

  @OneToMany(() => ApiKey, (ak) => ak.company, { cascade: true })
  apiKeys: ApiKey[];

  @OneToMany(() => CompanySettings, (cs) => cs.company, { cascade: true })
  settings: CompanySettings[];

  @OneToMany(() => PaymentTransaction, (pt) => pt.company, { cascade: true })
  paymentTransactions: PaymentTransaction[];
}

