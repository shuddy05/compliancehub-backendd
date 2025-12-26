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
import { ComplianceObligation } from './compliance-obligation.entity';
import { User } from './user.entity';

@Entity('compliance_filings')
export class ComplianceFiling {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (c) => c.complianceFilings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'uuid' })
  obligationId: string;

  @ManyToOne(() => ComplianceObligation, (co) => co.complianceFilings)
  @JoinColumn({ name: 'obligationId' })
  obligation: ComplianceObligation;

  @Column({ type: 'varchar', length: 10 })
  filingPeriod: string; // YYYY-MM or YYYY-QX or YYYY

  @Column({ type: 'integer' })
  filingYear: number;

  @Column({ type: 'integer', nullable: true })
  filingMonth: number;

  @Column({ type: 'integer', nullable: true })
  filingQuarter: number;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string; // pending, calculated, filed, paid, overdue, exempted

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  filedDate: Date;

  @Column({ type: 'date', nullable: true })
  paymentDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  calculatedAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  penaltyAmount: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  filingReference: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentReference: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  filingMethod: string; // manual, automated, accountant

  @Column({ type: 'text', nullable: true })
  filingDocumentUrl: string;

  @Column({ type: 'text', nullable: true })
  paymentReceiptUrl: string;

  @Column({ type: 'simple-json', nullable: true })
  supportingDocuments: Array<{ name: string; url: string }>;

  @Column({ type: 'timestamp', nullable: true })
  reminderSentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  overdueNoticeSentAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
