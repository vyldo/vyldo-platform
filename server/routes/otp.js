import express from 'express';
import OTP from '../models/OTP.js';
import User from '../models/User.js';
import { sendOTPEmail } from '../utils/emailService.js';
import geoip from 'geoip-lite';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter: Max 3 OTP requests per 15 minutes per IP
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: 'Too many OTP requests. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Get location from IP
const getLocationFromIP = (ip) => {
  try {
    // Remove IPv6 prefix if present
    const cleanIP = ip.replace(/^::ffff:/, '');
    
    // Skip localhost
    if (cleanIP === '127.0.0.1' || cleanIP === 'localhost') {
      return 'Local Development';
    }

    const geo = geoip.lookup(cleanIP);
    if (geo) {
      return `${geo.city || 'Unknown'}, ${geo.country || 'Unknown'}`;
    }
    return 'Unknown Location';
  } catch (error) {
    console.error('Location lookup error:', error);
    return 'Unknown Location';
  }
};

// Send OTP for Signup
router.post('/send-signup-otp', otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Delete old OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase(), type: 'signup' });

    // Generate OTP
    const otp = generateOTP();
    const ipAddress = req.ip || req.connection.remoteAddress;
    const location = getLocationFromIP(ipAddress);

    // Save OTP to database (will be hashed automatically)
    const otpDoc = await OTP.create({
      email: email.toLowerCase(),
      otp,
      type: 'signup',
      ipAddress,
      location,
    });

    // Send email
    await sendOTPEmail(email, otp, 'signup', ipAddress, location);

    res.json({
      success: true,
      message: 'OTP sent to your email',
      expiresIn: 300, // 5 minutes in seconds
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: error.message || 'Failed to send OTP' });
  }
});

// Verify OTP for Signup
router.post('/verify-signup-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find OTP
    const otpDoc = await OTP.findOne({
      email: email.toLowerCase(),
      type: 'signup',
      isUsed: false,
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.status(400).json({ message: 'OTP not found or expired' });
    }

    // Check if expired
    if (new Date() > otpDoc.expiresAt) {
      await OTP.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    // Check attempts
    if (otpDoc.attempts >= 4) {
      await OTP.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({ message: 'Maximum attempts exceeded. Please request a new OTP.' });
    }

    // Verify OTP
    const isValid = await otpDoc.verifyOTP(otp);

    if (!isValid) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      
      const remainingAttempts = 4 - otpDoc.attempts;
      return res.status(400).json({ 
        message: `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.` 
      });
    }

    // Mark as used
    otpDoc.isUsed = true;
    await otpDoc.save();

    res.json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

// Send OTP for Password Reset
router.post('/send-reset-otp', otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'No account found with this email' });
    }

    // Delete old OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase(), type: 'password-reset' });

    // Generate OTP
    const otp = generateOTP();
    const ipAddress = req.ip || req.connection.remoteAddress;
    const location = getLocationFromIP(ipAddress);

    // Save OTP to database
    await OTP.create({
      email: email.toLowerCase(),
      otp,
      type: 'password-reset',
      ipAddress,
      location,
    });

    // Send email
    await sendOTPEmail(email, otp, 'password-reset', ipAddress, location);

    res.json({
      success: true,
      message: 'Password reset OTP sent to your email',
      expiresIn: 300,
    });
  } catch (error) {
    console.error('Send reset OTP error:', error);
    res.status(500).json({ message: error.message || 'Failed to send OTP' });
  }
});

// Verify OTP for Password Reset
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find OTP
    const otpDoc = await OTP.findOne({
      email: email.toLowerCase(),
      type: 'password-reset',
      isUsed: false,
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.status(400).json({ message: 'OTP not found or expired' });
    }

    // Check if expired
    if (new Date() > otpDoc.expiresAt) {
      await OTP.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    // Check attempts
    if (otpDoc.attempts >= 4) {
      await OTP.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({ message: 'Maximum attempts exceeded. Please request a new OTP.' });
    }

    // Verify OTP
    const isValid = await otpDoc.verifyOTP(otp);

    if (!isValid) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      
      const remainingAttempts = 4 - otpDoc.attempts;
      return res.status(400).json({ 
        message: `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.` 
      });
    }

    // Mark as used
    otpDoc.isUsed = true;
    await otpDoc.save();

    res.json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

// Reset Password (after OTP verification)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Check if OTP was verified (must have a used OTP within last 10 minutes)
    const recentOTP = await OTP.findOne({
      email: email.toLowerCase(),
      type: 'password-reset',
      isUsed: true,
      createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
    }).sort({ createdAt: -1 });

    if (!recentOTP) {
      return res.status(400).json({ message: 'Please verify OTP first' });
    }

    // Find user and update password
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    // Delete all reset OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase(), type: 'password-reset' });

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

export default router;
