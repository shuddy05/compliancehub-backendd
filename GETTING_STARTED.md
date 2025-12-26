# ComplianceHub Backend - Getting Started Guide

## 🚀 Quick Start (5 Minutes)

### Windows Users
```bash
cd "c:\Users\USER\Desktop\Aegis\aegis-flow\NestJS backend\compliancehub"
quickstart.bat
```

### Mac/Linux Users
```bash
cd "c:\Users\USER\Desktop\Aegis\aegis-flow\NestJS backend\compliancehub"
bash quickstart.sh
```

---

## 📋 Manual Setup Steps

### 1. Install Dependencies
```bash
npm install
```
This installs all required packages including:
- NestJS framework
- TypeORM for database
- JWT for authentication
- MySQL2 driver
- bcryptjs for password hashing
- class-validator for validation

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` file with your MySQL credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=compliancehub_db
DB_SYNCHRONIZE=true
DB_LOGGING=true

JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRATION=7d
```

### 3. Create MySQL Database
```bash
mysql -u root -p
```

In MySQL prompt:
```sql
CREATE DATABASE compliancehub_db;
EXIT;
```

Or one-liner:
```bash
mysql -u root -p -e "CREATE DATABASE compliancehub_db;"
```

### 4. Start Development Server
```bash
npm run start:dev
```

You should see:
```
[9:34:10 AM] Successfully compiled application
ComplianceHub API is running on http://localhost:3000/api/v1
```

---

## 🧪 Testing the API

### 1. Register a New User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"John",
    "lastName":"Doe",
    "email":"john@example.com",
    "password":"SecurePassword123"
  }'
```

Expected Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"john@example.com",
    "password":"SecurePassword123"
  }'
```

Expected Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400
}
```

### 3. Get Current User (Protected)
```bash
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Create a Tenant
```bash
curl -X POST http://localhost:3000/api/v1/tenants \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"ACME Corp",
    "slug":"acme-corp",
    "description":"Test organization",
    "industry":"Technology"
  }'
```

### 5. Create a Subscription Plan
```bash
curl -X POST http://localhost:3000/api/v1/subscriptions/plans \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Premium",
    "description":"Premium plan",
    "monthlyPrice":99.99,
    "annualPrice":999.99,
    "maxUsers":100,
    "maxTenants":5,
    "advancedReporting":true,
    "apiAccess":true,
    "prioritySupport":true
  }'
```

---

## 📁 Project Files Overview

### Key Files
- **src/main.ts** - Application entry point
- **src/app.module.ts** - Root module that imports all feature modules
- **.env** - Environment configuration (database, JWT secrets)
- **package.json** - Project dependencies and scripts
- **tsconfig.json** - TypeScript configuration

### Module Files
Each module has the following structure:
- **controller.ts** - HTTP endpoint handlers
- **service.ts** - Business logic
- **module.ts** - Module definition
- **dto/\*.ts** - Data Transfer Objects (validation schemas)

### Database
- **database/entities/\*.ts** - TypeORM entity definitions
- Creates 10 database tables automatically on startup

---

## 🔑 Environment Variables

### Required
```env
DB_HOST=localhost              # MySQL server host
DB_PORT=3306                   # MySQL port
DB_USER=root                   # MySQL username
DB_PASSWORD=password           # MySQL password
DB_NAME=compliancehub_db      # Database name

JWT_SECRET=your_secret_key     # JWT signing key
JWT_EXPIRATION=24h             # Access token expiration
JWT_REFRESH_SECRET=refresh_key # Refresh token secret
JWT_REFRESH_EXPIRATION=7d      # Refresh token expiration
```

### Optional
```env
MAIL_HOST=smtp.gmail.com       # Email SMTP (for notifications)
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password

AWS_REGION=us-east-1           # AWS region (for S3)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your_bucket

STRIPE_SECRET_KEY=sk_test_...  # Stripe (for payments)
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 📝 Available Commands

```bash
# Development
npm run start:dev              # Start with hot reload

# Production
npm run build                  # Build project
npm run start:prod             # Run built project
npm run start                  # Start project (production mode)

# Testing
npm run test                   # Run unit tests
npm run test:watch             # Run tests in watch mode
npm run test:e2e               # Run e2e tests
npm run test:cov               # Run tests with coverage

# Code Quality
npm run format                 # Format code with Prettier
npm run lint                   # Run ESLint
```

---

## 🐛 Troubleshooting

### MySQL Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solution:**
- Ensure MySQL is running
- Check database credentials in .env
- Verify database exists

### Port 3000 Already in Use
```
Error: listen EADDRINUSE :::3000
```

**Solution:**
- Change PORT in .env to 3001
- Or kill the process: `lsof -ti:3000 | xargs kill -9`

### JWT Token Invalid
```
Error: Unauthorized
```

**Solution:**
- Ensure JWT_SECRET matches in .env
- Check token hasn't expired (24 hours)
- Use refresh token to get new access token

### Database Tables Not Created
```
Error: ER_NO_REFERENCED_COLUMN_2
```

**Solution:**
- Set `DB_SYNCHRONIZE=true` in .env
- Delete database and recreate it
- Run: `npm run start` which will auto-create tables

---

## 🔐 Default Admin Setup

To create an admin user:

1. Register through `/auth/register`
2. Create admin role through `/rbac/roles`
3. Assign role using `/users/:id/roles/:roleId`

```bash
# 1. Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"Admin",
    "lastName":"User",
    "email":"admin@example.com",
    "password":"AdminPassword123"
  }'

# 2. Get your token by logging in
# 3. Assign admin role (done through admin panel)
```

---

## 📚 Learning Resources

### Inside the Project
- **README.md** - Full API documentation
- **SETUP.md** - Detailed setup guide
- **PROJECT_SUMMARY.md** - Project overview
- **src/modules/** - Module examples

### External Resources
- [NestJS Docs](https://docs.nestjs.com)
- [TypeORM Docs](https://typeorm.io)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [MySQL Tutorial](https://dev.mysql.com/doc/mysql-tutorial-excerpt/8.0/en/)

---

## 🎯 Next Steps

1. **Test all endpoints** - Use the curl commands or Postman
2. **Setup database** - Run migrations if needed
3. **Configure JWT secrets** - Change to production values
4. **Setup email** - Configure MAIL_* variables for notifications
5. **Setup payments** - Add Stripe keys for subscriptions
6. **Deploy** - Use Docker, Heroku, AWS, or your preferred platform

---

## 🆘 Support

If you encounter issues:

1. Check error messages carefully
2. Review relevant documentation files
3. Check `.env` configuration
4. Ensure MySQL is running and accessible
5. Check network connectivity
6. Review application logs in terminal

---

## ✅ Success Checklist

- [ ] Dependencies installed (`npm install` completed)
- [ ] MySQL running and database created
- [ ] `.env` file configured with database credentials
- [ ] Application started without errors
- [ ] Can call `/auth/register` endpoint
- [ ] Can call `/auth/login` endpoint
- [ ] Can call protected endpoint with valid token

Once all items are checked, your ComplianceHub backend is ready!

---

**Happy coding! 🎉**
