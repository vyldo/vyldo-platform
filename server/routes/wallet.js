import express from 'express';
import { Wallet, Transaction } from '../models/Wallet.js';
import Order from '../models/Order.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    console.log('💰 Fetching wallet for user:', req.user._id);

    // Get or create wallet
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user._id,
        balance: { available: 0, pending: 0, held: 0 }
      });
    }

    // Calculate balance from completed orders
    const completedOrders = await Order.find({
      seller: req.user._id,
      status: 'completed'
    });

    const totalEarnings = completedOrders.reduce((sum, order) => {
      return sum + (order.sellerEarnings || 0);
    }, 0);

    // Calculate pending earnings from active/delivered orders
    const pendingOrders = await Order.find({
      seller: req.user._id,
      status: { $in: ['active', 'delivered'] }
    });

    const pendingEarnings = pendingOrders.reduce((sum, order) => {
      return sum + (order.sellerEarnings || 0);
    }, 0);

    // Calculate held amount (pending withdrawals)
    const Withdrawal = (await import('../models/Withdrawal.js')).default;
    const pendingWithdrawals = await Withdrawal.find({
      user: req.user._id,
      status: { $in: ['pending', 'in_progress'] }
    });

    const heldAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    // Calculate completed withdrawals
    const completedWithdrawals = await Withdrawal.find({
      user: req.user._id,
      status: 'completed'
    });

    const withdrawnAmount = completedWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    // Available = Total Earnings - Withdrawn - Held
    const availableBalance = totalEarnings - withdrawnAmount - heldAmount;

    // Update wallet
    wallet.balance.available = Math.max(0, availableBalance);
    wallet.balance.pending = pendingEarnings;
    wallet.balance.held = heldAmount;
    await wallet.save();

    console.log('✅ Wallet calculated:', { 
      available: availableBalance, 
      pending: pendingEarnings,
      held: heldAmount,
      totalEarnings,
      withdrawn: withdrawnAmount
    });

    res.json({ 
      success: true, 
      wallet: {
        balance: {
          available: Math.max(0, availableBalance),
          pending: pendingEarnings,
          held: heldAmount
        },
        totalEarnings,
        totalWithdrawn: withdrawnAmount,
        currency: 'HIVE'
      },
      completedOrders: completedOrders.length,
      pendingOrders: pendingOrders.length
    });
  } catch (error) {
    console.error('❌ Wallet error:', error);
    res.status(500).json({ message: 'Failed to fetch wallet' });
  }
});

router.get('/transactions', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    
    const query = { user: req.user._id };
    if (type) query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await Transaction.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .populate('relatedOrder', 'packageDetails status');

    const total = await Transaction.countDocuments(query);

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

export default router;
