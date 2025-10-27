# Vyldo Platform - Complete Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
```

Edit `.env` with your settings:
- MongoDB connection string
- JWT secrets
- Hive escrow account
- Email configuration (optional)

### 3. Start MongoDB
Ensure MongoDB is running on your system:
```bash
# Windows
net start MongoDB

# Or if using MongoDB Compass, just open it
```

### 4. Run Development Server
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend dev server on http://localhost:5173

### 5. Access the Platform
Open your browser and navigate to: http://localhost:5173

## Production Build

### Build the Application
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

## VPS Deployment (Hostinger KVM1)

### Prerequisites
- Ubuntu 20.04+ server
- Root or sudo access
- Domain name (optional)

### Step 1: Connect to VPS
```bash
ssh root@your-vps-ip
```

### Step 2: Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

### Step 3: Install MongoDB
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Step 4: Install PM2
```bash
sudo npm install -g pm2
```

### Step 5: Clone and Setup Project
```bash
cd /var/www
git clone <your-repo-url> vyldo-platform
cd vyldo-platform
npm install
```

### Step 6: Configure Environment
```bash
nano .env
```

Set production values:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vyldo-platform
JWT_SECRET=<generate-strong-random-string>
SESSION_SECRET=<generate-strong-random-string>
HIVE_ESCROW_ACCOUNT=vyldo-escrow
CLIENT_URL=https://yourdomain.com
SERVER_URL=https://yourdomain.com
```

### Step 7: Build Application
```bash
npm run build
```

### Step 8: Start with PM2
```bash
pm2 start server/index.js --name vyldo-platform
pm2 save
pm2 startup
```

### Step 9: Install Nginx
```bash
sudo apt-get install -y nginx
```

### Step 10: Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/vyldo-platform
```

Add this configuration:
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

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/vyldo-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 11: Setup SSL (Recommended)
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Step 12: Setup Firewall
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## Monitoring & Maintenance

### View Logs
```bash
pm2 logs vyldo-platform
```

### Monitor Application
```bash
pm2 monit
```

### Restart Application
```bash
pm2 restart vyldo-platform
```

### Update Application
```bash
cd /var/www/vyldo-platform
git pull
npm install
npm run build
pm2 restart vyldo-platform
```

## Database Seeding (Optional)

Create initial categories:
```bash
node server/scripts/seedCategories.js
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000
# Kill the process
kill -9 <PID>
```

### MongoDB Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod
# Restart MongoDB
sudo systemctl restart mongod
```

### PM2 Not Starting
```bash
# Check PM2 logs
pm2 logs
# Delete and restart
pm2 delete vyldo-platform
pm2 start server/index.js --name vyldo-platform
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Set strong JWT_SECRET and SESSION_SECRET
- [ ] Enable firewall
- [ ] Install SSL certificate
- [ ] Regular backups of MongoDB
- [ ] Keep Node.js and dependencies updated
- [ ] Monitor server logs regularly
- [ ] Set up automated backups

## Support

For issues or questions, refer to the README.md file or contact the development team.

## Platform Features Checklist

- [x] User authentication (login/register)
- [x] Profile management with completion tracking
- [x] Gig creation, editing, deletion
- [x] Order management system
- [x] Real-time messaging
- [x] Hive token integration
- [x] Escrow payment system
- [x] Tiered platform fees
- [x] Manual withdrawal system
- [x] Review and rating system
- [x] Admin panel
- [x] Notifications
- [x] Search and filtering
- [x] Responsive design

All features are production-ready and fully functional!
