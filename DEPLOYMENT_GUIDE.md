# 🚀 Complete Deployment Guide - Hostinger KVM1

## 📋 Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Server Setup (Hostinger KVM1)](#server-setup)
3. [Domain Configuration](#domain-configuration)
4. [Install Dependencies](#install-dependencies)
5. [Database Setup](#database-setup)
6. [Application Deployment](#application-deployment)
7. [SSL Certificate (HTTPS)](#ssl-certificate)
8. [Nginx Configuration](#nginx-configuration)
9. [PM2 Process Manager](#pm2-process-manager)
10. [Environment Variables](#environment-variables)
11. [Final Testing](#final-testing)
12. [Maintenance & Monitoring](#maintenance)

---

## 🎯 Pre-Deployment Checklist

### ✅ Required Items:
- [ ] Hostinger KVM1 VPS account
- [ ] Domain name (e.g., vyldo.com)
- [ ] SSH access to server
- [ ] MongoDB Atlas account (or local MongoDB)
- [ ] Hive blockchain account
- [ ] Email service (for notifications)

### 📊 Server Requirements (KVM1):
```
CPU: 1 vCore
RAM: 2 GB
Storage: 20 GB SSD
Bandwidth: 1 TB
OS: Ubuntu 22.04 LTS (recommended)
```

---

## 🖥️ Server Setup (Hostinger KVM1)

### Step 1: Access Your Server
```bash
# SSH into your server
ssh root@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y
```

### Step 2: Create Non-Root User
```bash
# Create new user
adduser vyldo

# Add to sudo group
usermod -aG sudo vyldo

# Switch to new user
su - vyldo
```

### Step 3: Setup Firewall
```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22

# Allow HTTP & HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Check status
sudo ufw status
```

---

## 🌐 Domain Configuration

### Step 1: Point Domain to Server
```
Go to your domain registrar (Namecheap, GoDaddy, etc.)

Add A Records:
Type: A
Name: @
Value: YOUR_SERVER_IP
TTL: 300

Type: A
Name: www
Value: YOUR_SERVER_IP
TTL: 300
```

### Step 2: Verify DNS Propagation
```bash
# Check DNS
nslookup vyldo.com
dig vyldo.com

# Wait 5-30 minutes for propagation
```

---

## 📦 Install Dependencies

### Step 1: Install Node.js (v20 LTS)
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell
source ~/.bashrc

# Install Node.js
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node -v  # Should show v20.x.x
npm -v
```

### Step 2: Install MongoDB
```bash
# Option A: Use MongoDB Atlas (Recommended)
# Go to https://www.mongodb.com/cloud/atlas
# Create free cluster
# Get connection string

# Option B: Install Local MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg

echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Step 3: Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 4: Install PM2
```bash
npm install -g pm2
```

### Step 5: Install Git
```bash
sudo apt install git -y
```

---

## 💾 Database Setup

### MongoDB Atlas (Recommended):
```bash
# 1. Go to https://www.mongodb.com/cloud/atlas
# 2. Create account
# 3. Create cluster (Free M0)
# 4. Create database user
# 5. Whitelist IP: 0.0.0.0/0 (allow all)
# 6. Get connection string:
mongodb+srv://username:password@cluster.mongodb.net/vyldo-platform
```

### Local MongoDB:
```bash
# Create database
mongosh

use vyldo-platform

# Create admin user
db.createUser({
  user: "vyldo_admin",
  pwd: "STRONG_PASSWORD_HERE",
  roles: ["readWrite", "dbAdmin"]
})

exit
```

---

## 🚀 Application Deployment

### Step 1: Clone Repository
```bash
cd /home/vyldo
git clone YOUR_GITHUB_REPO_URL vyldo-platform
cd vyldo-platform
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Build Frontend
```bash
npm run build
```

### Step 4: Create Environment File
```bash
nano .env
```

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vyldo-platform

# JWT Secret (Generate strong secret)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# Hive Blockchain
HIVE_NODE=https://api.hive.blog
HIVE_ACCOUNT=your-hive-account
HIVE_ACTIVE_KEY=your-hive-active-key

# Frontend URL
VITE_API_URL=https://vyldo.com

# File Upload
MAX_FILE_SIZE=104857600

# Email (Optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Session Secret
SESSION_SECRET=your-session-secret-change-this-min-32-chars
```

Save: `Ctrl + X`, then `Y`, then `Enter`

### Step 5: Create Admin User
```bash
npm run create-admin
```

### Step 6: Seed Categories
```bash
npm run seed-categories
```

---

## 🔒 SSL Certificate (HTTPS)

### Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Get SSL Certificate
```bash
# Replace with your domain
sudo certbot --nginx -d vyldo.com -d www.vyldo.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose redirect HTTP to HTTPS (option 2)
```

### Auto-Renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot auto-renews via cron
sudo systemctl status certbot.timer
```

---

## ⚙️ Nginx Configuration

### Create Nginx Config
```bash
sudo nano /etc/nginx/sites-available/vyldo
```

```nginx
# Vyldo Platform - Nginx Configuration

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name vyldo.com www.vyldo.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name vyldo.com www.vyldo.com;

    # SSL Configuration (Certbot will add these)
    ssl_certificate /etc/letsencrypt/live/vyldo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vyldo.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Root directory for static files
    root /home/vyldo/vyldo-platform/dist;
    index index.html;

    # Max upload size
    client_max_body_size 100M;

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Socket.io
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Uploads directory
    location /uploads {
        alias /home/vyldo/vyldo-platform/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
```

### Enable Site
```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/vyldo /etc/nginx/sites-enabled/

# Remove default
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔄 PM2 Process Manager

### Start Application
```bash
cd /home/vyldo/vyldo-platform

# Start with PM2
pm2 start server/index.js --name vyldo-platform

# Save PM2 configuration
pm2 save

# Setup auto-start on reboot
pm2 startup
# Copy and run the command it shows
```

### PM2 Commands
```bash
# View logs
pm2 logs vyldo-platform

# Monitor
pm2 monit

# Restart
pm2 restart vyldo-platform

# Stop
pm2 stop vyldo-platform

# Status
pm2 status

# Delete
pm2 delete vyldo-platform
```

---

## 🔐 Environment Variables

### Production .env File
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/vyldo-platform
JWT_SECRET=CHANGE_THIS_TO_RANDOM_32_CHAR_STRING
HIVE_NODE=https://api.hive.blog
HIVE_ACCOUNT=your-hive-account
HIVE_ACTIVE_KEY=5JxxxYourActiveKeyxxx
VITE_API_URL=https://vyldo.com
MAX_FILE_SIZE=104857600
SESSION_SECRET=CHANGE_THIS_TO_RANDOM_32_CHAR_STRING
```

### Generate Secrets
```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ✅ Final Testing

### Test Checklist:
```bash
# 1. Check server status
pm2 status

# 2. Check Nginx
sudo systemctl status nginx

# 3. Check MongoDB connection
pm2 logs vyldo-platform | grep MongoDB

# 4. Test domain
curl https://vyldo.com

# 5. Test API
curl https://vyldo.com/api/health

# 6. Check SSL
curl -I https://vyldo.com
```

### Browser Testing:
```
1. Open https://vyldo.com
2. Register new account
3. Login
4. Create gig
5. Upload files
6. Test messaging
7. Test orders
8. Test wallet
9. Admin panel access
10. Mobile responsive check
```

---

## 🔧 Maintenance & Monitoring

### Daily Monitoring
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs vyldo-platform --lines 100

# Check disk space
df -h

# Check memory
free -m

# Check CPU
top
```

### Weekly Tasks
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Restart PM2
pm2 restart vyldo-platform

# Clear old logs
pm2 flush
```

### Backup Database
```bash
# MongoDB Atlas: Auto-backup enabled
# Local MongoDB:
mongodump --uri="mongodb://localhost:27017/vyldo-platform" --out=/home/vyldo/backups/$(date +%Y%m%d)
```

### Update Application
```bash
cd /home/vyldo/vyldo-platform

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build frontend
npm run build

# Restart PM2
pm2 restart vyldo-platform
```

---

## 🚨 Troubleshooting

### Issue: Site not loading
```bash
# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Check PM2
pm2 status
pm2 logs vyldo-platform
```

### Issue: Database connection error
```bash
# Check MongoDB
sudo systemctl status mongod

# Check connection string in .env
cat .env | grep MONGODB_URI
```

### Issue: SSL certificate error
```bash
# Renew certificate
sudo certbot renew --force-renewal

# Restart Nginx
sudo systemctl restart nginx
```

### Issue: Out of memory
```bash
# Check memory
free -m

# Restart PM2
pm2 restart vyldo-platform

# Consider upgrading VPS plan
```

---

## 📊 Performance Optimization

### Enable Caching
```bash
# Already configured in Nginx
# Static files cached for 30 days
# Gzip compression enabled
```

### Database Indexing
```javascript
// Already implemented in models
// Indexes on: user, gig, order, etc.
```

### CDN (Optional)
```
Use Cloudflare for:
- DDoS protection
- CDN
- SSL
- Caching
```

---

## 🎉 Launch Checklist

- [ ] Server setup complete
- [ ] Domain connected
- [ ] SSL certificate installed
- [ ] Database configured
- [ ] Application deployed
- [ ] PM2 running
- [ ] Nginx configured
- [ ] Admin account created
- [ ] Categories seeded
- [ ] All features tested
- [ ] Backup system in place
- [ ] Monitoring setup
- [ ] Documentation ready

---

## 📞 Support & Resources

### Hostinger Support:
- Live Chat: 24/7
- Email: support@hostinger.com
- Knowledge Base: https://support.hostinger.com

### Useful Commands:
```bash
# View all PM2 apps
pm2 list

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# View Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Check port usage
sudo netstat -tulpn | grep :5000

# Restart all services
pm2 restart all
sudo systemctl restart nginx
```

---

## 🚀 You're Ready to Launch!

Your Vyldo platform is now live at: **https://vyldo.com**

**Admin Panel:** https://vyldo.com/admin

**Good luck with your launch! 🎊**

---

**Created by Aftab Irshad** 💯
