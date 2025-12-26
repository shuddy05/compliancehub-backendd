import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';
import { LearningContent } from './learning-content.entity';

@Entity('learning_progress')
export class LearningProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (u) => u.learningProgress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'uuid' })
  contentId: string;

  @ManyToOne(() => LearningContent, (lc) => lc.learningProgress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contentId' })
  content: LearningContent;

  @Column({ type: 'varchar', length: 50, default: 'started' })
  status: string; // started, in_progress, completed

  @Column({ type: 'integer', default: 0 })
  progressPercentage: number;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'integer', default: 0 })
  timeSpent: number; // seconds

  @Column({ type: 'timestamp' })
  lastViewedAt: Date;

  @Column({ type: 'boolean', default: false })
  markedHelpful: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
