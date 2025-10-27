# 🚀 Vyldo Platform - Deployment Checklist

## ✅ Pre-Deployment Checklist

### Local Testing
- [ ] Run `npm install` successfully
- [ ] MongoDB is running
- [ ] `.env` file configured
- [ ] Run `npm run dev` successfully
- [ ] Frontend loads at http://localhost:5173
- [ ] Backend responds at http://localhost:5000
- [ ] Can register new user
- [ ] Can login
- [ ] Can edit profile
- [ ] Can upload images
- [ ] Profile completion works
- [ ] Can create gig (after 100% profile)
- [ ] Gig detail page displays correctly
- [ ] Can request withdrawal
- [ ] All pages load without errors
- [ ] No console errors

### Code Quality
- [ ] All files saved
- [ ] No syntax errors
- [ ] All imports working
- [ ] Environment variables set
- [ ] Git repository initialized
- [ ] .gitignore configured
- [ ] README.md complete

---

## 🌐 VPS Deployment Checklist

### 1. VPS Preparation
- [ ] VPS purchased (Hostinger KVM1 or similar)
- [ ] SSH access working
- [ ] Root or sudo access available
- [ ] Domain name configured (optional)
- [ ] DNS pointing to VPS IP

### 2. Server Setup
```bash
# Update system
- [ ] sudo apt update
- [ ] sudo apt upgrade -y

# Install Node.js 18
- [ ] curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
- [ ] sudo apt-get install -y nodejs
- [ ] node --version (verify v18+)
- [ ] npm --version (verify 9+)

# Install MongoDB
- [ ] wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
- [ ] echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
- [ ] sudo apt-get update
- [ ] sudo apt-get install -y mongodb-org
- [ ] sudo systemctl start mongod
- [ ] sudo systemctl enable mongod
- [ ] sudo systemctl status mongod (verify running)

# Install PM2
- [ ] sudo npm install -g pm2
- [ ] pm2 --version (verify installed)

# Install Nginx
- [ ] sudo apt-get install -y nginx
- [ ] sudo systemctl status nginx (verify running)

# Install Git
- [ ] sudo apt-get install -y git
- [ ] git --version (verify installed)
```

### 3. Project Deployment
```bash
# Clone project
- [ ] cd /var/www
- [ ] git clone <your-repo-url> vyldo-platform
- [ ] cd vyldo-platform
- [ ] ls -la (verify files present)

# Install dependencies
- [ ] npm install
- [ ] Wait for completion (may take 5-10 minutes)

# Configure environment
- [ ] cp .env.example .env
- [ ] nano .env
- [ ] Set NODE_ENV=production
- [ ] Set strong JWT_SECRET
- [ ] Set strong SESSION_SECRET
- [ ] Set MONGODB_URI=mongodb://localhost:27017/vyldo-platform
- [ ] Set CLIENT_URL=https://yourdomain.com
- [ ] Set SERVER_URL=https://yourdomain.com
- [ ] Save and exit (Ctrl+X, Y, Enter)

# Build application
- [ ] npm run build
- [ ] Verify dist/ folder created
- [ ] Check for build errors

# Test server
- [ ] node server/index.js
- [ ] Verify "Server running on port 5000"
- [ ] Verify "MongoDB connected successfully"
- [ ] Press Ctrl+C to stop
```

### 4. PM2 Configuration
```bash
# Start with PM2
- [ ] pm2 start server/index.js --name vyldo-platform
- [ ] pm2 status (verify running)
- [ ] pm2 logs vyldo-platform (check for errors)
- [ ] pm2 save
- [ ] pm2 startup
- [ ] Copy and run the command shown
- [ ] Reboot server to test auto-start
- [ ] ssh back in and verify pm2 list shows app
```

### 5. Nginx Configuration
```bash
# Create Nginx config
- [ ] sudo nano /etc/nginx/sites-available/vyldo-platform

# Add this configuration:
```
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
- [ ] sudo ln -s /etc/nginx/sites-available/vyldo-platform /etc/nginx/sites-enabled/
- [ ] sudo nginx -t (verify config)
- [ ] sudo systemctl restart nginx
- [ ] sudo systemctl status nginx (verify running)
```

### 6. SSL Setup (Recommended)
```bash
# Install Certbot
- [ ] sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
- [ ] sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
- [ ] Enter email address
- [ ] Agree to terms
- [ ] Choose redirect option (2)
- [ ] Verify certificate installed

# Test auto-renewal
- [ ] sudo certbot renew --dry-run
```

### 7. Firewall Configuration
```bash
# Setup UFW
- [ ] sudo ufw allow 22 (SSH)
- [ ] sudo ufw allow 80 (HTTP)
- [ ] sudo ufw allow 443 (HTTPS)
- [ ] sudo ufw enable
- [ ] sudo ufw status (verify rules)
```

### 8. Create Uploads Directory
```bash
# Create directories
- [ ] mkdir -p /var/www/vyldo-platform/uploads/avatars
- [ ] mkdir -p /var/www/vyldo-platform/uploads/covers
- [ ] mkdir -p /var/www/vyldo-platform/uploads/gigs
- [ ] mkdir -p /var/www/vyldo-platform/uploads/portfolios
- [ ] mkdir -p /var/www/vyldo-platform/uploads/messages
- [ ] mkdir -p /var/www/vyldo-platform/uploads/deliverables

# Set permissions
- [ ] sudo chown -R $USER:$USER /var/www/vyldo-platform/uploads
- [ ] sudo chmod -R 755 /var/www/vyldo-platform/uploads
```

---

## 🧪 Post-Deployment Testing

### Basic Tests
- [ ] Visit https://yourdomain.com
- [ ] Homepage loads correctly
- [ ] No console errors in browser
- [ ] Register new account
- [ ] Verify email sent (if configured)
- [ ] Login with new account
- [ ] Dashboard loads
- [ ] Profile edit page loads
- [ ] Upload avatar image
- [ ] Upload cover image
- [ ] Add skills, languages, education, experience
- [ ] Profile completion reaches 100%
- [ ] Create new gig
- [ ] All gig sections work
- [ ] Upload gig images
- [ ] Publish gig
- [ ] View gig detail page
- [ ] All sections display correctly
- [ ] Package switcher works
- [ ] Test on mobile device
- [ ] Test on tablet
- [ ] Test on desktop

### Advanced Tests
- [ ] Create second account
- [ ] Browse gigs as buyer
- [ ] Place test order
- [ ] Check order appears in dashboard
- [ ] Test messaging (if enabled)
- [ ] Request withdrawal
- [ ] Check withdrawal appears in admin panel
- [ ] Process withdrawal as admin
- [ ] Verify transaction details
- [ ] Leave review on completed order
- [ ] Check review displays on gig
- [ ] Test search functionality
- [ ] Test filters
- [ ] Test pagination

### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] Images load quickly
- [ ] No memory leaks
- [ ] PM2 shows stable memory usage
- [ ] MongoDB queries optimized
- [ ] No N+1 query problems

### Security Tests
- [ ] HTTPS working (green padlock)
- [ ] SSL certificate valid
- [ ] Headers secure (check with securityheaders.com)
- [ ] No sensitive data in console
- [ ] API endpoints protected
- [ ] File upload restrictions working
- [ ] Rate limiting working
- [ ] XSS protection working
- [ ] SQL injection protection working

---

## 📊 Monitoring Setup

### PM2 Monitoring
```bash
- [ ] pm2 monit (check resource usage)
- [ ] pm2 logs vyldo-platform (check logs)
- [ ] pm2 status (verify running)
```

### Log Rotation
```bash
- [ ] pm2 install pm2-logrotate
- [ ] pm2 set pm2-logrotate:max_size 10M
- [ ] pm2 set pm2-logrotate:retain 7
```

### MongoDB Monitoring
```bash
- [ ] sudo systemctl status mongod
- [ ] Check MongoDB logs: sudo tail -f /var/log/mongodb/mongod.log
```

### Nginx Monitoring
```bash
- [ ] sudo systemctl status nginx
- [ ] Check access logs: sudo tail -f /var/log/nginx/access.log
- [ ] Check error logs: sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 Backup Setup

### Database Backup
```bash
# Create backup script
- [ ] nano /var/www/vyldo-platform/backup.sh

# Add this:
```
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db vyldo-platform --out /var/backups/mongodb/$DATE
find /var/backups/mongodb -type d -mtime +7 -exec rm -rf {} +
```

```bash
- [ ] chmod +x /var/www/vyldo-platform/backup.sh
- [ ] sudo mkdir -p /var/backups/mongodb

# Setup cron job
- [ ] crontab -e
- [ ] Add: 0 2 * * * /var/www/vyldo-platform/backup.sh
```

### File Backup
```bash
# Backup uploads folder
- [ ] tar -czf /var/backups/uploads-$(date +%Y%m%d).tar.gz /var/www/vyldo-platform/uploads
```

---

## 📝 Documentation

### Update Documentation
- [ ] Update README.md with production URL
- [ ] Document any custom configurations
- [ ] Create admin user guide
- [ ] Create user manual
- [ ] Document API endpoints
- [ ] Create troubleshooting guide

### Team Access
- [ ] Share admin credentials securely
- [ ] Document SSH access
- [ ] Share MongoDB credentials
- [ ] Document PM2 commands
- [ ] Share deployment process

---

## 🎯 Go-Live Checklist

### Final Checks
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Security hardened
- [ ] Backups configured
- [ ] Monitoring setup
- [ ] SSL certificate valid
- [ ] Domain configured
- [ ] Email working (if configured)
- [ ] Payment system tested
- [ ] Admin panel accessible
- [ ] User registration working
- [ ] Gig creation working
- [ ] Order flow working
- [ ] Withdrawal system working

### Launch
- [ ] Announce to users
- [ ] Monitor for first 24 hours
- [ ] Check error logs regularly
- [ ] Respond to user feedback
- [ ] Fix any issues immediately

### Post-Launch
- [ ] Monitor server resources
- [ ] Check database size
- [ ] Review logs daily
- [ ] Backup regularly
- [ ] Update dependencies monthly
- [ ] Security patches applied
- [ ] Performance optimization
- [ ] User feedback collected

---

## 🆘 Emergency Contacts

### Important Commands
```bash
# Restart application
pm2 restart vyldo-platform

# View logs
pm2 logs vyldo-platform

# Restart Nginx
sudo systemctl restart nginx

# Restart MongoDB
sudo systemctl restart mongod

# Check disk space
df -h

# Check memory
free -h

# Check processes
top
```

### Rollback Plan
```bash
# If deployment fails:
1. pm2 stop vyldo-platform
2. cd /var/www/vyldo-platform
3. git checkout previous-working-commit
4. npm install
5. npm run build
6. pm2 restart vyldo-platform
```

---

## ✅ Deployment Complete!

Once all checkboxes are ticked, your Vyldo platform is live! 🎉

**Remember:**
- Monitor regularly
- Backup frequently
- Update security patches
- Respond to user feedback
- Scale as needed

**Created by Aftab Irshad**

Good luck with your platform! 🚀
