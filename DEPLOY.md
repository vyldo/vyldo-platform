# AWS EC2 DEPLOYMENT - COMPLETE GUIDE

## STEP 1: Push to GitHub (Windows)

```powershell
cd "C:\Users\aftab\Videos\Vyldo Freelancing Platform"
git add .
git commit -m "Production ready"
git push origin main
```

## STEP 2: Connect to EC2

```powershell
ssh -i "C:\path\to\RSA.pem" ubuntu@13.61.145.155
```

## STEP 3: Clean Old Installation

```bash
pm2 stop all
pm2 delete all
cd ~
rm -rf vyldo-platform
sudo rm -rf /var/www/vyldo
sudo rm -f /etc/nginx/sites-enabled/vyldo
```

## STEP 4: Clone & Install

```bash
cd ~
git clone https://github.com/vyldo/vyldo-platform.git
cd vyldo-platform
npm install
```

## STEP 5: Create .env File

```bash
nano .env
```

Paste:
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/vyldo-platform
JWT_SECRET=change-this-to-random-32-chars-min
SESSION_SECRET=change-this-to-random-32-chars-min
CLIENT_URL=https://13.61.145.155
```

Save: Ctrl+O, Enter, Ctrl+X

## STEP 6: Build & Deploy

```bash
npm run build
sudo mkdir -p /var/www/vyldo
sudo cp -r dist/* /var/www/vyldo/
sudo chown -R www-data:www-data /var/www/vyldo
mkdir -p logs
```

## STEP 7: Start Backend

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## STEP 8: SSL Certificate

```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/nginx-selfsigned.key \
  -out /etc/ssl/certs/nginx-selfsigned.crt \
  -subj "/CN=13.61.145.155"
```

## STEP 9: Nginx Config

```bash
sudo nano /etc/nginx/sites-available/vyldo
```

Paste complete nginx config, then:

```bash
sudo ln -s /etc/nginx/sites-available/vyldo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## STEP 10: Open Browser

Visit: https://13.61.145.155

Accept security warning and proceed!
