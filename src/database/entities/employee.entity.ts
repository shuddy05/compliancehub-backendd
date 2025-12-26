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
import { PayrollRun } from './payroll-run.entity';
import { PayrollItem } from './payroll-item.entity';
import { TaxRelief } from './tax-relief.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (c) => c.employees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'varchar', length: 50, nullable: true })
  employeeCode: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  middleName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender: string; // male, female, other

  @Column({ type: 'varchar', length: 20, nullable: true })
  maritalStatus: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  jobTitle: string;

  @Column({ type: 'varchar', length: 50, default: 'full_time' })
  employmentType: string; // full_time, part_time, contract, intern

  @Column({ type: 'date' })
  employmentStartDate: Date;

  @Column({ type: 'date', nullable: true })
  employmentEndDate: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  grossSalary: number;

  @Column({ type: 'varchar', length: 20, default: 'monthly' })
  salaryFrequency: string; // monthly, weekly, daily

  @Column({ type: 'varchar', length: 50, default: 'bank_transfer' })
  paymentMethod: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bankName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  accountNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  accountName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  taxId: string; // Personal TIN

  @Column({ type: 'varchar', length: 50, nullable: true })
  pensionPin: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pensionProvider: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 8.0 })
  pensionPercentage: number;

  @Column({ type: 'boolean', default: true })
  nhfApplicable: boolean;

  @Column({ type: 'simple-json', nullable: true })
  allowances: Array<{ type: string; amount: number; taxable: boolean }>;

  @Column({ type: 'simple-json', nullable: true })
  fixedDeductions: Array<{ type: string; amount: number; description: string }>;

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
  @OneToMany(() => PayrollItem, (pi) => pi.employee, { cascade: true })
  payrollItems: PayrollItem[];

  @OneToMany(() => TaxRelief, (tr) => tr.employee, { cascade: true })
  taxReliefs: TaxRelief[];
}
