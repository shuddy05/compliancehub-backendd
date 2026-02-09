import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { User } from './user.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (c) => c.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'varchar', length: 100 })
  documentType: string; // CAC_CERTIFICATE, TIN_CERT, PAYMENT_RECEIPT, PAYSLIP, etc.

  @Column({ type: 'varchar', length: 255 })
  documentName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text' })
  fileUrl: string;

  @Column({ type: 'bigint', nullable: true })
  fileSize: number; // bytes

  @Column({ type: 'varchar', length: 50, nullable: true })
  fileType: string; // pdf, xlsx, jpg, png

  @Column({ type: 'varchar', length: 50, nullable: true })
  relatedEntityType: string; // compliance_filing, payroll_run, employee

  @Column({ type: 'uuid', nullable: true })
  relatedEntityId: string;

  @Column({ type: 'uuid', nullable: true })
  uploadedById: string;

  @ManyToOne(() => User, (u) => u.documents)
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @CreateDateColumn()
  uploadedAt: Date;
}

