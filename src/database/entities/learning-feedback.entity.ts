import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { LearningContent } from './learning-content.entity';
import { Company } from './company.entity';

@Entity('learning_feedback')
@Unique(['userId', 'contentId'])
export class LearningFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  contentId: string;

  @Column({ type: 'uuid', nullable: true })
  companyId: string;

  @Column({ type: 'boolean' })
  helpful: boolean; // true = helpful, false = not helpful

  @Column({ type: 'text', nullable: true })
  comment: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => LearningContent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contentId' })
  content: LearningContent;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
