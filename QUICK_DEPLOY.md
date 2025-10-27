# ⚡ Quick Deployment Guide - 30 Minutes

## 🎯 Prerequisites
- Hostinger KVM1 VPS
- Domain name
- SSH access

---

## 📝 Step-by-Step (Copy & Paste)

### 1️⃣ Connect to Server (2 min)
```bash
ssh root@YOUR_SERVER_IP
```

### 2️⃣ Initial Setup (5 min)
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Install dependencies
apt install nginx git -y
npm install -g pm2

# Setup firewall
ufw enable
ufw allow 22
ufw allow 80
ufw allow 443
```

### 3️⃣ Clone & Install (3 min)
```bash
cd /root
git clone YOUR_REPO_URL vyldo-platform
cd vyldo-platform
npm install
```

### 4️⃣ Environment Setup (2 min)
```bash
nano .env
```

**Paste this (update values):**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/vyldo
JWT_SECRET=your-32-char-secret-here
HIVE_NODE=https://api.hive.blog
HIVE_ACCOUNT=your-hive-account
HIVE_ACTIVE_KEY=your-active-key
VITE_API_URL=https://yourdomain.com
MAX_FILE_SIZE=104857600
SESSION_SECRET=your-32-char-secret-here
```

Save: `Ctrl+X`, `Y`, `Enter`

### 5️⃣ Build & Setup (3 min)
```bash
# Build frontend
npm run build

# Create admin
npm run create-admin

# Seed categories
npm run seed-categories
```

### 6️⃣ Nginx Configuration (5 min)
```bash
nano /etc/nginx/sites-available/vyldo
```

**Paste this (update domain):**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    root /root/vyldo-platform/dist;
    index index.html;
    
    client_max_body_size 100M;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    location /uploads {
        alias /root/vyldo-platform/uploads;
        expires 30d;
    }
}
```

Save: `Ctrl+X`, `Y`, `Enter`

```bash
# Enable site
ln -s /etc/nginx/sites-available/vyldo /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Test & restart
nginx -t
systemctl restart nginx
```

### 7️⃣ SSL Certificate (5 min)
```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get certificate (replace domain)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts, choose option 2 (redirect)
```

### 8️⃣ Start Application (2 min)
```bash
cd /root/vyldo-platform

# Start with PM2
pm2 start server/index.js --name vyldo

# Save & auto-start
pm2 save
pm2 startup
# Run the command it shows
```

### 9️⃣ Domain Setup (3 min)
**Go to your domain registrar:**

Add these DNS records:
```
Type: A
Name: @
Value: YOUR_SERVER_IP

Type: A
Name: www
Value: YOUR_SERVER_IP
```

Wait 5-10 minutes for DNS propagation.

### 🔟 Test Everything (2 min)
```bash
# Check status
pm2 status
systemctl status nginx

# Test site
curl https://yourdomain.com

# View logs
pm2 logs vyldo
```

---

## ✅ Done! Your site is live! 🎉

**Visit:** https://yourdomain.com

**Admin:** https://yourdomain.com/admin

---

## 🔧 Useful Commands

```bash
# View logs
pm2 logs vyldo

# Restart app
pm2 restart vyldo

# Update app
cd /root/vyldo-platform
git pull
npm install
npm run build
pm2 restart vyldo

# Check errors
pm2 logs vyldo --err

# Monitor
pm2 monit
```

---

## 🚨 Troubleshooting

**Site not loading?**
```bash
pm2 status
systemctl status nginx
pm2 logs vyldo
```

**Database error?**
```bash
# Check .env file
cat .env | grep MONGODB_URI
```

**SSL not working?**
```bash
certbot renew --force-renewal
systemctl restart nginx
```

---

## 📊 MongoDB Atlas Setup (If needed)

1. Go to: https://www.mongodb.com/cloud/atlas
2. Create account
3. Create free cluster (M0)
4. Database Access → Add user
5. Network Access → Add IP: `0.0.0.0/0`
6. Connect → Get connection string
7. Update `.env` with connection string

---

## 🎯 Post-Launch

- [ ] Test all features
- [ ] Create test accounts
- [ ] Upload test gigs
- [ ] Test payments
- [ ] Monitor logs
- [ ] Setup backups

---

**Total Time: ~30 minutes** ⚡

**You're live! 🚀**
