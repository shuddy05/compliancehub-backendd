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
import { ComplianceFiling } from './compliance-filing.entity';

@Entity('compliance_obligations')
export class ComplianceObligation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (c) => c.complianceObligations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'varchar', length: 50 })
  obligationType: string; // PAYE, VAT, WHT, PENSION, NSITF, ITF, CAC_ANNUAL_RETURN

  @Column({ type: 'varchar', length: 255 })
  obligationName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  agency: string; // FIRS, Pension Commission, NSITF, ITF, CAC, State Tax

  @Column({ type: 'varchar', length: 50 })
  frequency: string; // monthly, quarterly, annually, one_time

  @Column({ type: 'integer', nullable: true })
  dueDay: number;

  @Column({ type: 'integer', nullable: true })
  dueMonth: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'simple-json', nullable: true })
  appliesIf: Record<string, any>;

  @Column({ type: 'varchar', length: 50, nullable: true })
  enabledForTier: string; // free, pro, enterprise

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => ComplianceFiling, (cf) => cf.obligation, { cascade: true })
  complianceFilings: ComplianceFiling[];
}
