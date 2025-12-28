import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Company } from '../database/entities/company.entity';
import { CompanyUser } from '../database/entities/company-user.entity';
import { Employee } from '../database/entities/employee.entity';
import { PayrollRun } from '../database/entities/payroll-run.entity';
import { PayrollItem } from '../database/entities/payroll-item.entity';
import { ComplianceObligation } from '../database/entities/compliance-obligation.entity';
import { ComplianceFiling } from '../database/entities/compliance-filing.entity';
import { Document } from '../database/entities/document.entity';
import { Notification } from '../database/entities/notification.entity';
import { Subscription } from '../database/entities/subscription.entity';
import { AuditLog } from '../database/entities/audit-log.entity';
import { LearningContent } from '../database/entities/learning-content.entity';
import { LearningProgress } from '../database/entities/learning-progress.entity';
import { FeatureFlag } from '../database/entities/feature-flag.entity';
import { CompanySettings } from '../database/entities/company-settings.entity';
import { PaymentTransaction } from '../database/entities/payment-transaction.entity';
import { TaxRelief } from '../database/entities/tax-relief.entity';
import { Reminder } from '../database/entities/reminder.entity';
import { ApiKey } from '../database/entities/api-key.entity';

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'compliancehub_db',
  entities: [
    User,
    Company,
    CompanyUser,
    Employee,
    PayrollRun,
    PayrollItem,
    ComplianceObligation,
    ComplianceFiling,
    Document,
    Notification,
    Subscription,
    AuditLog,
    LearningContent,
    LearningProgress,
    FeatureFlag,
    CompanySettings,
    PaymentTransaction,
    TaxRelief,
    Reminder,
    ApiKey,
  ],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true' ? ['error', 'warn', 'log'] : ['error'],
  migrations: ['src/database/migrations/*.ts'],
  migrationsRun: false,
  charset: 'utf8mb4',
  // Connection pooling and reliability settings
  poolSize: 10,
  retryAttempts: 5,
  retryDelay: 3000, // 3 seconds between retries
  extra: {
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
  },
});
