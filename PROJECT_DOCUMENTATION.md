# 📚 Vyldo Freelancing Platform - Complete Documentation

## 🎯 Project Overview

**Project Name:** Vyldo Freelancing Platform  
**Type:** Full-Stack Web Application  
**Purpose:** Blockchain-based freelancing marketplace  
**Technology:** MERN Stack + Hive Blockchain  
**Created By:** Aftab Irshad  
**Version:** 1.0.0  

---

## 📋 Project Summary

Vyldo ek complete freelancing platform hai jahan:
- Freelancers apni services (gigs) bech sakte hain
- Buyers services khareed sakte hain
- Payments Hive blockchain se hoti hain (cryptocurrency)
- Real-time messaging hai
- Admin panel hai management ke liye
- Secure aur professional platform hai

---

## 🛠️ Technologies Used

### Frontend (Client Side):
- React 18 - User interface
- Vite - Fast build tool
- TailwindCSS - Styling
- React Router - Page navigation
- React Query - Data management
- Zustand - State management
- Socket.io - Real-time chat
- Axios - API calls

### Backend (Server Side):
- Node.js - JavaScript runtime
- Express - Web framework
- MongoDB - Database
- Mongoose - Database modeling
- JWT - Authentication
- Bcrypt - Password encryption
- Multer - File uploads
- Socket.io - WebSocket server

### Blockchain:
- Hive Blockchain - Payments
- @hiveio/dhive - Hive integration

---

## ✨ Main Features

### 1. User Features:
- Register/Login
- Profile management
- Upload avatar & cover
- Add portfolio
- Skills & bio

### 2. Gig Features:
- Create gigs
- 3 packages (Basic, Standard, Premium)
- Upload images
- Set prices in HIVE
- Categories & tags
- Edit/Delete gigs

### 3. Order Features:
- Buy gigs
- Pay with Hive
- Track orders
- Submit requirements
- Receive deliverables
- Request revisions
- Complete orders

### 4. Messaging:
- Real-time chat
- Send files
- Online status
- Unread messages

### 5. Wallet:
- Check balance
- View earnings
- Withdraw money
- Transaction history

### 6. Reviews:
- Rate sellers (1-5 stars)
- Write reviews
- View ratings

### 7. Admin Panel:
- View statistics
- Manage users
- Manage gigs
- Approve withdrawals
- Handle support tickets
- Team management

---

## 📁 File Structure

```
vyldo-platform/
│
├── server/                      # Backend code
│   ├── models/                  # Database schemas
│   ├── routes/                  # API endpoints
│   ├── middleware/              # Auth & validation
│   ├── scripts/                 # Helper scripts
│   └── index.js                 # Main server file
│
├── src/                         # Frontend code
│   ├── components/              # Reusable components
│   ├── pages/                   # Page components
│   ├── store/                   # State management
│   ├── lib/                     # Utilities
│   └── App.jsx                  # Main app
│
├── uploads/                     # Uploaded files
│   ├── avatars/
│   ├── gigs/
│   ├── portfolios/
│   └── hero/
│
├── .env                         # Configuration
├── package.json                 # Dependencies
└── README.md                    # Documentation
```

---

## 🗄️ Database Collections

### 1. Users Collection:
```
- _id
- username
- email
- password (encrypted)
- displayName
- avatar
- coverImage
- bio
- skills
- portfolio
- role (user/seller/admin/team)
- wallet address
- createdAt
```

### 2. Gigs Collection:
```
- _id
- seller (user reference)
- title
- description
- category
- subcategory
- images (array)
- packages (basic, standard, premium)
- tags
- rating
- reviewCount
- isActive
- createdAt
```

### 3. Orders Collection:
```
- _id
- buyer (user reference)
- seller (user reference)
- gig (gig reference)
- packageType
- totalAmount
- platformFee
- sellerEarnings
- status
- requirements
- deliverables
- dueDate
- completedAt
```

### 4. Messages Collection:
```
- _id
- sender (user reference)
- receiver (user reference)
- content
- attachments
- isRead
- createdAt
```

### 5. Reviews Collection:
```
- _id
- order (order reference)
- reviewer (user reference)
- reviewee (user reference)
- rating (1-5)
- comment
- createdAt
```

### 6. Withdrawals Collection:
```
- _id
- user (user reference)
- amount
- hiveUsername
- status (pending/completed/rejected)
- createdAt
```

### 7. Support Tickets Collection:
```
- _id
- user (user reference)
- subject
- category
- priority
- status
- messages (array)
- createdAt
```

---

## 🔌 API Endpoints

### Authentication:
```
POST   /api/auth/register        - Register new user
POST   /api/auth/login           - Login user
GET    /api/auth/me              - Get current user
POST   /api/auth/logout          - Logout user
```

### Users:
```
GET    /api/users/:id            - Get user profile
PUT    /api/users/profile        - Update profile
POST   /api/users/avatar         - Upload avatar
POST   /api/users/cover          - Upload cover
POST   /api/users/portfolio      - Add portfolio
```

### Gigs:
```
GET    /api/gigs                 - Get all gigs
GET    /api/gigs/:id             - Get single gig
POST   /api/gigs                 - Create gig
PUT    /api/gigs/:id             - Update gig
DELETE /api/gigs/:id             - Delete gig
POST   /api/gigs/:id/images      - Upload images
```

### Orders:
```
GET    /api/orders               - Get user orders
GET    /api/orders/:id           - Get single order
POST   /api/orders               - Create order
PUT    /api/orders/:id           - Update order
POST   /api/orders/:id/requirements  - Submit requirements
POST   /api/orders/:id/deliver   - Submit deliverable
POST   /api/orders/:id/revision  - Request revision
POST   /api/orders/:id/complete  - Complete order
```

### Messages:
```
GET    /api/messages             - Get conversations
GET    /api/messages/:userId     - Get messages with user
POST   /api/messages             - Send message
POST   /api/messages/attachment  - Upload attachment
```

### Reviews:
```
GET    /api/reviews/gig/:gigId   - Get gig reviews
POST   /api/reviews              - Create review
```

### Wallet:
```
GET    /api/wallet/balance       - Get balance
GET    /api/wallet/transactions  - Get transactions
POST   /api/wallet/withdraw      - Request withdrawal
```

### Admin:
```
GET    /api/admin/stats          - Get statistics
GET    /api/admin/users          - Get all users
GET    /api/admin/gigs           - Get all gigs
GET    /api/admin/orders         - Get all orders
GET    /api/admin/withdrawals    - Get withdrawals
PUT    /api/admin/withdrawals/:id - Approve/reject
```

---

## 🌐 Frontend Routes

```
/                     - Home page
/login                - Login page
/register             - Register page
/gigs                 - Browse gigs
/gigs/:id             - Gig details
/create-gig           - Create new gig
/orders               - User orders
/orders/:id           - Order details
/messages             - Messages inbox
/messages/:userId     - Chat with user
/profile/:username    - User profile
/profile/edit         - Edit profile
/wallet               - Wallet page
/support              - Support tickets
/admin                - Admin dashboard
/admin/users          - Manage users
/admin/gigs           - Manage gigs
/admin/orders         - Manage orders
/admin/withdrawals    - Manage withdrawals
/admin/support        - Support tickets
/admin/team           - Team management
/admin/hero-settings  - Hero video settings
```

---

## 🔐 Environment Variables

```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/vyldo-platform

# JWT
JWT_SECRET=your-secret-key-here

# Hive Blockchain
HIVE_NODE=https://api.hive.blog
HIVE_ACCOUNT=your-hive-account
HIVE_ACTIVE_KEY=your-active-key

# Frontend
VITE_API_URL=http://localhost:5000

# File Upload
MAX_FILE_SIZE=104857600

# Session
SESSION_SECRET=your-session-secret
```

---

## 📦 Dependencies

### Production Dependencies:
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.3",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "multer": "^1.4.5-lts.1",
  "socket.io": "^4.6.1",
  "express-rate-limit": "^7.1.5",
  "@hiveio/dhive": "^1.2.8",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.21.1",
  "react-query": "^3.39.3",
  "zustand": "^4.4.7",
  "axios": "^1.6.5"
}
```

---

## 🎯 Key Features Explained

### 1. Hive Blockchain Integration:
- Users pay with HIVE cryptocurrency
- Secure and transparent transactions
- No chargebacks
- Low fees
- Fast transfers

### 2. Real-time Messaging:
- Socket.io for instant messages
- Online/offline status
- Typing indicators
- File sharing

### 3. Three-tier Gig Packages:
- Basic: Entry-level service
- Standard: Mid-tier with more features
- Premium: Full-featured package

### 4. Admin Panel:
- Complete platform control
- User management
- Content moderation
- Financial oversight
- Support system

### 5. Security:
- Password encryption
- JWT tokens
- Rate limiting
- Input validation
- File upload restrictions

---

## 📊 Platform Statistics

Admin can view:
- Total users
- Total gigs
- Total orders
- Active orders
- Completed orders
- Platform earnings
- Pending withdrawals
- Cancelled orders

---

## 🎨 Design Features

- Responsive design (mobile, tablet, desktop)
- Modern UI with TailwindCSS
- Dark/light compatible
- Smooth animations
- Professional layout
- User-friendly interface

---

## 🚀 Deployment

Platform can be deployed on:
- Hostinger VPS
- DigitalOcean
- AWS
- Heroku
- Vercel (frontend)

Requirements:
- Node.js 20+
- MongoDB
- Nginx (production)
- SSL certificate
- Domain name

---

## 📝 Scripts Available

```bash
npm run dev          # Start development
npm run server       # Start backend only
npm run client       # Start frontend only
npm run build        # Build for production
npm run start        # Start production server
npm run create-admin # Create admin user
npm run seed-categories # Add categories
npm run clear-hero   # Clear hero settings
```

---

## 💰 Revenue Model

Platform earns through:
- 5% platform fee on each order
- Collected from completed orders
- Stored in platform wallet
- Visible in admin dashboard

---

## 🔄 Order Workflow

1. Buyer browses gigs
2. Selects package
3. Places order
4. Pays with HIVE
5. Seller receives notification
6. Buyer submits requirements
7. Seller works on order
8. Seller submits deliverable
9. Buyer reviews work
10. Buyer accepts or requests revision
11. Order completes
12. Funds released to seller
13. Both can leave reviews

---

## 👥 User Roles

### User:
- Browse gigs
- Place orders
- Message sellers

### Seller:
- All user features
- Create gigs
- Manage orders
- Earn money

### Admin:
- Full platform access
- Manage all content
- Approve withdrawals
- View analytics

### Team:
- Limited admin access
- Based on permissions
- Support & moderation

---

## 🎯 Target Audience

- Freelancers (sellers)
- Businesses (buyers)
- Crypto enthusiasts
- Remote workers
- Digital service providers

---

## 📱 Supported Devices

- Desktop (Windows, Mac, Linux)
- Tablets (iPad, Android)
- Mobile (iOS, Android)
- All modern browsers

---

## 🌍 Scalability

Platform can handle:
- Thousands of users
- Unlimited gigs
- Concurrent orders
- Real-time messages
- File uploads

---

## 🔧 Maintenance

Regular tasks:
- Database backups
- Server monitoring
- Security updates
- Bug fixes
- Feature additions

---

## 📞 Support

Users can:
- Create support tickets
- Get admin help
- Report issues
- Request features

---

## ✅ Quality Assurance

- Input validation
- Error handling
- Loading states
- Success messages
- User feedback

---

## 🎉 Conclusion

Vyldo ek complete, production-ready freelancing platform hai jo:
- Modern technologies use karta hai
- Secure aur scalable hai
- User-friendly interface hai
- Blockchain payments support karta hai
- Professional features provide karta hai

**Ready for launch!** 🚀

---

**Created by Aftab Irshad**  
**Version 1.0.0**  
**Date: October 2024**
