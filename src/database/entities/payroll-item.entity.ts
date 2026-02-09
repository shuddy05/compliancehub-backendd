import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PayrollRun } from './payroll-run.entity';
import { Employee } from './employee.entity';
import { Company } from './company.entity';

@Entity('payroll_items')
export class PayrollItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  payrollRunId: string;

  @ManyToOne(() => PayrollRun, (pr) => pr.payrollItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payrollRunId' })
  payrollRun: PayrollRun;

  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee, (e) => e.payrollItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  basicSalary: number;

  @Column({ type: 'simple-json', nullable: true })
  allowances: Array<{ type: string; amount: number }>;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  grossSalary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  paye: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pensionEmployee: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pensionEmployer: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  nhf: number;

  @Column({ type: 'simple-json', nullable: true })
  otherDeductions: Array<{ type: string; amount: number }>;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalDeductions: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  netSalary: number;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  paymentStatus: string; // pending, paid, failed

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentReference: string;

  @Column({ type: 'datetime', nullable: true })
  paymentDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  nsitfContribution: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  itfContribution: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}

