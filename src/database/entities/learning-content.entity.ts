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
import { User } from './user.entity';
import { LearningProgress } from './learning-progress.entity';
import { LearningBookmark } from './learning-bookmark.entity';
import { LearningFeedback } from './learning-feedback.entity';

@Entity('learning_content')
export class LearningContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 50 })
  contentType: string; // article, video, checklist, faq

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string; // tax_basics, payroll_101, pension_guide

  @Column({ type: 'text', nullable: true })
  body: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  duration: string; // e.g., "12 min"

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnail: string; // path to thumbnail image

  @Column({ type: 'text', nullable: true })
  videoUrl: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  difficultyLevel: string; // beginner, intermediate, advanced

  @Column({ type: 'integer', nullable: true })
  estimatedReadTime: number; // minutes

  @Column({ type: 'simple-json', nullable: true })
  tags: string[];

  @Column({ type: 'integer', default: 0 })
  viewCount: number;

  @Column({ type: 'integer', default: 0 })
  helpfulCount: number;

  @Column({ type: 'boolean', default: false })
  isPublished: boolean;

  @Column({ type: 'boolean', default: false })
  featured: boolean;

  @Column({ type: 'datetime', nullable: true })
  publishedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => LearningProgress, (lp) => lp.content, { cascade: true })
  learningProgress: LearningProgress[];

  @OneToMany(() => LearningBookmark, (bookmark) => bookmark.content, { cascade: true })
  bookmarks: LearningBookmark[];

  @OneToMany(() => LearningFeedback, (feedback) => feedback.content, { cascade: true })
  feedbacks: LearningFeedback[];
}

