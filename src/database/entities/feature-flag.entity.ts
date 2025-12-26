import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('feature_flags')
export class FeatureFlag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  featureKey: string;

  @Column({ type: 'varchar', length: 255 })
  featureName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-json' })
  enabledForTiers: string[]; // ['pro', 'enterprise']

  @Column({ type: 'boolean', default: false })
  isBeta: boolean;

  @Column({ type: 'simple-json', nullable: true })
  betaAccessCompanies: string[]; // [company_id1, company_id2]

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'integer', default: 100 })
  rolloutPercentage: number; // For gradual rollout

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
