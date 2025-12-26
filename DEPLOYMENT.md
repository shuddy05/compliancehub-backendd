# Deployment Guide - ComplianceHub API

## Prerequisites
- GitHub account
- Domain: api.compliancehub.ng
- Server with Node.js 18+ or Docker
- PM2 or Docker for process management
- Nginx or Apache for reverse proxy

---

## Step 1: Create GitHub Repository

### Option A: Using GitHub CLI (Recommended)
```bash
# Install GitHub CLI if not already installed
# Then authenticate
gh auth login

# Create repository
gh repo create compliancehub-api --public --source=. --push --description "ComplianceHub NestJS Backend API"
```

### Option B: Manual Setup
1. Go to https://github.com/new
2. Create repository: `compliancehub-api`
3. Choose public/private as needed
4. In your local directory:
```bash
cd /home/ifeanyireed/aegis-flow-shuddy/aegis-flow/NestJS\ backend/compliancehub
git remote set-url origin https://github.com/YOUR_USERNAME/compliancehub-api.git
git branch -M main
git push -u origin main
```

---

## Step 2: Prepare Code for Deployment

### Commit Changes
```bash
cd /home/ifeanyireed/aegis-flow-shuddy/aegis-flow/NestJS\ backend/compliancehub

# Stage files
git add src/config/database.config.ts .gitignore Dockerfile docker-compose.yml ecosystem.config.js

# Commit
git commit -m "feat: Add deployment configuration for production"

# Push
git push origin main
```

### Create Release
```bash
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0
```

---

## Step 3: Deploy to api.compliancehub.ng

### Option A: Docker Deployment (Recommended)

#### 1. Prepare Server
```bash
# SSH into your server
ssh root@api.compliancehub.ng

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. Clone Repository
```bash
cd /opt
sudo git clone https://github.com/YOUR_USERNAME/compliancehub-api.git
cd compliancehub-api
```

#### 3. Setup Environment
```bash
# Copy and edit .env
sudo cp .env.example .env
sudo nano .env

# Update with production values:
# - DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
# - JWT_SECRET (strong random value)
# - NODE_ENV=production
```

#### 4. Build and Deploy
```bash
# Build Docker image
sudo docker-compose build

# Start services
sudo docker-compose up -d

# Check logs
sudo docker-compose logs -f
```

---

### Option B: PM2 Deployment (Without Docker)

#### 1. Setup Server
```bash
# SSH into server
ssh root@api.compliancehub.ng

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /opt/compliancehub-api
sudo chown $USER:$USER /opt/compliancehub-api
```

#### 2. Clone and Setup
```bash
cd /opt/compliancehub-api
git clone https://github.com/YOUR_USERNAME/compliancehub-api.git .
cp .env.example .env
nano .env  # Edit with production values

# Install dependencies
npm ci --only=production

# Build
npm run build
```

#### 3. Start with PM2
```bash
# Start application
pm2 start ecosystem.config.js --name compliancehub-api

# Save PM2 config
pm2 save

# Setup PM2 startup
pm2 startup
# (Run the output command)
```

---

## Step 4: Configure Nginx Reverse Proxy

Create `/etc/nginx/sites-available/compliancehub-api`:

```nginx
upstream compliancehub_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name api.compliancehub.ng;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.compliancehub.ng;

    # SSL Certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.compliancehub.ng/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.compliancehub.ng/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Logging
    access_log /var/log/nginx/compliancehub-api-access.log;
    error_log /var/log/nginx/compliancehub-api-error.log;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_vary on;

    # Proxy settings
    location /api/v1 {
        proxy_pass http://compliancehub_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }

    location / {
        proxy_pass http://compliancehub_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and test:
```bash
sudo ln -s /etc/nginx/sites-available/compliancehub-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 5: Setup SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d api.compliancehub.ng

# Auto-renew (already enabled)
sudo systemctl enable certbot.timer
```

---

## Step 6: Setup CI/CD (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
          DEPLOY_HOST: ${{ secrets.DEPLOY_HOST }}
          DEPLOY_USER: ${{ secrets.DEPLOY_USER }}
        run: |
          mkdir -p ~/.ssh
          echo "$DEPLOY_KEY" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -H $DEPLOY_HOST >> ~/.ssh/known_hosts
          
          ssh $DEPLOY_USER@$DEPLOY_HOST << 'EOF'
          cd /opt/compliancehub-api
          git pull origin main
          npm ci --only=production
          npm run build
          pm2 restart compliancehub-api
          EOF
```

Add secrets in GitHub repo settings:
- `DEPLOY_KEY` - SSH private key
- `DEPLOY_HOST` - api.compliancehub.ng
- `DEPLOY_USER` - deployment user

---

## Step 7: Monitor and Maintain

### Check Application Status
```bash
# If using PM2
pm2 status
pm2 logs compliancehub-api

# If using Docker
docker-compose ps
docker-compose logs -f api
```

### View Logs
```bash
# PM2
pm2 logs compliancehub-api

# Nginx
tail -f /var/log/nginx/compliancehub-api-access.log
tail -f /var/log/nginx/compliancehub-api-error.log
```

### Health Check
```bash
curl https://api.compliancehub.ng/api/v1
```

---

## Troubleshooting

### API not responding
```bash
# Check process running
pm2 status
ps aux | grep node

# Check logs
pm2 logs compliancehub-api

# Restart
pm2 restart compliancehub-api
```

### Database connection issues
```bash
# Check .env file
cat .env | grep DB_

# Test connection from server
mysql -h $DB_HOST -u $DB_USER -p $DB_NAME
```

### Port already in use
```bash
# Find process on port 3000
lsof -i :3000

# Kill if needed
kill -9 <PID>
```

---

## Security Checklist

- [ ] Change `.env` database password
- [ ] Use strong JWT_SECRET (min 32 chars)
- [ ] Enable HTTPS with SSL certificate
- [ ] Configure firewall rules
- [ ] Setup database backups
- [ ] Enable PM2/Docker auto-restart
- [ ] Setup monitoring/alerting
- [ ] Configure rate limiting
- [ ] Setup error tracking (Sentry, etc.)

---

## Performance Tips

1. **Enable Caching**
   - Configure Redis for sessions
   - Add query result caching

2. **Database Optimization**
   - Add indexes on frequently queried columns
   - Enable connection pooling

3. **Load Balancing**
   - Use PM2 cluster mode (already configured)
   - Add reverse proxy caching

4. **Monitoring**
   - Setup PM2 Plus for monitoring
   - Configure alerts for crashes

---

For more information, see:
- NestJS Docs: https://docs.nestjs.com
- Docker Docs: https://docs.docker.com
- PM2 Docs: https://pm2.io/docs
