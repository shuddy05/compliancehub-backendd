import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CompanyUser } from './company-user.entity';
import { Document } from './document.entity';
import { Notification } from './notification.entity';
import { AuditLog } from './audit-log.entity';
import { LearningProgress } from './learning-progress.entity';
import { TaxRelief } from './tax-relief.entity';
import { ApiKey } from './api-key.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName: string;

  @Column({ type: 'text', nullable: true })
  avatarUrl: string;

  // Authentication
  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'boolean', default: false })
  phoneVerified: boolean;

  @Column({ type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  @Column({ type: 'text', nullable: true })
  totpSecret: string | null;

  @Column({ type: 'text', nullable: true })
  totpTempSecret: string | null;

  @Column({ type: 'datetime', nullable: true })
  lastLogin: Date;

  // Preferences
  @Column({ type: 'varchar', length: 10, default: 'en' })
  preferredLanguage: string;

  @Column({ type: 'boolean', default: false })
  darkModeEnabled: boolean;

  @Column({ type: 'simple-json', nullable: true })
  notificationPreferences: { email: boolean; sms: boolean; whatsapp: boolean };

  // Onboarding
  @Column({ type: 'boolean', default: false })
  onboardingCompleted: boolean;

  @Column({ type: 'integer', default: 1 })
  onboardingStep: number;

  @Column({ type: 'simple-json', nullable: true })
  coachMarksSeen: string[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => CompanyUser, (cu) => cu.user, { cascade: true })
  companyUsers: CompanyUser[];

  @OneToMany(() => Document, (d) => d.uploadedBy)
  documents: Document[];

  @OneToMany(() => Notification, (n) => n.user)
  notifications: Notification[];

  @OneToMany(() => AuditLog, (al) => al.user)
  auditLogs: AuditLog[];

  @OneToMany(() => LearningProgress, (lp) => lp.user, { cascade: true })
  learningProgress: LearningProgress[];

  @OneToMany(() => TaxRelief, (tr) => tr.verifiedBy)
  verifiedTaxReliefs: TaxRelief[];

  @OneToMany(() => ApiKey, (ak) => ak.createdBy)
  apiKeys: ApiKey[];
}

