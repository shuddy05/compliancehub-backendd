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
import { User } from './user.entity';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (c) => c.apiKeys, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'varchar', length: 255 })
  keyName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  apiKey: string; // Hashed

  @Column({ type: 'varchar', length: 255, nullable: true })
  apiSecret: string; // Hashed

  @Column({ type: 'simple-json' })
  scopes: string[]; // ['payroll:read', 'payroll:write', 'compliance:read']

  @Column({ type: 'integer', default: 1000 })
  rateLimit: number; // Requests per month

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @Column({ type: 'integer', default: 0 })
  requestsThisMonth: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => User, (u) => u.apiKeys)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
