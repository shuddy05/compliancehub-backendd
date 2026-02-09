import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';
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
import { LearningBookmark } from '../database/entities/learning-bookmark.entity';
import { LearningFeedback } from '../database/entities/learning-feedback.entity';
import { FeatureFlag } from '../database/entities/feature-flag.entity';
import { CompanySettings } from '../database/entities/company-settings.entity';
import { PaymentTransaction } from '../database/entities/payment-transaction.entity';
import { TaxRelief } from '../database/entities/tax-relief.entity';
import { Reminder } from '../database/entities/reminder.entity';
import { ApiKey } from '../database/entities/api-key.entity';
import { EmailVerificationToken } from '../database/entities/email-verification-token.entity';
import { SupportTicket, TicketMessage } from '../modules/support/support.entity';

const isProduction = process.env.NODE_ENV === 'production';

export const databaseConfig = (): TypeOrmModuleOptions => 
  isProduction
    ? {
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'compliancehub_db',
        driver: require('mysql2') as any,
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
          LearningBookmark,
          LearningFeedback,
          FeatureFlag,
          CompanySettings,
          PaymentTransaction,
          TaxRelief,
          Reminder,
          ApiKey,
          EmailVerificationToken,
          SupportTicket,
          TicketMessage,
        ],
        synchronize: process.env.DB_SYNCHRONIZE === 'true' || process.env.SKIP_MIGRATION === 'true',
        logging: process.env.DB_LOGGING === 'true' ? ['error', 'warn', 'log'] : ['error'],
        migrations: ['src/database/migrations/*.ts'],
        migrationsRun: false,
        charset: 'utf8mb4',
        poolSize: 10,
        retryAttempts: 5,
        retryDelay: 3000,
        extra: {
          connectionLimit: 10,
          waitForConnections: true,
          queueLimit: 0,
          connectTimeout: 30000,
          acquireTimeout: 30000,
          timeout: 40000,
          enableKeepAlive: true,
          keepAliveInitialDelayMs: 0,
        },
      }
    : {
        type: 'better-sqlite3',
        database: path.join(process.cwd(), 'compliancehub.db'),
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
          LearningBookmark,
          LearningFeedback,
          FeatureFlag,
          CompanySettings,
          PaymentTransaction,
          TaxRelief,
          Reminder,
          ApiKey,
          EmailVerificationToken,
          SupportTicket,
          TicketMessage,
        ],
        synchronize: true,
        logging: false,
      };
