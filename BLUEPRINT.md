Nigerian SME Compliance SaaS App - Complete Product Blueprint
1. App Concept & Problem Statement
Core Idea
ComplianceHub is a comprehensive compliance automation platform designed specifically for Nigerian SMEs, automating tax filings (PAYE, VAT, WHT), payroll processing, pension remittances, and regulatory submissions to FIRS, NSITF, ITF, and state agencies.
Target Users
Primary Users:
Small to Medium Enterprises (5-250 employees)
Startups and tech companies
Retail and service businesses
Manufacturing SMEs
Professional services firms
Secondary Users:
Accountants and bookkeepers managing multiple clients
HR managers handling payroll
Business owners seeking compliance peace of mind
Pain Points
Complexity Overload: Nigerian tax and compliance regulations are intricate, with multiple agencies (FIRS, Pension Commission, NSITF, ITF, state tax boards)
Manual Processes: Most SMEs use Excel spreadsheets, leading to errors and missed deadlines
Penalty Risk: Late filings result in hefty penalties (10% of tax due + interest)
Time Drain: Business owners spend 15-20 hours monthly on compliance tasks
Knowledge Gap: Most SMEs don't know what's due when, or how to calculate correctly
Agency Fragmentation: Different portals, formats, and requirements for each agency
Cost Burden: Hiring accountants costs ₦150,000-500,000/month
Audit Anxiety: No organized records when tax audits occur
Value Proposition
For SMEs:
Save 90% of compliance time - Automated calculations, filings, and reminders
Zero penalties - Never miss a deadline with intelligent notifications
Cost reduction - 70% cheaper than hiring full-time accountant
Peace of mind - Always audit-ready with complete documentation
Growth enabler - Focus on business, not paperwork
For Accountants:
Client scalability - Manage 5x more clients efficiently
Professional image - Modern tools vs Excel spreadsheets
Revenue growth - Upsell compliance services
Error reduction - Automated calculations prevent mistakes
Why This Is Critical for Nigerian SMEs
Regulatory Tightening: FIRS digitization means more enforcement, higher penalties
Bank Integration: Banks now report transactions to FIRS automatically
TIN Mandate: No TIN, no business account, no contracts
Investor Requirements: Compliance records mandatory for fundraising
Growth Barrier: Non-compliance prevents government contracts, partnerships
Digital Economy: As Nigeria digitizes, compliance becomes non-negotiable

2. Subscription & Monetization Model
Tier Structure
Free Tier - "Starter"
Price: ₦0/month
 Target: Solo entrepreneurs, micro businesses (1-5 employees)
Features:
Up to 5 employees
Basic PAYE calculation (manual filing)
Payroll processing (1 month history)
Compliance calendar view
Email reminders (3 days before deadline)
Document storage (100MB)
Learning resources access
WhatsApp support (48-hour response)
ComplianceHub branding on exports
Limitations:
No automatic filing
No pension/NSITF/ITF integration
No multi-user access
No API access
No dedicated support
Pro Tier - "Growth"
Price: ₦15,000/month or ₦150,000/year (save 2 months)
 Target: Growing SMEs (6-50 employees)
Features:
Up to 50 employees
Automated PAYE, WHT calculations + filing
Pension remittance automation
NSITF & ITF compliance
VAT filing assistance
Unlimited payroll history
Multi-user access (up to 3 users)
Advanced reminders (email, SMS, WhatsApp)
Document storage (5GB)
Audit trail & reports
Priority support (12-hour response)
White-label payslips
API access (1,000 calls/month)
Accountant collaboration portal
Dark mode
Limitations:
No dedicated account manager
No custom integrations
Standard SLA
Enterprise Tier - "Scale"
Price: Custom (starting at ₦75,000/month)
 Target: Established companies (51+ employees), agencies managing multiple clients
Features:
Unlimited employees
Everything in Pro +
Multi-company management (for accountants/agencies)
Custom compliance workflows
Dedicated account manager
Advanced analytics & forecasting
Custom integrations (accounting software, banks)
Onboarding assistance
Quarterly compliance review
Audit support
API access (unlimited)
Document storage (unlimited)
SSO/SAML authentication
Custom user roles
Priority phone support (2-hour response)
Custom reporting
Training sessions
99.9% uptime SLA
Subscription Logic
SUBSCRIPTION_LIFECYCLE {
  
  ON_USER_SIGNUP:
    - Assign tier = "FREE"
    - Set trial_end = null (free has no trial)
    - Set status = "active"
    - Enable FREE tier features
    - Send welcome email with onboarding checklist
  
  ON_UPGRADE_TO_PRO:
    - If first_time_pro:
        - trial_end = current_date + 14 days
        - status = "trial"
        - Enable all PRO features
        - Set reminder: trial_end - 3 days
    - Else:
        - Charge immediately via Paystack/Flutterwave
        - If payment_successful:
            - status = "active"
            - billing_period_start = current_date
            - billing_period_end = current_date + 30 days (monthly)
            - next_billing_date = billing_period_end
            - Enable PRO features
        - Else:
            - status = "payment_failed"
            - Keep on FREE tier
            - Send payment retry link
  
  ON_TRIAL_END:
    - If no payment_method_added:
        - status = "trial_expired"
        - Downgrade to FREE tier
        - Disable PRO features
        - Send "trial ended" email with upgrade CTA
    - Else:
        - Attempt first charge
        - Follow ON_UPGRADE_TO_PRO logic
  
  ON_BILLING_DATE:
    - Attempt recurring charge
    - If payment_successful:
        - Extend billing_period_end + 30 days
        - Set next_billing_date
        - Send receipt
        - status = "active"
    - Else:
        - payment_retry_count += 1
        - If retry_count <= 3:
            - Schedule retry in 3 days
            - Send payment failure email
            - status = "payment_failed"
        - Else:
            - status = "suspended"
            - grace_period_end = current_date + 7 days
            - Disable PRO features (read-only access)
            - Send urgent payment email
  
  DURING_GRACE_PERIOD:
    - User has read-only access to data
    - Cannot create new payroll/filings
    - Can view historical data
    - Can update payment method
    - If payment_received:
        - Reactivate immediately
        - Clear grace period
    - If grace_period_end reached:
        - status = "cancelled"
        - Downgrade to FREE tier
        - Disable PRO features completely
        - Archive data (keep for 90 days)
  
  ON_CANCELLATION_REQUEST:
    - status = "pending_cancellation"
    - cancellation_date = billing_period_end
    - Continue service until period end
    - Send "sorry to see you go" email
    - Optional: Offer discount to stay
    - On cancellation_date:
        - status = "cancelled"
        - Downgrade to FREE tier
        - Send exit survey
}

Grace Period Policy
Payment Failed Scenarios:
Days 1-3: Payment retry automatically, status = "payment_failed", full access continues
Days 4-7: Final retry, urgent email/SMS notifications, status = "suspended", read-only mode
Day 8+: Downgrade to FREE tier, status = "cancelled"
Reactivation:
User can reactivate anytime during grace period
Upon successful payment, immediate full access restoration
No data loss during 90-day archive period
Payment Integration Approach
We DO NOT hold funds. We act as a facilitator only.
PAYMENT_FLOW {
  
  SETUP:
    - Integrate Paystack & Flutterwave (dual provider redundancy)
    - User payment method stored as token (not card details)
    - PCI-DSS compliance through provider
  
  SUBSCRIPTION_CHARGE:
    - When billing_date arrives:
        1. Create charge request via Paystack API
        2. Paystack charges customer card directly
        3. Funds go to OUR Paystack business account
        4. Webhook confirmation received
        5. Update subscription status in our DB
        6. Send receipt to customer
  
  REFUND_FLOW:
    - If refund needed (rare):
        1. Admin initiates refund in dashboard
        2. API call to Paystack refund endpoint
        3. Funds returned to customer from our Paystack balance
        4. Update subscription status
        5. Notify customer
  
  COMPLIANCE_PAYMENTS (e.g., PAYE to FIRS):
    - We NEVER touch these funds
    - Two approaches:
    
    APPROACH A - Information Only (Recommended):
    - We calculate amounts due
    - Generate payment advice/schedule
    - User makes payment directly to FIRS via:
        * Remita
        * Bank transfer
        * FIRS portal
    - User uploads payment receipt
    - We track payment status
    
    APPROACH B - Payment Link (Future):
    - We generate payment link to FIRS directly
    - Link opens FIRS payment portal or Remita
    - User completes payment there
    - Webhook confirmation from FIRS/Remita
    - We update records (no funds touch our system)
}

Why This Approach:
Regulatory Safety: Avoid Central Bank of Nigeria (CBN) licensing requirements
Trust: Users pay government directly, we don't hold tax money
Liability: No risk of managing other people's tax funds
Simplicity: Focus on software, not financial services
Feature Access Matrix
Feature
Free
Pro
Enterprise
Employees
5
50
Unlimited
PAYE Calculation
✓
✓
✓
PAYE Auto-filing
✗
✓
✓
Pension Remittance
✗
✓
✓
NSITF/ITF
✗
✓
✓
VAT Assistance
✗
✓
✓
WHT Tracking
✗
✓
✓
Multi-user Access
1
3
Unlimited
Document Storage
100MB
5GB
Unlimited
Payroll History
1 month
Unlimited
Unlimited
API Access
✗
1K/mo
Unlimited
Reminders
Email
All channels
All + SMS
Support
48hr
12hr
2hr
White-label
✗
✓
✓
Multi-company
✗
✗
✓
Dedicated Manager
✗
✗
✓
Custom Integrations
✗
✗
✓
Audit Support
✗
✗
✓

Handling Expired/Non-Paying Users
NON_PAYMENT_HANDLING {
  
  FEATURE_DOWNGRADE:
    - Move from PRO → FREE tier
    - Disable pro_features immediately:
        * Auto-filing stopped
        * Extra users locked out
        * API access revoked
        * Document storage capped (new uploads blocked)
        * Advanced reminders stopped
    
  DATA_RETENTION:
    - Historical data remains accessible (read-only)
    - Payroll records: Last 1 month visible on FREE
    - Documents: Can view but not upload new
    - Reports: Basic only
    
  RE-UPGRADE_INCENTIVE:
    - Show upgrade prompt on every login
    - "Unlock 12 months of history - Upgrade now"
    - Offer 20% discount for immediate reactivation
    - Countdown timer: "Upgrade within 7 days for discount"
    
  DATA_DELETION_POLICY:
    - After 90 days of cancellation:
        * Send final warning email
        * "Download your data before deletion"
        * Provide data export option
    - After 120 days:
        * Permanently delete PRO-tier data
        * Keep only last 1 month (FREE tier level)
        * Anonymize for analytics
}


3. Database Schema & Tables
Multi-Tenant Architecture
Approach: Shared database, tenant-isolated via company_id foreign key on all tables.
TENANT_ISOLATION_STRATEGY:
- Single database, multiple companies (tenants)
- Every query filtered by company_id
- Row-level security enforced in application layer
- Future: Migrate large Enterprise clients to separate schemas

Core Tables
1. companies
Master tenant table.
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  tin VARCHAR(20) UNIQUE, -- Tax Identification Number
  rc_number VARCHAR(20), -- Corporate Affairs Commission number
  industry VARCHAR(100),
  employee_count INTEGER DEFAULT 0,
  address TEXT,
  state VARCHAR(50),
  lga VARCHAR(100), -- Local Government Area
  phone VARCHAR(20),
  email VARCHAR(255),
  logo_url TEXT,
  
  -- Subscription
  subscription_tier VARCHAR(20) DEFAULT 'free', -- free, pro, enterprise
  subscription_status VARCHAR(20) DEFAULT 'active', -- active, trial, suspended, cancelled
  trial_end TIMESTAMP,
  billing_period_start TIMESTAMP,
  billing_period_end TIMESTAMP,
  next_billing_date TIMESTAMP,
  payment_retry_count INTEGER DEFAULT 0,
  grace_period_end TIMESTAMP,
  
  -- Settings
  fiscal_year_end DATE DEFAULT '12-31',
  default_currency VARCHAR(3) DEFAULT 'NGN',
  timezone VARCHAR(50) DEFAULT 'Africa/Lagos',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT TRUE,
  
  INDEX idx_tin (tin),
  INDEX idx_subscription_status (subscription_status),
  INDEX idx_next_billing_date (next_billing_date)
);

2. users
Platform users (multi-role, multi-company support).
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash TEXT NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  
  -- Authentication
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP,
  
  -- Preferences
  preferred_language VARCHAR(10) DEFAULT 'en',
  dark_mode_enabled BOOLEAN DEFAULT FALSE,
  notification_preferences JSONB, -- {email: true, sms: false, whatsapp: true}
  
  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 1,
  coach_marks_seen JSONB DEFAULT '[]', -- ['payroll_intro', 'compliance_calendar']
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  
  INDEX idx_email (email),
  INDEX idx_phone (phone)
);

3. company_users
Junction table for multi-company access with roles.
CREATE TABLE company_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- super_admin, company_admin, accountant, staff, read_only
  
  -- Permissions (JSONB for flexible RBAC)
  permissions JSONB, -- {payroll: {create: true, edit: true}, compliance: {view: true}}
  
  -- Access control
  is_primary_company BOOLEAN DEFAULT FALSE,
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMP,
  accepted_at TIMESTAMP,
  invitation_token TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  
  UNIQUE(company_id, user_id),
  INDEX idx_company_user (company_id, user_id),
  INDEX idx_role (role)
);

4. employees
Company employees for payroll and compliance.
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Personal Info
  employee_code VARCHAR(50),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10), -- male, female, other
  marital_status VARCHAR(20),
  
  -- Employment
  department VARCHAR(100),
  job_title VARCHAR(100),
  employment_type VARCHAR(50), -- full_time, part_time, contract, intern
  employment_start_date DATE NOT NULL,
  employment_end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Salary
  gross_salary DECIMAL(15,2) NOT NULL,
  salary_frequency VARCHAR(20) DEFAULT 'monthly', -- monthly, weekly, daily
  payment_method VARCHAR(50) DEFAULT 'bank_transfer',
  
  -- Bank Details
  bank_name VARCHAR(100),
  account_number VARCHAR(20),
  account_name VARCHAR(255),
  
  -- Tax & Pension
  tax_id VARCHAR(50), -- Personal TIN
  pension_pin VARCHAR(50),
  pension_provider VARCHAR(100),
  pension_percentage DECIMAL(5,2) DEFAULT 8.00, -- Employee contribution (8%)
  nhf_applicable BOOLEAN DEFAULT TRUE, -- National Housing Fund (2.5%)
  
  -- Allowances & Deductions (JSONB for flexibility)
  allowances JSONB, -- [{type: 'housing', amount: 50000, taxable: true}, ...]
  fixed_deductions JSONB, -- [{type: 'loan', amount: 10000, description: 'Staff loan'}]
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  UNIQUE(company_id, employee_code),
  INDEX idx_company_employees (company_id, is_active),
  INDEX idx_tax_id (tax_id)
);

5. payroll_runs
Monthly payroll processing records.
CREATE TABLE payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Period
  payroll_period VARCHAR(7) NOT NULL, -- YYYY-MM format (e.g., '2025-01')
  payroll_start_date DATE NOT NULL,
  payroll_end_date DATE NOT NULL,
  payment_date DATE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- draft, processing, approved, paid, cancelled
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  
  -- Totals
  total_gross DECIMAL(15,2) DEFAULT 0,
  total_deductions DECIMAL(15,2) DEFAULT 0,
  total_net DECIMAL(15,2) DEFAULT 0,
  total_paye DECIMAL(15,2) DEFAULT 0,
  total_pension_employee DECIMAL(15,2) DEFAULT 0,
  total_pension_employer DECIMAL(15,2) DEFAULT 0,
  total_nhf DECIMAL(15,2) DEFAULT 0,
  total_nsitf DECIMAL(15,2) DEFAULT 0,
  total_itf DECIMAL(15,2) DEFAULT 0,
  
  employee_count INTEGER DEFAULT 0,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  UNIQUE(company_id, payroll_period),
  INDEX idx_company_period (company_id, payroll_period),
  INDEX idx_status (status)
);

6. payroll_items
Individual employee payroll details per run.
CREATE TABLE payroll_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Earnings
  basic_salary DECIMAL(15,2) NOT NULL,
  allowances JSONB, -- [{type: 'housing', amount: 50000}, ...]
  gross_salary DECIMAL(15,2) NOT NULL,
  
  -- Deductions
  paye DECIMAL(15,2) DEFAULT 0,
  pension_employee DECIMAL(15,2) DEFAULT 0, -- 8%
  pension_employer DECIMAL(15,2) DEFAULT 0, -- 10%
  nhf DECIMAL(15,2) DEFAULT 0, -- 2.5%
  other_deductions JSONB, -- [{type: 'loan', amount: 10000}, ...]
  total_deductions DECIMAL(15,2) DEFAULT 0,
  
  -- Net Pay
  net_salary DECIMAL(15,2) NOT NULL,
  
  -- Payment
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed
  payment_reference VARCHAR(100),
  payment_date TIMESTAMP,
  
  -- Employer Costs (for compliance)
  nsitf_contribution DECIMAL(15,2) DEFAULT 0, -- 1% of payroll
  itf_contribution DECIMAL(15,2) DEFAULT 0, -- 1% of payroll
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(payroll_run_id, employee_id),
  INDEX idx_payroll_employee (payroll_run_id, employee_id),
  INDEX idx_payment_status (payment_status)
);

7. compliance_obligations
Master list of compliance requirements.
CREATE TABLE compliance_obligations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Obligation Details
  obligation_type VARCHAR(50) NOT NULL, -- PAYE, VAT, WHT, PENSION, NSITF, ITF, CAC_ANNUAL_RETURN
  obligation_name VARCHAR(255) NOT NULL,
  description TEXT,
  agency VARCHAR(100), -- FIRS, Pension Commission, NSITF, ITF, CAC, State Tax
  
  -- Frequency
  frequency VARCHAR(50) NOT NULL, -- monthly, quarterly, annually, one_time
  due_day INTEGER, -- Day of month (e.g., 10 for monthly PAYE)
  due_month INTEGER, -- For annual obligations (e.g., 3 for March)
  
  -- Applicability
  is_active BOOLEAN DEFAULT TRUE,
  applies_if JSONB, -- {employee_count: {min: 1}, annual_revenue: {min: 25000000}} for conditional
  
  -- Feature Flag
  enabled_for_tier VARCHAR(50), -- free, pro, enterprise
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_company_obligations (company_id, is_active),
  INDEX idx_obligation_type (obligation_type)
);

8. compliance_filings
Actual compliance filing records.
CREATE TABLE compliance_filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  obligation_id UUID NOT NULL REFERENCES compliance_obligations(id),
  
  -- Period
  filing_period VARCHAR(10) NOT NULL, -- YYYY-MM or YYYY-QX or YYYY
  filing_year INTEGER NOT NULL,
  filing_month INTEGER, -- NULL for annual
  filing_quarter INTEGER, -- NULL for monthly
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, calculated, filed, paid, overdue, exempted
  due_date DATE NOT NULL,
  filed_date DATE,
  payment_date DATE,
  
  -- Amounts
  calculated_amount DECIMAL(15,2),
  paid_amount DECIMAL(15,2),
  penalty_amount DECIMAL(15,2) DEFAULT 0,
  
  -- Filing Details
  filing_reference VARCHAR(100), -- FIRS/Agency confirmation number
  payment_reference VARCHAR(100), -- Bank/Remita reference
  filing_method VARCHAR(50), -- manual, automated, accountant
  
  -- Documents
  filing_document_url TEXT,
  payment_receipt_url TEXT,
  supporting_documents JSONB, -- [{name: 'schedule.xlsx', url: '...'}]
  
  -- Reminders
  reminder_sent_at TIMESTAMP,
  overdue_notice_sent_at TIMESTAMP,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  UNIQUE(company_id, obligation_id, filing_period),
  INDEX idx_company_filings (company_id, due_date),
  INDEX idx_status (status, due_date)
);

9. documents
File storage for compliance documents.
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Document Info
  document_type VARCHAR(100) NOT NULL, -- CAC_CERTIFICATE, TIN_CERT, PAYMENT_RECEIPT, PAYSLIP, etc.
  document_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- File
  file_url TEXT NOT NULL,
  file_size BIGINT, -- bytes
  file_type VARCHAR(50), -- pdf, xlsx, jpg, png
  
  -- Relations
  related_entity_type VARCHAR(50), -- compliance_filing, payroll_run, employee
  related_entity_id UUID,
  
  -- Metadata
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE,
  
  INDEX idx_company_documents (company_id, document_type),
  INDEX idx_related_entity (related_entity_type, related_entity_id)
);

10. notifications
System-generated notifications.
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id), -- NULL for company-wide notifications
  
  -- Notification Details
  notification_type VARCHAR(50) NOT NULL, -- deadline_reminder, payment_overdue, payroll_ready, subscription_expiry
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT, -- Deep link to relevant screen
  
  -- Delivery
  channels JSONB, -- {email: true, sms: false, push: true, whatsapp: false}
  email_sent_at TIMESTAMP,
  sms_sent_at TIMESTAMP,
  push_sent_at TIMESTAMP,
  whatsapp_sent_at TIMESTAMP,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  is_archived BOOLEAN DEFAULT FALSE,
  
  -- Priority
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, critical
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_notifications (user_id, is_read, created_at),
  INDEX idx_company_notifications (company_id, created_at)
);

11. subscriptions
Detailed subscription and billing history.
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Plan
  plan_name VARCHAR(50) NOT NULL, -- free, pro, enterprise
  billing_cycle VARCHAR(20), -- monthly, annually
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'NGN',
  
  -- Period
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  
  -- Status
  status VARCHAR(50) NOT NULL, -- active, trial, cancelled, expired
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,
  
  -- Payment
  payment_provider VARCHAR(50), -- paystack, flutterwave
  payment_reference VARCHAR(255),
  paid_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_company_subscriptions (company_id, status)
);

12. audit_logs
Complete audit trail for compliance.
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  
  -- Action
  action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE, VIEW, APPROVE, EXPORT
  entity_type VARCHAR(100) NOT NULL, -- payroll_run, employee, compliance_filing
  entity_id UUID,
  
  -- Details
  description TEXT NOT NULL,
  changes JSONB, -- {before: {...}, after: {...}}
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Metadata
  timestamp TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_company_audits (company_id, timestamp),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_user_actions (user_id, timestamp)
);

13. learning_content
Educational resources for users.
CREATE TABLE learning_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content_type VARCHAR(50) NOT NULL, -- article, video, checklist, faq
  category VARCHAR(100), -- tax_basics, payroll_101, pension_guide
  body TEXT,
  video_url TEXT,
  
  -- Metadata
  difficulty_level VARCHAR(20), -- beginner, intermediate, advanced
  estimated_read_time INTEGER, -- minutes
  tags JSONB, -- ['PAYE', 'SME', 'compliance']
  
  -- Engagement
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  
  -- Publishing
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  author_id UUID REFERENCES users(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_category (category, is_published),
  INDEX idx_slug (slug)
);

14. learning_progress
Track user engagement with learning content.

```sql
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES learning_content(id) ON DELETE CASCADE,
  
  -- Progress
  status VARCHAR(50) DEFAULT 'started', -- started, in_progress, completed
  progress_percentage INTEGER DEFAULT 0,
  completed_at TIMESTAMP,
  
  -- Engagement
  time_spent INTEGER DEFAULT 0, -- seconds
  last_viewed_at TIMESTAMP DEFAULT NOW(),
  marked_helpful BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, content_id),
  INDEX idx_user_progress (user_id, status)
);

15. feature_flags
Feature access control per company/tier.
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Feature
  feature_key VARCHAR(100) UNIQUE NOT NULL, -- auto_paye_filing, pension_integration, multi_company
  feature_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Access Control
  enabled_for_tiers JSONB NOT NULL, -- ['pro', 'enterprise']
  is_beta BOOLEAN DEFAULT FALSE,
  beta_access_companies JSONB, -- [company_id1, company_id2] for beta testing
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  rollout_percentage INTEGER DEFAULT 100, -- For gradual rollout
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_feature_key (feature_key)
);

16. company_settings
Extended company configuration.
CREATE TABLE company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID UNIQUE NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Payroll Settings
  payroll_day INTEGER DEFAULT 25, -- Day of month to run payroll
  payroll_approval_required BOOLEAN DEFAULT TRUE,
  auto_generate_payslips BOOLEAN DEFAULT TRUE,
  
  -- Compliance Settings
  auto_file_paye BOOLEAN DEFAULT FALSE, -- Only for PRO+
  auto_calculate_pension BOOLEAN DEFAULT TRUE,
  compliance_officer_email VARCHAR(255),
  
  -- Notification Preferences
  deadline_reminder_days JSONB DEFAULT '[7, 3, 1]', -- Days before deadline
  send_sms_reminders BOOLEAN DEFAULT FALSE,
  send_whatsapp_reminders BOOLEAN DEFAULT TRUE,
  
  -- Branding
  primary_color VARCHAR(7) DEFAULT '#10B981', -- Green
  logo_url TEXT,
  company_letterhead_url TEXT,
  
  -- Integration
  accounting_software VARCHAR(50), -- quickbooks, sage, xero
  accounting_integration_active BOOLEAN DEFAULT FALSE,
  bank_integration_active BOOLEAN DEFAULT FALSE,
  
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_company (company_id)
);

17. payment_transactions
Track all payment attempts and subscriptions.
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  
  -- Transaction Details
  transaction_type VARCHAR(50) NOT NULL, -- subscription, upgrade, renewal
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  
  -- Payment Provider
  provider VARCHAR(50) NOT NULL, -- paystack, flutterwave
  provider_reference VARCHAR(255) UNIQUE,
  payment_method VARCHAR(50), -- card, bank_transfer, ussd
  
  -- Status
  status VARCHAR(50) NOT NULL, -- pending, successful, failed, refunded
  failure_reason TEXT,
  
  -- Metadata
  metadata JSONB, -- Provider-specific data
  initiated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  INDEX idx_company_transactions (company_id, status),
  INDEX idx_provider_reference (provider_reference)
);

18. tax_reliefs
Track employee tax relief claims.
CREATE TABLE tax_reliefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Relief Type
  relief_type VARCHAR(100) NOT NULL, -- CRA (Consolidated Relief Allowance), NHF, NHIS, pension
  relief_name VARCHAR(255),
  
  -- Period
  tax_year INTEGER NOT NULL,
  
  -- Amount
  annual_relief_amount DECIMAL(15,2) NOT NULL,
  monthly_relief_amount DECIMAL(15,2), -- For payroll calculation
  
  -- Supporting Documents
  supporting_document_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_employee_reliefs (employee_id, tax_year),
  INDEX idx_company_reliefs (company_id, tax_year)
);

19. reminders
Scheduled reminders queue.
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Reminder Details
  reminder_type VARCHAR(100) NOT NULL, -- deadline, subscription_renewal, payroll_due
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Related Entity
  related_entity_type VARCHAR(50), -- compliance_filing, payroll_run, subscription
  related_entity_id UUID,
  
  -- Scheduling
  due_date DATE NOT NULL,
  remind_days_before INTEGER DEFAULT 3,
  scheduled_for TIMESTAMP NOT NULL,
  
  -- Delivery
  recipients JSONB, -- [user_id1, user_id2] or 'all_admins'
  channels JSONB, -- {email: true, sms: false, push: true}
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed, cancelled
  sent_at TIMESTAMP,
  error_message TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_scheduled_reminders (status, scheduled_for),
  INDEX idx_company_reminders (company_id, due_date)
);

20. api_keys
API access management for Enterprise clients.
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Key Details
  key_name VARCHAR(255) NOT NULL,
  api_key VARCHAR(255) UNIQUE NOT NULL, -- Hashed
  api_secret VARCHAR(255), -- Hashed
  
  -- Permissions
  scopes JSONB NOT NULL, -- ['payroll:read', 'payroll:write', 'compliance:read']
  rate_limit INTEGER DEFAULT 1000, -- Requests per month
  
  -- Usage
  last_used_at TIMESTAMP,
  requests_this_month INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  INDEX idx_company_keys (company_id, is_active),
  INDEX idx_api_key (api_key)
);

Database Relationships Summary
companies (1) ----< (many) company_users >---- (many) users
companies (1) ----< (many) employees
companies (1) ----< (many) payroll_runs
payroll_runs (1) ----< (many) payroll_items >---- (1) employees
companies (1) ----< (many) compliance_obligations
compliance_obligations (1) ----< (many) compliance_filings
companies (1) ----< (many) documents
companies (1) ----< (many) notifications
companies (1) ----< (many) subscriptions
companies (1) ----< (many) audit_logs
users (1) ----< (many) learning_progress >---- (1) learning_content
employees (1) ----< (many) tax_reliefs
companies (1) ----< (many) reminders
companies (1) ----< (many) api_keys

Indexing Strategy
Key Indexes for Performance:
Multi-tenant queries: Always index company_id + frequently filtered columns
Date-based queries: Index created_at, due_date, billing_period_end
Status lookups: Index status fields for workflows
Foreign keys: Automatically indexed for joins
Unique constraints: Email, TIN, employee_code, API keys
Data Migration Strategy
MIGRATION_PHASES {
  
  PHASE_1_CORE:
    - companies, users, company_users
    - Basic RBAC setup
    - Authentication flow
  
  PHASE_2_EMPLOYEES:
    - employees table
    - Initial data seeding (bulk import support)
  
  PHASE_3_PAYROLL:
    - payroll_runs, payroll_items
    - Calculation engine
  
  PHASE_4_COMPLIANCE:
    - compliance_obligations (seed Nigerian obligations)
    - compliance_filings
    - documents
  
  PHASE_5_SUBSCRIPTIONS:
    - subscriptions, payment_transactions
    - Billing integration
  
  PHASE_6_ENGAGEMENT:
    - notifications, reminders
    - learning_content, learning_progress
    - audit_logs
  
  PHASE_7_ADVANCED:
    - feature_flags
    - api_keys
    - tax_reliefs
}


4. User Types & Roles
Role Hierarchy
Super Admin (Anthropic/Platform)
    ↓
Company Admin (Business Owner)
    ↓
Accountant (Financial Manager)
    ↓
Staff (HR/Finance Staff)
    ↓
Read-Only (Auditor/Consultant)

Role Definitions
1. Super Admin (Platform Level)
Who: Platform administrators (internal team)
Permissions:
Access all companies (for support)
Manage feature flags
View system analytics
Override subscription limits (for demos/testing)
Manage learning content
Access audit logs across companies
Cannot modify company data (read-only for compliance)
Use Cases:
Customer support escalations
System monitoring
Feature rollouts
Content management
2. Company Admin (Tenant Level)
Who: Business owner, CEO, Managing Director
Permissions:
Full access to all company data
Manage company profile and settings
Invite/remove users
Assign roles
Approve payroll
Review and file compliance
Manage subscriptions and billing
Download all reports
Archive/delete data
API key management (Enterprise)
Use Cases:
Strategic oversight
Final approvals
Financial decisions
Compliance accountability
UI Indicators:
Crown icon next to name
"Owner" badge
Access to Settings > Billing
3. Accountant (Power User)
Who: In-house accountant, financial controller, CFO
Permissions:
Full access to payroll and compliance modules
Create/edit employees
Run payroll calculations
Prepare compliance filings
Upload documents
View all financial reports
Cannot manage users or subscriptions
Cannot delete company data
Use Cases:
Day-to-day compliance management
Payroll processing
Tax calculations
Report generation
UI Indicators:
Calculator icon
"Accountant" badge
Quick access to payroll/compliance
4. Staff (Limited User)
Who: HR officer, finance assistant, office manager
Permissions:
View employees (read-only)
View payroll history
Download payslips
View compliance calendar
Cannot edit financial data
Cannot approve payroll
Cannot file compliance
Use Cases:
Distribute payslips
Answer employee queries
Monitor deadlines
Generate basic reports
UI Indicators:
"Team" badge
Limited navigation menu
5. Read-Only (Observer)
Who: External auditor, consultant, investor
Permissions:
View-only access to all modules
Cannot create, edit, or delete
Cannot download sensitive documents (unless enabled)
Can export reports (if enabled by admin)
Use Cases:
External audits
Compliance verification
Due diligence reviews
UI Indicators:
Eye icon
"View Only" badge
No action buttons visible
Role-Based Access Control (RBAC) Matrix
Feature/Action
Super Admin
Company Admin
Accountant
Staff
Read-Only
Company Management










Edit company profile
✓ (all)
✓
✗
✗
✗
Manage subscription
✓
✓
✗
✗
✗
View billing history
✓
✓
✗
✗
✗
User Management










Invite users
✓
✓
✗
✗
✗
Assign roles
✓
✓
✗
✗
✗
Remove users
✓
✓
✗
✗
✗
Employee Management










Create employees
✓
✓
✓
✗
✗
Edit employees
✓
✓
✓
✗
✗
Delete employees
✓
✓
✗
✗
✗
View employees
✓
✓
✓
✓
✓
Payroll










Run payroll
✓
✓
✓
✗
✗
Edit payroll
✓
✓
✓
✗
✗
Approve payroll
✓
✓
✗
✗
✗
View payroll
✓
✓
✓
✓
✓
Download payslips
✓
✓
✓
✓
✓
Compliance










Calculate obligations
✓
✓
✓
✗
✗
File compliance
✓
✓
✓
✗
✗
Upload receipts
✓
✓
✓
✗
✗
View compliance
✓
✓
✓
✓
✓
Documents










Upload documents
✓
✓
✓
✗
✗
Download documents
✓
✓
✓
✓
Admin-controlled
Delete documents
✓
✓
✗
✗
✗
Reports










Generate reports
✓
✓
✓
✓
✓
Export data
✓
✓
✓
Admin-controlled
Admin-controlled
API Access










Manage API keys
✓
✓ (Enterprise)
✗
✗
✗
Use API
✓
✓
✓
✗
✗
System










View audit logs
✓
✓
✓
✗
✗
Manage feature flags
✓
✗
✗
✗
✗

Multi-Company Support
For Enterprise Tier (Accountants/Agencies):
MULTI_COMPANY_ACCESS {
  
  SETUP:
    - Accountant creates Enterprise account
    - Can add multiple client companies under one account
    - Each company = separate tenant with isolated data
  
  COMPANY_SWITCHING:
    - Dropdown in header: "Select Company"
    - Shows all companies user has access to
    - Switch maintains current page context
    - Last selected company remembered
  
  PERMISSIONS_PER_COMPANY:
    - User can have different roles per company
    - Example: Accountant in Company A, Staff in Company B
    - Stored in company_users.role per company
  
  DASHBOARD_VIEW:
    - "All Companies" view (Enterprise only)
    - Aggregated compliance deadlines
    - Cross-company reports
    - Bulk actions (e.g., file PAYE for all clients)
  
  BILLING:
    - One subscription covers all companies
    - Or per-company pricing (configurable)
    - Example: ₦50k/month for 5 companies, ₦8k/month per additional
}

Permission Enforcement
PERMISSION_CHECK_MIDDLEWARE {
  
  ON_EVERY_REQUEST:
    1. Extract user_id from JWT token
    2. Extract company_id from request (header or URL param)
    3. Query company_users table:
        - WHERE user_id = X AND company_id = Y
    4. Get user.role for this company
    5. Load role.permissions from RBAC config
    6. Check if requested action is allowed
    7. If NOT allowed:
        - Return 403 Forbidden
        - Log unauthorized attempt
    8. If allowed:
        - Proceed with request
        - Log action in audit_logs
  
  EXAMPLE:
    User requests: POST /api/payroll/runs
    
    Check:
    - Does user have "payroll:create" permission?
    - Is user role Accountant or Company Admin?
    - Is company subscription active?
    - Is company_id owned by this user?
    
    If all TRUE → Allow
    Otherwise → Deny with specific error message
}

Role Assignment Flow
INVITE_USER_TO_COMPANY {
  
  INITIATED_BY: Company Admin
  
  STEP_1_SEND_INVITE:
    - Admin enters: email, role (Accountant/Staff/Read-Only)
    - System checks: Is email already a user?
    - If YES:
        - Create company_users record with invited status
        - Send in-app notification
    - If NO:
        - Create company_users record with invitation_token
        - Send email invite with signup link
  
  STEP_2_ACCEPTANCE:
    - User clicks link
    - If new user: Complete signup flow
    - If existing user: Confirm join
    - company_users.accepted_at = NOW()
    - Send welcome email with role description
  
  STEP_3_ONBOARDING:
    - Show role-specific tutorial
    - Accountant: "Here's how to run payroll"
    - Staff: "View payslips and compliance calendar"
    - Enable coach marks for first login
}

Special Scenarios
Scenario 1: Accountant Managing Multiple Clients
Creates ONE user account
Gets added to 10 different companies (tenants)
Role = Accountant in all 10
Dashboard shows aggregated view
Can switch between companies
Single subscription (Enterprise tier)
Scenario 2: Employee Self-Service (Future)
Company enables "Employee Portal" feature
Employees get read-only access to:
Their own payslips
Tax certificates
Pension statements
Cannot see other employees' data
No access to company financials
Scenario 3: External Auditor
Company Admin invites with Read-Only role
Time-limited access (e.g., 30 days)
After expiry, access auto-revoked
Cannot download sensitive documents

Screen Modifications Required for Various User Types
1. Authentication & User Signup Flow
Update SignUp.tsx to include role selection (only for invites)
Create RoleSelection.tsx page for invited users to confirm their role
Add role info display after signup
2. Dashboard/Home Screen
Add user role badge (Crown for Admin, Calculator for Accountant, Team for Staff, Eye for Read-Only)
Display role-specific quick actions
Show "Switch Company" dropdown (visible for multi-company users)
Hide/show modules based on role
3. Settings/User Management Pages
Create UserManagement.tsx page (Admin/Company Admin only)
List all users
Invite new users with role selector
Edit user roles
Remove users
Create InviteUser.tsx modal/page
Create RoleManagementSettings.tsx
4. Navigation & Sidebar
Update ModuleLayout.tsx to show role-specific navigation
Hide payroll/compliance for Staff
Hide user management for non-admins
Hide billing/subscription for non-admins
Add user profile dropdown with role badge
5. Company Management
Update CompanySetup.tsx to show "Manage Subscription" link (Admin only)
Create SubscriptionManagement.tsx page
Create BillingHistory.tsx page
Add company switcher component
6. Payroll Pages
Add approval buttons (visible only for Company Admin/Accountant)
Hide edit/delete for Staff
Show read-only mode for Read-Only users
7. Compliance Pages
Hide filing buttons for Staff/Read-Only
Show audit log access (Admin/Accountant only)
Document upload restricted by role
8. New Pages to Create
UserManagement.tsx - Manage company users
SubscriptionManagement.tsx - Manage plans & billing
BillingHistory.tsx - View payment history
AuditLogs.tsx - View system audit trail
CompanyProfile.tsx - Edit company details (Admin only)
ApiKeys.tsx - API key management (Admin only)
RoleGuide.tsx - Show role permissions/capabilities
9. UI Indicators & Badges
Add role badge component showing:
Crown icon → Super Admin
Briefcase icon → Company Admin
Calculator icon → Accountant
People icon → Staff
Eye icon → Read-Only
Show on user profile, team members list, payroll approvals
10. Permission Enforcement UI
Disable buttons based on permissions
Show "You don't have permission" tooltips on disabled actions
Hide entire sections (not just disable buttons) for restricted roles
Show appropriate error messages on 403 responses
11. Multi-Company Features
Add company switcher dropdown in header
Create CompanySelector.tsx component
Add "All Companies" aggregated view (Enterprise only)
Show multi-company dashboard
12. Role-Specific Onboarding
Show role-specific welcome screens
Display tutorials based on role
Quick start guides per role


5. Screens & UI/UX
Got it 👍 You want this styled, structured, and presentation-ready—clear enough for audits, investors, or dev handoff.
Here’s a clean, modern, well-hierarchized version of your content with visual rhythm and clarity.

Frontend Tech Stack & Application Architecture
Core Framework
React 18.3.1 — Component-based UI library
React Router DOM 6.30.1 — Client-side routing
TypeScript 5.8.3 — Static typing & safer codebase

Build & Development
Vite 5.4.19 — Lightning-fast dev server & bundler
@vitejs/plugin-react-swc 3.11.0 — High-performance React compilation

UI & Styling
Tailwind CSS 3.4.17 — Utility-first styling
Shadcn/UI (Radix UI) — Accessible component library (30+ components)
Tailwind Merge 2.6.0 — Conflict-free Tailwind class merging
Class Variance Authority 0.7.1 — Component variant management

Animation & Motion
Framer Motion 12.23.26 — Declarative animations
Canvas Confetti 1.9.4 — Celebration & feedback effects
Embla Carousel 8.6.0 — Touch-friendly carousels

Forms & Validation
React Hook Form 7.61.1 — Performant form handling
Zod 3.25.76 — Schema-based validation
@hookform/resolvers 3.10.0 — RHF + Zod integration

Data & State Management
3TanStack React Query 5.83.0 — Server state & caching
Next Themes 0.3.0 — Dark / Light mode handling

UI Components & Utilities
Lucide React 0.462.0 — Icon system
Sonner 1.7.4 — Toast notifications
React Day Picker 8.10.1 — Date selection
React Resizable Panels 2.1.9 — Flexible layouts
cmdk 1.1.1 — Command palette
Input OTP 1.4.2 — One-time password inputs

Data Visualization & Helpers
Recharts 2.15.4 — Charts & graphs
date-fns 3.6.0 — Date utilities
clsx 2.1.1 — Conditional class handling

Development Tooling
ESLint 9.32.0 — Code quality enforcement
PostCSS 8.5.6 — CSS transformations
Autoprefixer 10.4.21 — Cross-browser CSS support

Frontend Audit — Navigation Structure
Public Pages
Page
Route
Purpose
Landing
/
Homepage
About
/about
Company & team
Pricing
/pricing
Plans & features
Demo
/demo
Product walkthrough


Authentication & Onboarding
Page
Route
Welcome
/welcome
Sign Up
/signup
Sign In
/signin
Forgot Password
/forgot-password
Role Selection
/role-selection
Company Setup
/company-setup
Plan Selection
/plan-selection
Checkout
/checkout
Payment Success
/payment-success
Onboarding Complete
/onboarding-complete

Dashboard & Core App
Page
Route
Dashboard
/dashboard
Notifications
/notifications
Settings
/settings
Support Tickets
/support


Company Management
Page
Route
Company List
/companies
Add Company
/companies/add
Company Detail
/companies/:id


Employee Management
Page
Route
Employee List
/employees
Add Employee
/employees/add
Bulk Import
/employees/import
Employee Detail
/employees/:id
Edit Employee
/employees/:id/edit
Self-Service Portal
/self-service


Payroll Module
Page
Route
Payroll Dashboard
/payroll
Run Payroll
/payroll/run
Review Payroll
/payroll/run/review
Approval
/payroll/run/approval
Payment
/payroll/run/payment
Payslip
/payroll/:id/payslip
Reports
/payroll/reports


Compliance Module
Page
Route
Compliance Home
/compliance
Calendar
/compliance/calendar
Obligation Detail
/compliance/:type/:period
File Compliance
/compliance/file/:type/:period
Manual Filing
/compliance/manual/:type/:period
Upload Receipt
/compliance/upload-receipt/:type/:period
Reports
/compliance/reports
Penalties
/compliance/penalties
Tax Relief
/compliance/tax-relief


Document Management
Page
Route
Document Library
/documents
Upload Document
/documents/upload
Document Viewer
/documents/:id


Learning & Support
Page
Route
Learning Hub
/learning
Content Detail
/learning/:id
Help Centre
/help or /learning/help-centre
Contact Support
/support/contact


Subscription & Billing
Page
Route
Subscription Overview
/settings/subscription
Change Plan
/settings/subscription/plans
Payment Method
/settings/subscription/payment
Invoice Detail
/settings/subscription/invoices/:id


User Management
Page
Route
User Management
/user-management


Error Handling
Page
Route
Not Found
*


Key Features (Audit Checklist)
End-to-End Auth Flow
/welcome → signup → signin → role-selection → company-setup → plan-selection → checkout → payment-success → onboarding-complete
Consistent Public Navigation (Home, About, Pricing, Demo)
Dark / Light Mode via Next Themes
Mobile-First Responsive Design with Tailwind CSS
30+ Accessible Radix UI Components
Robust Form Validation (React Hook Form + Zod)
Scalable State Management (React Query)
Accessibility-First UI (ARIA-compliant Radix primitives)

Complete Screen List (40+ Screens)
AUTHENTICATION FLOW (5 screens)
1. Welcome Screen
Purpose: First impression, value proposition
Layout:
Full-screen gradient (white → light green)
Animated logo (water droplet morphing into "Aegis")
Tagline: "Nigerian SME Compliance, Simplified"
3 key benefits (icons + text):
"Automate Tax Filings"
"Never Miss Deadlines"
"Audit-Ready Always"
CTAs: "Get Started Free" (primary), "Sign In" (secondary)
Micro-interactions:
Logo animates on load (Lottie: water droplet splash)
Benefit cards fade in sequentially
CTA buttons have ripple effect on tap
Coach Mark: None (first screen)

2. Sign Up Screen
Purpose: User registration
Layout:
Back button (top-left)
Progress indicator: Step 1 of 3
Form fields:
First Name
Last Name
Email (with validation)
Phone (Nigeria format +234)
Password (strength meter)
"Already have an account? Sign In" link
Primary CTA: "Continue"
Micro-interactions:
Password strength bar animates (red → yellow → green)
Field validation shows checkmark/error icon
"Continue" button disables until all valid
Coach Mark: "Strong passwords protect your business data"

3. Company Setup Screen
Purpose: Capture company details
Layout:
Progress: Step 2 of 3
Form fields:
Company Name
Tax ID (TIN) - optional but recommended
RC Number - optional
Industry (dropdown)
Number of Employees (slider: 1-250+)
State (dropdown)
LGA (dependent dropdown)
"Why we need this" info icons
CTA: "Next"
Micro-interactions:
Employee slider shows visual size: micro → small → medium → large
State selection loads LGA options with shimmer effect
Info icons expand tooltips on tap
Coach Mark: "Your TIN helps us auto-calculate taxes accurately"

4. Plan Selection Screen
Purpose: Choose subscription tier
Layout:
Progress: Step 3 of 3
Title: "Choose Your Plan"
3 pricing cards (Free, Pro, Enterprise):
Plan name
Price (bold, large)
Key features (4-5 bullet points)
"Select Plan" CTA
Pro card highlighted with pulse animation
"Compare all features" link
"Start with Free, upgrade anytime" note
Micro-interactions:
Cards tilt slightly on hover (web) or parallax on scroll (mobile)
Selected card scales up 1.05x
Checkmark appears on selection
Coach Mark: "Start free, no credit card required"

5. Onboarding Complete / Welcome Dashboard
Purpose: Celebrate completion, guide next steps
Layout:
Confetti animation
"Welcome to ComplianceHub!" heading
"Here's what to do next" checklist:
☐ Add your first employee
☐ Review compliance calendar
☐ Explore learning resources
CTA: "Get Started"
Skip link: "I'll explore on my own"
Micro-interactions:
Confetti falls (Lottie animation)
Checklist items bounce in one by one
CTA button has shimmer effect
Coach Mark: None (transition to dashboard)

MAIN DASHBOARD (3 screens)
6. Dashboard Home (Overview)
Purpose: At-a-glance business health, compliance status
Layout:
Header:
Company logo + name
Company switcher (Enterprise only)
Notification bell (badge if unread)
User avatar → dropdown menu
Main Content (Cards in vertical scroll):
Compliance Status Card (Glassmorphism)


Title: "Compliance Health"
Circular progress: 85% (green if >80%, yellow if 50-80%, red if <50%)
"3 filings due this month"
"View Calendar" link
Upcoming Deadlines Card


Timeline view (next 7 days)
Each deadline: Date, obligation name, amount (if known)
Color-coded: Red (<3 days), Yellow (3-7 days), Green (7+ days)
"All Deadlines" link
Payroll Summary Card


Last payroll: December 2025
Total paid: ₦2,450,000
Employees paid: 23
"Run Payroll" CTA button
Quick Actions Card


Grid of 4 action buttons:
Add Employee
File Compliance
Upload Document
Generate Report
Learning Spotlight (if beginner detected)


Featured article: "PAYE for Beginners"
"5 min read"
Thumbnail image
"Read Now" CTA
Bottom Navigation (Mobile):
Home (active)
Compliance
Payroll
More
Micro-interactions:
Cards fade in with stagger (0.1s delay each)
Compliance progress animates from 0 → 85%
Deadline items have subtle pulse if <3 days
Quick action buttons scale on tap
Coach Marks (First Visit):
"This is your compliance health score" (pointing to progress)
"Never miss a deadline here" (timeline)
"Run payroll in seconds" (payroll card)

7. Dashboard - Notifications Center
Purpose: Centralized notification management
Layout:
Header: "Notifications" + "Mark all as read" link
Tabs: All (badge: 5) | Unread (3) | Archived
List of notification cards:
Icon (color-coded by type)
Title (bold if unread)
Message snippet
Timestamp (relative: "2 hours ago")
Action button (e.g., "View Deadline", "Approve Payroll")
Swipe actions (mobile): Archive, Delete
Notification Types:
Deadline reminders (red bell)
Payroll ready (green dollar)
Payment overdue (orange alert)
Subscription expiry (blue info)
System updates (gray cog)
Micro-interactions:
Pull-to-refresh (mobile)
Notification cards slide in from right
Unread badge animates on new notification
Swipe gesture shows action icons
Coach Mark: "Get alerted via email, SMS, or WhatsApp"

8. Dashboard - Settings Hub
Purpose: Centralized settings access
Layout:
Grouped list with section headers:
Company Settings:
Company Profile
Team & Users
Subscription & Billing (Admin only)
Integrations
Compliance Settings:
Compliance Preferences
Notification Preferences
Compliance Calendar
Payroll Settings:
Payroll Configuration
Tax Relief Settings
Account Settings:
My Profile
Security & Privacy
Learning Progress
Support:
Help Center


Contact Support


What's New


Sign Out (bottom, red text)


Micro-interactions:
Sections expand/collapse
Each row has right chevron
Tapping row navigates with slide transition
Coach Mark: None (standard iOS-style settings)

EMPLOYEE MANAGEMENT (6 screens)
9. Employee List
Purpose: View and manage all employees
Layout:
Header: "Employees" + "Add Employee" button
Search bar (debounced)
Filter chips: All (23) | Active (20) | Inactive (3)
Sort dropdown: Name | Department | Salary
Employee cards (list view):
Avatar (initials if no photo)
Name + Job Title
Department
Status badge (Active/Inactive)
Salary (masked: ₦●●●,●●● - tap to reveal)
Chevron right
Empty state (if no employees): Illustration + "Add your first employee"
Micro-interactions:
Search shows shimmer loader while fetching
Filter chips highlight with scale animation
Cards have hover lift effect (web)
Salary reveal: blur → clear animation
Coach Mark: "Add employees to start running payroll"

10. Add Employee Screen
Purpose: Create new employee record
Layout:
Header: "Add Employee" + Cancel button
Form in sections (collapsible accordions):
Personal Information:
First/Last/Middle Name
Email, Phone
Date of Birth (date picker)
Gender (segmented control)
Employment Details:
Employee Code (auto-generated, editable)
Department (dropdown or add new)
Job Title
Employment Type (Full-time/Part-time/Contract)
Start Date
Gross Salary (₦)
Payment Method (Bank Transfer/Cash/Cheque)
Bank Details:
Bank Name (searchable dropdown)
Account Number (validates with bank API if available)
Account Name (auto-filled after validation)
Tax & Pension:
Tax ID (TIN) - optional
Pension PIN - optional
Pension Provider (dropdown)
Allowances (Optional):
"+ Add Allowance" button


Type (Housing/Transport/Meal), Amount, Taxable checkbox


Primary CTA: "Save Employee"


Secondary CTA: "Save & Add Another"


Micro-interactions:
Sections expand with smooth accordion animation
Salary input shows formatted preview (₦150,000.00)
Bank validation shows spinner → checkmark
Allowances slide in when added
Coach Mark: "We auto-calculate tax and pension for you"

11. Employee Detail Screen
Purpose: View/edit single employee
Layout:
Header: Employee name + Edit button (pencil icon)
Profile section:
Large avatar
Name, Job Title, Department
Status badge
Quick actions: View Payslips, Edit, Deactivate
Tabs:
Overview: Personal info, employment details, bank details
Payroll History: List of payslips with download button
Tax & Pension: YTD totals, relief claims
Documents: Uploaded contracts, certificates
Micro-interactions:
Tabs slide horizontally on swipe
Quick action buttons have icon animations
Payslip downloads show progress circle
Coach Mark: "Track each employee's full history here"

12. Edit Employee Screen
Purpose: Modify employee details
Layout: Same as Add Employee, but:
Pre-filled with existing data
"Delete Employee" button (bottom, red, requires confirmation)
Audit log note: "Last updated by John Doe on Dec 15"
Micro-interactions:
Changed fields highlighted with subtle border
Save button shows success animation (checkmark)
Delete confirmation modal slides up from bottom

13. Bulk Import Employees
Purpose: Upload multiple employees at once
Layout:
Header: "Import Employees"
Steps:
Download Template (Excel/CSV)
Fill Template
Upload File
Drag-and-drop zone or file picker
Preview table (first 10 rows)
Validation results: ✓ Valid (20) | ⚠ Warnings (3) | ✗ Errors (1)
"Fix Errors" button → inline editing
"Import X Employees" CTA (disabled if errors)
Micro-interactions:
Drag-and-drop zone pulses on hover
Upload shows progress bar
Validation runs with animated spinner
Error rows highlight in red with inline message
Coach Mark: "Import from your existing spreadsheet"

14. Employee Self-Service Portal (Future - Pro/Enterprise)
Purpose: Employees view their own data
Layout:
Simplified navigation
Dashboard showing:
Last payslip
YTD earnings
Tax certificate download
Pension statement
Profile editing (limited fields)
Leave requests (if HR module added)
Micro-interactions:
Documents download with confetti
Profile changes require admin approval → pending badge

PAYROLL MODULE (7 screens)
15. Payroll Home / Runs List
Purpose: View all payroll runs
Layout:
Header: "Payroll" + "Run Payroll" button
Filter: Year selector (2025, 2024, ...)
List of payroll run cards:
Period (e.g., "December 2025")
Status badge (Draft/Approved/Paid)
Total net pay: ₦2,450,000
Employees: 23
Payment date
Quick actions: View, Approve (if draft), Export
Empty state: "Run your first payroll to get started"
Micro-interactions:
Status badges animate color pulse
Export shows dropdown: PDF/Excel/CSV
Card tap expands to show summary
Coach Mark: "Your payroll history is always accessible"

16. Run Payroll Screen (Step 1: Configuration)
Purpose: Set up payroll run
Layout:
Header: "Run Payroll" + Close button
Progress: Step 1 of 4
Form:
Payroll Period (month-year picker) - defaults to current month
Payment Date (date picker) - defaults to company setting
Include Employees: All (23) | Selected (checkboxes)
Apply Bonuses (optional):
"+ Add Bonus" → Employee selector, Amount, Reason
Apply Deductions (optional):
"+ Add Deduction" → Employee selector, Amount, Reason
CTA: "Calculate Payroll"
Micro-interactions:
Period picker has smooth scroll
Employee list loads with skeleton screens
Bonus/Deduction forms slide in
Coach Mark: "We'll calculate everything automatically"

17. Run Payroll (Step 2: Review Calculations)
Purpose: Review auto-calculated payroll
Layout:
Progress: Step 2 of 4


Summary cards (top):


Total Gross: ₦3,200,000
Total Deductions: ₦750,000
Total Net Pay: ₦2,450,000 (large, bold)
PAYE Due: ₦450,000
Pension Due: ₦300,000
Employee-wise breakdown table:


Name | Gross | PAYE | Pension | Deductions | Net
Sortable columns
Tap row to expand full breakdown
"Edit Individual" option for corrections


CTAs: "Back" | "Approve & Continue"


Micro-interactions:
Numbers count up animation (0 → final value)
Table rows expand with accordion
Editing shows inline form
Coach Mark: "Review each employee's calculation here"

18. Run Payroll (Step 3: Approval)
Purpose: Final approval before processing
Layout:
Progress: Step 3 of 4
Approval checklist:
☑ All calculations reviewed
☑ Payment date confirmed: Dec 25, 2025
☑ Bank account has sufficient funds
☐ I approve this payroll (checkbox)
Approver: [Current user name] (if Company Admin)
Warning: "Approved payroll cannot be edited"
CTAs: "Back" | "Approve Payroll" (disabled until checkbox)
Micro-interactions:
Approval checkbox has satisfying click sound (optional)
"Approve" button glows green when enabled
Approval shows confetti animation
Coach Mark: "Only admins can approve payroll"

19. Run Payroll (Step 4: Payment Processing)
Purpose: Execute payments (optional - can be manual)
Layout:
Progress: Step 4 of 4
Two options:
Option A: Manual Payment:
"Download Payment Schedule" (Excel/PDF)
Instructions: "Use this to process payments via your bank"
"Mark as Paid" button (when done)
Option B: Auto Payment (Future - Enterprise):
Connect bank account
"Process Payments" button
Shows progress: Processing (1/23)...
Success summary: 22 ✓ Successful, 1 ✗ Failed
Retry failed payments
Micro-interactions:
Download shows success toast
Payment processing has animated progress bar
Success shows confetti
Coach Mark: "We don't handle payments directly - you stay in control"

20. Payslip View Screen
Purpose: View individual payslip
Layout:
Header: "Payslip - December 2025"
Company letterhead (if uploaded)
Employee details:
Name, Employee Code, Department
Payment Date, Bank Account
Earnings table:
Basic Salary: ₦150,000
Housing Allowance: ₦50,000
Gross Salary: ₦200,000
Deductions table:
PAYE: ₦25,000
Pension (8%): ₦16,000
Loan: ₦10,000
Total Deductions: ₦51,000
Net Pay: ₦149,000 (large, highlighted)
Footer: Digital signature, "This is a computer-generated document"
CTAs: Download PDF | Share via Email/WhatsApp
Micro-interactions:
PDF generates with loading spinner
Share options slide up from bottom
Coach Mark: "Employees receive payslips via email automatically"

21. Payroll Reports Screen
Purpose: Generate custom payroll reports
Layout:
Header: "Payroll Reports"
Report type selector:
Payroll Summary (by month)
Employee-wise Earnings
Tax Summary (PAYE breakdown)
Pension Summary
Deductions Report
Filters:
Date Range (start-end date pickers)
Departments (multi-select)
Employees (multi-select)
Preview button → Shows table preview
Export options: PDF | Excel | CSV
"Save Report Template" (for recurring reports)
Micro-interactions:
Report preview loads with skeleton
Export shows progress percentage
Saved templates appear as quick-access chips
Coach Mark: "Export for your accountant or auditor"

COMPLIANCE MODULE (8 screens)
22. Compliance Calendar
Purpose: Visual timeline of all obligations
Layout:
Header: "Compliance Calendar"
Month picker (Dec 2025) with prev/next arrows
Calendar view (month grid):
Days with deadlines highlighted
Color dots: Red (overdue), Yellow (due soon), Green (filed)
Tap date → shows obligations for that day
List view toggle (alternative to calendar)
Filter: All Obligations | PAYE | VAT | Pension | NSITF | ITF
"Add Reminder" button
Micro-interactions:
Month transitions slide horizontally
Deadline dots pulse if due <3 days
Tapping date expands drawer with details
Coach Mark: "Never miss a deadline again"

23. Compliance Obligation Detail
Purpose: View single obligation (e.g., PAYE for December)
Layout:
Header: "PAYE - December 2025"


Status badge: Pending / Calculated / Filed / Paid


Details card:


Filing Agency: FIRS
Due Date: Jan 10, 2026 (red if overdue)
Period: December 1-31, 2025
Amount Due: ₦450,000
Calculated On: Dec 18, 2025
Action buttons (status-dependent):


If Pending: "Calculate Amount"
If Calculated: "File Now" | "Mark as Filed"
If Filed: "Upload Payment Receipt" | "View Filing"
If Paid: "Download Receipt" | "View History"
Related Documents section:


Filing schedule (PDF)
Payment receipt (if uploaded)
Filing History (previous months)


Micro-interactions:
Status badge animates on status change
"File Now" shows confirmation modal
Document upload has drag-and-drop
Coach Mark: "We calculate the exact amount for you"

24. File Compliance Screen (Automated - Pro)
Purpose: Auto-file compliance via API
Layout:
Header: "File PAYE - December 2025"
Pre-flight checklist:
☑ Payroll run approved
☑ Amount calculated: ₦450,000
☑ FIRS credentials linked (if required)
☐ I confirm the amount is correct
Filing details:
Method: Automated (via ComplianceHub)
Expected completion: 2-5 minutes
Warning: "Filing cannot be undone"
CTAs: "Cancel" | "File Now"
Post-Filing Screen:
Success animation (green checkmark)
"Filing Successful!"
Reference number: FIRS-202512-4567
Download confirmation PDF
"Done" button
Micro-interactions:
Checklist items check off with animation
Filing shows progress spinner
Success shows confetti
Coach Mark: "We file directly with FIRS on your behalf (Pro feature)"

25. Manual Filing Assistance (Free Tier)
Purpose: Guide users through manual filing
Layout:
Header: "File PAYE Manually"


Step-by-step guide:


Calculate Amount: ₦450,000 (done by app)
Download Schedule: PDF with full breakdown
Visit FIRS Portal: [Link to FIRS website]
Make Payment: Via Remita or bank transfer
Upload Receipt: Drag-and-drop zone
Confirm Filing: Mark as complete
Video tutorial: "How to file PAYE on FIRS portal (3 min)"


"Need help?" link to support


Micro-interactions:
Steps expand/collapse
Completed steps show checkmark
Upload shows progress bar
Coach Mark: "Upgrade to Pro for automatic filing"

26. Upload Payment Receipt Screen
Purpose: Proof of compliance payment
Layout:
Header: "Upload Receipt - PAYE December"
Drag-and-drop zone (or file picker)
Accepted formats: PDF, JPG, PNG (max 5MB)
Form fields:
Payment Date (date picker)
Payment Reference Number
Payment Method (dropdown: Bank Transfer/Remita/USSD)
Preview uploaded file
CTA: "Save Receipt"
Micro-interactions:
Drag-and-drop highlights on hover
Upload shows progress bar
Preview shows full-screen on tap
Coach Mark: "Keep receipts for audit-ready records"

27. Compliance Reports Screen
Purpose: Generate compliance reports
Layout:
Report types:
Annual Tax Summary (all obligations)
PAYE History (12 months)
Pension Remittance Report
VAT Filing History
Compliance Audit Trail
Filters: Year, Obligation Type
Export: PDF (formatted) | Excel (detailed)
Micro-interactions:
Report preview loads with skeleton
Export shows download progress

28. Penalties & Overdue Screen
Purpose: Track missed deadlines
Layout:
Header: "Penalties & Overdue"
Warning banner if overdue obligations exist
List of overdue items:
Obligation name
Original due date
Days overdue (red badge)
Estimated penalty (if calculable)
"File Now" button
Historical penalties (if any):
Date, Obligation, Penalty Paid, Receipt
Total Penalties YTD: ₦0 (goal)
Micro-interactions:
Overdue count badge pulses
Days overdue ticks up daily
Coach Mark: "We help you avoid penalties entirely"

29. Tax Relief Claims Screen (Advanced - Pro)
Purpose: Manage employee tax reliefs
Layout:
Header: "Tax Relief Claims"
Explainer: "Reduce PAYE by claiming reliefs"
Employee list with relief status:
Name | CRA Claimed | NHF | NHIS | Pension | Total Relief
"+ Add Relief Claim" button
Bulk upload option (Excel template)
Add Relief Form:
Employee selector
Relief type (dropdown)
Annual amount
Upload supporting document
CTA: "Submit Claim"
Micro-interactions:
Relief types show info popups
Annual amount auto-calculates monthly relief
Submission shows success animation

DOCUMENT MANAGEMENT (3 screens)
30. Documents Library
Purpose: Centralized document storage
Layout:
Header: "Documents" + "Upload" button
Folders (expandable):
Company Documents (CAC, TIN Certificate)
Payroll (Payslips by month)
Compliance (Receipts, Filings)
Employee Documents (Contracts, Certificates)
Search bar
Sort: Date | Name | Type
Grid or list view toggle
Document cards:
File icon (based on type)
File name
Upload date
File size
Actions: View | Download | Share | Delete
Micro-interactions:
Folders expand with smooth animation
Documents load with lazy loading
Long-press shows context menu (mobile)
Coach Mark: "Keep all compliance docs in one place"

31. Upload Document Screen
Purpose: Add new document
Layout:
Drag-and-drop zone (large)
File picker button
Form:
Document Type (dropdown)
Related To (dropdown: Company/Employee/Payroll/Compliance)
Description (optional)
Preview area (if image/PDF)
CTA: "Upload"
Micro-interactions:
Drag-and-drop zone pulses
Upload shows progress circle
Success shows checkmark animation

32. Document Viewer Screen
Purpose: View document details
Layout:
Full-screen document preview (PDF/image)
Zoom/pan controls
Header: Document name + Actions menu
Actions: Download | Share | Move to Folder | Delete
Metadata footer:
Uploaded by
Upload date
File size
Related entity link
Micro-interactions:
Pinch-to-zoom (mobile)
Swipe gestures for prev/next document
Delete requires confirmation

LEARNING & SUPPORT (4 screens)
33. Learning Hub
Purpose: Educational resources
Layout:
Header: "Learning Hub"
Search bar
Featured content (carousel):
"PAYE 101" video
"Setting Up Payroll" article
"Compliance Calendar Explained" checklist
Categories (tabs):
Tax Basics
Payroll How-Tos
Compliance Guides
Video Tutorials
Content cards:
Thumbnail
Title
Type badge (Article/Video/Checklist)
Difficulty (Beginner/Intermediate)
Read time
Bookmark icon
"My Progress" link → Shows completed content
Micro-interactions:
Carousel auto-advances
Bookmark animates fill
Content cards have hover lift
Coach Mark: "Learn Nigerian compliance basics here"

34. Article/Video Detail Screen
Purpose: Consume learning content
Layout:
Header: Title + Back button
Content:
If video: Embedded player (YouTube/Vimeo)
If article: Formatted text with images
Progress bar (bottom) - tracks reading/viewing
"Mark as Complete" button
"Was this helpful?" thumbs up/down
Related content section
Micro-interactions:
Video player standard controls
Article has smooth scroll
"Complete" shows confetti

35. Help Center
Purpose: FAQs and support
Layout:
Search bar: "How can we help?"
Common topics (grid):
Getting Started
Payroll Issues
Compliance Questions
Billing & Subscriptions
Account Settings
FAQ accordion list (per topic)
"Still need help?" CTA → Contact Support
Micro-interactions:
Search shows instant results
FAQs expand/collapse
Contact form slides up

36. Contact Support Screen
Purpose: Submit support ticket
Layout:
Header: "Contact Support"
Form:
Issue Type (dropdown)
Subject
Description (textarea)
Attach Screenshot (optional)
Expected response time: "Within 12 hours (Pro)"
CTA: "Send Message"
Alternative: WhatsApp button (direct chat)
Micro-interactions:
Screenshot upload shows preview
Send shows success animation
WhatsApp opens in new window

SUBSCRIPTION & BILLING (4 screens)
37. Subscription Overview
Purpose: Manage subscription
Layout:
Current plan card (glassmorphism):
Plan name (badge)
Price: ₦15,000/month
Next billing: Jan 18, 2026
"Manage Plan" button
Features checklist (what's included)
Usage stats:
Employees: 23 / 50
Document Storage: 1.2GB / 5GB
API Calls: 450 / 1,000 (if applicable)
Billing history (last 3 invoices)
"View All Invoices" link
Micro-interactions:
Usage bars animate progress
Plan card has subtle glow
Coach Mark: "Upgrade anytime as your business grows"

38. Change Plan Screen
Purpose: Upgrade/downgrade subscription
Layout:
Current plan highlighted
Comparison table (Free vs Pro vs Enterprise):
Features side-by-side
Prices
"Current" badge on active plan
"Upgrade" or "Contact Sales" buttons
"Downgrade to Free" link (bottom, less prominent)
Prorated billing note: "Changes apply immediately, billing adjusted"
Micro-interactions:
Comparison scrolls horizontally (mobile)
Selected plan highlights
Upgrade shows payment screen

39. Payment Method Screen
Purpose: Add/update payment method
Layout:
Header: "Payment Method"
Current card (if exists):
Card brand logo (Visa/Mastercard)
Last 4 digits: •••• 4242
Expiry: 12/27
"Remove" button
"+ Add New Card" button
Secure payment badge: "Powered by Paystack"
Form (when adding):
Card number (auto-formatted)
Expiry (MM/YY)
CVV
Billing address (optional)
CTA: "Save Card"
Micro-interactions:
Card number shows brand icon as you type
Form validation shows instant feedback
Save shows security animation
Coach Mark: "Your card details are never stored by us"

40. Invoice Detail Screen
Purpose: View past invoices
Layout:
Header: "Invoice - December 2025"
Invoice details:
Invoice Number: INV-20251218-001
Date: Dec 18, 2025
Plan: Pro (Monthly)
Amount: ₦15,000
Status: Paid
Payment Method: Visa •••• 4242
Company billing address
Download PDF button
"Need a receipt?" link → email receipt
Micro-interactions:
PDF downloads with progress
Email receipt sends with toast confirmation

Additional Screens (Mobile-Specific)
41. Bottom Sheet Modals
Quick actions overlay
Filter/sort options
Confirmation dialogs
Share sheets
42. Splash Screen
Animated logo while app loads
Version number (bottom)
43. Error States
404: "Page not found" with back button
500: "Something went wrong" with retry
Network error: "No internet" with retry
44. Empty States
No employees yet
No payroll runs
No documents uploaded
Custom illustrations for each
Screen Transitions & Navigation
Web:
Smooth page transitions (fade + slide)
Breadcrumb navigation
Persistent sidebar
Mobile:
Bottom navigation (4 tabs: Home, Compliance, Payroll, More)
Stack navigation (push/pop)
Swipe-back gesture (iOS)

6. Modules & Functional Flow
Module Breakdown
MODULE 1: Authentication & Onboarding
Key Flows:
A. Sign Up & Company Setup
SIGN_UP_FLOW {
  1. User enters email, password
  2. Email verification sent
  3. User clicks verification link
  4. Redirect to company setup
  5. Capture company details (TIN, RC, employees)
  6. Plan selection (defaults to Free)
  7. If Free: Activate immediately
  8. If Pro trial: Start 14-day trial, set trial_end
  9. If Pro paid: Collect payment via Paystack
  10. Create company record, assign Company Admin role(backend)
  11. Show welcome dashboard with onboarding checklist
  12. Trigger first-time coach marks
}

B. Login with Multi-Company Support
LOGIN_FLOW {
  1. User enters email + password
  2. Validate credentials
  3. Check email_verified = TRUE
  4. Query company_users table for user_id
  5. If user belongs to 1 company:
      - Auto-select that company
      - Load dashboard for that company
  6. If user belongs to multiple companies:
      - Show company selector modal
      - User picks company
      - Remember last selected company
  7. Generate JWT with {user_id, company_id, role}
  8. Redirect to dashboard
}

C. Role-Based Access on Login
RBAC_ENFORCEMENT {
  ON_EVERY_API_REQUEST:
    1. Extract JWT from Authorization header
    2. Decode JWT → {user_id, company_id, role}
    3. Check feature flags: Does this company's tier allow this feature?
    4. Check role permissions: Does this role allow this action?
    5. If NOT allowed:
        - Return 403 Forbidden
        - Show upgrade prompt (if tier issue)
        - Show permission denied (if role issue)
    6. If allowed: Proceed
}


MODULE 2: Employee Management
Key Flows:
A. Add Employee
ADD_EMPLOYEE {
  INPUT: Employee form data
  
  VALIDATION:
    - Required fields: first_name, last_name, gross_salary, employment_start_date
    - Email format valid
    - TIN format valid (if provided)
    - Salary > 0
  
  PROCESSING:
    1. Generate employee_code (auto-increment or custom)
    2. Calculate monthly salary from gross_salary + frequency
    3. Set default pension_percentage = 8%
    4. Parse allowances JSON
    5. INSERT into employees table
    6. Update company.employee_count += 1
    7. Check subscription tier:
        - If Free and count > 5: Show upgrade prompt
        - If Pro and count > 50: Show upgrade prompt
    8. Log in audit_logs: "Employee X added by Y"
    9. Send welcome email to employee (if email provided)
  
  RETURN: employee_id
}

B. Bulk Import Employees
BULK_IMPORT {
  INPUT: Excel/CSV file
  
  PROCESSING:
    1. Parse file (use library like Papaparse)
    2. Validate each row:
        - Required fields present
        - Data types correct
        - No duplicate employee_codes
    3. Separate into:
        - Valid rows (green)
        - Warnings (yellow) - e.g., missing optional TIN
        - Errors (red) - e.g., invalid email
    4. Show preview table with validation results
    5. User fixes errors inline or re-uploads
    6. On "Import" button:
        - Loop through valid rows
        - Call ADD_EMPLOYEE for each
        - Show progress: "Importing 15/50..."
    7. Show summary: "45 imported, 5 skipped (see errors)"
    8. Log audit: "Bulk import: 45 employees by User Y"
}

C. Employee Deactivation (Not Deletion)
DEACTIVATE_EMPLOYEE {
  INPUT: employee_id, end_date
  
  PROCESSING:
    1. UPDATE employees SET:
        - is_active = FALSE
        - employment_end_date = end_date
    2. Do NOT include in future payroll runs
    3. Keep historical data (payroll, documents)
    4. Update company.employee_count -= 1
    5. Log: "Employee X deactivated by User Y, reason: Z"
  
  NOTE: Soft delete, never hard delete for audit compliance
}


MODULE 3: Payroll Processing
Key Flows:
A. Run Payroll (End-to-End)
RUN_PAYROLL {
  STEP_1_CONFIGURE:
    - Select payroll_period (YYYY-MM)
    - Select payment_date
    - Select employees (default: all active)
    - Add one-time bonuses/deductions
  
  STEP_2_CALCULATE:
    FOR EACH selected employee:
      1. Get gross_salary
      2. Add allowances (taxable + non-taxable separately)
      3. Calculate CRA (Consolidated Relief Allowance):
          - CRA = Higher of (N200,000 + 20% of gross, 1% of gross)
      4. Calculate taxable_income:
          - taxable_income = gross + taxable_allowances - CRA - pension_employee
      5. Calculate PAYE using tax bands:
          - First N300,000: 7%
          - Next N300,000: 11%
          - Next N500,000: 15%
          - Next N500,000: 19%
          - Next N1,600,000: 21%
          - Above N3,200,000: 24%
      6. Calculate pension:
          - Employee: 8% of gross
          - Employer: 10% of gross
      7. Calculate NHF (if applicable): 2.5% of basic salary
      8. Calculate NSITF (employer): 1% of gross
      9. Calculate ITF (employer): 1% of gross
      10. Add other_deductions (loans, etc.)
      11. Calculate net_salary:
          - net = gross - PAYE - pension_employee - other_deductions
      12. INSERT into payroll_items table
    
    SUM all payroll_items to get totals:
      - total_gross, total_paye, total_net, etc.
    
    INSERT into payroll_runs table with status='draft'
  
  STEP_3_REVIEW:
    - Display summary + employee breakdown
    - Allow edits (recalculates on change)
    - User clicks "Approve"
  
  STEP_4_APPROVE:
    - Check: Is user Company Admin?
    - UPDATE payroll_run status='approved'
    - Set approved_by, approved_at
    - Log audit: "Payroll approved by X"
  
  STEP_5_PAYMENT:
    - Generate payment schedule (Excel/CSV)
    - User downloads and processes via bank
    - OR (Future): Integrate with bank API for direct payment
    - User marks as "Paid"
    - UPDATE payroll_run status='paid', payment_date=NOW()
    - Send payslips to all employees via email
  
  RETURN: payroll_run_id
}

B. Payroll Calculation Deep Dive (Nigerian Tax)
CALCULATE_PAYE_NIGERIA {
  INPUT: gross_salary, allowances, reliefs
  
  STEP_1_GROSS_INCOME:
    - total_gross = basic_salary + taxable_allowances
  
  STEP_2_RELIEFS:
    - CRA = MAX(200000 + 0.20 * total_gross, 0.01 * total_gross)
    - Pension relief = 8% * total_gross (capped at 8% contribution)
    - NHF relief = 2.5% * basic_salary (if applicable)
    - NHIS relief = (if claimed, from tax_reliefs table)
    - Total_reliefs = CRA + pension + NHF + NHIS
  
  STEP_3_TAXABLE_INCOME:
    - taxable_income = total_gross - total_reliefs
    - If taxable_income < 0: taxable_income = 0
  
  STEP_4_APPLY_TAX_BANDS (Progressive):
    - Band 1: First N300,000 at 7% = N21,000
    - Band 2: Next N300,000 at 11% = N33,000
    - Band 3: Next N500,000 at 15% = N75,000
    - Band 4: Next N500,000 at 19% = N95,000
    - Band 5: Next N1,600,000 at 21% = N336,000
    - Band 6: Above N3,200,000 at 24%
    
    EXAMPLE: If taxable_income = N5,000,000
      - First N300k: N21k
      - Next N300k: N33k
      - Next N500k: N75k
      - Next N500k: N95k
      - Next N1.6m: N336k
      - Remaining N1
.8m: N1.8m * 24% = N432k - Total PAYE = N992,000
STEP_5_MONTHLY_PAYE: - Annual PAYE = calculated above - Monthly PAYE = Annual PAYE / 12
RETURN: monthly_paye }

**C. Generate Payslips**
```pseudocode
GENERATE_PAYSLIP {
  INPUT: payroll_item_id
  
  PROCESSING:
    1. Fetch payroll_item with employee details
    2. Fetch company details (logo, letterhead)
    3. Generate HTML template:
        - Company header
        - Employee info
        - Earnings breakdown
        - Deductions breakdown
        - Net pay (highlighted)
        - Payment details (bank, account)
        - Footer: "Computer-generated, no signature required"
    4. Convert HTML to PDF (use library like Puppeteer/wkhtmltopdf)
    5. Store PDF in documents table
    6. Return PDF URL
}

SEND_PAYSLIPS_BULK {
  INPUT: payroll_run_id
  
  PROCESSING:
    1. Fetch all payroll_items for run
    2. For each item:
        - Generate PDF payslip
        - Send email to employee:
            Subject: "Your Payslip for [Month Year]"
            Body: "Dear [Name], Your payslip is attached..."
            Attachment: payslip.pdf
        - Log: "Payslip sent to employee X"
    3. Show summary: "23 payslips sent"
}


MODULE 4: Compliance Automation
Key Flows:
A. Compliance Obligation Setup (One-Time, Admin)
SEED_NIGERIAN_OBLIGATIONS {
  # Run this on first company setup or as database migration
  
  OBLIGATIONS = [
    {
      type: 'PAYE',
      name: 'Pay As You Earn (PAYE)',
      agency: 'FIRS',
      frequency: 'monthly',
      due_day: 10, # 10th of following month
      enabled_for_tier: 'pro', # Free users get reminders only
      applies_if: {employee_count: {min: 1}}
    },
    {
      type: 'WHT',
      name: 'Withholding Tax',
      agency: 'FIRS',
      frequency: 'monthly',
      due_day: 21,
      enabled_for_tier: 'pro',
      applies_if: {annual_revenue: {min: 0}} # All companies
    },
    {
      type: 'VAT',
      name: 'Value Added Tax',
      agency: 'FIRS',
      frequency: 'monthly',
      due_day: 21,
      enabled_for_tier: 'pro',
      applies_if: {annual_revenue: {min: 25000000}} # N25m threshold
    },
    {
      type: 'PENSION',
      name: 'Pension Remittance',
      agency: 'Pension Commission',
      frequency: 'monthly',
      due_day: 10,
      enabled_for_tier: 'pro',
      applies_if: {employee_count: {min: 3}} # 3+ employees
    },
    {
      type: 'NSITF',
      name: 'NSITF Contribution',
      agency: 'NSITF',
      frequency: 'quarterly',
      due_month: [1, 4, 7, 10], # Jan, Apr, Jul, Oct
      due_day: 30,
      enabled_for_tier: 'pro',
      applies_if: {employee_count: {min: 1}}
    },
    {
      type: 'ITF',
      name: 'Industrial Training Fund',
      agency: 'ITF',
      frequency: 'annually',
      due_month: 3, # March 31
      due_day: 31,
      enabled_for_tier: 'pro',
      applies_if: {annual_payroll: {min: 50000000}} # N50m payroll
    },
    {
      type: 'CAC_ANNUAL',
      name: 'CAC Annual Returns',
      agency: 'Corporate Affairs Commission',
      frequency: 'annually',
      due_month: 12, # Within 18 months of incorporation
      due_day: 31,
      enabled_for_tier: 'free', # All tiers
      applies_if: {has_rc_number: true}
    }
  ]
  
  FOR EACH company IN database:
    FOR EACH obligation IN OBLIGATIONS:
      IF obligation.applies_if is met by company:
        INSERT into compliance_obligations
}

B. Auto-Calculate Compliance Amounts
CALCULATE_COMPLIANCE {
  # Runs automatically after payroll approval
  
  ON_EVENT: payroll_run.status = 'approved'
  
  TRIGGER_CALCULATIONS:
    1. PAYE Calculation:
        - Sum all payroll_items.paye for the month
        - Create/Update compliance_filing:
            obligation_type = 'PAYE'
            filing_period = payroll_run.payroll_period
            calculated_amount = total_paye
            due_date = (period_end + 10 days)
            status = 'calculated'
    
    2. Pension Calculation:
        - Sum payroll_items.pension_employee + pension_employer
        - Create/Update compliance_filing:
            obligation_type = 'PENSION'
            calculated_amount = total_pension
            due_date = (period_end + 10 days)
            status = 'calculated'
    
    3. NSITF Calculation (Quarterly):
        - If current month is end of quarter (Mar/Jun/Sep/Dec):
            - Sum last 3 months NSITF contributions
            - Create compliance_filing
    
    4. ITF Calculation (Annual):
        - If current month is December:
            - Sum all 12 months ITF contributions
            - Create compliance_filing

  SEND_REMINDERS:
    - Create reminder for 7 days before due_date
    - Create reminder for 3 days before
    - Create reminder for 1 day before
}

C. Automated Filing (Pro Feature)
AUTO_FILE_COMPLIANCE {
  # Only for Pro/Enterprise with enabled feature flag
  
  INPUT: compliance_filing_id
  
  PRE_CHECKS:
    1. Is company subscription active?
    2. Is auto-filing enabled in company_settings?
    3. Are API credentials configured? (FIRS API key, Remita merchant ID)
    4. Is calculated_amount confirmed by user?
  
  FILING_PROCESS:
    1. Prepare filing payload:
        - Company TIN
        - Filing period
        - Amount due
        - Employee breakdown (for PAYE)
    
    2. Call FIRS API (or relevant agency):
        - POST /api/file-paye
        - Include authentication
        - Send JSON payload
    
    3. Handle response:
        - If SUCCESS:
            - Update filing status = 'filed'
            - Save filing_reference
            - Generate filing confirmation PDF
            - Notify user: "PAYE filed successfully"
        - If ERROR:
            - Log error
            - Update status = 'filing_failed'
            - Notify user with error details
            - Fallback: Manual filing instructions
    
    4. Payment Step (Separate):
        - Generate payment link to Remita/FIRS portal
        - User completes payment externally
        - User uploads receipt
        - Update status = 'paid'
  
  AUDIT_LOG:
    - Log every step: attempted, filed, confirmed
    - Store API responses for troubleshooting
}

D. Reminder System
COMPLIANCE_REMINDER_ENGINE {
  # Cron job runs daily at 9am WAT
  
  DAILY_CHECK:
    1. Query all compliance_filings WHERE:
        - status IN ('pending', 'calculated')
        - due_date IN (today + 7 days, today + 3 days, today + 1 day, today)
    
    2. For each filing:
        - Check company notification preferences
        - Get list of admins/accountants for company
        - Determine urgency:
            - 7 days: priority = 'low'
            - 3 days: priority = 'normal'
            - 1 day: priority = 'high'
            - 0 days (due today): priority = 'critical'
        
        3. Create notification:
            - title: "PAYE Due in 3 Days"
            - message: "₦450,000 due on Jan 10. File now to avoid penalties."
            - action_url: "/compliance/filing/[id]"
            - channels: {email: true, sms: (if priority='critical'), whatsapp: true}
        
        4. Send via configured channels:
            - Email: Via SendGrid/Mailgun
            - SMS: Via Termii/Africa's Talking
            - WhatsApp: Via Twilio WhatsApp API
            - Push: Via Firebase Cloud Messaging
        
        5. Mark reminder as sent:
            - reminder_sent_at = NOW()
            - Prevent duplicate sends
  
  OVERDUE_HANDLING:
    1. Query filings WHERE:
        - due_date < today
        - status != 'paid'
    
    2. Update status = 'overdue'
    
    3. Send escalation notification:
        - "URGENT: PAYE Overdue - Penalties May Apply"
        - Calculate estimated penalty (if known)
        - Offer expedited filing assistance
}


MODULE 5: Subscription & Billing
Key Flows:
A. Subscription Upgrade
UPGRADE_SUBSCRIPTION {
  INPUT: company_id, new_plan ('pro' or 'enterprise'), billing_cycle ('monthly' or 'annually')
  
  STEP_1_VALIDATION:
    - Check current plan
    - Prevent downgrade via this flow (separate flow)
    - Calculate prorated amount if mid-cycle
  
  STEP_2_PRICING:
    IF billing_cycle = 'monthly':
      - amount = 15000 NGN
    ELSE IF billing_cycle = 'annually':
      - amount = 150000 NGN (2 months free)
    
    IF prorated:
      - days_remaining = billing_period_end - today
      - prorated_credit = (days_remaining / 30) * current_plan_amount
      - amount_due = amount - prorated_credit
  
  STEP_3_PAYMENT:
    - Initiate Paystack transaction:
        POST https://api.paystack.co/transaction/initialize
        {
          email: company.email,
          amount: amount_due * 100, # Kobo
          reference: generate_unique_ref(),
          callback_url: "https://app.compliancehub.ng/billing/callback"
        }
    
    - Redirect user to Paystack payment page
    - User completes payment
  
  STEP_4_WEBHOOK_HANDLING:
    ON_WEBHOOK: transaction.success
    
    1. Verify transaction via Paystack API
    2. UPDATE companies SET:
        - subscription_tier = 'pro'
        - subscription_status = 'active'
        - billing_period_start = NOW()
        - billing_period_end = NOW() + 30 days (or 365 days)
        - next_billing_date = billing_period_end
    
    3. INSERT into subscriptions table (history)
    4. INSERT into payment_transactions (record payment)
    5. Enable Pro features immediately
    6. Send confirmation email with invoice
    7. Log audit: "Upgraded to Pro by User X"
  
  RETURN: Success message + invoice
}

B. Recurring Billing
RECURRING_BILLING_JOB {
  # Cron job runs daily at 2am WAT
  
  DAILY_CHECK:
    1. Query companies WHERE:
        - next_billing_date = today
        - subscription_status = 'active'
        - subscription_tier IN ('pro', 'enterprise')
    
    2. For each company:
        TRY:
          - Get saved payment method (card token from Paystack)
          - Initiate charge via Paystack:
              POST /transaction/charge_authorization
              {
                authorization_code: saved_token,
                email: company.email,
                amount: subscription_amount * 100
              }
          
          IF SUCCESS:
            - Extend billing_period_end + 30 days
            - Set next_billing_date
            - INSERT payment_transaction (status='successful')
            - Send receipt email
            - payment_retry_count = 0
          
          IF FAILED:
            - payment_retry_count += 1
            - INSERT payment_transaction (status='failed')
            
            IF retry_count == 1:
              - Send "Payment failed" email with update card link
              - Schedule retry in 3 days
            
            IF retry_count == 2:
              - Send "Urgent: Update payment method" email
              - Schedule retry in 3 days
            
            IF retry_count == 3:
              - subscription_status = 'suspended'
              - grace_period_end = today + 7 days
              - Send "Service suspended" email
              - Disable Pro features (read-only mode)
            
        CATCH ERROR:
          - Log error
          - Notify admin team for manual intervention
}

C. Grace Period Handling
GRACE_PERIOD_MANAGEMENT {
  # Cron job runs daily
  
  CHECK_SUSPENDED_ACCOUNTS:
    1. Query companies WHERE:
        - subscription_status = 'suspended'
        - grace_period_end <= today
    
    2. For each company:
        - subscription_status = 'cancelled'
        - subscription_tier = 'free'
        - Disable Pro features completely
        - Keep data intact (90-day retention)
        - Send "Subscription cancelled" email
        - Offer win-back discount (20% off if reactivate within 14 days)
  
  REACTIVATION_OPTION:
    IF user updates payment method during grace period:
      - Attempt immediate charge
      - If successful:
          - subscription_status = 'active'
          - Clear grace_period_end
          - Re-enable Pro features
          - Send "Welcome back" email
}


MODULE 6: Feature Flags & Tier Management
Key Flow:
FEATURE_FLAG_CHECK {
  # Called on every feature access
  
  INPUT: feature_key (e.g., 'auto_paye_filing'), company_id
  
  PROCESSING:
    1. Query feature_flags WHERE feature_key = X
    2. Check is_active = TRUE
    3. Check company.subscription_tier IN feature.enabled_for_tiers
    4. If is_beta = TRUE:
        - Check if company_id IN beta_access_companies
    5. Check rollout_percentage:
        - Generate hash of company_id
        - If hash % 100 < rollout_percentage: ALLOW
        - Else: DENY (for gradual rollouts)
    
    IF ALL CHECKS PASS:
      - RETURN: feature_enabled = TRUE
    ELSE:
      - RETURN: feature_enabled = FALSE
      - REASON: "Upgrade to Pro" or "Coming soon" or "Not in beta"
  
  UI_HANDLING:
    - If feature disabled:
        - Show feature with lock icon
        - Tooltip: "Upgrade to Pro to unlock"
        - Click opens upgrade modal
}


MODULE 7: Notifications & Reminders
Notification Types & Triggers:
NOTIFICATION_TRIGGERS {
  
  1. COMPLIANCE_DEADLINE:
      WHEN: 7, 3, 1 days before due_date
      TO: All admins + accountants
      CHANNELS: Email, Push, WhatsApp (if critical)
      MESSAGE: "PAYE due in 3 days - ₦450,000"
  
  2. PAYROLL_READY:
      WHEN: Payroll status = 'calculated'
      TO: Company admin
      CHANNELS: Email, Push
      MESSAGE: "December payroll ready for approval - ₦2.4m"
  
  3. SUBSCRIPTION_EXPIRY:
      WHEN: 7, 3, 1 days before billing_period_end
      TO: Company admin
      CHANNELS: Email, SMS (if critical)
      MESSAGE: "Your Pro subscription renews on Jan 18 - ₦15k"
  
  4. PAYMENT_FAILED:
      WHEN: Recurring payment fails
      TO: Company admin + billing contact
      CHANNELS: Email, SMS
      MESSAGE: "Payment failed - Update card to continue service"
  
  5. DOCUMENT_UPLOADED:
      WHEN: User uploads compliance receipt
      TO: Accountant (if different from uploader)
      CHANNELS: Email, Push
      MESSAGE: "Payment receipt uploaded for PAYE Dec 2025"
  
  6. EMPLOYEE_ADDED:
      WHEN: New employee created
      TO: Accountant, HR staff
      CHANNELS: Email
      MESSAGE: "New employee John Doe added to payroll"
  
  7. FEATURE_ANNOUNCEMENT:
      WHEN: Admin publishes new feature
      TO: All users
      CHANNELS: In-app banner, Email
      MESSAGE: "New: Auto-file VAT returns now available!"
}


MODULE 8: Audit & Logging
AUDIT_LOGGING {
  # Log EVERYTHING for compliance
  
  LOGGED_ACTIONS:
    - User login/logout
    - Role changes
    - Employee CRUD
    - Payroll run/approve/pay
    - Compliance filing
    - Document upload/delete
    - Settings changes
    - API calls
    - Payment transactions
  
  LOG_STRUCTURE:
    {
      timestamp: "2025-12-18T10:30:00Z",
      user_id: "uuid",
      user_name: "John Doe",
      company_id: "uuid",
      action: "APPROVE_PAYROLL",
      entity_type: "payroll_run",
      entity_id: "uuid",
      description: "Approved December 2025 payroll (₦2.4m)",
      changes: {
        before: {status: 'draft'},
        after: {status: 'approved', approved_by: 'uuid'}
      },
      ip_address: "102.89.2.105",
      user_agent: "Mozilla/5.0..."
    }
  
  RETENTION:
    - Keep audit logs indefinitely (compliance requirement)
    - Index by company_id, timestamp for fast queries
    - Provide "Audit Trail" report for download
}


7. 30-Day Development Roadmap
Team Composition (Recommended)
1 Full-Stack Developer (Lead)
1 Frontend Developer (React/React Native)
1 Backend Developer (Node.js/Python)
1 UI/UX Designer (Part-time)
1 QA Tester (Week 3-4)
Week 1: Foundation (Days 1-7)
Day 1-2: Project Setup & Architecture
Initialize repositories (web + mobile)
Set up development environment
Configure CI/CD pipeline (GitHub Actions)
Database design finalization
Choose tech stack:
Frontend: Next.js 14 (web) + React Native (mobile)
Backend: Node.js + Express + PostgreSQL
Auth: NextAuth.js / Firebase Auth
Payments: Paystack SDK
Hosting: Vercel (web) + Railway/Render (API)
Day 3-4: Database & Authentication
Create database schema (all tables)
Seed Nigerian compliance obligations
Implement user registration
Implement login with JWT
Email verification flow
Password reset functionality
Role-based middleware
Day 5-7: Core UI Components
Design system setup (Tailwind + custom theme)
Glassmorphism components library
Navigation structure (sidebar, bottom nav)
Dashboard layout skeleton
Form components (inputs, selects, date pickers)
Button variations with micro-interactions
Loading states (shimmer, spinners)
Empty states illustrations
Deliverable: Working auth flow, empty dashboard, component library

Week 2: Employee & Payroll MVP (Days 8-14)
Day 8-9: Employee Management
Employee list screen (CRUD)
Add/Edit employee forms
Employee detail view
Data validation
Employee search & filter
Basic document upload (employee contracts)
Day 10-12: Payroll Core
Payroll run configuration screen
PAYE calculation engine (Nigerian tax bands)
Pension calculation (8% + 10%)
NHF, NSITF, ITF calculations
Payroll items table generation
Payroll review screen
Approval workflow
Day 13-14: Payroll Output
Payslip PDF generation
Payslip email sending (SendGrid/Mailgun)
Payment schedule export (Excel)
Payroll history list
Basic payroll reports
Deliverable: End-to-end payroll processing (manual payment)

Week 3: Compliance & Subscriptions (Days 15-21)
Day 15-16: Compliance Automation
Compliance calendar UI
Auto-calculate compliance amounts post-payroll
Compliance obligation detail screens
Manual filing assistance (step-by-step guide)
Document upload for receipts
Compliance history
Day 17-18: Subscription & Billing
Plan selection screen
Paystack integration (test mode)
Subscription upgrade flow
Payment webhook handling
Invoice generation
Billing history
Grace period logic
Day 19-20: Feature Flags & Tier Enforcement
Feature flags table & management
Tier-based access control
Upgrade prompts (modals)
Free vs Pro feature differentiation
Usage limits enforcement (employee count)
Day 21: Dashboard & Notifications
Dashboard widgets (compliance health, deadlines, payroll summary)
Notification system (in-app)
Email notification triggers
Reminder scheduling (cron jobs)
Deliverable: Full Free tier + Pro upgrade flow + compliance tracking

Week 4: Polish, Testing & Launch Prep (Days 22-30)
Day 22-23: Learning & Support
Learning hub UI
Seed initial articles (PAYE guide, Payroll 101)
FAQ section
Contact support form
WhatsApp integration (link)
Day 24-25: Mobile App (React Native)
Port core screens to mobile:
Dashboard
Employee list
Payroll run (view only)
Compliance calendar
Notifications
Bottom navigation
Dark mode toggle
Push notifications setup (Firebase)
Day 26: Onboarding & Coach Marks
Welcome flow (sign up → company setup → plan selection)
First-time user tooltips
Interactive product tour
Onboarding checklist
Day 27: Testing & Bug Fixes
QA testing (manual + automated)
Cross-browser testing (Chrome, Safari, Edge)
Mobile device testing (iOS + Android)
Payment flow testing (Paystack test mode)
Load testing (basic)
Security audit (OWASP top 10)
Day 28: Performance Optimization
Frontend optimization (code splitting, lazy loading)
API response caching
Database query optimization (indexes)
Image optimization
Lighthouse score > 90
Day 29: Documentation & Deployment
API documentation (Swagger/Postman)
User guide (PDF/web)
Admin panel for super admin
Production environment setup
Domain configuration (SSL)
Analytics setup (Google Analytics / Mixpanel)
Day 30: Soft Launch
Deploy to production
Invite 10 beta users (friends, family, small businesses)
Monitor errors (Sentry)
Collect feedback
Prepare marketing materials
Deliverable: Fully functional MVP on web + mobile, ready for public beta

MVP vs Future Features
MVP (30 Days): ✅ Employee management ✅ Payroll processing (PAYE, Pension, NHF) ✅ Compliance tracking (PAYE, Pension, NSITF, ITF) ✅ Document storage ✅ Notifications & reminders ✅ Subscriptions (Free + Pro) ✅ Learning resources ✅ Manual filing assistance
Post-MVP (Phase 2 - Months 2-3):
Auto-filing API integration (FIRS, Pension Commission)
Bank integration for payment processing
VAT module
WHT tracking
Multi-company support (Enterprise)
API access for third-party integrations
Advanced analytics & forecasting
Accountant collaboration portal
Employee self-service portal
Phase 3 (Months 4-6):
AI-powered compliance advisor
Predictive cash flow modeling
Expense tracking integration
Invoice management
HR modules (leave, attendance)
Slack/Teams integration
White-label option (for agencies)

8. Financial Projections
Assumptions
Market Size:


Total addressable SMEs in Nigeria: 41 million (SMEDAN 2021)
Target: SMEs with 5-50 employees: ~500,000
Reachable via digital channels: ~100,000 (20%)
Conversion Funnel:


Website visitors → Sign-ups: 10%
Free users → Pro (first 3 months): 15%
Free users → Pro (months 4-12): 5% monthly
Annual churn: 25% (industry average for SaaS)
Pricing:


Pro Monthly: ₦15,000/month
Pro Annual: ₦150,000/year (₦12,500/month effective)
Enterprise: ₦75,000/month average (custom)
Customer Acquisition:


Month 1-3: Beta (organic + referrals)
Month 4-6: Paid ads (Facebook, Google, LinkedIn)
Month 7-12: Content marketing + partnerships
CAC Target: ₦30,000 (2-month payback for Pro)
Operational Costs:


Infrastructure (AWS/Vercel): ₦200k/month
Team salaries (5 people): ₦3m/month
Marketing: ₦500k/month (months 1-3), ₦2m/month (months 4-12)
Misc (legal, admin): ₦300k/month

12-Month Revenue Projection
Month
New Sign-ups
Total Free Users
Free→Pro Conversions
Total Pro Users
Total Enterprise
Monthly Revenue (₦)
Cumulative Revenue (₦)
1
50
50
0
0
0
0
0
2
100
145
5 (from Month 1)
5
0
75,000
75,000
3
150
280
15
20
0
300,000
375,000
4
200
455
30
48 (2 churned)
1
795,000
1,170,000
5
250
675
40
85 (3 churned)
2
1,425,000
2,595,000
6
300
940
50
130 (5 churned)
3
2,175,000
4,770,000
7
350
1,260
60
185 (5 churned)
4
3,075,000
7,845,000
8
400
1,640
70
248 (7 churned)
5
4,095,000
11,940,000
9
450
2,070
80
318 (10 churned)
6
5,220,000
17,160,000
10
500
2,550
90
395 (13 churned)
7
6,450,000
23,610,000
11
550
3,085
100
482 (13 churned)
8
7,830,000
31,440,000
12
600
3,670
110
577 (15 churned)
10
9,405,000
40,845,000

Revenue Breakdown (Month 12):
Pro Monthly (400 users × ₦15k): ₦6,000,000
Pro Annual (177 users × ₦12.5k): ₦2,212,500
Enterprise (10 users × ₦75k): ₦750,000
Total MRR (Month 12): ₦8,962,500
ARR (Annual Run Rate): ₦107,550,000

Cost Breakdown (12 Months)
Category
Monthly Cost (₦)
Annual Cost (₦)
Salaries (5 people)
3,000,000
36,000,000
Infrastructure
200,000
2,400,000
Marketing (Avg)
1,500,000
18,000,000
Payment Processing (2.9%)
~260,000 (Month 12)
~1,200,000
Legal & Admin
300,000
3,600,000
Total Monthly (Avg)
5,260,000
61,200,000


Profitability Analysis
Metric
Month 6
Month 12
Year 2 (Projected)
Monthly Revenue
₦2,175,000
₦9,405,000
₦25,000,000
Monthly Costs
₦5,000,000
₦5,260,000
₦8,000,000
Monthly Profit
(₦2,825,000)
₦4,145,000
₦17,000,000
Break-Even Month
-
Month 9
-
Cumulative Profit
(₦22,230,000)
(₦20,355,000)
₦84,000,000

Key Insights:
Break-even at Month 9 (~₦5.2m MRR)
Cumulative loss first year: ₦20m (requires funding)
Profitable from Month 10 onwards
Year 2: ₦204m revenue, 40% margin

Unit Economics
Per Pro User (Monthly Plan):
Revenue: ₦15,000/month
Gross Margin: ₦14,565 (after payment processing)
CAC: ₦30,000
Payback Period: 2.1 months
LTV (24-month lifespan, 25% churn): ₦291,300
LTV:CAC Ratio: 9.7:1 ✅ (>3 is healthy)
Per Enterprise User:
Revenue: ₦75,000/month
Gross Margin: ₦72,825
CAC: ₦150,000 (higher touch sales)
Payback Period: 2.1 months
LTV (36-month lifespan,15% churn): ₦2,187,750
LTV:CAC Ratio: 14.6:1 ✅ (excellent)

Funding Requirements
Seed Round (₦25-30m):
12-month runway
Covers initial losses until break-even
Marketing budget for customer acquisition
Team expansion (2 additional developers)
Use of Funds:
Product development: 40% (₦12m)
Marketing & sales: 35% (₦10.5m)
Operations: 15% (₦4.5m)
Reserve: 10% (₦3m)

9. Go-To-Market (GTM) Strategy
Phase 1: Pre-Launch (Weeks 1-4)
Objectives:
Build anticipation
Collect 500+ waitlist emails
Validate product-market fit
Tactics:
Landing Page:


Headline: "Nigerian SME Compliance, Simplified"
Value props: Save time, avoid penalties, stay audit-ready
Waitlist form with early bird offer
Explainer video (2 min)
Social proof: "Join 500+ SMEs waiting"
Content Marketing:


Blog articles:
"The Complete Guide to PAYE in Nigeria (2025)"
"10 Compliance Mistakes Nigerian SMEs Make"
"How Much Should Your Startup Budget for Compliance?"
SEO optimization for keywords: "PAYE calculator Nigeria", "compliance software SME"
Guest posts on TechCabal, Nairametrics
Social Media:


Twitter: Daily compliance tips, countdown to launch
LinkedIn: Thought leadership on SME challenges
Instagram: Infographics, behind-the-scenes
Create hashtag: #ComplianceMadeEasy
Partnership Outreach:


Contact 20 accounting firms for pilot program
Reach out to startup incubators (CcHUB, Ventures Platform)
Partner with SME associations (NASME, SMEDAN)
Beta Program:


Invite 20 businesses for closed beta (Days 28-30)
Offer lifetime 50% discount for feedback
Conduct user interviews
Metrics:
Waitlist sign-ups: 500
Beta users: 20
Social followers: 1,000 (Twitter + LinkedIn)

Phase 2: Launch (Month 1-2)
Objectives:
Convert waitlist to Free users
Achieve 100 Pro subscribers
Generate buzz
Tactics:
Product Hunt Launch:


Prepare hunter, assets (screenshots, video)
Launch on Tuesday/Wednesday
Goal: Top 5 Product of the Day
Offer: Free Pro for 3 months (first 50 users)
PR & Media:


Press release to TechCabal, Techpoint, Ventures Africa
Pitch story: "YC startup tackles Nigeria's $500m compliance problem"
Founder interviews on podcasts (e.g., Afrobytes, Technext)
Email Campaign:


Send to waitlist: "We're live! Claim your free Pro trial"
3-email drip: Day 1 (launch), Day 3 (features), Day 7 (success stories)
Personalized for accountants vs business owners
Paid Ads (Soft Launch):


Facebook/Instagram: Target SME owners, 25-45, Lagos/Abuja
Google Ads: Bid on "PAYE calculator", "compliance software"
Budget: ₦200k/month (testing)
Landing page A/B testing
Referral Program:


Incentive: Refer 3 users → Get 1 month free Pro
Built-in sharing (WhatsApp, email)
Leaderboard: Top referrers win prizes
Community Engagement:


Host webinar: "Mastering PAYE Compliance in 2025" (100 attendees)
Create WhatsApp group for users (peer support)
Weekly "Ask Me Anything" on Twitter Spaces
Metrics:
Total users: 150 (100 Free, 50 Pro)
MRR: ₦750k
CAC: ₦25k (below target)
Activation rate (complete onboarding): 70%

Phase 3: Early Growth (Month 3-6)
Objectives:
Scale to 500 Pro users
Reduce churn below 5%/month
Establish thought leadership
Tactics:
Performance Marketing Scale-Up:


Increase ad budget: ₦1m/month
Expand platforms: LinkedIn Ads (target accountants)
Retargeting campaigns (website visitors, Free users)
Lookalike audiences based on Pro users
Accountant-as-Champion Strategy:


Launch "Accountant Partner Program"
Commission: 20% recurring revenue for referrals
Co-branded marketing materials
Exclusive training & certification
Goal: 50 accountant partners managing 10 clients each = 500 users
Content Flywheel:


Publish 3 articles/week (SEO-optimized)
YouTube channel: Tutorial videos (payroll setup, filing walkthrough)
Case studies: "How [Company] saved 20 hours/month"
Compliance newsletter: Weekly tips (10k subscribers by Month 6)
Product-Led Growth:


Optimize Free→Pro conversion:
In-app prompts at key moments (e.g., after 2nd payroll: "Automate filing with Pro")
Feature comparison tooltips
Limited-time offers (20% off annual plan)
Improve onboarding: Personalized setup based on industry
Implement NPS surveys: Identify promoters for case studies
Partnerships:


Integrate with accounting software (QuickBooks, Xero via API)
Partner with banks for SME customers (Kuda, Carbon)
List on SME resource hubs (SMEDAN portal, etc.)
Events & Workshops:


Host monthly "Compliance Clinic" (online + in-person Lagos/Abuja)
Sponsor SME conferences (GITEX Africa, SME Summit)
Co-host with co-working spaces (WeWork, Ventures Platform)
Metrics:
Total users: 940 (675 Free, 130 Pro, 3 Enterprise)
MRR: ₦2.2m
CAC: ₦28k
Churn: 4%/month
NPS: 50+

Phase 4: Scaling (Month 7-12)
Objectives:
Reach 500+ Pro users
Launch Enterprise tier
Expand to 3 additional cities
Tactics:
Enterprise Sales Motion:


Hire 2 sales reps (commission-based)
Target: Accounting firms with 20+ SME clients
Outbound: Cold email, LinkedIn outreach
Demo strategy: Personalized 30-min product tour
Pilot program: Free for first month, then convert
Geo-Expansion:


Launch localized campaigns for Abuja, Port Harcourt, Ibadan
Partner with regional accountant associations
Sponsor local business events
Demand Generation:


Host virtual summit: "Future of SME Compliance" (500+ attendees)
Publish whitepaper: "The State of SME Compliance in Nigeria 2025"
Run LinkedIn Ads targeting CFOs, finance managers
Podcast sponsorships (business-focused podcasts)
Retention & Expansion:


Launch loyalty program: Annual plan subscribers get exclusive perks
Upsell features: API access, custom reports (add-ons)
Customer success team: Proactive check-ins for Enterprise users
Quarterly business reviews (QBRs) with Enterprise clients
User-Generated Content:


Create ambassador program: 20 power users
Encourage reviews on Google, Trustpilot, Capterra
Feature user testimonials on website (video + text)
Social media challenges (e.g., "#PayrollDoneRight")
Platform Expansion:


Mobile app launch (if not in MVP)
API documentation for developers
Zapier integration (connect to 1000+ apps)
Metrics:
Total users: 3,670 (3,000 Free, 577 Pro, 10 Enterprise)
MRR: ₦9.4m
CAC: ₦30k
Churn: 3%/month
Customer satisfaction (CSAT): 90%+

Phase 5: Retention & Advocacy (Ongoing)
Objectives:
Reduce churn to <2%/month
Increase LTV by 50%
Turn customers into evangelists
Tactics:
Customer Success:


Automated health scoring (usage, engagement, support tickets)
Proactive interventions for at-risk users
Personalized onboarding for new features
Celebrate milestones (e.g., "You've filed 12 compliances on time!")
Education & Certification:


Launch "ComplianceHub Academy": Online courses
Offer certification: "Certified Compliance Pro"
Live webinars with industry experts (FIRS officials, accountants)
Community Building:


User conference (annual): "ComplianceHub Summit"
Online community forum (Discourse/Circle)
Peer-to-peer support groups (by industry)
Feature spotlight: "User of the Month"
Feedback Loop:


Quarterly user surveys (product roadmap input)
Beta testing program for new features
Public roadmap (transparency)
Feature voting system
Referral & Advocacy:


Incentivized referrals: ₦5k credit per Pro referral
Case study program: Publish success stories
Review campaigns: Incentivize reviews (gift cards)
"Love ComplianceHub?" in-app prompts
Metrics:
Churn: 1.5%/month (best-in-class)
NPS: 60+ (industry-leading)
Referral rate: 30% of new users from referrals
Expansion MRR: 20% (upsells & add-ons)

GTM Metrics Dashboard
Track Weekly:
New sign-ups (Free)
Free → Pro conversions
Churn rate
MRR & ARR
CAC by channel
Activation rate (completed onboarding)
Track Monthly:
NPS score
CSAT score
Support ticket volume
Feature adoption rate
Website traffic & conversion rate
Social media engagement
Track Quarterly:
LTV:CAC ratio
Payback period
Gross margin
Customer cohort retention
Market share (vs competitors)

10. Branding
Brand Name Options
Primary Recommendation: ComplianceHub
Clear, descriptive, professional
Domain: compliancehub.ng (or .com.ng)
Easy to spell, remember, and pronounce

Taglines
Primary: "Nigerian SME Compliance, Simplified"
Clear value proposition
Target audience explicit
Benefit-focused
Alternatives:
"Never Miss a Deadline Again" (pain-focused)
"Automate Tax, Payroll & Compliance" (feature-focused)
"Your Compliance Co-Pilot" (relationship-focused)
"Compliance Peace of Mind" (emotional benefit)

Domain Strategy
Primary Domain: compliancehub.ng
Local trust (.ng extension)
Clean, professional
Social Media Handles:
Twitter: @ComplianceHubNG
Instagram: @ComplianceHubNG
LinkedIn: linkedin.com/company/compliancehub-nigeria
Facebook: facebook.com/ComplianceHubNG
Email Domain: hello@compliancehub.ng, support@compliancehub.ng

Brand Voice & Tone
Personality:
Professional but not stuffy
Helpful without being condescending
Confident without being arrogant
Empathetic to SME struggles
Nigerian but not overly localized (avoid heavy pidgin in core product)
Writing Guidelines:
DO:
Use simple language (avoid jargon)
Be conversational ("Let's run payroll" vs "Execute payroll processing")
Show empathy ("We know compliance is stressful")
Use active voice ("File your PAYE" vs "PAYE should be filed")
Provide context (explain why something matters)
DON'T:
Use fear tactics ("You'll go to jail!")
Oversimplify complex regulations
Make promises we can't keep ("100% audit-proof")
Use excessive emojis in professional contexts
Be overly casual in compliance matters
Example Microcopy:
Context
Bad
Good
Error message
"Invalid input"
"Oops! Please enter a valid TIN (11 digits)"
Empty state
"No employees"
"Add your first employee to get started with payroll"
Success
"Payroll approved"
"Great! December payroll approved. Employees will receive payslips via email."
Upgrade prompt
"Upgrade now!"
"Automate PAYE filing with Pro - Save 5 hours/month"


Brand Guidelines Document
Include:
Logo usage (clear space, minimum size, don'ts)
Color palette (hex codes, usage guidelines)
Typography (fonts, sizes, hierarchy)
Iconography (style, examples)
Photography (style: authentic Nigerian SMEs, bright, optimistic)
Tone of voice (examples per context)
Mockups (business cards, social media, app screenshots)

11. Key Technical Recommendations
Architecture Philosophy
1. Modular Monolith → Microservices
Start with monolithic backend (faster MVP)
Organize code in modules (Auth, Payroll, Compliance, Billing)
Each module has clear boundaries
Future: Extract high-load modules (e.g., Payroll engine) into microservices
/backend
  /modules
    /auth (signup, login, JWT)
    /employees (CRUD, search)
    /payroll (calculations, runs, items)
    /compliance (obligations, filings, reminders)
    /billing (subscriptions, payments)
    /notifications (email, SMS, push)
    /documents (upload, storage)
  /shared (database, utils, middleware)


2. Event-Driven Architecture
Use Event Bus for Decoupling:
// Example: Payroll Approved Event

// In payroll module
payrollService.approve(payrollRunId).then(() => {
  eventBus.publish('PAYROLL_APPROVED', {
    payrollRunId,
    companyId,
    period,
    totalPaye,
    totalPension
  });
});

// Listeners in other modules
eventBus.subscribe('PAYROLL_APPROVED', (data) => {
  // Compliance module: Auto-calculate obligations
  complianceService.calculatePAYE(data);
  complianceService.calculatePension(data);
  
  // Notification module: Alert admins
  notificationService.send({
    type: 'PAYROLL_READY',
    companyId: data.companyId
  });
  
  // Audit module: Log action
  auditService.log('PAYROLL_APPROVED', data);
});

Benefits:
Loose coupling between modules
Easy to add new features (just subscribe to events)
Better testability
Scalable (can move to RabbitMQ/Kafka later)

3. API-First Design

**Base URL**: `https://api.compliancehub.ng/api/v1`
**Authentication**: JWT Bearer Token in Authorization header
**All endpoints require**: `Authorization: Bearer {jwt_token}`

## Authentication Endpoints

### POST /auth/register
Register new user and create company
```
Request:
{
  "email": "user@company.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "companyName": "Acme Inc",
  "companyTin": "12345678901",
  "companyRcNumber": "RC123456"
}

Response (201):
{
  "success": true,
  "data": {
    "userId": "uuid",
    "companyId": "uuid",
    "accessToken": "jwt_token",
    "refreshToken": "jwt_token",
    "expiresIn": 900
  }
}
```

### POST /auth/login
Authenticate user
```
Request:
{
  "email": "user@company.com",
  "password": "SecurePass123!"
}

Response (200):
{
  "success": true,
  "data": {
    "userId": "uuid",
    "accessToken": "jwt_token",
    "refreshToken": "jwt_token",
    "expiresIn": 900,
    "companies": [
      {
        "id": "uuid",
        "name": "Acme Inc",
        "role": "super_admin"
      }
    ]
  }
}
```

### POST /auth/refresh
Refresh access token
```
Request (requires refresh_token in httpOnly cookie)
Response (200):
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token",
    "expiresIn": 900
  }
}
```

### POST /auth/logout
Logout user
```
Response (200):
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

## Companies Endpoints

### GET /companies
List all companies for user
```
Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Acme Inc",
      "tin": "12345678901",
      "rcNumber": "RC123456",
      "employees": 23,
      "subscriptionTier": "pro",
      "complianceStatus": "healthy"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### POST /companies
Create new company
```
Request:
{
  "name": "New Company Ltd",
  "tin": "12345678901",
  "rcNumber": "RC654321",
  "address": "123 Business Street, Lagos",
  "sector": "Technology"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "New Company Ltd",
    "subscriptionTier": "free"
  }
}
```

### GET /companies/:id
Get company details
```
Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Acme Inc",
    "tin": "12345678901",
    "rcNumber": "RC123456",
    "address": "123 Business Street, Lagos",
    "employees": 23,
    "subscriptionTier": "pro",
    "payrollDay": 25,
    "fiscalYearEnd": "2024-12-31"
  }
}
```

### PATCH /companies/:id
Update company
```
Request:
{
  "address": "456 New Address, Abuja",
  "payrollDay": 20
}

Response (200):
{
  "success": true,
  "data": { ...updated company }
}
```

### GET /companies/:id/settings
Get company settings
```
Response (200):
{
  "success": true,
  "data": {
    "payrollDay": 25,
    "payrollApprovalRequired": true,
    "autoGeneratePayslips": true,
    "autoFilePaye": false,
    "autoCalculatePension": true,
    "deadlineReminderDays": [7, 3, 1]
  }
}
```

### GET /companies/:id/users
List company team members
```
Query Parameters:
- role: 'super_admin' | 'company_admin' | 'accountant' | 'staff' | 'read_only'
- page, limit

Response (200):
{
  "success": true,
  "data": [
    {
      "userId": "uuid",
      "email": "user@company.com",
      "firstName": "John",
      "role": "company_admin",
      "joinedAt": "2025-12-18T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

### POST /companies/:id/invite
Invite user to company
```
Request:
{
  "email": "newuser@company.com",
  "role": "accountant"
}

Response (201):
{
  "success": true,
  "data": {
    "invitationId": "uuid",
    "email": "newuser@company.com",
    "role": "accountant",
    "expiresAt": "2026-01-17T10:30:00Z"
  }
}
```

### DELETE /companies/:id/users/:userId
Remove user from company
```
Response (200):
{
  "success": true,
  "data": {
    "message": "User removed from company"
  }
}
```

### GET /companies/:id/compliance-summary
Get compliance dashboard data
```
Response (200):
{
  "success": true,
  "data": {
    "totalObligations": 6,
    "overdue": 0,
    "dueThisWeek": 2,
    "dueThisMonth": 3,
    "filedThisYear": 18,
    "latestFiling": {
      "type": "PAYE",
      "period": "December 2025",
      "status": "filed",
      "amount": "₦450,000"
    }
  }
}
```

### GET /companies/:id/payroll-summary
Get payroll dashboard data
```
Response (200):
{
  "success": true,
  "data": {
    "ytdPayroll": "₦28,500,000",
    "ytdPaye": "₦3,600,000",
    "ytdPension": "₦2,280,000",
    "employees": 23,
    "lastPayrollDate": "2025-12-18",
    "nextPayrollDue": "2026-01-25"
  }
}
```

---

## Employees Endpoints

### GET /companies/:companyId/employees
List all employees
```
Query Parameters:
- page: number (default: 1)
- limit: number (default: 20)
- search: string (name, email, employee code)
- department: string
- status: 'active' | 'inactive'

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "employeeCode": "EMP001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@company.com",
      "department": "Engineering",
      "jobTitle": "Senior Developer",
      "grossSalary": "₦500,000",
      "employmentStatus": "active",
      "dateOfBirth": "1990-05-15"
    }
  ],
  "pagination": { ... }
}
```

### POST /companies/:companyId/employees
Create new employee
```
Request:
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@company.com",
  "department": "Finance",
  "jobTitle": "Accountant",
  "grossSalary": 450000,
  "employmentStartDate": "2025-01-01",
  "employmentType": "full-time",
  "bankName": "First Bank",
  "accountNumber": "1234567890",
  "accountName": "Jane Smith",
  "taxId": "12345678901"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "employeeCode": "EMP002",
    "firstName": "Jane",
    "createdAt": "2025-12-18T10:30:00Z"
  }
}
```

### GET /companies/:companyId/employees/:id
Get employee details
```
Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "employeeCode": "EMP001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@company.com",
    "department": "Engineering",
    "jobTitle": "Senior Developer",
    "grossSalary": 500000,
    "salaryFrequency": "monthly",
    "bankName": "First Bank",
    "accountNumber": "0123456789",
    "accountName": "John Doe",
    "taxId": "12345678901",
    "pensionPin": "PIN123456",
    "pensionProvider": "FIDELITY",
    "allowances": [
      { "type": "Housing", "amount": 100000, "taxable": false },
      { "type": "Transport", "amount": 50000, "taxable": true }
    ]
  }
}
```

### PATCH /companies/:companyId/employees/:id
Update employee
```
Request:
{
  "jobTitle": "Lead Developer",
  "department": "Technical"
}

Response (200):
{
  "success": true,
  "data": { ...updated employee }
}
```

### DELETE /companies/:companyId/employees/:id
Soft delete employee
```
Response (200):
{
  "success": true,
  "data": {
    "message": "Employee deactivated",
    "id": "uuid"
  }
}
```

### GET /companies/:companyId/employees/:id/tax-relief
Get employee tax relief claims
```
Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "CRA",
      "amount": 200000,
      "status": "approved",
      "claimedAt": "2025-01-15"
    }
  ]
}
```

### GET /companies/:companyId/employees/:id/payroll-history
Get 12-month payroll history
```
Response (200):
{
  "success": true,
  "data": [
    {
      "period": "December 2025",
      "grossSalary": 500000,
      "paye": 45000,
      "pension": 40000,
      "deductions": 15000,
      "netPay": 400000,
      "payslipUrl": "https://..."
    }
  ]
}
```

---

## Payroll Endpoints

### GET /companies/:companyId/payroll/runs
List all payroll runs
```
Query Parameters:
- page, limit
- status: 'draft' | 'calculated' | 'approved' | 'paid'
- year: number
- month: number

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "period": "December 2025",
      "status": "approved",
      "totalGross": "₦11,500,000",
      "totalNet": "₦9,200,000",
      "totalPaye": "₦1,150,000",
      "employees": 23,
      "approvedAt": "2025-12-18T10:30:00Z",
      "approvedBy": "John Admin"
    }
  ],
  "pagination": { ... }
}
```

### POST /companies/:companyId/payroll/runs
Create new payroll run
```
Request:
{
  "period": "2025-12",
  "paymentDate": "2025-12-25",
  "includeEmployees": ["emp_uuid_1", "emp_uuid_2"],
  "bonuses": [
    { "employeeId": "uuid", "amount": 50000, "reason": "Year-end bonus" }
  ],
  "deductions": [
    { "employeeId": "uuid", "amount": 10000, "reason": "Loan repayment" }
  ]
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "period": "December 2025",
    "status": "draft"
  }
}
```

### GET /companies/:companyId/payroll/runs/:id
Get payroll run details
```
Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "period": "December 2025",
    "status": "approved",
    "totalGross": 11500000,
    "totalDeductions": 2300000,
    "totalNet": 9200000,
    "totalPaye": 1150000,
    "totalPension": 920000,
    "employees": 23
  }
}
```

### POST /companies/:companyId/payroll/runs/:id/calculate
Calculate payroll amounts
```
Request: {} (uses run configuration)

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "calculated",
    "summary": {
      "totalGross": 11500000,
      "totalPaye": 1150000,
      "totalNet": 9200000
    },
    "readyForReview": true
  }
}
```

### POST /companies/:companyId/payroll/runs/:id/approve
Approve payroll run
```
Request: {}

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "approved",
    "approvedAt": "2025-12-18T10:30:00Z",
    "approvedBy": "John Admin"
  }
}
```

### GET /companies/:companyId/payroll/runs/:id/items
Get individual payroll items
```
Query Parameters:
- page, limit

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "employeeCode": "EMP001",
      "employeeName": "John Doe",
      "grossSalary": 500000,
      "paye": 50000,
      "pension": 40000,
      "netPay": 410000,
      "payslipUrl": "https://..."
    }
  ],
  "pagination": { ... }
}
```

### GET /companies/:companyId/payroll/summary
Get YTD payroll summary
```
Query Parameters:
- year: number
- department: string (optional)

Response (200):
{
  "success": true,
  "data": {
    "year": 2025,
    "totalPayroll": "₦114,000,000",
    "totalPaye": "₦11,400,000",
    "totalPension": "₦9,120,000",
    "runsCompleted": 12,
    "employeesPayrolled": 23
  }
}
```

---

## Compliance Endpoints

### GET /companies/:companyId/compliance/obligations
List all applicable obligations
```
Query Parameters:
- active: boolean (default: true)

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "PAYE",
      "obligationName": "Pay As You Earn",
      "description": "Monthly tax withholding",
      "agency": "FIRS",
      "frequency": "monthly",
      "dueDay": 10,
      "dueMonth": null,
      "appliesToCompany": true
    },
    {
      "type": "PENSION",
      "obligationName": "Pension Contribution",
      "description": "8% employee + 10% employer",
      "frequency": "monthly",
      "dueDay": 15
    },
    {
      "type": "VAT",
      "obligationName": "Value Added Tax",
      "frequency": "quarterly",
      "dueMonth": [3, 6, 9, 12]
    }
  ]
}
```

### GET /companies/:companyId/compliance/filings
List compliance filings
```
Query Parameters:
- status: 'pending' | 'filed' | 'paid'
- year: number
- type: string

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "PAYE",
      "period": "December 2025",
      "dueDate": "2026-01-10",
      "status": "filed",
      "amount": "₦450,000",
      "filedDate": "2026-01-05",
      "paidAmount": "₦450,000",
      "paidDate": "2026-01-08"
    }
  ]
}
```

### POST /companies/:companyId/compliance/filings
Create filing
```
Request:
{
  "obligationId": "uuid",
  "filingPeriod": "2025-12",
  "calculatedAmount": 450000
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "calculated",
    "amount": 450000
  }
}
```

### PUT /companies/:companyId/compliance/filings/:id/submit
Mark filing as filed
```
Request:
{
  "filingReference": "FIRS-202512-4567"
}

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "filed",
    "filedDate": "2025-12-18T10:30:00Z",
    "filingReference": "FIRS-202512-4567"
  }
}
```

### PUT /companies/:companyId/compliance/filings/:id/mark-paid
Record payment
```
Request:
{
  "paymentDate": "2025-12-20",
  "paymentReference": "TRX123456"
}

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "paid",
    "paidDate": "2025-12-20T10:30:00Z"
  }
}
```

### GET /companies/:companyId/compliance/calendar
Get compliance calendar (month view)
```
Query Parameters:
- year: number
- month: number

Response (200):
{
  "success": true,
  "data": {
    "year": 2025,
    "month": 12,
    "deadlines": [
      {
        "date": "2026-01-10",
        "obligations": [
          { "type": "PAYE", "status": "pending" }
        ]
      }
    ]
  }
}
```

---

## Documents Endpoints

### POST /companies/:companyId/documents
Upload document
```
Request: multipart/form-data
- file: File
- documentType: string (CAC_CERT, TIN_CERT, RECEIPT, PAYSLIP, CONTRACT, etc.)
- documentName: string
- relatedEntityType: string (optional: company, employee, payroll_run, compliance_filing)
- relatedEntityId: string (optional)

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "documentName": "CAC Certificate",
    "documentType": "CAC_CERT",
    "fileSize": 2048576,
    "uploadedAt": "2025-12-18T10:30:00Z"
  }
}
```

### GET /companies/:companyId/documents
List documents
```
Query Parameters:
- page, limit
- documentType: string
- search: string

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "documentName": "CAC Certificate",
      "documentType": "CAC_CERT",
      "fileSize": 2048576,
      "uploadedAt": "2025-12-18T10:30:00Z",
      "uploadedBy": "John Doe"
    }
  ],
  "pagination": { ... }
}
```

### GET /companies/:companyId/documents/:id
Get document details
```
Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "documentName": "CAC Certificate",
    "documentType": "CAC_CERT",
    "fileUrl": "https://...",
    "fileSize": 2048576,
    "uploadedAt": "2025-12-18T10:30:00Z",
    "relatedEntityType": "company",
    "relatedEntityId": "uuid"
  }
}
```

### GET /companies/:companyId/documents/:id/download
Download document
```
Response: File binary (application/pdf or image/png)
```

### GET /companies/:companyId/documents/entity/:entityType/:entityId
Get documents linked to entity
```
Response (200):
{
  "success": true,
  "data": [
    { ...document }
  ]
}
```

### DELETE /companies/:companyId/documents/:id
Delete document
```
Response (200):
{
  "success": true,
  "data": {
    "message": "Document deleted"
  }
}
```

---

## Notifications Endpoints

### GET /notifications
Get user notifications
```
Query Parameters:
- filter: 'all' | 'unread'
- page, limit

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "notificationType": "COMPLIANCE_DEADLINE",
      "title": "PAYE Due in 3 Days",
      "message": "PAYE for December 2025 is due on Jan 10",
      "isRead": false,
      "priority": "high",
      "createdAt": "2025-12-18T10:30:00Z",
      "actionUrl": "/compliance/filings/uuid"
    }
  ],
  "pagination": { ... }
}
```

### PATCH /notifications/:id/read
Mark single notification as read
```
Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "isRead": true
  }
}
```

### PATCH /notifications/read-all
Mark all notifications as read
```
Response (200):
{
  "success": true,
  "data": {
    "markedAsRead": 15
  }
}
```

### GET /notifications/unread-count
Get unread notification count
```
Response (200):
{
  "success": true,
  "data": {
    "unreadCount": 3
  }
}
```

### DELETE /notifications/:id
Delete notification
```
Response (200):
{
  "success": true,
  "data": {
    "message": "Notification deleted"
  }
}
```

### GET /notifications/preferences
Get notification preferences
```
Response (200):
{
  "success": true,
  "data": {
    "channels": {
      "email": true,
      "sms": false,
      "push": true,
      "whatsapp": false
    }
  }
}
```

### PATCH /notifications/preferences
Update notification preferences
```
Request:
{
  "channels": {
    "email": true,
    "sms": true,
    "push": true
  }
}

Response (200):
{
  "success": true,
  "data": { ...updated preferences }
}
```

---

## Subscriptions Endpoints

### GET /subscriptions/current
Get current subscription
```
Response (200):
{
  "success": true,
  "data": {
    "companyId": "uuid",
    "plan": "pro",
    "billingCycle": "monthly",
    "price": 15000,
    "status": "active",
    "nextBillingDate": "2026-01-18",
    "features": [
      "Auto-file PAYE",
      "Unlimited employees",
      "Priority support"
    ]
  }
}
```

### POST /subscriptions/upgrade
Initiate plan upgrade
```
Request:
{
  "newPlan": "pro",
  "billingCycle": "monthly"
}

Response (200):
{
  "success": true,
  "data": {
    "paymentUrl": "https://paystack.co/pay/...",
    "amount": 15000,
    "reference": "ref_123456"
  }
}
```

### GET /subscriptions/plans
Get available plans
```
Response (200):
{
  "success": true,
  "data": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "employees": 5,
      "storage": "100MB",
      "features": [
        "Manual payroll",
        "Basic compliance tracking"
      ]
    },
    {
      "id": "pro",
      "name": "Pro",
      "price": 15000,
      "employees": 50,
      "storage": "5GB",
      "features": [
        "Auto-calculate payroll",
        "Auto-file compliance",
        "Unlimited API calls"
      ]
    },
    {
      "id": "enterprise",
      "name": "Enterprise",
      "price": 75000,
      "employees": "Unlimited",
      "storage": "Unlimited",
      "features": [
        "Everything in Pro",
        "Multi-company",
        "Dedicated support"
      ]
    }
  ]
}
```

### GET /subscriptions/:companyId/usage
Get usage metrics
```
Response (200):
{
  "success": true,
  "data": {
    "tier": "pro",
    "usage": {
      "employees": {
        "used": 23,
        "limit": 50,
        "percentage": 46
      },
      "storage": {
        "used": 1.2,
        "limit": 5,
        "percentage": 24,
        "unit": "GB"
      },
      "apiCalls": {
        "used": 450,
        "limit": 1000,
        "percentage": 45
      }
    }
  }
}
```

### POST /subscriptions/cancel
Cancel subscription
```
Request:
{
  "cancellationReason": "Too expensive",
  "cancelAtPeriodEnd": false
}

Response (200):
{
  "success": true,
  "data": {
    "status": "cancelled",
    "effectiveDate": "2025-12-18T10:30:00Z",
    "message": "Your subscription has been cancelled"
  }
}
```

### GET /subscriptions/invoices
Get billing invoices
```
Query Parameters:
- page, limit

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "invoiceNumber": "INV-20251218-001",
      "date": "2025-12-18",
      "amount": 15000,
      "status": "paid",
      "paidDate": "2025-12-18",
      "downloadUrl": "https://..."
    }
  ],
  "pagination": { ... }
}
```

### POST /subscriptions/webhook/paystack
Webhook for Paystack payment confirmation
```
Request (from Paystack):
{
  "event": "charge.success",
  "data": {
    "id": 123456,
    "reference": "ref_123456",
    "amount": 1500000,
    "status": "success",
    "customer": {
      "email": "company@email.com"
    }
  }
}

Response (200):
{
  "status": "ok"
}
```

---

## Error Response Format

All errors follow this format:
```
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": {
      "field": "email",
      "value": "invalid-email",
      "error": "Must be a valid email"
    }
  }
}
```

## HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate record)
- **500**: Internal Server Error

## Rate Limiting

- **API Limit**: 100 requests per 15 minutes per company
- **Auth Limit**: 5 login attempts per 15 minutes
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

API Response Format:
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    ...
  },
  "meta": {
    "timestamp": "2025-12-18T10:30:00Z",
    "request_id": "req_12345"
  },
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}

Error Response:
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "field": "email",
    "details": {
      "provided": "invalid-email",
      "expected": "valid email address"
    }
  },
  "meta": {
    "timestamp": "2025-12-18T10:30:00Z",
    "request_id": "req_12345"
  }
}


4. Feature Flag Management
Implementation:
// Feature flag check middleware
async function checkFeature(featureKey) {
  return async (req, res, next) => {
    const { company_id } = req.user;
    
    const isEnabled = await featureFlagService.isEnabled(
      featureKey,
      company_id
    );
    
    if (!isEnabled) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FEATURE_DISABLED',
          message: 'This feature is not available on your plan',
          upgrade_required: true,
          feature: featureKey
        }
      });
    }
    
    next();
  };
}

// Usage in routes
router.post('/compliance/auto-file',
  authenticate,
  checkFeature('auto_paye_filing'),
  complianceController.autoFile
);

Feature Flag Configuration:
// In database or config file
const features = {
  'auto_paye_filing': {
    tiers: ['pro', 'enterprise'],
    isBeta: false,
    rollout: 100 // percentage
  },
  'multi_company': {
    tiers: ['enterprise'],
    isBeta: false,
    rollout: 100
  },
  'api_access': {
    tiers: ['pro', 'enterprise'],
    isBeta: false,
    rollout: 100
  },
  'ai_compliance_advisor': {
    tiers: ['enterprise'],
    isBeta: true,
    betaCompanies: ['company_uuid_1', 'company_uuid_2'],
    rollout: 10 // gradual rollout
  }
};


5. Audit-First Design
Every State Change Must Be Logged:
// Audit middleware (wrap all write operations)
function auditLog(action, entityType) {
  return async (req, res, next) => {
    // Store original response.json
    const originalJson = res.json.bind(res);
    
    res.json = function(body) {
      // Log after successful operation
      if (body.success) {
        auditService.log({
          userId: req.user.id,
          companyId: req.user.company_id,
          action,
          entityType,
          entityId: body.data?.id,
          changes: {
            before: req._before, // Set in controller
            after: body.data
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        });
      }
      
      originalJson(body);
    };
    
    next();
  };
}

// Usage
router.patch('/employees/:id',
  authenticate,
  auditLog('UPDATE', 'employee'),
  employeeController.update
);

Audit Query Examples:
// Who changed this employee's salary?
const logs = await auditService.query({
  entityType: 'employee',
  entityId: 'emp_123',
  action: 'UPDATE',
  field: 'gross_salary'
});

// What did User X do today?
const userActions = await auditService.query({
  userId: 'user_456',
  dateRange: { start: today, end: tomorrow }
});

// Full compliance trail for audit
const complianceTrail = await auditService.exportReport({
  companyId: 'company_789',
  dateRange: { start: '2025-01-01', end: '2025-12-31' },
  format: 'pdf'
});


6. Coach Marks & Onboarding System
Progressive Onboarding:
// Track user progress
const onboardingSteps = [
  { id: 'welcome', completed: false },
  { id: 'add_first_employee', completed: false },
  { id: 'run_first_payroll', completed: false },
  { id: 'review_compliance_calendar', completed: false },
  { id: 'explore_learning', completed: false }
];

// Show next incomplete step
function getNextOnboardingStep(user) {
  return onboardingSteps.find(step => 
    !user.onboarding_completed_steps.includes(step.id)
  );
}

// Mark step as complete
function completeStep(userId, stepId) {
  // Update database
  await db.users.update(userId, {
    onboarding_completed_steps: [...existing, stepId],
    onboarding_completed: allStepsComplete
  });
  
  // Show celebration if all complete
  if (allStepsComplete) {
    showConfetti();
    showModal('Onboarding Complete! You're ready to go.');
  }
}

Coach Mark Component (React):
// CoachMark.jsx
const CoachMark = ({ id, title, description, position, targetRef }) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    // Check if user has seen this coach mark
    const seen = localStorage.getItem(`coach_mark_${id}`);
    if (!seen) {
      setVisible(true);
    }
  }, [id]);
  
  const dismiss = () => {
    localStorage.setItem(`coach_mark_${id}`, 'true');
    setVisible(false);
  };
  
  if (!visible) return null;
  
  return (
    <Popover position={position} targetRef={targetRef}>
      <div className="coach-mark">
        <h4>{title}</h4>
        <p>{description}</p>
        <button onClick={dismiss}>Got it!</button>
      </div>
    </Popover>
  );
};

// Usage
<div ref={payrollButtonRef}>
  <button>Run Payroll</button>
  <CoachMark
    id="first_payroll"
    title="Run Your First Payroll"
    description="Click here to start. We'll calculate everything automatically."
    position="bottom"
    targetRef={payrollButtonRef}
  />
</div>


7. Performance Optimization
Database Optimization:
-- Critical indexes
CREATE INDEX CONCURRENTLY idx_employees_company_active 
  ON employees(company_id, is_active);

CREATE INDEX CONCURRENTLY idx_payroll_items_run_employee 
  ON payroll_items(payroll_run_id, employee_id);

CREATE INDEX CONCURRENTLY idx_compliance_filings_company_status_due 
  ON compliance_filings(company_id, status, due_date);

-- Materialized view for dashboard stats (refresh nightly)
CREATE MATERIALIZED VIEW company_stats AS
SELECT 
  company_id,
  COUNT(DISTINCT employee_id) as employee_count,
  SUM(CASE WHEN status='overdue' THEN 1 ELSE 0 END) as overdue_filings,
  SUM(CASE WHEN due_date <= CURRENT_DATE + 7 THEN 1 ELSE 0 END) as upcoming_deadlines
FROM compliance_filings
GROUP BY company_id;

Caching Strategy:
// Redis caching
const cache = {
  // Cache expensive calculations
  async getPayrollCalculation(payrollRunId) {
    const cacheKey = `payroll:${payrollRunId}:calculation`;
    const cached = await redis.get(cacheKey);
    
    if (cached) return JSON.parse(cached);
    
    const calculation = await payrollService.calculate(payrollRunId);
    await redis.setex(cacheKey, 3600, JSON.stringify(calculation)); // 1 hour
    
    return calculation;
  },
  
  // Invalidate on updates
  async invalidatePayroll(payrollRunId) {
    await redis.del(`payroll:${payrollRunId}:calculation`);
  }
};

API Response Optimization:
// Pagination
router.get('/employees', async (req, res) => {
  const { page = 1, per_page = 20, search, department } = req.query;
  
  const offset = (page - 1) * per_page;
  
  const [employees, total] = await Promise.all([
    db.employees.findMany({
      where: buildWhereClause(search, department),
      limit: per_page,
      offset,
      select: ['id', 'first_name', 'last_name', 'job_title'] // Only needed fields
    }),
    db.employees.count({ where: buildWhereClause(search, department) })
  ]);
  
  res.json({
    success: true,
    data: employees,
    pagination: {
      page,
      per_page,
      total,
      total_pages: Math.ceil(total / per_page)
    }
  });
});


8. Security Best Practices
Authentication:
// JWT with short expiry + refresh tokens
const accessToken = jwt.sign(
  { userId, companyId, role },
  process.env.JWT_SECRET,
  { expiresIn: '15m' } // Short-lived
);

const refreshToken = jwt.sign(
  { userId },
  process.env.REFRESH_SECRET,
  { expiresIn: '7d' }
);

// Store refresh token in httpOnly cookie
res.cookie('refresh_token', refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
});

Rate Limiting:
const rateLimit = require('express-rate-limit');

// API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  keyGenerator: (req) => req.user.company_id // Per company, not IP
});

// Stricter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts
  skipSuccessfulRequests: true
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

Input Validation:
const { body, validationResult } = require('express-validator');

router.post('/employees',
  [
    body('first_name').trim().notEmpty().isLength({ max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('gross_salary').isFloat({ min: 0 }).toFloat(),
    body('tax_id').optional().matches(/^\d{11}$/) // 11-digit TIN
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  employeeController.create
);


This comprehensive blueprint provides everything needed to build ComplianceHub from concept to launch. The 30-day roadmap is aggressive but achievable with a focused team. Key success factors: nail the payroll calculation accuracy, make onboarding seamless, and prioritize Nigerian SME-specific pain


