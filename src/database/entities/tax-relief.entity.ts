import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from './employee.entity';
import { Company } from './company.entity';
import { User } from './user.entity';

@Entity('tax_reliefs')
export class TaxRelief {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee, (e) => e.taxReliefs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (c) => c.taxReliefs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'varchar', length: 100 })
  reliefType: string; // CRA, NHF, NHIS, pension

  @Column({ type: 'varchar', length: 255, nullable: true })
  reliefName: string;

  @Column({ type: 'integer' })
  taxYear: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  annualReliefAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  monthlyReliefAmount: number;

  @Column({ type: 'text', nullable: true })
  supportingDocumentUrl: string;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @Column({ type: 'uuid', nullable: true })
  verifiedById: string;

  @ManyToOne(() => User, (u) => u.verifiedTaxReliefs)
  @JoinColumn({ name: 'verifiedById' })
  verifiedBy: User;

  @Column({ type: 'datetime', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

