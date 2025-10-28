import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/User.js';
import Gig from '../models/Gig.js';
import Order from '../models/Order.js';
import Withdrawal from '../models/Withdrawal.js';
import { protect } from '../middleware/auth.js';
import { requireAdmin, requireAdminOrTeam, requirePermission } from '../middleware/adminAuth.js';
import { generateAnalyticsReport } from '../utils/pdfGenerator.js';
import { createNotification } from '../utils/notifications.js';
import bcrypt from 'bcryptjs';
import { 
  getTeamMemberStats, 
  reassignPendingTasks,
  lockWithdrawal,
  unlockWithdrawal,
  checkDuplicateWithdrawal,
  updateTeamMemberStats
} from '../utils/taskAssignment.js';

const router = express.Router();

// Multer config for verified badge upload
const badgeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/verified-badges';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'badge-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const badgeUpload = multer({
  storage: badgeStorage,
  limits: { fileSize: 500 * 1024 }, // 500KB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.use(protect);
router.use(requireAdminOrTeam);

router.get('/stats', requirePermission('viewAnalytics'), async (req, res) => {
  try {
    const { startDate, endDate, period = '7days' } = req.query;
    
    console.log('📊 Fetching admin stats...', { period, startDate, endDate });

    // Calculate date range
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      // Default periods
      const now = new Date();
      let daysAgo;
      switch (period) {
        case '24hours':
          daysAgo = 1;
          break;
        case '7days':
          daysAgo = 7;
          break;
        case '30days':
          daysAgo = 30;
          break;
        case '1year':
          daysAgo = 365;
          break;
        default:
          daysAgo = 7;
      }
      const startPeriod = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      dateFilter = { createdAt: { $gte: startPeriod } };
    }

    // Users
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments(dateFilter);
    console.log('👥 Total Users:', totalUsers, '| New in period:', newUsers);

    // Gigs
    const totalGigs = await Gig.countDocuments();
    const activeGigs = await Gig.countDocuments({ isActive: true });
    console.log('📦 Total Gigs:', totalGigs, '| Active:', activeGigs);

    // Orders - Count by exact status
    const totalOrders = await Order.countDocuments();
    
    // Active orders: active, delivered, revision_requested
    const activeOrders = await Order.countDocuments({ 
      status: { $in: ['active', 'delivered', 'revision_requested'] } 
    });
    
    // Completed orders
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    
    // Cancelled orders
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
    
    // Pending orders: pending, pending_verification
    const pendingOrders = await Order.countDocuments({ 
      status: { $in: ['pending', 'pending_verification'] } 
    });

    console.log('📋 Orders:', {
      total: totalOrders,
      active: activeOrders,
      completed: completedOrders,
      cancelled: cancelledOrders,
      pending: pendingOrders
    });

    // Withdrawals
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
    const completedWithdrawals = await Withdrawal.countDocuments({ status: 'completed' });
    console.log('💰 Withdrawals - Pending:', pendingWithdrawals, '| Completed:', completedWithdrawals);

    // Platform earnings from completed orders
    const platformEarnings = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$platformFee' } } }
    ]);
    const totalEarnings = platformEarnings[0]?.total || 0;
    console.log('💵 Platform Earnings:', totalEarnings);

    // Period-based stats
    const newOrdersInPeriod = await Order.countDocuments(dateFilter);
    const newGigsInPeriod = await Gig.countDocuments(dateFilter);
    
    // Period earnings
    const periodEarnings = await Order.aggregate([
      { 
        $match: { 
          status: 'completed',
          ...dateFilter
        } 
      },
      { $group: { _id: null, total: { $sum: '$platformFee' } } }
    ]);
    const periodEarningsTotal = periodEarnings[0]?.total || 0;

    console.log('📅 Period stats:', {
      users: newUsers,
      orders: newOrdersInPeriod,
      gigs: newGigsInPeriod,
      earnings: periodEarningsTotal
    });

    res.json({
      success: true,
      period,
      dateRange: dateFilter.createdAt ? {
        start: dateFilter.createdAt.$gte,
        end: dateFilter.createdAt.$lte || new Date()
      } : null,
      stats: {
        users: { 
          total: totalUsers, 
          newInPeriod: newUsers 
        },
        gigs: { 
          total: totalGigs, 
          active: activeGigs,
          newInPeriod: newGigsInPeriod
        },
        orders: { 
          total: totalOrders, 
          active: activeOrders,
          completed: completedOrders,
          cancelled: cancelledOrders,
          pending: pendingOrders,
          newInPeriod: newOrdersInPeriod
        },
        earnings: {
          total: totalEarnings,
          inPeriod: periodEarningsTotal
        },
        withdrawals: {
          pending: pendingWithdrawals,
          completed: completedWithdrawals
        }
      },
    });

    console.log('✅ Stats fetched successfully');
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// ===== TEAM MANAGEMENT =====
router.post('/team', requireAdmin, async (req, res) => {
  try {
    const { email, username, displayName, password, permissions } = req.body;
    
    console.log('👥 Adding team member:', { email, username, displayName, hasPassword: !!password });
    console.log('🔐 Permissions:', permissions);
    
    // Validation
    if (!email || !username || !displayName || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log('❌ User already exists:', existingUser.email);
      return res.status(400).json({ message: 'Email or username already exists' });
    }

    // Create user (password will be hashed by pre-save hook)
    const user = await User.create({
      email: email.trim().toLowerCase(),
      username: username.trim().toLowerCase(),
      displayName: displayName.trim(),
      password, // Don't hash here, let pre-save hook do it
      role: 'team',
      permissions: permissions || {},
      profileCompletion: 100,
      isActive: true,
      isAvailableForTasks: true // Auto-available for task assignment
    });
    
    console.log('✅ Team member created:', user._id);
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({ success: true, user: userResponse, message: 'Team member added successfully' });
  } catch (error) {
    console.error('❌ Add team error:', error);
    res.status(500).json({ message: 'Failed to add team member', error: error.message });
  }
});

router.get('/team', requireAdmin, async (req, res) => {
  try {
    const teamMembers = await User.find({ role: 'team' })
      .select('-password')
      .sort('-createdAt');
    
    res.json({ success: true, teamMembers });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch team members' });
  }
});

router.patch('/team/:id', requireAdmin, async (req, res) => {
  try {
    const { permissions, isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { permissions, isActive },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    
    res.json({ success: true, user, message: 'Team member updated' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update team member' });
  }
});

router.delete('/team/:id', requireAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Team member removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove team member' });
  }
});

// ===== USER MANAGEMENT =====
router.get('/users', requirePermission('manageUsers'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { displayName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) query.role = role;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

router.patch('/users/:id/suspend', requirePermission('suspendUsers'), async (req, res) => {
  try {
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isSuspended: true,
        suspendedAt: new Date(),
        suspendedBy: req.user._id,
        suspensionReason: reason
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user, message: 'User suspended successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to suspend user' });
  }
});

router.patch('/users/:id/unsuspend', requirePermission('suspendUsers'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isSuspended: false,
        suspendedAt: null,
        suspendedBy: null,
        suspensionReason: null
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user, message: 'User unsuspended successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to unsuspend user' });
  }
});

// Change seller level
router.patch('/users/:id/seller-level', requirePermission('manageUsers'), async (req, res) => {
  try {
    const { sellerLevel } = req.body;
    
    if (!['new_seller', 'level_1', 'level_2', 'top_rated'].includes(sellerLevel)) {
      return res.status(400).json({ message: 'Invalid seller level' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { sellerLevel },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`✅ Admin changed ${user.username}'s level to ${sellerLevel}`);
    res.json({ success: true, user, message: 'Seller level updated successfully' });
  } catch (error) {
    console.error('❌ Change seller level error:', error);
    res.status(500).json({ message: 'Failed to update seller level' });
  }
});

// Toggle verified status
router.patch('/users/:id/verified', requirePermission('manageVerified'), async (req, res) => {
  try {
    let { isVerified, verifiedText, verifiedBadgeType, verifiedBadgeImage } = req.body;

    // Decode HTML entities in image URL if present
    if (verifiedBadgeImage && typeof verifiedBadgeImage === 'string') {
      verifiedBadgeImage = verifiedBadgeImage
        .replace(/&#x2F;/g, '/')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'");
    }

    console.log('📝 Received verified update:', {
      userId: req.params.id,
      isVerified,
      verifiedText,
      verifiedBadgeType,
      verifiedBadgeImage
    });

    const updateData = { isVerified };
    if (verifiedText) {
      updateData.verifiedText = verifiedText;
    }
    if (verifiedBadgeType) {
      updateData.verifiedBadgeType = verifiedBadgeType;
    }
    if (verifiedBadgeImage !== undefined) {
      updateData.verifiedBadgeImage = verifiedBadgeImage;
    }

    console.log('💾 Update data:', updateData);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`✅ Admin ${isVerified ? 'verified' : 'unverified'} ${user.username}`);
    console.log(`   Badge Type: ${user.verifiedBadgeType}, Image: ${user.verifiedBadgeImage}`);
    
    res.json({ success: true, user, message: `User ${isVerified ? 'verified' : 'unverified'} successfully` });
  } catch (error) {
    console.error('❌ Change verified status error:', error);
    res.status(500).json({ message: 'Failed to update verified status' });
  }
});

// ===== GIG MANAGEMENT =====
router.get('/gigs', requirePermission('manageGigs'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'active') query.isActive = true;
    if (status === 'suspended') query.isPaused = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const gigs = await Gig.find(query)
      .populate('seller', 'displayName username')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Gig.countDocuments(query);

    res.json({
      success: true,
      gigs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch gigs' });
  }
});

router.patch('/gigs/:id/suspend', requirePermission('suspendGigs'), async (req, res) => {
  try {
    const { reason } = req.body;
    
    const gig = await Gig.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
        isPaused: true,
        suspensionReason: reason,
        suspendedBy: req.user._id,
        suspendedAt: new Date()
      },
      { new: true }
    );
    
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    
    res.json({ success: true, gig, message: 'Gig suspended successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to suspend gig' });
  }
});

router.patch('/gigs/:id/unsuspend', requirePermission('suspendGigs'), async (req, res) => {
  try {
    const gig = await Gig.findByIdAndUpdate(
      req.params.id,
      {
        isActive: true,
        isPaused: false,
        suspensionReason: null,
        suspendedBy: null,
        suspendedAt: null
      },
      { new: true }
    );
    
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    
    res.json({ success: true, gig, message: 'Gig unsuspended successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to unsuspend gig' });
  }
});

router.delete('/gigs/:id', requirePermission('manageGigs'), async (req, res) => {
  try {
    await Gig.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Gig deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete gig' });
  }
});

// ===== ORDER MANAGEMENT =====
router.get('/orders', requirePermission('manageOrders'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('buyer', 'displayName username')
      .populate('seller', 'displayName username')
      .populate('gig', 'title')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

router.patch('/orders/:id/cancel', requirePermission('cancelOrders'), async (req, res) => {
  try {
    const { reason } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason,
        cancelledBy: req.user._id
      },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ success: true, order, message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel order' });
  }
});

// ===== WITHDRAWAL MANAGEMENT =====
router.get('/withdrawals', requirePermission('manageWithdrawals'), async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const currentUser = await User.findById(req.user._id);

    let query = { status };

    // Team members (not admin) - show only assigned to them
    if (currentUser.role === 'team') {
      // Check if user is available
      if (!currentUser.isAvailableForTasks) {
        return res.json({
          success: true,
          withdrawals: [],
          message: 'You are offline. Go online to see assigned withdrawals.'
        });
      }

      // Only show withdrawals assigned to this team member
      query.assignedTo = req.user._id;
    }
    
    // Admin always sees ALL withdrawals (no filter)
    // Admin is only counted for distribution if isAvailableForTasks = true

    const withdrawals = await Withdrawal.find(query)
      .populate('user', 'displayName username email avatar hiveAccount role totalOrders rating createdAt profileCompletion isSuspended')
      .populate('processedBy', 'displayName username email role')
      .populate('assignedTo', 'displayName username email')
      .populate('lockedBy', 'displayName username email')
      .populate('notes.author', 'displayName username')
      .sort('-createdAt');

    console.log(`📋 ${currentUser.role === 'admin' ? 'Admin (all)' : 'Team member (assigned)'} fetched ${withdrawals.length} withdrawals`);

    res.json({ success: true, withdrawals });
  } catch (error) {
    console.error('Withdrawals fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch withdrawals' });
  }
});

router.patch('/withdrawals/:id/process', requirePermission('manageWithdrawals'), async (req, res) => {
  try {
    const { status, txId, blockNum, rejectionReason, note } = req.body;

    // Step 1: Check for duplicates
    const duplicateCheck = await checkDuplicateWithdrawal(req.params.id);
    if (duplicateCheck.isDuplicate) {
      return res.status(400).json({ 
        message: duplicateCheck.message,
        lockedBy: duplicateCheck.lockedBy
      });
    }

    // Step 2: Try to lock the withdrawal
    const lockResult = await lockWithdrawal(req.params.id, req.user._id);
    if (!lockResult.success) {
      return res.status(400).json({ 
        message: lockResult.message,
        lockedBy: lockResult.lockedBy
      });
    }

    const withdrawal = lockResult.withdrawal;

    // Step 3: Check if assigned to current user (team members only)
    const currentUser = await User.findById(req.user._id);
    if (currentUser.role === 'team' && 
        withdrawal.assignedTo && 
        withdrawal.assignedTo.toString() !== req.user._id.toString()) {
      // Unlock before returning error
      await unlockWithdrawal(req.params.id, req.user._id);
      return res.status(403).json({ 
        message: 'This withdrawal is not assigned to you'
      });
    }

    // Step 4: Process the withdrawal
    withdrawal.status = status;
    withdrawal.processedBy = req.user._id;
    withdrawal.processedAt = new Date();

    if (status === 'completed' && txId) {
      withdrawal.hiveTransaction = {
        txId,
        blockNum,
        timestamp: new Date(),
      };
      
      // Clear lock on completion
      withdrawal.lockedBy = undefined;
      withdrawal.lockedAt = undefined;
      withdrawal.lockExpiry = undefined;
    }

    if (status === 'rejected' && rejectionReason) {
      withdrawal.rejectionReason = rejectionReason;
      
      // Clear lock on rejection
      withdrawal.lockedBy = undefined;
      withdrawal.lockedAt = undefined;
      withdrawal.lockExpiry = undefined;
    }

    if (note) {
      withdrawal.notes.push({
        author: req.user._id,
        content: note,
      });
    }

    await withdrawal.save();

    // Update team member stats
    await updateTeamMemberStats(req.user._id, 'withdrawal', withdrawal.amount);

    console.log(`✅ Withdrawal ${withdrawal._id} ${status} by ${currentUser.displayName}`);

    // Populate withdrawal for notification
    const populatedWithdrawal = await Withdrawal.findById(withdrawal._id).populate('user');

    // Send notification to user
    if (status === 'completed') {
      await createNotification({
        user: populatedWithdrawal.user._id,
        type: 'withdrawal_processed',
        title: 'Withdrawal Completed! 💰',
        message: `Your withdrawal of ${withdrawal.amount} HIVE has been processed successfully`,
        link: '/withdrawals',
      });
    } else if (status === 'rejected') {
      await createNotification({
        user: populatedWithdrawal.user._id,
        type: 'withdrawal_rejected',
        title: 'Withdrawal Rejected ❌',
        message: `Your withdrawal request of ${withdrawal.amount} HIVE was rejected. ${rejectionReason || ''}`,
        link: '/withdrawals',
      });
    }

    res.json({ success: true, withdrawal });
  } catch (error) {
    console.error('❌ Process withdrawal error:', error);
    res.status(500).json({ message: 'Failed to process withdrawal' });
  }
});

router.get('/transactions', requirePermission('viewAnalytics'), async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await Transaction.find()
      .populate('user', 'displayName username')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments();

    res.json({
      success: true,
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

// ===== TASK ASSIGNMENT SYSTEM =====

// Fix: Make all team members with withdrawal permission available
router.post('/fix-team-availability', requireAdmin, async (req, res) => {
  try {
    const result = await User.updateMany(
      {
        role: { $in: ['admin', 'team'] },
        'permissions.manageWithdrawals': true,
        isActive: true
      },
      {
        $set: { isAvailableForTasks: true }
      }
    );

    console.log(`✅ Fixed availability for ${result.modifiedCount} team members`);

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} team members`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('❌ Fix availability error:', error);
    res.status(500).json({ message: 'Failed to fix availability' });
  }
});

// Toggle team member availability (Admin override with lock)
router.put('/team/:id/availability', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable, lockAvailability } = req.body;

    console.log(`🔄 Admin toggling availability for team member ${id}: ${isAvailable}, lock: ${lockAvailability}`);

    const teamMember = await User.findById(id);
    
    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    if (teamMember.role !== 'team' && teamMember.role !== 'admin') {
      return res.status(400).json({ message: 'User is not a team member' });
    }

    // If going offline, reassign pending tasks
    if (!isAvailable && teamMember.isAvailableForTasks) {
      console.log(`📤 Team member going offline, reassigning tasks...`);
      const reassigned = await reassignPendingTasks(id);
      
      teamMember.isAvailableForTasks = false;
      teamMember.availabilityLockedByAdmin = lockAvailability || false;
      await teamMember.save();

      return res.json({
        success: true,
        message: lockAvailability 
          ? 'Team member is now offline (locked by admin)'
          : 'Team member is now offline',
        reassigned,
        isAvailable: false,
        locked: lockAvailability || false,
      });
    }

    // If going online
    teamMember.isAvailableForTasks = isAvailable;
    teamMember.availabilityLockedByAdmin = lockAvailability || false;
    await teamMember.save();

    console.log(`✅ Team member availability updated`);

    res.json({
      success: true,
      message: lockAvailability
        ? `Team member is now ${isAvailable ? 'available' : 'offline'} (locked by admin)`
        : `Team member is now ${isAvailable ? 'available' : 'offline'}`,
      isAvailable,
      locked: lockAvailability || false,
    });
  } catch (error) {
    console.error('❌ Availability toggle error:', error);
    res.status(500).json({ message: 'Failed to update availability' });
  }
});

// Get team member task statistics
router.get('/team/task-stats', requirePermission('viewAnalytics'), async (req, res) => {
  try {
    const { memberId } = req.query;

    console.log(`📊 Fetching task stats${memberId ? ` for ${memberId}` : ' for all members'}`);

    const stats = await getTeamMemberStats(memberId || null);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('❌ Task stats error:', error);
    res.status(500).json({ message: 'Failed to fetch task statistics' });
  }
});

// Get assigned withdrawals for current user (team member)
router.get('/withdrawals/assigned', requirePermission('manageWithdrawals'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Check if user is available
    if (!user.isAvailableForTasks) {
      return res.json({
        success: true,
        withdrawals: [],
        message: 'You are currently offline. Go online to see assigned withdrawals.'
      });
    }

    // Get only withdrawals assigned to this user
    const withdrawals = await Withdrawal.find({
      assignedTo: req.user._id,
      status: { $in: ['pending', 'in_progress'] }
    })
    .populate('user', 'displayName email username hiveAccount')
    .sort('-createdAt');

    console.log(`📋 ${withdrawals.length} withdrawals assigned to ${user.displayName}`);

    res.json({
      success: true,
      withdrawals,
      count: withdrawals.length
    });
  } catch (error) {
    console.error('❌ Assigned withdrawals error:', error);
    res.status(500).json({ message: 'Failed to fetch assigned withdrawals' });
  }
});

// Get all support tickets (admin sees all, team sees only assigned)
router.get('/support/tickets', requirePermission('manageSupport'), async (req, res) => {
  try {
    const { status } = req.query;
    const currentUser = await User.findById(req.user._id);
    const SupportTicket = (await import('../models/SupportTicket.js')).default;

    let query = {};
    if (status) query.status = status;

    // Team members (not admin) - show only assigned to them
    if (currentUser.role === 'team') {
      // Check if user is available
      if (!currentUser.isAvailableForTasks) {
        return res.json({
          success: true,
          tickets: [],
          message: 'You are offline. Go online to see assigned tickets.'
        });
      }

      // Only show tickets assigned to this team member
      query.assignedTo = req.user._id;
    }
    
    // Admin always sees ALL tickets (no filter)
    // Admin is only counted for distribution if isAvailableForTasks = true

    const tickets = await SupportTicket.find(query)
      .populate('user', 'displayName email username avatar')
      .populate('assignedTo', 'displayName username email')
      .populate('resolvedBy', 'displayName username')
      .sort('-createdAt');

    console.log(`📋 ${currentUser.role === 'admin' ? 'Admin (all)' : 'Team member (assigned)'} fetched ${tickets.length} tickets`);

    res.json({ success: true, tickets });
  } catch (error) {
    console.error('Support tickets fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch support tickets' });
  }
});

// Get assigned support tickets for current user (team member)
router.get('/support/assigned', requirePermission('manageSupport'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const SupportTicket = (await import('../models/SupportTicket.js')).default;

    // Check if user is available
    if (!user.isAvailableForTasks) {
      return res.json({
        success: true,
        tickets: [],
        message: 'You are currently offline. Go online to see assigned tickets.'
      });
    }

    // Get only tickets assigned to this user
    const tickets = await SupportTicket.find({
      assignedTo: req.user._id,
      status: { $in: ['open', 'in_progress', 'waiting_reply'] }
    })
    .populate('user', 'displayName email username avatar')
    .sort('-createdAt');

    console.log(`📋 ${tickets.length} tickets assigned to ${user.displayName}`);

    res.json({
      success: true,
      tickets,
      count: tickets.length
    });
  } catch (error) {
    console.error('❌ Assigned tickets error:', error);
    res.status(500).json({ message: 'Failed to fetch assigned tickets' });
  }
});

// Get detailed team member report
router.get('/team/:id/report', requirePermission('viewAnalytics'), async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`📋 Generating report for team member ${id}`);

    const member = await User.findById(id)
      .select('displayName email taskStats isAvailableForTasks permissions role');

    if (!member) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    // Get assigned withdrawals
    const withdrawals = await Withdrawal.find({ assignedTo: id })
      .populate('user', 'displayName email')
      .sort('-createdAt')
      .limit(50);

    // Get assigned tickets
    const tickets = await SupportTicket.find({ assignedTo: id })
      .populate('user', 'displayName email')
      .sort('-createdAt')
      .limit(50);

    // Calculate stats
    const completedWithdrawals = await Withdrawal.countDocuments({
      processedBy: id,
      status: 'completed',
    });

    const totalWithdrawalValue = await Withdrawal.aggregate([
      { $match: { processedBy: id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const resolvedTickets = await SupportTicket.countDocuments({
      resolvedBy: id,
      status: { $in: ['solved', 'closed'] },
    });

    res.json({
      success: true,
      member: {
        _id: member._id,
        displayName: member.displayName,
        email: member.email,
        role: member.role,
        isAvailable: member.isAvailableForTasks,
        permissions: member.permissions,
      },
      stats: {
        withdrawals: {
          assigned: withdrawals.length,
          completed: completedWithdrawals,
          totalValue: totalWithdrawalValue[0]?.total || 0,
        },
        tickets: {
          assigned: tickets.length,
          resolved: resolvedTickets,
        },
        lastAssignedAt: member.taskStats?.lastAssignedAt,
      },
      recentWithdrawals: withdrawals.slice(0, 10),
      recentTickets: tickets.slice(0, 10),
    });
  } catch (error) {
    console.error('❌ Report generation error:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

// Get team member daily/weekly progress
router.get('/team/:id/progress', requirePermission('viewAnalytics'), async (req, res) => {
  try {
    const { id } = req.params;
    const { period = 'daily' } = req.query;

    console.log(`📊 Fetching ${period} progress for team member ${id}`);

    const member = await User.findById(id)
      .select('displayName email taskStats isAvailableForTasks');

    if (!member) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    // Calculate date range
    const now = new Date();
    let startDate;
    
    if (period === 'daily') {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (period === 'weekly') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (period === 'monthly') {
      startDate = new Date(now.setDate(now.getDate() - 30));
    }

    // Get withdrawals processed in period
    const withdrawalsProcessed = await Withdrawal.find({
      processedBy: id,
      status: 'completed',
      processedAt: { $gte: startDate }
    }).populate('user', 'displayName username');

    const withdrawalsValue = withdrawalsProcessed.reduce((sum, w) => sum + w.amount, 0);

    // Get tickets resolved in period
    const SupportTicket = (await import('../models/SupportTicket.js')).default;
    const ticketsResolved = await SupportTicket.find({
      resolvedBy: id,
      status: { $in: ['solved', 'closed'] },
      resolvedAt: { $gte: startDate }
    }).populate('user', 'displayName username');

    // Get currently assigned (pending)
    const currentWithdrawals = await Withdrawal.find({
      assignedTo: id,
      status: { $in: ['pending', 'in_progress'] }
    });

    const currentTickets = await SupportTicket.find({
      assignedTo: id,
      status: { $in: ['open', 'in_progress', 'waiting_reply'] }
    });

    // Calculate hourly breakdown for today
    const hourlyBreakdown = [];
    if (period === 'daily') {
      for (let hour = 0; hour < 24; hour++) {
        const hourStart = new Date(startDate);
        hourStart.setHours(hour, 0, 0, 0);
        const hourEnd = new Date(startDate);
        hourEnd.setHours(hour, 59, 59, 999);

        const withdrawalsInHour = withdrawalsProcessed.filter(w => 
          w.processedAt >= hourStart && w.processedAt <= hourEnd
        ).length;

        const ticketsInHour = ticketsResolved.filter(t =>
          t.resolvedAt >= hourStart && t.resolvedAt <= hourEnd
        ).length;

        if (withdrawalsInHour > 0 || ticketsInHour > 0) {
          hourlyBreakdown.push({
            hour: `${hour}:00`,
            withdrawals: withdrawalsInHour,
            tickets: ticketsInHour
          });
        }
      }
    }

    res.json({
      success: true,
      period,
      dateRange: {
        start: startDate,
        end: new Date()
      },
      member: {
        _id: member._id,
        displayName: member.displayName,
        email: member.email,
        isAvailable: member.isAvailableForTasks
      },
      summary: {
        withdrawalsProcessed: withdrawalsProcessed.length,
        withdrawalsValue: withdrawalsValue,
        ticketsResolved: ticketsResolved.length,
        currentPending: {
          withdrawals: currentWithdrawals.length,
          tickets: currentTickets.length
        }
      },
      details: {
        withdrawals: withdrawalsProcessed,
        tickets: ticketsResolved
      },
      hourlyBreakdown: period === 'daily' ? hourlyBreakdown : null
    });
  } catch (error) {
    console.error('❌ Progress report error:', error);
    res.status(500).json({ message: 'Failed to generate progress report' });
  }
});

// Get all team members progress comparison
router.get('/team/progress/comparison', requirePermission('viewAnalytics'), async (req, res) => {
  try {
    const { period = 'daily', startDate: customStart, endDate: customEnd } = req.query;

    console.log(`📊 Fetching team progress comparison for ${period}`);

    // Calculate date range
    const now = new Date();
    let startDate;
    let endDate = new Date();
    
    if (period === 'custom' && customStart && customEnd) {
      startDate = new Date(customStart);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(customEnd);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'daily') {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (period === 'weekly') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (period === 'monthly') {
      startDate = new Date(now.setDate(now.getDate() - 30));
    }

    // Get all team members
    const teamMembers = await User.find({
      role: { $in: ['admin', 'team'] },
      isActive: true
    }).select('displayName email isAvailableForTasks taskStats');

    const comparison = await Promise.all(teamMembers.map(async (member) => {
      // Withdrawals completed
      const withdrawalsCompleted = await Withdrawal.countDocuments({
        processedBy: member._id,
        status: 'completed',
        processedAt: { $gte: startDate }
      });

      const withdrawalsValue = await Withdrawal.aggregate([
        {
          $match: {
            processedBy: member._id,
            status: 'completed',
            processedAt: { $gte: startDate }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      // Withdrawals rejected
      const withdrawalsRejected = await Withdrawal.countDocuments({
        processedBy: member._id,
        status: 'rejected',
        processedAt: { $gte: startDate }
      });

      const withdrawalsRejectedValue = await Withdrawal.aggregate([
        {
          $match: {
            processedBy: member._id,
            status: 'rejected',
            processedAt: { $gte: startDate }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      // Total withdrawals processed (completed + rejected)
      const totalWithdrawals = withdrawalsCompleted + withdrawalsRejected;
      const totalValue = (withdrawalsValue[0]?.total || 0) + (withdrawalsRejectedValue[0]?.total || 0);

      // Tickets resolved
      const SupportTicket = (await import('../models/SupportTicket.js')).default;
      const tickets = await SupportTicket.countDocuments({
        resolvedBy: member._id,
        status: { $in: ['solved', 'closed'] },
        resolvedAt: { $gte: startDate }
      });

      // Currently assigned
      const currentWithdrawals = await Withdrawal.countDocuments({
        assignedTo: member._id,
        status: { $in: ['pending', 'in_progress'] }
      });

      const currentTickets = await SupportTicket.countDocuments({
        assignedTo: member._id,
        status: { $in: ['open', 'in_progress', 'waiting_reply'] }
      });

      return {
        _id: member._id,
        displayName: member.displayName,
        email: member.email,
        isAvailable: member.isAvailableForTasks,
        performance: {
          withdrawalsProcessed: totalWithdrawals,
          withdrawalsCompleted: withdrawalsCompleted,
          withdrawalsRejected: withdrawalsRejected,
          withdrawalsValue: withdrawalsValue[0]?.total || 0,
          withdrawalsRejectedValue: withdrawalsRejectedValue[0]?.total || 0,
          totalValue: totalValue,
          ticketsResolved: tickets,
          currentPending: {
            withdrawals: currentWithdrawals,
            tickets: currentTickets
          }
        },
        totalStats: {
          allTimeWithdrawals: member.taskStats?.withdrawalsHandled || 0,
          allTimeValue: member.taskStats?.withdrawalsValue || 0,
          allTimeTickets: member.taskStats?.ticketsHandled || 0
        }
      };
    }));

    // Sort by performance
    comparison.sort((a, b) => {
      const aScore = a.performance.withdrawalsProcessed + a.performance.ticketsResolved;
      const bScore = b.performance.withdrawalsProcessed + b.performance.ticketsResolved;
      return bScore - aScore;
    });

    res.json({
      success: true,
      period,
      dateRange: {
        start: startDate,
        end: endDate
      },
      teamMembers: comparison,
      summary: {
        totalWithdrawalsProcessed: comparison.reduce((sum, m) => sum + m.performance.withdrawalsProcessed, 0),
        totalWithdrawalsCompleted: comparison.reduce((sum, m) => sum + m.performance.withdrawalsCompleted, 0),
        totalWithdrawalsRejected: comparison.reduce((sum, m) => sum + m.performance.withdrawalsRejected, 0),
        totalWithdrawalsCompletedValue: comparison.reduce((sum, m) => sum + m.performance.withdrawalsValue, 0),
        totalWithdrawalsRejectedValue: comparison.reduce((sum, m) => sum + m.performance.withdrawalsRejectedValue, 0),
        totalWithdrawalsValue: comparison.reduce((sum, m) => sum + m.performance.totalValue, 0),
        totalTicketsResolved: comparison.reduce((sum, m) => sum + m.performance.ticketsResolved, 0),
        availableMembers: comparison.filter(m => m.isAvailable).length,
        totalMembers: comparison.length
      }
    });
  } catch (error) {
    console.error('❌ Team comparison error:', error);
    res.status(500).json({ message: 'Failed to generate team comparison' });
  }
});

// Get detailed withdrawal history for analytics
router.get('/team/withdrawal-history', requirePermission('viewAnalytics'), async (req, res) => {
  try {
    const { period = 'daily', startDate: customStart, endDate: customEnd, userId } = req.query;

    console.log(`📊 Fetching withdrawal history for ${period}, user: ${userId || 'all'}`);

    // Calculate date range
    const now = new Date();
    let startDate;
    let endDate = new Date();
    
    if (period === 'custom' && customStart && customEnd) {
      startDate = new Date(customStart);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(customEnd);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'daily') {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (period === 'weekly') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (period === 'monthly') {
      startDate = new Date(now.setDate(now.getDate() - 30));
    }

    // Build query
    const query = {
      status: { $in: ['completed', 'rejected'] },
      processedAt: { $gte: startDate, $lte: endDate }
    };

    // Filter by specific user if provided
    if (userId && userId !== 'all') {
      query.processedBy = userId;
    }

    // Fetch withdrawals
    const withdrawals = await Withdrawal.find(query)
      .populate('processedBy', 'displayName username email')
      .populate('user', 'displayName username email')
      .sort('-processedAt')
      .limit(100);

    // Calculate summary
    const summary = {
      total: withdrawals.length,
      completed: withdrawals.filter(w => w.status === 'completed').length,
      rejected: withdrawals.filter(w => w.status === 'rejected').length,
      totalValue: withdrawals
        .filter(w => w.status === 'completed')
        .reduce((sum, w) => sum + w.amount, 0)
    };

    res.json({
      success: true,
      period,
      dateRange: { start: startDate, end: endDate },
      withdrawals,
      summary
    });
  } catch (error) {
    console.error('❌ Withdrawal history error:', error);
    res.status(500).json({ message: 'Failed to fetch withdrawal history' });
  }
});

// Get detailed ticket history for analytics
router.get('/team/ticket-history', requirePermission('viewAnalytics'), async (req, res) => {
  try {
    const { period = 'daily', startDate: customStart, endDate: customEnd, userId } = req.query;

    console.log(`📊 Fetching ticket history for ${period}, user: ${userId || 'all'}`);

    // Calculate date range
    const now = new Date();
    let startDate;
    let endDate = new Date();
    
    if (period === 'custom' && customStart && customEnd) {
      startDate = new Date(customStart);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(customEnd);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'daily') {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (period === 'weekly') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (period === 'monthly') {
      startDate = new Date(now.setDate(now.getDate() - 30));
    }

    // Build query
    const SupportTicket = (await import('../models/SupportTicket.js')).default;
    const query = {
      status: { $in: ['solved', 'closed'] },
      resolvedAt: { $gte: startDate, $lte: endDate }
    };

    // Filter by specific user if provided
    if (userId && userId !== 'all') {
      query.resolvedBy = userId;
    }

    // Fetch tickets
    const tickets = await SupportTicket.find(query)
      .populate('resolvedBy', 'displayName username email')
      .populate('user', 'displayName username email')
      .sort('-resolvedAt')
      .limit(100);

    // Calculate summary
    const summary = {
      total: tickets.length,
      solved: tickets.filter(t => t.status === 'solved').length,
      closed: tickets.filter(t => t.status === 'closed').length
    };

    res.json({
      success: true,
      period,
      dateRange: { start: startDate, end: endDate },
      tickets,
      summary
    });
  } catch (error) {
    console.error('❌ Ticket history error:', error);
    res.status(500).json({ message: 'Failed to fetch ticket history' });
  }
});

// Export team analytics report as PDF
router.get('/team/export-report', requirePermission('viewAnalytics'), async (req, res) => {
  try {
    const { period = 'daily', startDate: customStart, endDate: customEnd, userId } = req.query;

    console.log(`📄 Generating PDF report for ${userId || 'all users'}`);

    // Get member info if specific user
    let member = null;
    if (userId && userId !== 'all') {
      member = await User.findById(userId).select('displayName email isAvailableForTasks');
      if (!member) {
        return res.status(404).json({ message: 'Team member not found' });
      }
    }

    // Calculate date range
    const now = new Date();
    let startDate;
    let endDate = new Date();
    
    if (period === 'custom' && customStart && customEnd) {
      startDate = new Date(customStart);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(customEnd);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'daily') {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (period === 'weekly') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (period === 'monthly') {
      startDate = new Date(now.setDate(now.getDate() - 30));
    }

    // Build query based on user filter
    const withdrawalQuery = {
      status: { $in: ['completed', 'rejected'] },
      processedAt: { $gte: startDate, $lte: endDate }
    };
    
    if (userId && userId !== 'all') {
      withdrawalQuery.processedBy = userId;
    }

    // Get performance data
    const withdrawalsCompleted = await Withdrawal.countDocuments({
      ...withdrawalQuery,
      status: 'completed'
    });

    const withdrawalsValue = await Withdrawal.aggregate([
      { $match: { ...withdrawalQuery, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const withdrawalsRejected = await Withdrawal.countDocuments({
      ...withdrawalQuery,
      status: 'rejected'
    });

    const withdrawalsRejectedValue = await Withdrawal.aggregate([
      { $match: { ...withdrawalQuery, status: 'rejected' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const SupportTicket = (await import('../models/SupportTicket.js')).default;
    const ticketQuery = {
      status: { $in: ['solved', 'closed'] },
      resolvedAt: { $gte: startDate, $lte: endDate }
    };
    
    if (userId && userId !== 'all') {
      ticketQuery.resolvedBy = userId;
    }
    
    const ticketsResolved = await SupportTicket.countDocuments(ticketQuery);

    // Get detailed transactions
    const withdrawals = await Withdrawal.find(withdrawalQuery)
      .populate('user', 'displayName username')
      .populate('processedBy', 'displayName username')
      .sort('-processedAt')
      .limit(100);

    const tickets = await SupportTicket.find(ticketQuery)
      .populate('user', 'displayName username')
      .populate('resolvedBy', 'displayName username')
      .sort('-resolvedAt')
      .limit(100);

    const performance = {
      withdrawalsProcessed: withdrawalsCompleted + withdrawalsRejected,
      withdrawalsCompleted,
      withdrawalsRejected,
      withdrawalsValue: withdrawalsValue[0]?.total || 0,
      withdrawalsRejectedValue: withdrawalsRejectedValue[0]?.total || 0,
      totalValue: (withdrawalsValue[0]?.total || 0) + (withdrawalsRejectedValue[0]?.total || 0),
      ticketsResolved
    };

    // Generate PDF
    const reportTitle = userId && userId !== 'all' 
      ? member.displayName 
      : 'All Users';
    
    // Get the user who is exporting the report
    const exportedBy = await User.findById(req.user._id).select('displayName email');
      
    const doc = generateAnalyticsReport(
      member || { displayName: 'All Users', email: 'Combined Report', isAvailableForTasks: true },
      performance,
      withdrawals,
      tickets,
      period,
      { start: startDate, end: endDate },
      exportedBy
    );

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${reportTitle}_Analytics_Report.pdf"`);

    // Pipe the PDF to response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('❌ PDF export error:', error);
    res.status(500).json({ message: 'Failed to generate PDF report' });
  }
});

export default router;
