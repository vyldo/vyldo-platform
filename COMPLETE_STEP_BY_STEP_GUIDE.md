# 🚀 Complete Step-by-Step Deployment Guide (Urdu/English)

## 📚 Table of Contents
1. [Hostinger VPS Khareedna](#step-1-hostinger-vps-khareedna)
2. [Domain Khareedna](#step-2-domain-khareedna)
3. [VPS Access Karna](#step-3-vps-access-karna)
4. [Server Setup](#step-4-server-setup)
5. [Domain Connect Karna](#step-5-domain-connect-karna)
6. [MongoDB Setup](#step-6-mongodb-setup)
7. [Application Upload](#step-7-application-upload)
8. [Nginx Setup](#step-8-nginx-setup)
9. [SSL Certificate](#step-9-ssl-certificate)
10. [Application Start](#step-10-application-start)
11. [Testing](#step-11-testing)

---

## 📝 STEP 1: Hostinger VPS Khareedna

### 1.1 Hostinger Website Par Jao
```
1. Browser mein jao: https://www.hostinger.com
2. Agar account nahi hai to "Sign Up" par click karo
3. Email aur password se account banao
```

### 1.2 VPS Plan Select Karo
```
1. Top menu mein "VPS" par click karo
2. Ya direct link: https://www.hostinger.com/vps-hosting

Plans dikhenge:
- KVM 1: $3.99/month (Recommended for start)
  ✅ 1 vCore
  ✅ 2 GB RAM
  ✅ 20 GB SSD
  ✅ 1 TB Bandwidth

- KVM 2: $8.99/month (Better performance)
  ✅ 2 vCores
  ✅ 4 GB RAM
  ✅ 40 GB SSD
  ✅ 2 TB Bandwidth
```

### 1.3 Plan Choose Karo
```
1. "KVM 1" plan par "Add to Cart" click karo
2. Billing period select karo:
   - 1 month: $5.99/month
   - 12 months: $4.99/month
   - 24 months: $3.99/month (Best value)

3. Operating System select karo:
   ✅ Ubuntu 22.04 (Recommended)
   
4. Server Location select karo:
   - USA (New York)
   - Europe (Netherlands)
   - Asia (Singapore) ← Choose this for Pakistan/India
```

### 1.4 Payment Karo
```
1. Cart mein jao
2. Payment method select karo:
   - Credit/Debit Card
   - PayPal
   - Cryptocurrency
   
3. Payment details enter karo
4. "Submit Secure Payment" click karo
```

### 1.5 VPS Activate Hoga
```
1. Payment ke baad 5-10 minutes wait karo
2. Email aayega "VPS is ready"
3. Email mein milega:
   - Server IP address
   - Root password
   - SSH access details
```

---

## 🌐 STEP 2: Domain Khareedna

### 2.1 Domain Provider Choose Karo
```
Options:
1. Hostinger (same place) - Easy
2. Namecheap - Popular
3. GoDaddy - Well known
4. Domain.com

Recommendation: Hostinger se hi lo (easy management)
```

### 2.2 Hostinger Se Domain Khareedna
```
1. Hostinger dashboard mein jao
2. Top menu mein "Domains" click karo
3. Search box mein apna domain name likho
   Example: vyldo.com, vyldo.net, vyldo.io

4. Available domains dikhenge:
   - .com: $9.99/year (Best)
   - .net: $12.99/year
   - .io: $39.99/year
   - .pk: $14.99/year (Pakistan)

5. Domain select karo aur "Add to Cart"
6. Payment karo
```

### 2.3 Domain Settings
```
1. Payment ke baad domain active hoga
2. Hostinger dashboard → Domains → Manage
3. Domain ready hai, abhi connect karenge (Step 5 mein)
```

---

## 🔐 STEP 3: VPS Access Karna

### 3.1 SSH Client Install Karo (Windows)

**Option A: PuTTY (Easy)**
```
1. Download: https://www.putty.org/
2. Install karo
3. PuTTY open karo
```

**Option B: Windows Terminal (Modern)**
```
1. Windows 10/11 mein already hai
2. Start → Search "Terminal"
3. Open karo
```

### 3.2 VPS Se Connect Karo

**Email se ye details nikalo:**
```
Server IP: 123.45.67.89 (example)
Username: root
Password: xyz123ABC (example)
```

**PuTTY Use Kar Rahe Ho:**
```
1. PuTTY open karo
2. Host Name: apna server IP daalo (123.45.67.89)
3. Port: 22
4. Connection Type: SSH
5. "Open" click karo
6. Warning aayegi → "Yes" click karo
7. Login as: root
8. Password: email wala password daalo (type karte waqt dikhega nahi)
9. Enter press karo
```

**Windows Terminal Use Kar Rahe Ho:**
```
1. Terminal open karo
2. Ye command type karo:
   ssh root@123.45.67.89
   (apna IP daalo)
3. Password poocha jayega
4. Email wala password daalo
5. Enter press karo
```

### 3.3 Connected!
```
Agar ye dikhe to success:
root@vps-123:~#

Ab aap server mein ho! 🎉
```

---

## ⚙️ STEP 4: Server Setup

### 4.1 System Update Karo
```bash
# Ye command copy karo aur paste karo (Right click se paste hoga)
apt update && apt upgrade -y

# 2-3 minutes lagenge
# "Do you want to continue? [Y/n]" aaye to Y press karo
```

### 4.2 Node.js Install Karo
```bash
# NVM install karo (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Terminal reload karo
source ~/.bashrc

# Node.js version 20 install karo
nvm install 20

# Use karo
nvm use 20

# Check karo (version dikhna chahiye)
node -v
npm -v
```

### 4.3 Nginx Install Karo
```bash
# Nginx install karo (web server)
apt install nginx -y

# Start karo
systemctl start nginx
systemctl enable nginx

# Check karo
systemctl status nginx
# "active (running)" dikhna chahiye
# q press karo exit karne ke liye
```

### 4.4 PM2 Install Karo
```bash
# PM2 install karo (process manager)
npm install -g pm2

# Check karo
pm2 -v
```

### 4.5 Git Install Karo
```bash
apt install git -y

# Check karo
git --version
```

### 4.6 Firewall Setup Karo
```bash
# Firewall enable karo
ufw enable
# "Command may disrupt existing ssh connections" → y press karo

# Ports allow karo
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS

# Status check karo
ufw status
```

### 4.7 Uploads Folder Banao
```bash
# Root directory mein jao
cd /root

# Uploads folder banao
mkdir -p uploads/hero uploads/avatars uploads/covers uploads/gigs uploads/portfolios uploads/messages uploads/deliverables

# Permissions set karo
chmod -R 755 uploads
```

---

## 🔗 STEP 5: Domain Connect Karna

### 5.1 Hostinger Dashboard Mein Jao
```
1. Browser mein Hostinger login karo
2. Dashboard → Domains
3. Apna domain select karo (vyldo.com)
4. "Manage" click karo
```

### 5.2 DNS Records Add Karo
```
1. Left menu mein "DNS / Name Servers" click karo
2. "Manage DNS Records" section mein jao

3. A Record Add Karo:
   Click "Add Record"
   
   Record 1:
   Type: A
   Name: @ (ya blank chodo)
   Points to: YOUR_VPS_IP (123.45.67.89)
   TTL: 300 (ya default)
   
   Click "Add Record"
   
   Record 2:
   Type: A
   Name: www
   Points to: YOUR_VPS_IP (same IP)
   TTL: 300
   
   Click "Add Record"
```

### 5.3 DNS Propagation Wait Karo
```
DNS update hone mein 5-30 minutes lagte hain

Check karne ke liye:
1. Website: https://dnschecker.org
2. Apna domain daalo (vyldo.com)
3. Green ticks dikhne chahiye

Ya terminal mein:
nslookup vyldo.com
```

---

## 💾 STEP 6: MongoDB Setup

### 6.1 MongoDB Atlas Account Banao (Free)
```
1. Browser mein jao: https://www.mongodb.com/cloud/atlas
2. "Try Free" click karo
3. Sign up karo:
   - Email
   - Password
   - First name, Last name
   
4. "Create your Atlas account" click karo
5. Email verify karo
```

### 6.2 Cluster Banao
```
1. Login ke baad "Build a Database" click karo

2. Plan select karo:
   ✅ FREE (M0) - Select this
   
3. Cloud Provider:
   ✅ AWS
   
4. Region:
   ✅ Singapore (Asia) - Pakistan/India ke liye best
   
5. Cluster Name:
   vyldo-cluster (ya koi bhi naam)
   
6. "Create" click karo
7. 1-2 minutes wait karo
```

### 6.3 Database User Banao
```
1. "Security Quickstart" screen aayegi

2. Username aur Password banao:
   Username: vyldo_admin
   Password: Strong password (save kar lo)
   
   Example: VyldoAdmin@2024
   
3. "Create User" click karo
```

### 6.4 IP Whitelist Karo
```
1. "Where would you like to connect from?" section

2. "Add My Current IP Address" click karo

3. Phir "Add a Different IP Address" click karo
   IP Address: 0.0.0.0/0
   Description: Allow all
   
   (Ye sab IPs ko allow karega)
   
4. "Finish and Close" click karo
```

### 6.5 Connection String Lo
```
1. Dashboard mein "Database" click karo
2. Cluster ke paas "Connect" button click karo
3. "Connect your application" select karo
4. Driver: Node.js
5. Version: 5.5 or later

6. Connection string copy karo:
   mongodb+srv://vyldo_admin:<password>@vyldo-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority

7. <password> ko apne actual password se replace karo:
   mongodb+srv://vyldo_admin:VyldoAdmin@2024@vyldo-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority

8. Is string ko save kar lo (baad mein use hogi)
```

---

## 📦 STEP 7: Application Upload

### 7.1 GitHub Repository Banao

**Option A: GitHub Desktop Use Karo (Easy)**
```
1. Download: https://desktop.github.com/
2. Install karo
3. GitHub account se login karo
4. "Add" → "Add existing repository"
5. Apna project folder select karo
6. "Publish repository" click karo
7. Repository name: vyldo-platform
8. "Publish repository" click karo
```

**Option B: Command Line (Advanced)**
```bash
# Apne local computer par (project folder mein)
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vyldo-platform.git
git push -u origin main
```

### 7.2 Server Par Clone Karo
```bash
# VPS terminal mein (SSH connected)
cd /root

# Repository clone karo (apna URL daalo)
git clone https://github.com/YOUR_USERNAME/vyldo-platform.git

# Folder mein jao
cd vyldo-platform

# Files check karo
ls -la
```

### 7.3 Dependencies Install Karo
```bash
# NPM packages install karo
npm install

# 2-3 minutes lagenge
# Errors ignore karo (warnings ok hain)
```

### 7.4 Environment File Banao
```bash
# .env file banao
nano .env
```

**Ye content paste karo (apni values se update karo):**
```env
NODE_ENV=production
PORT=5000

# MongoDB (Step 6.5 se copy karo)
MONGODB_URI=mongodb+srv://vyldo_admin:VyldoAdmin@2024@vyldo-cluster.xxxxx.mongodb.net/vyldo-platform?retryWrites=true&w=majority

# JWT Secret (random string)
JWT_SECRET=vyldo-super-secret-jwt-key-change-this-to-random-32-characters-minimum

# Hive Blockchain
HIVE_NODE=https://api.hive.blog
HIVE_ACCOUNT=your-hive-username
HIVE_ACTIVE_KEY=5JxxxYourHiveActiveKeyHerexxxx

# Frontend URL (apna domain daalo)
VITE_API_URL=https://vyldo.com

# File Upload
MAX_FILE_SIZE=104857600

# Session Secret (random string)
SESSION_SECRET=vyldo-session-secret-change-this-to-random-32-characters-minimum
```

**Save karo:**
```
1. Ctrl + X press karo
2. Y press karo (yes)
3. Enter press karo
```

### 7.5 Frontend Build Karo
```bash
# Build command run karo
npm run build

# 1-2 minutes lagega
# "dist" folder ban jayega
```

### 7.6 Admin User Banao
```bash
# Admin create karo
npm run create-admin

# Prompts aayenge:
Email: admin@vyldo.com
Username: admin
Display Name: Admin
Password: Admin@123 (strong password daalo)

# Admin ban jayega ✅
```

### 7.7 Categories Seed Karo
```bash
# Categories add karo
npm run seed-categories

# 40+ categories add ho jayengi ✅
```

---

## 🌐 STEP 8: Nginx Setup

### 8.1 Nginx Config File Banao
```bash
# Config file banao
nano /etc/nginx/sites-available/vyldo
```

### 8.2 Configuration Paste Karo

**Ye content paste karo (domain name update karo):**
```nginx
# Vyldo Platform Nginx Configuration

server {
    listen 80;
    listen [::]:80;
    server_name vyldo.com www.vyldo.com;
    
    # Root directory
    root /root/vyldo-platform/dist;
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
    
    # Uploads
    location /uploads {
        alias /root/vyldo-platform/uploads;
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

**Save karo:**
```
Ctrl + X → Y → Enter
```

### 8.3 Site Enable Karo
```bash
# Symlink banao
ln -s /etc/nginx/sites-available/vyldo /etc/nginx/sites-enabled/

# Default site remove karo
rm /etc/nginx/sites-enabled/default

# Configuration test karo
nginx -t

# "syntax is ok" aur "test is successful" dikhna chahiye

# Nginx restart karo
systemctl restart nginx

# Status check karo
systemctl status nginx
# "active (running)" dikhna chahiye
# q press karo exit ke liye
```

---

## 🔒 STEP 9: SSL Certificate (HTTPS)

### 9.1 Certbot Install Karo
```bash
# Certbot install karo
apt install certbot python3-certbot-nginx -y
```

### 9.2 SSL Certificate Lo
```bash
# Certificate generate karo (apna domain daalo)
certbot --nginx -d vyldo.com -d www.vyldo.com

# Prompts aayenge:
```

**Prompt 1: Email**
```
Enter email address: your-email@gmail.com
(Recovery aur notifications ke liye)
```

**Prompt 2: Terms**
```
Please read the Terms of Service...
(Y)es/(N)o: Y
```

**Prompt 3: Newsletter**
```
Would you be willing to share your email...
(Y)es/(N)o: N
(Optional - N select karo)
```

**Prompt 4: Redirect**
```
Please choose whether or not to redirect HTTP traffic to HTTPS
1: No redirect
2: Redirect (Recommended)

Select: 2
```

### 9.3 Success!
```
Certificate generated successfully!
Your certificate will expire on: [date]

Ab aapka site HTTPS par hai! 🔒
```

### 9.4 Auto-Renewal Check Karo
```bash
# Test renewal
certbot renew --dry-run

# "Congratulations, all simulated renewals succeeded"
# dikhna chahiye
```

---

## ▶️ STEP 10: Application Start

### 10.1 PM2 Se Start Karo
```bash
# Project folder mein jao
cd /root/vyldo-platform

# PM2 se start karo
pm2 start server/index.js --name vyldo-platform

# Output:
# ┌─────┬──────────────────┬─────────┬─────────┐
# │ id  │ name             │ status  │ restart │
# ├─────┼──────────────────┼─────────┼─────────┤
# │ 0   │ vyldo-platform   │ online  │ 0       │
# └─────┴──────────────────┴─────────┴─────────┘
```

### 10.2 Logs Check Karo
```bash
# Logs dekho
pm2 logs vyldo-platform

# Ye dikhna chahiye:
# ✅ Connected to MongoDB
# 🚀 Server running on port 5000
# 📡 Socket.io initialized

# Ctrl + C press karo logs se exit karne ke liye
```

### 10.3 PM2 Save Karo
```bash
# Current setup save karo
pm2 save

# Auto-start enable karo (server restart par)
pm2 startup

# Ek command dikhegi, use copy karo aur run karo
# Example:
# sudo env PATH=$PATH:/root/.nvm/versions/node/v20.x.x/bin pm2 startup systemd -u root --hp /root

# Wo command paste karo aur enter press karo
```

### 10.4 Status Check Karo
```bash
# PM2 status
pm2 status

# "online" dikhna chahiye ✅
```

---

## ✅ STEP 11: Testing

### 11.1 Browser Mein Test Karo
```
1. Browser open karo
2. Apna domain type karo: https://vyldo.com
3. Site load honi chahiye! 🎉
```

### 11.2 Features Test Karo

**Home Page:**
```
✅ Hero video dikhai de rahi hai?
✅ Trust indicators show ho rahe hain?
✅ Categories dikhai de rahe hain?
```

**Register/Login:**
```
1. "Sign Up" click karo
2. Account banao
3. Email verify karo (agar enabled hai)
4. Login karo
```

**Create Gig:**
```
1. "Become a Seller" click karo
2. Gig create karo
3. Images upload karo
4. Publish karo
```

**Admin Panel:**
```
1. Browser mein: https://vyldo.com/admin
2. Admin credentials se login:
   Email: admin@vyldo.com
   Password: (jo step 7.6 mein banaya)
3. Dashboard dikhai dena chahiye
4. Stats check karo
```

### 11.3 Server Logs Check Karo
```bash
# Terminal mein
pm2 logs vyldo-platform

# Errors nahi hone chahiye
# Requests dikhai deni chahiye
```

### 11.4 Mobile Test Karo
```
1. Mobile browser mein site kholo
2. Responsive design check karo
3. Sab features kaam kar rahe hain?
```

---

## 🎉 CONGRATULATIONS! Site Live Hai!

### 📊 Your URLs:
```
Main Site: https://vyldo.com
Admin Panel: https://vyldo.com/admin
API: https://vyldo.com/api
```

### 🔑 Admin Access:
```
URL: https://vyldo.com/admin
Email: admin@vyldo.com
Password: (jo aapne banaya)
```

---

## 🔧 Useful Commands (Daily Use)

### PM2 Commands:
```bash
# Status dekho
pm2 status

# Logs dekho
pm2 logs vyldo-platform

# Restart karo
pm2 restart vyldo-platform

# Stop karo
pm2 stop vyldo-platform

# Start karo
pm2 start vyldo-platform

# Monitor karo
pm2 monit
```

### Nginx Commands:
```bash
# Status check
systemctl status nginx

# Restart
systemctl restart nginx

# Stop
systemctl stop nginx

# Start
systemctl start nginx

# Test config
nginx -t
```

### Server Commands:
```bash
# Disk space check
df -h

# Memory check
free -m

# CPU check
top
# q press karo exit ke liye

# Reboot server
reboot
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Site Load Nahi Ho Rahi
```bash
# Check PM2
pm2 status
pm2 logs vyldo-platform

# Check Nginx
systemctl status nginx
nginx -t

# Restart both
pm2 restart vyldo-platform
systemctl restart nginx
```

### Issue 2: Database Connection Error
```bash
# .env file check karo
cat .env | grep MONGODB_URI

# MongoDB Atlas mein IP whitelist check karo
# 0.0.0.0/0 add hai?
```

### Issue 3: SSL Certificate Error
```bash
# Certificate renew karo
certbot renew --force-renewal

# Nginx restart karo
systemctl restart nginx
```

### Issue 4: Upload Nahi Ho Rahi
```bash
# Uploads folder permissions
chmod -R 755 /root/vyldo-platform/uploads

# Nginx config mein max size check karo
grep client_max_body_size /etc/nginx/sites-available/vyldo
```

### Issue 5: Port 5000 Already in Use
```bash
# Kaunsa process use kar raha hai
lsof -i :5000

# Kill karo
kill -9 PID_NUMBER

# PM2 restart karo
pm2 restart vyldo-platform
```

---

## 📱 Support & Help

### Hostinger Support:
```
Live Chat: 24/7 available
Email: support@hostinger.com
Phone: Check dashboard
Knowledge Base: support.hostinger.com
```

### MongoDB Support:
```
Docs: docs.mongodb.com
Community: community.mongodb.com
Support: cloud.mongodb.com
```

### Emergency:
```bash
# Sab kuch restart karo
pm2 restart all
systemctl restart nginx

# Server reboot karo (last option)
reboot
```

---

## 🎯 Next Steps

### 1. Backup Setup Karo
```bash
# MongoDB Atlas auto-backup enabled hai

# Code backup (GitHub)
cd /root/vyldo-platform
git add .
git commit -m "Production deployment"
git push
```

### 2. Monitoring Setup Karo
```bash
# PM2 monitoring
pm2 install pm2-logrotate

# Daily check karo
pm2 status
pm2 logs vyldo-platform --lines 50
```

### 3. Email Setup Karo (Optional)
```
Gmail SMTP use kar sakte ho
.env mein add karo:
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=app-password
```

### 4. Analytics Add Karo (Optional)
```
Google Analytics
Facebook Pixel
Hotjar
```

---

## 💰 Monthly Costs

```
Hostinger KVM1: $3.99/month
Domain (.com): $9.99/year = $0.83/month
MongoDB Atlas: FREE
SSL Certificate: FREE
Total: ~$5/month
```

---

## ✅ Final Checklist

```
□ VPS purchased ✓
□ Domain purchased ✓
□ VPS accessed via SSH ✓
□ Server setup complete ✓
□ Domain connected ✓
□ MongoDB setup ✓
□ Application uploaded ✓
□ Nginx configured ✓
□ SSL certificate installed ✓
□ Application running ✓
□ Admin account created ✓
□ Categories seeded ✓
□ All features tested ✓
□ Site is LIVE! ✓
```

---

## 🎊 YOU DID IT!

**Your Vyldo platform is now LIVE and running!**

**Main Site:** https://vyldo.com
**Admin Panel:** https://vyldo.com/admin

**Congratulations! 🎉🚀**

---

**Created by Aftab Irshad** 💯

**Koi bhi sawal ho to poochna! Happy to help! 😊**
