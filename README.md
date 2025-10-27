# Vyldo Freelancing Platform

A complete, production-ready freelancing marketplace platform with Hive blockchain integration for payments.

## Features

- **User Management**: Complete authentication, profile management with progress tracking
- **Gig System**: Create, edit, delete gigs with 3-tier packages (Basic/Standard/Premium)
- **Order Management**: Full order lifecycle from placement to completion
- **Real-time Messaging**: Socket.IO powered chat system
- **Hive Token Payments**: All transactions in HIVE cryptocurrency
- **Escrow System**: Secure payment holding via @vyldo-escrow
- **Tiered Platform Fees**: 
  - 1-2000 HIVE: 9%
  - 2000-5000 HIVE: 8%
  - 5000-9000 HIVE: 7%
  - 9000+ HIVE: 6%
- **Manual Withdrawal System**: Admin-reviewed withdrawals
- **Review System**: Verified buyer reviews only
- **Admin Panel**: Complete platform management
- **Responsive Design**: Modern, beautiful UI with TailwindCSS

## Tech Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- Socket.IO for real-time features
- JWT authentication
- Hive blockchain integration (@hiveio/dhive)
- Multer for file uploads

### Frontend
- React 18
- React Router v6
- Zustand for state management
- React Query for data fetching
- TailwindCSS for styling
- Lucide React for icons
- Axios for API calls

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- Git

### Setup Steps

1. **Clone the repository**
```bash
cd "c:\Users\aftab\Videos\Vyldo Freelancing Platform"
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vyldo-platform
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret
HIVE_ESCROW_ACCOUNT=vyldo-escrow
CLIENT_URL=http://localhost:5173
```

4. **Start MongoDB**
Make sure MongoDB is running on your system.

5. **Run the application**

Development mode (both frontend and backend):
```bash
npm run dev
```

Or run separately:
```bash
npm run server
npm run client
```

6. **Build for production**
```bash
npm run build
npm start
```

## Deployment to VPS (Hostinger KVM1)

### Prerequisites on VPS
- Ubuntu 20.04 or higher
- Node.js v18+
- MongoDB
- Nginx
- PM2 for process management

### Deployment Steps

1. **Connect to your VPS**
```bash
ssh root@your-vps-ip
```

2. **Install required software**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y mongodb
sudo npm install -g pm2
```

3. **Clone your repository**
```bash
cd /var/www
git clone <your-repo-url> vyldo-platform
cd vyldo-platform
```

4. **Install dependencies**
```bash
npm install
```

5. **Configure environment**
```bash
cp .env.example .env
nano .env
```

Update with production values:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vyldo-platform
JWT_SECRET=<generate-strong-secret>
SESSION_SECRET=<generate-strong-secret>
HIVE_ESCROW_ACCOUNT=vyldo-escrow
CLIENT_URL=https://yourdomain.com
```

6. **Build the application**
```bash
npm run build
```

7. **Start with PM2**
```bash
pm2 start server/index.js --name vyldo-platform
pm2 save
pm2 startup
```

8. **Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/vyldo-platform
```

Add configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/vyldo-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

9. **Setup SSL (optional but recommended)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

10. **Monitor application**
```bash
pm2 logs vyldo-platform
pm2 monit
```

## Usage

### Creating an Account
1. Visit the platform
2. Click "Sign Up"
3. Fill in required details
4. Verify email (if configured)

### Completing Profile (Required for Sellers)
Sellers must complete 100% of their profile before posting gigs:
- Display name and avatar
- Bio (minimum 50 characters)
- Skills (minimum 3)
- Languages (minimum 1)
- Education (minimum 1 entry)
- Experience (minimum 1 entry)
- Portfolio (minimum 1 project)

### Creating a Gig
1. Complete your profile to 100%
2. Navigate to "Create Gig"
3. Fill in all details
4. Add 3 packages (Basic, Standard, Premium)
5. Set pricing in HIVE tokens
6. Publish

### Ordering a Gig
1. Browse or search for gigs
2. Select package
3. Provide requirements
4. Payment held in escrow
5. Seller delivers
6. Buyer accepts
7. Funds released to seller (minus platform fee)

### Withdrawing Funds
1. Go to Wallet
2. Click "Withdraw"
3. Enter Hive account name
4. Enter amount
5. Add memo (optional)
6. Submit request
7. Wait for admin approval
8. Receive HIVE in your wallet

## Platform Fees

Automatic fee deduction based on order value:
- **1-2000 HIVE**: 9% platform fee
- **2000-5000 HIVE**: 8% platform fee
- **5000-9000 HIVE**: 7% platform fee
- **9000+ HIVE**: 6% platform fee

## Security Features

- Bcrypt password hashing
- JWT token authentication
- Rate limiting
- XSS protection
- MongoDB injection prevention
- Helmet security headers
- Session management
- Input validation
- File upload restrictions

## Support

For issues or questions, contact the development team.

## Credits

**Created by Aftab Irshad**

## License

Proprietary - All rights reserved
