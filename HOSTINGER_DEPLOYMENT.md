# ComplianceHub API - Hostinger Deployment Guide

## Overview
This guide explains how to deploy the ComplianceHub NestJS backend to Hostinger as a Node.js application with custom domain `api.compliancehub.ng`.

---

## Prerequisites
- Hostinger account with Node.js support
- Domain `compliancehub.ng` already purchased (or pointing to Hostinger)
- GitHub repository created and access token ready
- SSH access to Hostinger server (if available)

---

## Step 1: Create New GitHub Repository

### 1.1 Create Repository
```bash
# On GitHub.com, create new repository:
# - Name: compliancehub-api
# - Description: ComplianceHub NestJS Backend API
# - Visibility: Private (recommended for API keys)
# - Initialize: No (we have existing code)
```

### 1.2 Add New Remote to Local Git
```bash
cd /path/to/compliancehub

# Remove old remote (if switching repos)
git remote remove origin

# Add new GitHub repository as origin
git remote add origin https://github.com/YOUR_USERNAME/compliancehub-api.git

# Verify
git remote -v
```

### 1.3 Push Code to GitHub
```bash
# Switch to main branch
git checkout -b main

# Stage all changes
git add .

# Commit with message
git commit -m "Initial commit: ComplianceHub API - Production ready"

# Push to GitHub
git push -u origin main
```

---

## Step 2: Prepare Application for Deployment

### 2.1 Update package.json Scripts
Ensure your `package.json` has these scripts:
```json
{
  "scripts": {
    "build": "nest build",
    "start": "node dist/main.js",
    "start:prod": "node dist/main.js",
    "start:dev": "nest start --watch"
  }
}
```

### 2.2 Create .env.production (for Hostinger)
```bash
# Copy example and update for production
cp .env.example .env.production

# Edit with your production values:
# - NODE_ENV=production
# - PORT=3000 (Hostinger will map this)
# - Update database credentials if different
# - Update JWT secrets
```

### 2.3 Verify Build
```bash
npm install
npm run build

# Check dist folder exists
ls -la dist/
```

---

## Step 3: Deploy to Hostinger

### Option A: Using Hostinger Control Panel (Recommended for Beginners)

#### 3.1 Access Node.js Application Manager
1. Login to Hostinger Control Panel
2. Go to **Hosting → Node.js Applications**
3. Click **Create Application** or **Add Application**

#### 3.2 Configure Application
```
Application Name:     compliancehub-api
Node.js Version:      18.x or higher
Application Mode:     Production
Application Startup:  npm start
Port:                 3000
```

#### 3.3 Connect GitHub Repository
1. Click **Connect with GitHub**
2. Authorize Hostinger access to your GitHub account
3. Select repository: `compliancehub-api`
4. Select branch: `main`
5. Enable **Auto Deploy on Push** (optional)

#### 3.4 Set Environment Variables
In Hostinger Control Panel:
```
NODE_ENV              production
PORT                  3000
DB_HOST               srv1592.hstgr.io
DB_PORT               3306
DB_USER               u728977135_aegisdev
DB_PASSWORD           [Your password]
DB_NAME               u728977135_aegisdb
DB_SYNCHRONIZE        false
DB_LOGGING            error
JWT_SECRET            [Generate secure key]
JWT_EXPIRATION        24h
JWT_REFRESH_SECRET    [Generate secure key]
JWT_REFRESH_EXPIRATION 7d
API_PREFIX            api/v1
```

#### 3.5 Configure Domain
1. Go to **Domains** section
2. Create subdomain: `api.compliancehub.ng`
3. Point to your Node.js application
4. Enable SSL/HTTPS (automatic)

#### 3.6 Deploy
Click **Deploy** button. Hostinger will:
- Clone your GitHub repo
- Install dependencies (`npm install`)
- Build application (`npm run build`)
- Start application (`npm start`)

---

### Option B: Manual SSH Deployment (Advanced)

#### 3.1 SSH into Hostinger Server
```bash
ssh user@your-hostinger-ip
# Enter password when prompted
```

#### 3.2 Navigate to Application Directory
```bash
cd /home/user/public_html  # or your app directory

# Or create a new directory
mkdir compliancehub-api
cd compliancehub-api
```

#### 3.3 Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/compliancehub-api.git .

# Navigate to directory
cd compliancehub-api
```

#### 3.4 Install Dependencies
```bash
npm install --production

# Or with legacy peer deps if needed
npm install --production --legacy-peer-deps
```

#### 3.5 Create Environment File
```bash
nano .env

# Paste your production environment variables
# (See Step 3.4 above)
```

#### 3.6 Build Application
```bash
npm run build

# Verify dist folder
ls -la dist/
```

#### 3.7 Install PM2 Globally (if not already)
```bash
npm install -g pm2
```

#### 3.8 Start Application with PM2
```bash
pm2 start ecosystem.config.js --name "compliancehub-api"

# Check status
pm2 status

# View logs
pm2 logs compliancehub-api

# Make PM2 start on server restart
pm2 startup
pm2 save
```

#### 3.9 Configure Domain (via Hostinger Control Panel)
1. Go to **Domains**
2. Select `compliancehub.ng`
3. Create subdomain: `api` pointing to your server IP
4. Enable SSL/HTTPS
5. Wait for DNS propagation (5-30 minutes)

---

## Step 4: Verify Deployment

### 4.1 Test Health Endpoint
```bash
curl https://api.compliancehub.ng/api/v1
# Should return: "Hello World!"
```

### 4.2 Test Registration Endpoint
```bash
curl -X POST https://api.compliancehub.ng/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# Should return: 201 Created with user data
```

### 4.3 Monitor Application
- **Option A Control Panel:** View logs in Hostinger Node.js Applications section
- **Option B SSH:** Use `pm2 logs compliancehub-api`

---

## Step 5: Set Up Continuous Deployment (Optional)

### Using GitHub Actions (Auto Deploy on Push)

#### 5.1 Create `.github/workflows/deploy.yml`
```yaml
name: Deploy to Hostinger

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Hostinger
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOSTINGER_HOST }}
          username: ${{ secrets.HOSTINGER_USER }}
          password: ${{ secrets.HOSTINGER_PASSWORD }}
          script: |
            cd /home/user/compliancehub-api
            git pull origin main
            npm install --production
            npm run build
            pm2 restart compliancehub-api
            pm2 logs compliancehub-api --lines 50
```

#### 5.2 Add GitHub Secrets
1. Go to GitHub repo → **Settings → Secrets and variables → Actions**
2. Add:
   - `HOSTINGER_HOST` - Your Hostinger server IP
   - `HOSTINGER_USER` - SSH username
   - `HOSTINGER_PASSWORD` - SSH password (or use key)

---

## Step 6: Monitoring & Maintenance

### 6.1 Monitor Application Health
```bash
# SSH into server
ssh user@hostinger-ip

# Check PM2 status
pm2 status

# Monitor in real-time
pm2 monit

# View logs
pm2 logs compliancehub-api --lines 100
pm2 logs compliancehub-api --err # Error logs only
```

### 6.2 Auto-Restart on Crash
PM2 is already configured to auto-restart. Verify:
```bash
pm2 show compliancehub-api | grep "autorestart"
# Should show: autorestart: true
```

### 6.3 Update Database Credentials
If database credentials change:
```bash
# Update via Hostinger Control Panel → Environment Variables
# Or manually via SSH:
nano .env
# Edit credentials
pm2 restart compliancehub-api
```

### 6.4 View Server Resources
```bash
pm2 monit
# Shows: CPU, Memory, PID usage
```

---

## Step 7: SSL/HTTPS Certificate

Hostinger automatically provides free SSL certificates. To verify:
```bash
curl -I https://api.compliancehub.ng/api/v1
# Should show: HTTP/2 200
```

---

## Troubleshooting

### Application Not Starting
```bash
# Check PM2 logs
pm2 logs compliancehub-api --err

# Check if port 3000 is in use
lsof -i :3000

# Restart PM2
pm2 restart compliancehub-api
```

### Database Connection Issues
```bash
# Test connection directly
node -e "
  const mysql = require('mysql');
  const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  conn.connect(err => {
    console.log(err ? 'FAILED: ' + err.message : 'SUCCESS');
    process.exit(0);
  });
"
```

### Domain Not Resolving
1. Check Hostinger Control Panel → Domains
2. Verify subdomain `api` is created and pointing to server IP
3. Wait for DNS propagation (up to 24 hours)
4. Test: `nslookup api.compliancehub.ng`

### Node Modules Size Issues
If disk space is limited:
```bash
npm install --production --omit=dev
npm prune --production
```

---

## Security Best Practices

1. **Keep .env File Secure**
   - Never commit `.env` to GitHub
   - Use `.gitignore` to exclude it
   - Store secrets in Hostinger Control Panel environment variables

2. **Update Dependencies Regularly**
   ```bash
   npm update
   npm audit fix
   ```

3. **Monitor Logs for Errors**
   ```bash
   pm2 logs compliancehub-api --err
   ```

4. **Use HTTPS Only**
   - All traffic to `api.compliancehub.ng` should be HTTPS
   - Redirect HTTP to HTTPS (Hostinger may do this automatically)

5. **Rate Limiting** (Consider adding to API)
   - Install: `npm install @nestjs/throttler`
   - Implement to prevent abuse

---

## Next Steps

1. ✅ Create GitHub repository
2. ✅ Push code to GitHub
3. ✅ Deploy to Hostinger
4. ✅ Configure domain `api.compliancehub.ng`
5. ✅ Test endpoints
6. ✅ Set up monitoring
7. 📋 Create API documentation (Swagger)
8. 📋 Set up logging service
9. 📋 Configure backups
10. 📋 Set up alerts/monitoring

---

## Support

For issues:
1. Check Hostinger documentation: https://support.hostinger.com/
2. Review NestJS docs: https://docs.nestjs.com
3. Check PM2 logs: `pm2 logs compliancehub-api`
4. Review GitHub Actions logs: GitHub repo → Actions tab

---

**Last Updated:** December 26, 2025
**Application:** ComplianceHub API v1
**Framework:** NestJS 11.x
**Node Version:** 18.x+
