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
import { Subscription } from './subscription.entity';

@Entity('payment_transactions')
export class PaymentTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (c) => c.paymentTransactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'uuid', nullable: true })
  subscriptionId: string;

  @ManyToOne(() => Subscription, (s) => s.paymentTransactions)
  @JoinColumn({ name: 'subscriptionId' })
  subscription: Subscription;

  @Column({ type: 'varchar', length: 50 })
  transactionType: string; // subscription, upgrade, renewal

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'NGN' })
  currency: string;

  @Column({ type: 'varchar', length: 50 })
  provider: string; // paystack, flutterwave

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  providerReference: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentMethod: string; // card, bank_transfer, ussd

  @Column({ type: 'varchar', length: 50 })
  status: string; // pending, successful, failed, refunded

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp' })
  initiatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;
}
