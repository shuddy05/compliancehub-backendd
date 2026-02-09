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
import { Employee } from './employee.entity';
import { TaxRelief } from './tax-relief.entity';

@Entity('company_users')
export class CompanyUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (c) => c.companyUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (u) => u.companyUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 50 })
  role: string; // super_admin, company_admin, accountant, staff, support_staff, read_only

  @Column({ type: 'simple-json', nullable: true })
  permissions: Record<string, Record<string, boolean>>;

  @Column({ type: 'boolean', default: false })
  isPrimaryCompany: boolean;

  @Column({ type: 'uuid', nullable: true })
  invitedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'invitedById' })
  invitedBy: User;

  @Column({ type: 'datetime', nullable: true })
  invitedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  acceptedAt: Date;

  @Column({ type: 'text', nullable: true })
  invitationToken: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

