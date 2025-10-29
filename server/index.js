import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import gigRoutes from './routes/gig.js';
import orderRoutes from './routes/order.js';
import messageRoutes from './routes/message.js';
import reviewRoutes from './routes/review.js';
import walletRoutes from './routes/wallet.js';
import withdrawalRoutes from './routes/withdrawal.js';
import adminRoutes from './routes/admin.js';
import categoryRoutes from './routes/category.js';
import notificationRoutes from './routes/notification.js';
import supportRoutes from './routes/support.js';
import supportAdminRoutes from './routes/supportAdmin.js';
import settingsRoutes from './routes/settings.js';
import sellerLevelRoutes from './routes/sellerLevel.js';

import { errorHandler } from './middleware/errorHandler.js';
import { setupSocketHandlers } from './socket/index.js';
import { startAutoAssignment } from './utils/autoAssignWithdrawals.js';
import Category from './models/Category.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy - required for Nginx reverse proxy
app.set('trust proxy', 1);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: true, // Allow all origins in production
    credentials: true,
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vyldo-platform', {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(async () => {
    console.log('✅ MongoDB connected successfully');
    
    // Auto-seed categories if none exist
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log('📊 No categories found, seeding default categories...');
      try {
        const { default: seedCategoriesData } = await import('./scripts/seedCategoriesData.js');
        await Category.insertMany(seedCategoriesData);
        console.log(`✅ Successfully seeded ${seedCategoriesData.length} categories`);
      } catch (err) {
        console.error('❌ Failed to seed categories:', err.message);
      }
    } else {
      console.log(`📊 Found ${categoryCount} categories in database`);
    }
    
    // Start auto-assignment service for withdrawals
    startAutoAssignment();
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Enhanced Helmet security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https:", "http:", "ws:", "wss:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
}));

// CORS configuration for production
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow production domain/IP
    if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) {
      return callback(null, true);
    }
    
    // Allow any HTTPS origin in production (for AWS EC2)
    if (process.env.NODE_ENV === 'production') {
      return callback(null, true);
    }
    
    // Allow tunnel services for development
    if (
      origin.includes('serveo.net') ||
      origin.includes('localhost.run') ||
      origin.includes('ngrok.io') ||
      origin.includes('ngrok-free.app') ||
      origin.includes('loca.lt') ||
      origin.includes('bore.pub') ||
      origin.includes('trycloudflare.com') ||
      origin.includes('pinggy.io')
    ) {
      return callback(null, true);
    }
    
    callback(null, true); // Allow all in production for now
  },
  credentials: true,
}));

app.use(compression());

// Request body size limits and sanitization
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Prevent NoSQL injection attacks
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️ Sanitized request from ${req.ip}: ${key}`);
  },
}));

// Additional security middleware
app.use((req, res, next) => {
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Strict transport security
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  next();
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'vyldo-secret-key',
  resave: false,
  saveUninitialized: false,
  name: 'sessionId', // Hide default session name
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

// General rate limiter - more lenient for production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window (increased for production)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  },
});

// Strict rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login/register attempts (increased for production)
  message: 'Too many authentication attempts, please try again after 15 minutes.',
  skipSuccessfulRequests: true,
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin/support', supportAdminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/seller-level', sellerLevelRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

setupSocketHandlers(io);

app.use(errorHandler);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { io };
