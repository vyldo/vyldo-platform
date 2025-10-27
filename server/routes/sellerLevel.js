import express from 'express';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { protect } from '../middleware/auth.js';
import { calculateSellerLevel, getProgressToNextLevel } from '../utils/sellerLevel.js';

const router = express.Router();

// Get seller level and progress
router.get('/my-level', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Calculate stats
    const completedOrders = await Order.countDocuments({
      seller: req.user._id,
      status: 'completed'
    });

    const orders = await Order.find({
      seller: req.user._id,
      status: 'completed'
    });

    const totalEarnings = orders.reduce((sum, order) => sum + (order.sellerEarnings || 0), 0);

    const ratings = orders.filter(o => o.rating).map(o => o.rating);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
      : 0;

    const stats = {
      totalOrders: completedOrders,
      totalEarnings,
      rating: {
        average: averageRating,
        count: ratings.length
      }
    };

    const levelInfo = calculateSellerLevel(user, stats);
    const progress = getProgressToNextLevel(user, stats);

    // Update user's seller level if changed
    if (user.sellerLevel !== levelInfo.level) {
      user.sellerLevel = levelInfo.level;
      await user.save();
    }

    res.json({
      success: true,
      level: levelInfo,
      progress,
      stats
    });
  } catch (error) {
    console.error('Error fetching seller level:', error);
    res.status(500).json({ message: 'Failed to fetch seller level' });
  }
});

// Get seller level for any user (public)
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate stats
    const completedOrders = await Order.countDocuments({
      seller: req.params.userId,
      status: 'completed'
    });

    const orders = await Order.find({
      seller: req.params.userId,
      status: 'completed'
    });

    const totalEarnings = orders.reduce((sum, order) => sum + (order.sellerEarnings || 0), 0);

    const ratings = orders.filter(o => o.rating).map(o => o.rating);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
      : 0;

    const stats = {
      totalOrders: completedOrders,
      totalEarnings,
      rating: {
        average: averageRating,
        count: ratings.length
      }
    };

    const levelInfo = calculateSellerLevel(user, stats);

    res.json({
      success: true,
      level: levelInfo,
      stats
    });
  } catch (error) {
    console.error('Error fetching seller level:', error);
    res.status(500).json({ message: 'Failed to fetch seller level' });
  }
});

export default router;
