# ComplianceHub Backend API

A comprehensive NestJS backend API for the ComplianceHub platform, featuring enterprise-grade authentication, multi-tenant support, role-based access control (RBAC), subscription management, and compliance task tracking.

**Production URL:** `https://api.compliancehub.ng/api/v1`

## Features

- **JWT-Based Authentication**: Secure login/registration with access and refresh tokens
- **Multi-Tenant Architecture**: Isolated tenant environments with tenant-scoped data access
- **Role-Based Access Control (RBAC)**: Fine-grained permissions and role management
- **Subscription Management**: Tiered subscription plans with billing cycle management
- **Compliance Task Management**: Create, track, and manage compliance tasks with assignment and progress tracking
- **User Management**: User profiles, role assignments, and tenant memberships
- **MySQL Database**: TypeORM integration with remote database support
- **50+ API Endpoints**: Comprehensive REST API for all business operations
- **Production Ready**: Dockerized, PM2 managed, SSL/HTTPS enabled

## Tech Stack

- **Framework**: NestJS 11.x
- **Database**: MySQL 8.0+ with TypeORM
- **Authentication**: JWT with Passport.js
- **Validation**: class-validator and class-transformer
- **Password Hashing**: bcryptjs
- **Process Manager**: PM2 (production)
- **Container**: Docker & Docker Compose
- **Environment**: dotenv and @nestjs/config

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MySQL 8.0+ (remote or local)

### Local Development

1. **Clone repository**:
```bash
git clone https://github.com/YOUR_USERNAME/compliancehub-api.git
cd compliancehub-api
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment**:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=compliancehub_db
DB_SYNCHRONIZE=true
DB_LOGGING=true

JWT_SECRET=your_super_secret_key
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRATION=7d
```

4. **Start development server**:
```bash
npm run start:dev
```

Server runs on `http://localhost:3000/api/v1`

## Build & Run

### Development
```bash
npm run start:dev        # Watch mode with auto-reload
npm run start:debug      # Debug mode
```

### Production
```bash
npm run build            # Compile TypeScript to JavaScript
npm run start:prod       # Run compiled JavaScript
```

### Using Docker
```bash
docker-compose up       # Start with Docker Compose
docker-compose down     # Stop containers
```

### Using PM2
```bash
pm2 start ecosystem.config.js
pm2 logs compliancehub-api
pm2 stop compliancehub-api
pm2 restart compliancehub-api
```

## Linting & Formatting

```bash
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
npm run test            # Run unit tests
npm run test:cov        # Generate coverage report
npm run test:e2e        # Run E2E tests
```

## API Endpoints

### Authentication (50+ endpoints total)
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/logout` - Logout user

### Users
- `GET /api/v1/users/me` - Get current user profile
- `GET /api/v1/users` - List all users
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Companies
- `POST /api/v1/companies` - Create company
- `GET /api/v1/companies` - List companies
- `GET /api/v1/companies/:id` - Get company details
- `PUT /api/v1/companies/:id` - Update company
- `DELETE /api/v1/companies/:id` - Delete company
- `GET /api/v1/companies/:id/settings` - Get company settings
- `PUT /api/v1/companies/:id/settings` - Update settings

### Employees
- `POST /api/v1/companies/:companyId/employees` - Create employee
- `GET /api/v1/companies/:companyId/employees` - List employees
- `GET /api/v1/companies/:companyId/employees/:id` - Get employee
- `PUT /api/v1/companies/:companyId/employees/:id` - Update employee
- `DELETE /api/v1/companies/:companyId/employees/:id` - Delete employee

### Payroll
- `POST /api/v1/companies/:companyId/payroll/runs` - Create payroll run
- `GET /api/v1/companies/:companyId/payroll/runs` - List payroll runs
- `GET /api/v1/companies/:companyId/payroll/runs/:id` - Get payroll details
- `PUT /api/v1/companies/:companyId/payroll/runs/:id/approve` - Approve payroll
- `PUT /api/v1/companies/:companyId/payroll/runs/:id/reject` - Reject payroll

### Compliance
- `GET /api/v1/companies/:companyId/compliance/obligations` - List obligations
- `GET /api/v1/companies/:companyId/compliance/filings` - List filings
- `POST /api/v1/companies/:companyId/compliance/filings` - Create filing
- `PUT /api/v1/companies/:companyId/compliance/filings/:id/submit` - Submit filing

### Subscriptions
- `GET /api/v1/subscriptions/plans` - Get subscription plans
- `GET /api/v1/subscriptions/current` - Get current subscription
- `POST /api/v1/subscriptions/upgrade` - Upgrade plan
- `POST /api/v1/subscriptions/downgrade` - Downgrade plan
- `POST /api/v1/subscriptions/cancel` - Cancel subscription

### Documents
- `POST /api/v1/companies/:companyId/documents` - Upload document
- `GET /api/v1/companies/:companyId/documents` - List documents
- `GET /api/v1/companies/:companyId/documents/:id/download` - Download document

### Notifications
- `GET /api/v1/notifications` - Get notifications
- `PATCH /api/v1/notifications/:id/read` - Mark as read
- `PATCH /api/v1/notifications/read-all` - Mark all as read

## Deployment

### Deploy to Hostinger

For step-by-step deployment instructions to Hostinger with custom domain `api.compliancehub.ng`:

📖 **[Hostinger Deployment Guide](./HOSTINGER_DEPLOYMENT.md)**

### Create New GitHub Repository

For setting up a new GitHub repository for this backend:

📖 **[GitHub Setup Guide](./GITHUB_SETUP.md)**

## Environment Variables

### Required Variables
```
NODE_ENV              development/production
PORT                  3000
API_PREFIX            api/v1

DB_HOST               Database host
DB_PORT               Database port (3306)
DB_USER               Database user
DB_PASSWORD           Database password
DB_NAME               Database name
DB_SYNCHRONIZE        true/false
DB_LOGGING            true/false

JWT_SECRET            Secret key for JWT signing
JWT_EXPIRATION        Token expiration time (e.g., 24h)
JWT_REFRESH_SECRET    Secret for refresh tokens
JWT_REFRESH_EXPIRATION Refresh token expiration (e.g., 7d)
```

### Optional Variables (for future features)
```
MAIL_HOST             SMTP server
MAIL_PORT             SMTP port
MAIL_USER             Email account
MAIL_PASSWORD         Email password

AWS_REGION            AWS region
AWS_ACCESS_KEY_ID     AWS access key
AWS_SECRET_ACCESS_KEY AWS secret key
AWS_S3_BUCKET         S3 bucket name

STRIPE_SECRET_KEY     Stripe API key
STRIPE_PUBLISHABLE_KEY Stripe public key
```

## Database Schema

The application uses TypeORM with the following entities:
- `User` - User accounts and profiles
- `Company` - Organization entities
- `CompanyUser` - User-Company relationships
- `Employee` - Employee records
- `PayrollRun` - Payroll cycles
- `PayrollItem` - Individual payroll entries
- `ComplianceObligation` - Compliance requirements
- `ComplianceFiling` - Filed compliance documents
- `Document` - General document storage
- `Notification` - User notifications
- `Subscription` - Billing subscriptions
- `AuditLog` - Activity audit trail
- And more...

## Testing

### Unit Tests
```bash
npm run test
npm run test:watch
npm run test:cov      # Coverage report
```

### E2E Tests
```bash
npm run test:e2e
```

## Project Structure

```
src/
├── app.controller.ts          # Main controller
├── app.module.ts              # Root module
├── app.service.ts             # Main service
├── app.ts                     # Application entry point
├── common/
│   ├── decorators/            # Custom decorators
│   ├── guards/                # Authentication guards
│   └── middleware/            # HTTP middleware
├── config/
│   └── database.config.ts     # Database configuration
├── database/
│   └── entities/              # TypeORM entities
└── modules/
    ├── auth/                  # Authentication module
    ├── users/                 # Users module
    ├── companies/             # Companies module
    ├── employees/             # Employees module
    ├── payroll/               # Payroll module
    ├── compliance/            # Compliance module
    ├── documents/             # Documents module
    ├── notifications/         # Notifications module
    └── subscriptions/         # Subscriptions module
```

## Security

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **HTTPS/SSL**: Enforced in production
- **Environment Variables**: Sensitive data in .env (not committed)
- **Database**: Remote MySQL with credentials management
- **CORS**: Configured for API security
- **Rate Limiting**: Recommended for production

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -m 'Add my feature'`
3. Push to branch: `git push origin feature/my-feature`
4. Submit pull request

## Troubleshooting

### Connection Issues
- Check database connection: Verify `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`
- See [Connection Test](#testing-database-connection) below

### Port Already in Use
```bash
# Kill process on port 3000
lsof -i :3000  # Find process
kill -9 <PID>  # Kill process
```

### Module Not Found
```bash
npm install                    # Reinstall dependencies
npm run build                  # Rebuild project
```

### JWT Token Issues
- Verify `JWT_SECRET` is set correctly
- Check token expiration in `.env`
- Review Passport JWT strategy configuration

## Testing Database Connection

```bash
node -e "
  const mysql = require('mysql');
  const conn = mysql.createConnection({
    host: 'DB_HOST',
    user: 'DB_USER',
    password: 'DB_PASSWORD',
    database: 'DB_NAME'
  });
  conn.connect(err => {
    console.log(err ? 'FAILED' : 'SUCCESS');
    process.exit(0);
  });
"
```

## License

ISC

## Support & Documentation

- **API Docs**: Visit `http://localhost:3000/api/docs` (when Swagger is enabled)
- **NestJS Docs**: https://docs.nestjs.com
- **TypeORM Docs**: https://typeorm.io
- **JWT Guide**: https://jwt.io

## Version History

- **v1.0.0** - Initial release
  - Complete authentication system
  - Multi-tenant architecture
  - 50+ API endpoints
  - Database integration
  - PM2 production setup
  - Docker support

## Contact & Issues

For bugs and feature requests, create an issue in the GitHub repository.

---

**Last Updated:** December 26, 2025
**Repository:** compliancehub-api
**Status:** Production Ready ✅
