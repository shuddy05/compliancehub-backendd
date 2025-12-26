# ComplianceHub API - Complete Endpoint Reference

## Base URL
`http://localhost:3000/api/v1`

## Authentication

All protected endpoints require:
```
Header: Authorization: Bearer <access_token>
```

---

## 🔐 Authentication Endpoints

### Register User
```
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}

Response: 201 Created
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

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}

Response: 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400
}
```

### Refresh Token
```
POST /auth/refresh
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Response: 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400
}
```

### Logout
```
POST /auth/logout
Authorization: Bearer <access_token>

Response: 200 OK
{
  "message": "Logged out successfully"
}
```

---

## 👥 User Endpoints

### Get Current User
```
GET /users/me
Authorization: Bearer <access_token>

Response: 200 OK
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "status": "active",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "roles": [...],
  "subscriptions": [...],
  "tenantUsers": [...]
}
```

### Get All Users (Admin Only)
```
GET /users?limit=10&offset=0
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

### Get User by ID
```
GET /users/:id
Authorization: Bearer <access_token>

Response: 200 OK
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  ...
}
```

### Update User
```
PUT /users/:id
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "firstName": "Jane",
  "lastName": "Smith",
  "profilePicture": "url_to_image.jpg",
  "status": "active"
}

Response: 200 OK
{...updated user data...}
```

### Delete User
```
DELETE /users/:id
Authorization: Bearer <access_token>

Response: 200 OK
{...deleted user data (soft delete)...}
```

### Assign Role to User (Admin Only)
```
POST /users/:userId/roles/:roleId
Authorization: Bearer <admin_token>

Response: 200 OK
{...user with assigned role...}
```

### Remove Role from User (Admin Only)
```
DELETE /users/:userId/roles/:roleId
Authorization: Bearer <admin_token>

Response: 200 OK
{...user with removed role...}
```

---

## 🏢 Tenant Endpoints

### Create Tenant
```
POST /tenants
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "name": "ACME Corporation",
  "slug": "acme-corp",
  "description": "Global tech company",
  "website": "https://acme.com",
  "industry": "Technology",
  "maxUsers": 50
}

Response: 201 Created
{
  "id": "uuid",
  "name": "ACME Corporation",
  "slug": "acme-corp",
  "status": "active",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Get User's Tenants
```
GET /tenants
Authorization: Bearer <access_token>

Response: 200 OK
[
  {
    "id": "uuid",
    "name": "ACME Corporation",
    "slug": "acme-corp",
    "status": "active",
    "tenantUsers": [...]
  }
]
```

### Get All Tenants (Admin Only)
```
GET /tenants/all?limit=10&offset=0
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "data": [...],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

### Get Tenant by ID
```
GET /tenants/:id
Authorization: Bearer <access_token>

Response: 200 OK
{
  "id": "uuid",
  "name": "ACME Corporation",
  ...
}
```

### Get Tenant by Slug
```
GET /tenants/:slug
Authorization: Bearer <access_token>

Response: 200 OK
{...tenant data...}
```

### Update Tenant
```
PUT /tenants/:id
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "name": "ACME Corp",
  "description": "Updated description",
  "website": "https://new-site.com",
  "maxUsers": 100
}

Response: 200 OK
{...updated tenant...}
```

### Delete Tenant
```
DELETE /tenants/:id
Authorization: Bearer <access_token>

Response: 200 OK
{...soft deleted tenant...}
```

### Get Tenant Users
```
GET /tenants/:id/users
Authorization: Bearer <access_token>

Response: 200 OK
[
  {
    "id": "uuid",
    "tenantId": "uuid",
    "userId": "uuid",
    "role": "owner",
    "status": "active",
    "user": {...user data...}
  }
]
```

### Add User to Tenant
```
POST /tenants/:id/users
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "userId": "uuid",
  "role": "member"
}

Response: 201 Created
{
  "id": "uuid",
  "tenantId": "uuid",
  "userId": "uuid",
  "role": "member",
  "status": "active"
}
```

### Remove User from Tenant
```
DELETE /tenants/:id/users/:userId
Authorization: Bearer <access_token>

Response: 200 OK
{
  "message": "User removed from tenant"
}
```

---

## 💳 Subscription Endpoints

### Create Subscription Plan (Admin Only)
```
POST /subscriptions/plans
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "name": "Premium",
  "description": "Premium plan with advanced features",
  "monthlyPrice": 99.99,
  "annualPrice": 999.99,
  "maxUsers": 100,
  "maxTenants": 5,
  "advancedReporting": true,
  "apiAccess": true,
  "prioritySupport": true
}

Response: 201 Created
{
  "id": "uuid",
  "name": "Premium",
  "monthlyPrice": 99.99,
  "status": "active"
}
```

### Get All Plans
```
GET /subscriptions/plans?limit=10&offset=0

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "name": "Basic",
      "monthlyPrice": 29.99,
      "maxUsers": 10,
      "advancedReporting": false,
      "apiAccess": false,
      "prioritySupport": false
    },
    {
      "id": "uuid",
      "name": "Premium",
      "monthlyPrice": 99.99,
      "maxUsers": 100,
      "advancedReporting": true,
      "apiAccess": true,
      "prioritySupport": true
    }
  ],
  "total": 2,
  "limit": 10,
  "offset": 0
}
```

### Get Plan Details
```
GET /subscriptions/plans/:id

Response: 200 OK
{...plan details...}
```

### Update Plan (Admin Only)
```
PUT /subscriptions/plans/:id
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "monthlyPrice": 109.99,
  "maxUsers": 150
}

Response: 200 OK
{...updated plan...}
```

### Delete Plan (Admin Only)
```
DELETE /subscriptions/plans/:id
Authorization: Bearer <admin_token>

Response: 200 OK
{...plan with status: inactive...}
```

### Create Subscription
```
POST /subscriptions
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "planId": "uuid",
  "billingCycle": "monthly",
  "autoRenew": true
}

Response: 201 Created
{
  "id": "uuid",
  "userId": "uuid",
  "planId": "uuid",
  "status": "active",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-02-01T00:00:00.000Z",
  "billingCycle": "monthly",
  "autoRenew": true
}
```

### Get Current Subscription
```
GET /subscriptions/me
Authorization: Bearer <access_token>

Response: 200 OK
{
  "id": "uuid",
  "status": "active",
  "plan": {...plan details...}
}
```

### Get All User Subscriptions
```
GET /subscriptions/me/all
Authorization: Bearer <access_token>

Response: 200 OK
[
  {
    "id": "uuid",
    "status": "active",
    "plan": {...}
  },
  {
    "id": "uuid",
    "status": "cancelled",
    "plan": {...}
  }
]
```

### Get User Subscriptions (Admin Only)
```
GET /subscriptions/users/:userId
Authorization: Bearer <admin_token>

Response: 200 OK
[...user subscriptions...]
```

### Cancel Subscription
```
POST /subscriptions/:id/cancel
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "reason": "No longer needed"
}

Response: 200 OK
{
  "id": "uuid",
  "status": "cancelled",
  "cancelledAt": "2024-01-15T00:00:00.000Z"
}
```

### Renew Subscription (Admin Only)
```
POST /subscriptions/:id/renew
Authorization: Bearer <admin_token>

Response: 200 OK
{...renewed subscription...}
```

### Get Expiring Subscriptions (Admin Only)
```
GET /subscriptions/expiring/soon?days=7
Authorization: Bearer <admin_token>

Response: 200 OK
[...subscriptions expiring in 7 days...]
```

### Get Expired Subscriptions (Admin Only)
```
GET /subscriptions/expired/list
Authorization: Bearer <admin_token>

Response: 200 OK
[...expired subscriptions...]
```

---

## ⚙️ RBAC Endpoints (Admin Only)

### Create Role
```
POST /rbac/roles
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "name": "moderator",
  "description": "Moderator role"
}

Response: 201 Created
{
  "id": "uuid",
  "name": "moderator",
  "description": "Moderator role",
  "isSystem": false,
  "status": "active"
}
```

### Get All Roles
```
GET /rbac/roles?limit=10&offset=0
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "data": [...],
  "total": 4,
  "limit": 10,
  "offset": 0
}
```

### Get Role Details
```
GET /rbac/roles/:id
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "id": "uuid",
  "name": "moderator",
  "permissions": [...]
}
```

### Create Permission
```
POST /rbac/permissions
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "name": "reports_delete",
  "resource": "reports",
  "action": "delete",
  "description": "Delete reports"
}

Response: 201 Created
{
  "id": "uuid",
  "name": "reports_delete",
  "resource": "reports",
  "action": "delete"
}
```

### Get All Permissions
```
GET /rbac/permissions?limit=10&offset=0
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "data": [...],
  "total": 14,
  "limit": 10,
  "offset": 0
}
```

### Get Permission Details
```
GET /rbac/permissions/:id
Authorization: Bearer <admin_token>

Response: 200 OK
{...permission details...}
```

### Assign Permission to Role
```
POST /rbac/roles/:roleId/permissions/:permissionId
Authorization: Bearer <admin_token>

Response: 200 OK
{...role with assigned permission...}
```

### Remove Permission from Role
```
DELETE /rbac/roles/:roleId/permissions/:permissionId
Authorization: Bearer <admin_token>

Response: 200 OK
{...role with removed permission...}
```

---

## 📋 Compliance Task Endpoints

### Create Task
```
POST /compliance/tasks
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "tenantId": "uuid",
  "title": "Complete GDPR audit",
  "description": "Annual GDPR compliance audit",
  "dueDate": "2024-06-01T00:00:00.000Z",
  "assignedToId": "uuid",
  "priority": "high",
  "category": "audit"
}

Response: 201 Created
{
  "id": "uuid",
  "tenantId": "uuid",
  "title": "Complete GDPR audit",
  "status": "pending",
  "priority": "high",
  "progressPercentage": 0,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Get Task Details
```
GET /compliance/tasks/:id
Authorization: Bearer <access_token>

Response: 200 OK
{...task details...}
```

### Get Tenant Tasks
```
GET /compliance/tenants/:tenantId/tasks?limit=10&offset=0&status=pending&priority=high
Authorization: Bearer <access_token>

Response: 200 OK
{
  "data": [...],
  "total": 5,
  "limit": 10,
  "offset": 0
}
```

### Get Assigned Tasks (For Current User)
```
GET /compliance/my-tasks?limit=10&offset=0
Authorization: Bearer <access_token>

Response: 200 OK
{
  "data": [...],
  "total": 8,
  "limit": 10,
  "offset": 0
}
```

### Update Task
```
PUT /compliance/tasks/:id
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "status": "in_progress",
  "progressPercentage": 50,
  "notes": "Audit in progress..."
}

Response: 200 OK
{...updated task...}
```

### Delete Task
```
DELETE /compliance/tasks/:id
Authorization: Bearer <access_token>

Response: 200 OK
{...deleted task...}
```

### Get Overdue Tasks
```
GET /compliance/tenants/:tenantId/overdue
Authorization: Bearer <access_token>

Response: 200 OK
[...overdue tasks...]
```

### Get Compliance Statistics
```
GET /compliance/tenants/:tenantId/stats
Authorization: Bearer <access_token>

Response: 200 OK
{
  "total": 20,
  "completed": 12,
  "pending": 8,
  "overdue": 2,
  "completionPercentage": 60
}
```

---

## 📊 Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Server Error |

---

## 🔄 Common Headers

```
Authorization: Bearer <token>     # For protected endpoints
Content-Type: application/json    # For POST/PUT requests
X-Tenant-ID: <tenant_id>         # Optional, for tenant context
```

---

## ✅ Rate Limiting

Not yet implemented. Recommended for production:
- 100 requests per minute for authenticated users
- 10 requests per minute for unauthenticated users

---

## 📝 Error Response Format

```json
{
  "statusCode": 400,
  "message": "Email validation failed",
  "error": "BadRequest"
}
```

---

## 🚀 Testing with cURL, Postman, or VS Code REST Client

### Postman Setup
1. Create new collection
2. Set base URL: `http://localhost:3000/api/v1`
3. Create environment with `token` variable
4. Use provided endpoints with `Bearer {{token}}`

### cURL Example
```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.accessToken')

# Use token
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN"
```

---

**This completes the API endpoint reference. All endpoints are ready for integration!**
