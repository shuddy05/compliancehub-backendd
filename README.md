# ComplianceHub Backend API

A comprehensive NestJS backend API for the ComplianceHub platform, featuring enterprise-grade authentication, multi-tenant support, role-based access control (RBAC), subscription management, and compliance task tracking.

## Features

- **JWT-Based Authentication**: Secure login/registration with access and refresh tokens
- **Multi-Tenant Architecture**: Isolated tenant environments with tenant-scoped data access
- **Role-Based Access Control (RBAC)**: Fine-grained permissions and role management
- **Subscription Management**: Tiered subscription plans with billing cycle management
- **Compliance Task Management**: Create, track, and manage compliance tasks with assignment and progress tracking
- **User Management**: User profiles, role assignments, and tenant memberships
- **MySQL Database**: TypeORM integration with automated migrations
- **API Documentation**: RESTful API with comprehensive endpoints

## Tech Stack

- **Framework**: NestJS 10+
- **Database**: MySQL with TypeORM
- **Authentication**: JWT with Passport
- **Validation**: class-validator and class-transformer
- **Password Hashing**: bcryptjs
- **Environment Management**: dotenv and @nestjs/config

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- MySQL 8.0+

### Setup

1. **Navigate to project**:
```bash
cd compliancehub
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=compliancehub_db
DB_SYNCHRONIZE=true
DB_LOGGING=true

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRATION=7d
```

4. **Create database**:
```bash
mysql -u root -p -e "CREATE DATABASE compliancehub_db;"
```

5. **Run the application**:
```bash
npm run start
```

The API will be available at `http://localhost:3000/api/v1`

## Running the App

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Test

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user

### Users

- `GET /users/me` - Get current user
- `GET /users` - Get all users (Admin only)
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user (Admin only)
- `POST /users/:id/roles/:roleId` - Assign role to user (Admin only)
- `DELETE /users/:id/roles/:roleId` - Remove role from user (Admin only)

### Tenants

- `POST /tenants` - Create tenant
- `GET /tenants` - Get user's tenants
- `GET /tenants/all` - Get all tenants (Admin only)
- `GET /tenants/:id` - Get tenant by ID
- `PUT /tenants/:id` - Update tenant
- `DELETE /tenants/:id` - Delete tenant
- `GET /tenants/:id/users` - Get tenant users
- `POST /tenants/:id/users` - Add user to tenant
- `DELETE /tenants/:id/users/:userId` - Remove user from tenant

### Subscriptions

- `POST /subscriptions/plans` - Create subscription plan (Admin only)
- `GET /subscriptions/plans` - Get all plans
- `GET /subscriptions/plans/:id` - Get plan details
- `PUT /subscriptions/plans/:id` - Update plan (Admin only)
- `DELETE /subscriptions/plans/:id` - Delete plan (Admin only)
- `POST /subscriptions` - Create user subscription
- `GET /subscriptions/me` - Get current subscription
- `GET /subscriptions/me/all` - Get all user subscriptions
- `POST /subscriptions/:id/cancel` - Cancel subscription
- `GET /subscriptions/expiring/soon` - Get expiring subscriptions (Admin only)

### Compliance Tasks

- `POST /compliance/tasks` - Create compliance task
- `GET /compliance/tasks/:id` - Get task details
- `GET /compliance/tenants/:tenantId/tasks` - Get tenant tasks
- `GET /compliance/my-tasks` - Get user's assigned tasks
- `PUT /compliance/tasks/:id` - Update task
- `DELETE /compliance/tasks/:id` - Delete task
- `GET /compliance/tenants/:tenantId/stats` - Get compliance statistics

### RBAC Management

- `POST /rbac/roles` - Create role (Admin only)
- `GET /rbac/roles` - Get all roles (Admin only)
- `POST /rbac/permissions` - Create permission (Admin only)
- `GET /rbac/permissions` - Get all permissions (Admin only)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the access token in the Authorization header:

```bash
Authorization: Bearer <access_token>
```

## Multi-Tenant Support

The API supports multi-tenancy through tenant headers and isolation at the database level. All data is scoped to tenants automatically.

## Role-Based Access Control

System roles:
- **admin** - Full system access
- **manager** - Tenant management access
- **user** - Standard user access
- **viewer** - Read-only access

## Security

- Passwords hashed using bcryptjs
- JWT tokens with expiration
- CORS enabled
- Input validation on all endpoints
- SQL injection prevention via TypeORM

## Database

The project uses TypeORM with MySQL. Entities are automatically synchronized with the database when `DB_SYNCHRONIZE=true`.

## Support

For questions or issues, please contact the development team.
