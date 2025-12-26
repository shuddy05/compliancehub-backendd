# GitHub Repository Setup for ComplianceHub API

## Quick Start - New GitHub Repository

### Step 1: Create New GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Fill in:
   - **Repository name:** `compliancehub-api`
   - **Description:** ComplianceHub NestJS Backend API
   - **Visibility:** Private (recommended for production)
   - **Do NOT initialize** (we have existing code)
3. Click **Create repository**

### Step 2: Get Your Repository URL
Copy the HTTPS or SSH URL from GitHub:
- HTTPS: `https://github.com/YOUR_USERNAME/compliancehub-api.git`
- SSH: `git@github.com:YOUR_USERNAME/compliancehub-api.git`

---

## Step 3: Configure Local Git Repository

Navigate to project directory:
```bash
cd /home/ifeanyireed/aegis-flow-shuddy/aegis-flow/NestJS\ backend/compliancehub
```

### Option A: Using HTTPS (Simpler)
```bash
# Remove old remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/YOUR_USERNAME/compliancehub-api.git

# Verify
git remote -v
# Should show: origin  https://github.com/YOUR_USERNAME/compliancehub-api.git
```

### Option B: Using SSH (More Secure)
```bash
# Remove old remote
git remote remove origin

# Add new remote
git remote add origin git@github.com:YOUR_USERNAME/compliancehub-api.git

# Verify
git remote -v
```

---

## Step 4: Push Code to GitHub

```bash
# Ensure you're on main branch
git checkout -b main

# Stage all changes
git add .

# Commit changes
git commit -m "Initial commit: ComplianceHub API - NestJS Backend

- JWT authentication with Passport
- Multi-tenant support
- Role-based access control (RBAC)
- TypeORM database integration
- 50+ API endpoints for:
  - User management
  - Company management
  - Payroll processing
  - Compliance tracking
  - Document management
  - Subscription billing
  - Notifications system"

# Push to GitHub
git push -u origin main

# Verify on GitHub
# Visit: https://github.com/YOUR_USERNAME/compliancehub-api
```

---

## Step 5: Verify Repository on GitHub

1. Go to your GitHub repository URL
2. Check that all files are there:
   - `src/` - Source code
   - `package.json` - Dependencies
   - `.env.example` - Environment template
   - `ecosystem.config.js` - PM2 config
   - `.gitignore` - Git ignore rules
   - `HOSTINGER_DEPLOYMENT.md` - Deployment guide

3. Verify `.env` file is NOT committed (should show in .gitignore)

---

## Step 6: Create GitHub Personal Access Token (For Hostinger)

If using Hostinger's auto-deploy feature:

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token** → **Generate new token (classic)**
3. Configure:
   - **Token name:** `hostinger-deployment`
   - **Expiration:** 90 days
   - **Scopes:** Select `repo` (full control of private repositories)
4. Click **Generate token**
5. Copy the token (you won't see it again)
6. Use this token in Hostinger deployment configuration

---

## Step 7: Project Structure

Your GitHub repository should have:

```
compliancehub-api/
├── src/
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── app.ts
│   ├── common/
│   │   ├── decorators/
│   │   ├── guards/
│   │   └── middleware/
│   ├── config/
│   │   └── database.config.ts
│   ├── database/
│   │   └── entities/
│   └── modules/
│       ├── auth/
│       ├── users/
│       ├── companies/
│       ├── employees/
│       ├── payroll/
│       ├── compliance/
│       ├── documents/
│       ├── notifications/
│       └── subscriptions/
├── test/
├── dist/ (generated on build)
├── node_modules/ (not committed)
├── .env (not committed)
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
├── nest-cli.json
├── ecosystem.config.js
├── Dockerfile
├── docker-compose.yml
├── HOSTINGER_DEPLOYMENT.md
└── README.md
```

---

## Step 8: Branch Protection (Optional but Recommended)

To protect the `main` branch:

1. Go to GitHub repo → **Settings** → **Branches**
2. Click **Add rule**
3. Configure:
   - **Branch name pattern:** `main`
   - ✅ **Require a pull request before merging**
   - ✅ **Require status checks to pass**
   - ✅ **Require branches to be up to date**
4. Click **Create**

---

## Step 9: Set Up GitHub Actions (Optional)

For automated testing/deployment, create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Lint
        run: npm run lint --if-present
```

---

## Useful Git Commands

```bash
# Check status
git status

# View commits
git log --oneline

# Add specific files
git add path/to/file

# Amend last commit
git commit --amend

# View diff
git diff

# Create new branch
git checkout -b feature/branch-name

# Push branch
git push origin feature/branch-name

# Pull latest
git pull origin main

# Delete branch
git branch -d feature/branch-name
```

---

## Troubleshooting

### "Refusing to merge unrelated histories"
```bash
git pull origin main --allow-unrelated-histories
```

### "Permission denied (publickey)"
- Using SSH? Ensure SSH key is added to GitHub
- Go to **Settings** → **SSH and GPG keys**
- Add your SSH public key

### "Remote origin already exists"
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/compliancehub-api.git
```

### "fatal: The current branch is ahead of 'origin/main' by X commits"
```bash
git push origin main
```

---

## Next Steps

1. ✅ Create GitHub repository
2. ✅ Configure local git remote
3. ✅ Push code to GitHub
4. 📋 Deploy to Hostinger (see `HOSTINGER_DEPLOYMENT.md`)
5. 📋 Configure domain `api.compliancehub.ng`
6. 📋 Set up monitoring and logging
7. 📋 Add GitHub Actions CI/CD

---

**Repository:** compliancehub-api
**Default Branch:** main
**Visibility:** Private
**Last Updated:** December 26, 2025
