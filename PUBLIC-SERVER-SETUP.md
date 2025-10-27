# 🌐 Vyldo Platform - Public Server Setup Guide

## 📋 Prerequisites

1. **Ngrok Account (Free)**
   - Sign up: https://ngrok.com/
   - Get your authtoken from dashboard

2. **Stable Internet Connection**
   - Required for tunneling

3. **Laptop Should Stay On**
   - Server runs on your laptop

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Ngrok

**Option A - Download:**
```
1. Go to: https://ngrok.com/download
2. Download for Windows
3. Extract ngrok.exe
4. Move to: C:\ngrok\ngrok.exe
5. Add C:\ngrok to PATH
```

**Option B - NPM:**
```bash
npm install -g ngrok
```

### Step 2: Setup Ngrok Auth

```bash
# Get token from: https://dashboard.ngrok.com/get-started/your-authtoken
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

### Step 3: Run Public Server

**Just double-click:**
```
START-PUBLIC-SERVER.bat
```

**Or manually:**
```bash
# Terminal 1 - Start Vyldo
npm run dev

# Terminal 2 - Backend Tunnel
ngrok http 5000

# Terminal 3 - Frontend Tunnel  
ngrok http 5173
```

### Step 4: Get Your Public URLs

Ngrok will show:
```
Backend:  https://abc123.ngrok-free.app
Frontend: https://xyz456.ngrok-free.app
```

### Step 5: Update Environment

Update `.env`:
```env
CLIENT_URL=https://xyz456.ngrok-free.app
SERVER_URL=https://abc123.ngrok-free.app
```

Restart server after updating!

---

## 🔧 Alternative Methods

### Method 1: LocalTunnel (No Signup)

```bash
# Install
npm install -g localtunnel

# Start server
npm run dev

# Create tunnels
lt --port 5000 --subdomain vyldo-api
lt --port 5173 --subdomain vyldo-app
```

**URLs:**
```
Backend:  https://vyldo-api.loca.lt
Frontend: https://vyldo-app.loca.lt
```

### Method 2: Serveo (SSH Tunnel)

```bash
# Backend
ssh -R 80:localhost:5000 serveo.net

# Frontend
ssh -R 80:localhost:5173 serveo.net
```

### Method 3: Cloudflare Tunnel (Best for Production)

```bash
# Install
# Download from: https://developers.cloudflare.com/cloudflare-one/

# Login
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create vyldo

# Run tunnel
cloudflared tunnel --url http://localhost:5000
```

---

## 📱 Access from Anywhere

### Share These URLs:

**For Team Members:**
```
Frontend: https://your-frontend-url.ngrok-free.app
```

**For API Testing:**
```
Backend: https://your-backend-url.ngrok-free.app
```

### Mobile Access:

1. Open browser on phone
2. Enter frontend URL
3. ✅ Works perfectly!

### Remote Team Access:

1. Share frontend URL via WhatsApp/Email
2. Team can access from anywhere
3. ✅ Real-time collaboration!

---

## ⚙️ Configuration

### Update CORS (server/index.js)

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend-url.ngrok-free.app'
  ],
  credentials: true
}));
```

### Update Socket.IO

```javascript
const io = new Server(httpServer, {
  cors: {
    origin: 'https://your-frontend-url.ngrok-free.app',
    credentials: true,
  },
});
```

### Update Frontend API (src/lib/axios.js)

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://your-backend-url.ngrok-free.app',
  withCredentials: true,
});
```

---

## 🔒 Security Tips

### 1. Use HTTPS Only
- Ngrok provides HTTPS by default ✅

### 2. Add Authentication
- Already implemented in Vyldo ✅

### 3. Rate Limiting
- Already configured ✅

### 4. Don't Share Credentials
- Keep .env file private
- Don't commit to GitHub

### 5. Monitor Access
- Check ngrok dashboard
- View request logs

---

## 📊 Monitoring

### Ngrok Dashboard
```
https://dashboard.ngrok.com/endpoints
```

**Shows:**
- Active connections
- Request count
- Bandwidth usage
- Error logs

### Server Logs
```bash
# Watch logs in real-time
npm run dev
```

---

## 🐛 Troubleshooting

### Issue 1: Ngrok Not Found
```bash
# Install globally
npm install -g ngrok

# Or download exe and add to PATH
```

### Issue 2: Port Already in Use
```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue 3: CORS Error
```javascript
// Add your ngrok URL to CORS whitelist
origin: ['https://your-url.ngrok-free.app']
```

### Issue 4: Tunnel Expired
```bash
# Free ngrok tunnels expire after 2 hours
# Just restart ngrok
ngrok http 5000
```

### Issue 5: Slow Connection
```bash
# Use ngrok with region
ngrok http 5000 --region=in
```

---

## 💡 Pro Tips

### 1. Custom Subdomain (Paid)
```bash
ngrok http 5000 --subdomain=vyldo-api
# URL: https://vyldo-api.ngrok.io
```

### 2. Save Configuration
Create `ngrok.yml`:
```yaml
authtoken: YOUR_TOKEN
tunnels:
  backend:
    proto: http
    addr: 5000
  frontend:
    proto: http
    addr: 5173
```

Run:
```bash
ngrok start --all
```

### 3. Keep Laptop Awake
```
Settings > Power > Never Sleep
```

### 4. Auto-Start on Boot
```
1. Press Win+R
2. Type: shell:startup
3. Copy START-PUBLIC-SERVER.bat shortcut
```

### 5. Use Static IP (Advanced)
```bash
# Reserve ngrok static domain (paid feature)
ngrok http 5000 --hostname=vyldo.ngrok.io
```

---

## 📈 Performance

### Expected Performance:
- **Latency:** +50-100ms (due to tunnel)
- **Bandwidth:** Depends on your internet
- **Concurrent Users:** 10-50 (free tier)

### Optimize:
1. Close unnecessary apps
2. Use wired connection (not WiFi)
3. Upgrade ngrok plan for better performance

---

## 💰 Pricing

### Ngrok Free:
- ✅ HTTPS tunnels
- ✅ Random URLs
- ✅ 1 online ngrok process
- ❌ Custom domains
- ❌ Reserved URLs

### Ngrok Paid ($8/month):
- ✅ Everything in free
- ✅ Custom domains
- ✅ Reserved URLs
- ✅ More concurrent tunnels
- ✅ Better performance

---

## 🎯 Use Cases

### 1. Remote Development
```
Work from anywhere on your project
```

### 2. Client Demos
```
Show live progress to clients
```

### 3. Team Collaboration
```
Multiple developers access same server
```

### 4. Mobile Testing
```
Test on real devices
```

### 5. API Testing
```
Test webhooks and integrations
```

---

## 📞 Support

### Ngrok Issues:
- Docs: https://ngrok.com/docs
- Support: support@ngrok.com

### Vyldo Issues:
- Contact: Aftab Irshad
- GitHub: [Your Repo]

---

## ✅ Checklist

Before going public:

- [ ] Ngrok installed and configured
- [ ] Authtoken added
- [ ] Server running locally
- [ ] Ngrok tunnels active
- [ ] URLs copied
- [ ] .env updated
- [ ] Server restarted
- [ ] CORS configured
- [ ] Tested from mobile
- [ ] Shared URLs with team

---

## 🎉 Success!

Your Vyldo Platform is now accessible from anywhere in the world!

**Share your URLs and start collaborating!** 🚀
