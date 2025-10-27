import express from 'express';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Gig from '../models/Gig.js';
import { Wallet } from '../models/Wallet.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { reassignPendingTasks } from '../utils/taskAssignment.js';

const router = express.Router();

router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -twoFactorSecret');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate actual stats
    const completedOrders = await Order.countDocuments({
      seller: user._id,
      status: 'completed'
    });

    const totalGigs = await Gig.countDocuments({
      seller: user._id,
      isActive: true
    });

    // Calculate average rating from reviews
    const Review = (await import('../models/Review.js')).default;
    const reviews = await Review.find({ seller: user._id });
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    // Calculate total earnings
    const earnings = await Order.aggregate([
      { $match: { seller: user._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$sellerEarnings' } } }
    ]);

    const userWithStats = {
      ...user.toObject(),
      totalOrders: completedOrders,
      totalGigs,
      rating: {
        average: avgRating,
        count: reviews.length
      },
      totalEarnings: earnings[0]?.total || 0
    };

    res.json({
      success: true,
      user: userWithStats,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

router.put('/profile', protect, async (req, res) => {
  try {
    const updates = req.body;
    
    const allowedUpdates = [
      'displayName', 'phone', 'bio', 'tagline', 'skills', 
      'languages', 'education', 'experience', 'portfolio', 'hiveAccount'
    ];

    const updateData = {};
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    user.calculateProfileCompletion();
    await user.save();

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    user.calculateProfileCompletion();
    await user.save();

    res.json({
      success: true,
      avatar: avatarUrl,
      user,
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Failed to upload avatar' });
  }
});

router.post('/cover', protect, upload.single('cover'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const coverUrl = `/uploads/covers/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { coverImage: coverUrl },
      { new: true }
    ).select('-password');

    user.calculateProfileCompletion();
    await user.save();

    res.json({
      success: true,
      coverImage: coverUrl,
      user,
    });
  } catch (error) {
    console.error('Cover upload error:', error);
    res.status(500).json({ message: 'Failed to upload cover image' });
  }
});

router.post('/portfolio', protect, upload.single('portfolio'), async (req, res) => {
  try {
    const { title, description, url } = req.body;

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/portfolios/${req.file.filename}`;
    }

    const portfolioItem = {
      title,
      description,
      image: imageUrl,
      url: url || '',
    };

    const user = await User.findById(req.user._id);
    user.portfolio.push(portfolioItem);
    user.calculateProfileCompletion();
    await user.save();

    res.json({
      success: true,
      portfolio: user.portfolio,
      user,
    });
  } catch (error) {
    console.error('Portfolio add error:', error);
    res.status(500).json({ message: 'Failed to add portfolio item' });
  }
});

router.delete('/portfolio/:itemId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.portfolio = user.portfolio.filter(
      item => item._id.toString() !== req.params.itemId
    );
    user.calculateProfileCompletion();
    await user.save();

    res.json({
      success: true,
      portfolio: user.portfolio,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete portfolio item' });
  }
});

router.post('/education', protect, async (req, res) => {
  try {
    const educationItem = req.body;

    const user = await User.findById(req.user._id);
    user.education.push(educationItem);
    user.calculateProfileCompletion();
    await user.save();

    res.json({
      success: true,
      education: user.education,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add education' });
  }
});

router.delete('/education/:itemId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.education = user.education.filter(
      item => item._id.toString() !== req.params.itemId
    );
    user.calculateProfileCompletion();
    await user.save();

    res.json({
      success: true,
      education: user.education,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete education' });
  }
});

router.post('/experience', protect, async (req, res) => {
  try {
    const experienceItem = req.body;

    const user = await User.findById(req.user._id);
    user.experience.push(experienceItem);
    user.calculateProfileCompletion();
    await user.save();

    res.json({
      success: true,
      experience: user.experience,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add experience' });
  }
});

router.delete('/experience/:itemId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.experience = user.experience.filter(
      item => item._id.toString() !== req.params.itemId
    );
    user.calculateProfileCompletion();
    await user.save();

    res.json({
      success: true,
      experience: user.experience,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete experience' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q, skills, minRating } = req.query;
    
    const query = { role: { $in: ['seller', 'admin'] }, isActive: true, isBanned: false };

    if (q) {
      query.$or = [
        { displayName: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
      ];
    }

    if (skills) {
      const skillsArray = skills.split(',');
      query.skills = { $in: skillsArray };
    }

    if (minRating) {
      query['rating.average'] = { $gte: parseFloat(minRating) };
    }

    const users = await User.find(query)
      .select('-password -twoFactorSecret')
      .sort({ 'rating.average': -1, totalOrders: -1 })
      .limit(50);

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: 'Search failed' });
  }
});

// Get user stats for dashboard
router.get('/stats', protect, async (req, res) => {
  try {
    console.log('📊 Fetching stats for user:', req.user._id);

    // Seller stats
    const activeOrders = await Order.countDocuments({
      seller: req.user._id,
      status: 'active'
    });

    const totalGigs = await Gig.countDocuments({
      seller: req.user._id,
      isActive: true
    });

    // Calculate earnings from completed orders
    const completedOrders = await Order.find({
      seller: req.user._id,
      status: 'completed'
    });

    const totalEarnings = completedOrders.reduce((sum, order) => {
      return sum + (order.sellerEarnings || 0);
    }, 0);

    // Get actual wallet balance (earnings - withdrawals + deposits)
    const wallet = await Wallet.findOne({ user: req.user._id });
    const availableBalance = wallet?.balance?.available || 0;

    // Buyer stats
    const activePurchases = await Order.countDocuments({
      buyer: req.user._id,
      status: { $in: ['active', 'delivered'] }
    });

    const totalPurchases = await Order.countDocuments({
      buyer: req.user._id
    });

    const purchaseOrders = await Order.find({
      buyer: req.user._id,
      status: 'completed'
    });

    const totalSpent = purchaseOrders.reduce((sum, order) => {
      return sum + (order.totalAmount || 0);
    }, 0);

    console.log('✅ Stats calculated:', {
      activeOrders,
      totalGigs,
      availableBalance,
      totalEarnings,
      activePurchases,
      totalPurchases,
      totalSpent
    });

    res.json({
      success: true,
      stats: {
        // Seller stats
        activeOrders,
        totalGigs,
        balance: availableBalance, // Real wallet balance
        totalEarnings, // Total lifetime earnings
        
        // Buyer stats
        activePurchases,
        totalPurchases,
        totalSpent,
        savedGigs: 0
      }
    });
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// Toggle own availability (for team members)
router.put('/availability', protect, async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const user = await User.findById(req.user._id);

    // Check if user is team member or admin
    if (user.role !== 'team' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Only team members can toggle availability' });
    }

    // Check if admin has locked availability
    if (user.availabilityLockedByAdmin) {
      return res.status(403).json({ 
        message: 'Your availability is controlled by admin. Please contact admin to change.',
        lockedByAdmin: true
      });
    }

    console.log(`🔄 Team member ${user.displayName} toggling availability: ${isAvailable}`);

    // If going offline, reassign pending tasks
    if (!isAvailable && user.isAvailableForTasks) {
      console.log(`📤 Team member going offline, reassigning tasks...`);
      const reassigned = await reassignPendingTasks(user._id);
      
      user.isAvailableForTasks = false;
      await user.save();

      return res.json({
        success: true,
        message: 'You are now offline',
        isAvailable: false,
        reassigned,
      });
    }

    // If going online
    user.isAvailableForTasks = isAvailable;
    await user.save();

    console.log(`✅ Team member availability updated`);

    res.json({
      success: true,
      message: isAvailable ? 'You are now available for tasks' : 'You are now offline',
      isAvailable,
    });
  } catch (error) {
    console.error('❌ Availability toggle error:', error);
    res.status(500).json({ message: 'Failed to update availability' });
  }
});

// Get own availability status
router.get('/availability', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('isAvailableForTasks availabilityLockedByAdmin role permissions taskStats');

    if (user.role !== 'team' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Not a team member' });
    }

    res.json({
      success: true,
      isAvailable: user.isAvailableForTasks,
      lockedByAdmin: user.availabilityLockedByAdmin,
      canToggle: !user.availabilityLockedByAdmin,
      taskStats: user.taskStats,
    });
  } catch (error) {
    console.error('❌ Get availability error:', error);
    res.status(500).json({ message: 'Failed to fetch availability' });
  }
});

export default router;
