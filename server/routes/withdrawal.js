import express from 'express';
import Withdrawal from '../models/Withdrawal.js';
import { Wallet, Transaction } from '../models/Wallet.js';
import { protect, authorize } from '../middleware/auth.js';
import { 
  assignTaskToTeamMember, 
  updateTeamMemberStats,
  lockWithdrawal,
  unlockWithdrawal,
  checkDuplicateWithdrawal
} from '../utils/taskAssignment.js';

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { amount, hiveAccount, memo } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    if (!hiveAccount || hiveAccount.trim().length === 0) {
      return res.status(400).json({ message: 'Hive account is required' });
    }

    // Parse amount to number
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({ message: 'Invalid amount format' });
    }

    // Minimum withdrawal check
    if (withdrawAmount < 1) {
      return res.status(400).json({ message: 'Minimum withdrawal amount is 1 HIVE' });
    }

    // Get wallet
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user._id,
        balance: { available: 0, pending: 0, held: 0 }
      });
    }

    // Calculate actual available balance
    const Order = (await import('../models/Order.js')).default;
    const completedOrders = await Order.find({
      seller: req.user._id,
      status: 'completed'
    });

    const totalEarnings = completedOrders.reduce((sum, order) => {
      return sum + (order.sellerEarnings || 0);
    }, 0);

    const completedWithdrawals = await Withdrawal.find({
      user: req.user._id,
      status: 'completed'
    });

    const withdrawnAmount = completedWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    const pendingWithdrawals = await Withdrawal.find({
      user: req.user._id,
      status: { $in: ['pending', 'in_progress'] }
    });

    const heldAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    const actualAvailable = totalEarnings - withdrawnAmount - heldAmount;

    console.log('💰 Withdrawal validation:', {
      requested: withdrawAmount,
      totalEarnings,
      withdrawn: withdrawnAmount,
      held: heldAmount,
      actualAvailable
    });

    // Check if sufficient balance
    if (actualAvailable < withdrawAmount) {
      return res.status(400).json({ 
        message: `Insufficient balance. Available: ${actualAvailable.toFixed(3)} HIVE, Requested: ${withdrawAmount.toFixed(3)} HIVE` 
      });
    }

    // Update wallet
    wallet.balance.available = actualAvailable - withdrawAmount;
    wallet.balance.held = heldAmount + withdrawAmount;
    await wallet.save();

    // Auto-assign to available team member
    const assignedTo = await assignTaskToTeamMember('withdrawal');
    
    // Create withdrawal
    const withdrawal = await Withdrawal.create({
      user: req.user._id,
      amount: withdrawAmount,
      hiveAccount: hiveAccount.trim(),
      memo: memo?.trim() || '',
      ipAddress: req.ip,
      assignedTo: assignedTo || null,
      assignedAt: assignedTo ? new Date() : null,
    });

    // Update team member stats if assigned
    if (assignedTo) {
      await updateTeamMemberStats(assignedTo, 'withdrawal', withdrawAmount);
      console.log(`✅ Withdrawal ${withdrawal._id} assigned to team member ${assignedTo}`);
    } else {
      console.log('⚠️ No available team members, withdrawal unassigned');
    }

    console.log('✅ Withdrawal created:', withdrawal._id);

    res.status(201).json({ success: true, withdrawal });
  } catch (error) {
    console.error('❌ Withdrawal error:', error);
    res.status(500).json({ message: 'Failed to create withdrawal', error: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user._id }).sort('-createdAt');
    res.json({ success: true, withdrawals });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch withdrawals' });
  }
});

export default router;
