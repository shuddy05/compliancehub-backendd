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
import { User } from './user.entity';
import { PayrollItem } from './payroll-item.entity';

@Entity('payroll_runs')
export class PayrollRun {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (c) => c.payrollRuns, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'varchar', length: 7 })
  payrollPeriod: string; // YYYY-MM format

  @Column({ type: 'date' })
  payrollStartDate: Date;

  @Column({ type: 'date' })
  payrollEndDate: Date;

  @Column({ type: 'date', nullable: true })
  paymentDate: Date;

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status: string; // draft, processing, approved, paid, cancelled

  @Column({ type: 'uuid', nullable: true })
  approvedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approvedById' })
  approvedBy: User;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalGross: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalDeductions: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalNet: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPaye: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPensionEmployee: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPensionEmployer: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalNhf: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalNsitf: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalItf: number;

  @Column({ type: 'integer', default: 0 })
  employeeCount: number;

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

  // Relations
  @OneToMany(() => PayrollItem, (pi) => pi.payrollRun, { cascade: true })
  payrollItems: PayrollItem[];
}
