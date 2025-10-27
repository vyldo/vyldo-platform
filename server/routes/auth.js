import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { Wallet } from '../models/Wallet.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'vyldo-secret-jwt-key', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName, username, phone } = req.body;

    if (!email || !password || !displayName || !username) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const existingUser = await User.findOne({ 
      $or: [{ email }, { username: username.toLowerCase() }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken' 
      });
    }

    const user = await User.create({
      email,
      password,
      displayName,
      username: username.toLowerCase(),
      phone,
    });

    await Wallet.create({
      user: user._id,
    });

    const token = generateToken(user._id);

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', { email, passwordLength: password?.length });

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('✅ User found:', { email: user.email, role: user.role, hasPassword: !!user.password });

    if (user.isSuspended) {
      console.log('⚠️ User suspended:', email);
      return res.status(403).json({ 
        message: 'Your account has been suspended', 
        reason: user.suspensionReason 
      });
    }

    if (user.isBanned) {
      console.log('⚠️ User banned:', email);
      return res.status(403).json({ 
        message: 'Your account has been banned', 
        reason: user.banReason 
      });
    }

    console.log('🔑 Comparing password...');
    const isPasswordMatch = await user.comparePassword(password);
    console.log('🔑 Password match result:', isPasswordMatch);

    if (!isPasswordMatch) {
      console.log('❌ Password mismatch for:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.lastSeen = new Date();
    await user.save();

    const token = generateToken(user._id);

    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('✅ Login successful:', { email: user.email, role: user.role });

    res.json({
      success: true,
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
});

router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');

    const isPasswordMatch = await user.comparePassword(currentPassword);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

router.post('/logout', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed' });
  }
});

export default router;
