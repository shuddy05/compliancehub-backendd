# ComplianceHub NestJS Backend - Installation & Setup Guide

## Quick Start

### 1. Navigate to Project
```bash
cd "c:\Users\USER\Desktop\Aegis\aegis-flow\NestJS backend\compliancehub"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=compliancehub_db
DB_SYNCHRONIZE=true
DB_LOGGING=true

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRATION=7d
```

### 4. Create MySQL Database
```bash
mysql -u root -p -e "CREATE DATABASE compliancehub_db;"
```

### 5. Run the Application

#### Development Mode (with hot reload)
```bash
npm run start:dev
```

#### Production Mode
```bash
npm run build
npm run start:prod
```

#### Regular Start
```bash
npm run start
```

The API will be available at:
- **Local**: `http://localhost:3000/api/v1`
- **API Docs can be added**: Consider Swagger/OpenAPI integration

## Project Structure Created

```
src/
├── config/
│   └── database.config.ts           # Database configuration with TypeORM
├── database/
│   ├── entities/                    # TypeORM entity definitions
│   │   ├── user.entity.ts           # User model with roles and subscriptions
│   │   ├── tenant.entity.ts         # Tenant (Organization) model
│   │   ├── role.entity.ts           # Role model
│   │   ├── permission.entity.ts     # Permission model
│   │   ├── user-role.entity.ts      # User-Role junction table
│   │   ├── subscription-plan.entity.ts # Subscription plan options
│   │   ├── user-subscription.entity.ts # User subscription tracking
│   │   ├── tenant-user.entity.ts    # Tenant membership
│   │   └── compliance-task.entity.ts    # Compliance tasks
│   └── migrations/                  # Database migrations folder
├── common/
│   ├── decorators/
│   │   ├── roles.decorator.ts       # @RequiredRoles() decorator
│   │   └── get-user.decorator.ts    # @GetUser() parameter decorator
│   ├── guards/
│   │   ├── jwt-auth.guard.ts        # JWT authentication guard
│   │   └── roles.guard.ts           # Role-based access control guard
│   └── middleware/
│       └── tenant.middleware.ts     # Multi-tenant context extraction
├── modules/
│   ├── auth/                        # Authentication & Authorization
│   │   ├── auth.controller.ts       # Auth endpoints (register, login, refresh)
│   │   ├── auth.module.ts           # Auth module definition
│   │   ├── services/
│   │   │   └── auth.service.ts      # Password hashing, token generation
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts      # JWT Passport strategy
│   │   ├── interfaces/
│   │   │   └── jwt-payload.interface.ts # JWT payload types
│   │   └── dto/
│   │       └── auth.dto.ts          # Login, Register, Refresh DTOs
│   │
│   ├── users/                       # User Management
│   │   ├── users.controller.ts      # User CRUD endpoints
│   │   ├── users.module.ts
│   │   ├── services/
│   │   │   └── users.service.ts     # User business logic
│   │   └── dto/
│   │       └── user.dto.ts          # User DTOs
│   │
│   ├── tenants/                     # Tenant Management
│   │   ├── tenants.controller.ts    # Tenant CRUD & user management
│   │   ├── tenants.module.ts
│   │   ├── services/
│   │   │   └── tenants.service.ts   # Tenant isolation logic
│   │   └── dto/
│   │       └── tenant.dto.ts        # Tenant DTOs
│   │
│   ├── subscriptions/               # Subscription Management
│   │   ├── subscriptions.controller.ts # Subscription & plan endpoints
│   │   ├── subscriptions.module.ts
│   │   ├── services/
│   │   │   └── subscriptions.service.ts # Subscription logic
│   │   └── dto/
│   │       └── subscription.dto.ts  # Subscription DTOs
│   │
│   ├── rbac/                        # Role-Based Access Control
│   │   ├── rbac.module.ts
│   │   ├── controllers/
│   │   │   └── rbac.controller.ts   # Role & permission management
│   │   └── services/
│   │       └── rbac.service.ts      # RBAC logic
│   │
│   └── compliance/                  # Compliance Task Management
│       ├── compliance-tasks.controller.ts # Task CRUD endpoints
│       ├── compliance.module.ts
│       ├── services/
│       │   └── compliance-tasks.service.ts # Task logic
│       └── dto/
│           └── compliance-task.dto.ts
│
├── app.module.ts                    # Root application module
├── app.controller.ts                # Root controller
├── app.service.ts                   # Root service
└── main.ts                          # Application entry point

.env                                 # Environment configuration (create from .env.example)
.env.example                         # Environment template
package.json                         # Project dependencies
tsconfig.json                        # TypeScript configuration
```

## Key Features Implemented

### 1. **Authentication (JWT)**
- User registration and login
- Access tokens (24h expiration)
- Refresh tokens (7d expiration)
- Password hashing with bcryptjs

### 2. **Multi-Tenant Support**
- Tenant isolation at database level
- Tenant-scoped data queries
- Tenant middleware for automatic tenant context

### 3. **Role-Based Access Control (RBAC)**
- System roles: admin, manager, user, viewer
- Dynamic permission assignment
- Role-based route guards
- Custom decorators for role enforcement

### 4. **User Management**
- User CRUD operations
- Role assignment/removal
- Profile management
- User status tracking (active, inactive, suspended)

### 5. **Tenant Management**
- Organization/tenant CRUD
- User tenant membership
- Tenant invitation system
- Multi-level access control (owner, admin, manager, member)

### 6. **Subscription Management**
- Multiple subscription plans
- User subscription tracking
- Billing cycle management (monthly/annual)
- Plan expiration and renewal
- Automatic renewal options

### 7. **Compliance Task Management**
- Create and track compliance tasks
- Task assignment to users
- Progress tracking
- Priority and status management
- Compliance statistics and reporting

## API Testing

### Authentication Flow
```bash
# 1. Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"John",
    "lastName":"Doe",
    "email":"john@example.com",
    "password":"SecurePass123"
  }'

# 2. Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"john@example.com",
    "password":"SecurePass123"
  }'

# 3. Use token in header
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer <access_token>"
```

## Database Schema

The application creates the following tables:
- `users` - User accounts
- `roles` - Role definitions
- `permissions` - Permission definitions
- `user_roles` - User-Role relationships
- `tenants` - Organizations/tenants
- `tenant_users` - Tenant memberships
- `subscription_plans` - Available subscription tiers
- `user_subscriptions` - User subscription instances
- `compliance_tasks` - Compliance task tracking
- `role_permissions` - Role-Permission relationships

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in .env
PORT=3001
```

### Database Connection Issues
```bash
# Check MySQL is running
mysql -u root -p

# Create database if not exists
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS compliancehub_db;"

# Grant permissions
mysql -u root -p -e "GRANT ALL PRIVILEGES ON compliancehub_db.* TO 'root'@'localhost';"
```

### TypeScript Compilation Errors
```bash
# Clear node_modules and reinstall
rm -r node_modules
npm install

# Clear build directory
rm -r dist
npm run build
```

## Next Steps

1. **Set up Swagger/OpenAPI** for API documentation
2. **Add email notifications** for user events
3. **Implement audit logging** for compliance tracking
4. **Add Stripe integration** for payment processing
5. **Setup Redis** for caching and session management
6. **Add file upload** to AWS S3
7. **Implement GraphQL** alongside REST API
8. **Add WebSocket support** for real-time updates
9. **Setup CI/CD pipeline** for automated testing and deployment

## Environment Variables Reference

```env
# Server
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=compliancehub_db
DB_SYNCHRONIZE=true
DB_LOGGING=true

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRATION=7d

# Email (Optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_password

# AWS S3 (Optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your_bucket

# Stripe (Optional)
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_PUBLISHABLE_KEY=your_publishable_key
```

## Support & Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [MySQL Reference](https://dev.mysql.com/doc/)

## License

This project is proprietary and confidential.
