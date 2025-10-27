import Withdrawal from '../models/Withdrawal.js';
import { assignTaskToTeamMember, updateTeamMemberStats } from './taskAssignment.js';

/**
 * Auto-assign unassigned withdrawals to available team members
 * Runs periodically to ensure all withdrawals are assigned
 */
export const autoAssignPendingWithdrawals = async () => {
  try {
    console.log('🔄 Checking for unassigned withdrawals...');

    // Find all pending withdrawals without assignment
    const unassignedWithdrawals = await Withdrawal.find({
      status: 'pending',
      assignedTo: null
    }).sort('createdAt'); // Oldest first

    if (unassignedWithdrawals.length === 0) {
      console.log('✅ No unassigned withdrawals found');
      return { assigned: 0 };
    }

    console.log(`📋 Found ${unassignedWithdrawals.length} unassigned withdrawals`);

    let assignedCount = 0;

    // Assign each withdrawal
    for (const withdrawal of unassignedWithdrawals) {
      const assignedTo = await assignTaskToTeamMember('withdrawal');
      
      if (assignedTo) {
        withdrawal.assignedTo = assignedTo;
        withdrawal.assignedAt = new Date();
        await withdrawal.save();
        
        await updateTeamMemberStats(assignedTo, 'withdrawal', withdrawal.amount);
        
        console.log(`✅ Assigned withdrawal ${withdrawal._id} to team member ${assignedTo}`);
        assignedCount++;
      } else {
        console.log(`⚠️ No available team members for withdrawal ${withdrawal._id}`);
      }
    }

    console.log(`✅ Auto-assigned ${assignedCount} withdrawals`);
    return { assigned: assignedCount, total: unassignedWithdrawals.length };
  } catch (error) {
    console.error('❌ Auto-assign error:', error);
    return { assigned: 0, error: error.message };
  }
};

/**
 * Start auto-assignment interval
 * Checks every 30 seconds for unassigned withdrawals
 */
export const startAutoAssignment = () => {
  console.log('🚀 Starting auto-assignment service...');
  
  // Run immediately on start
  autoAssignPendingWithdrawals();
  
  // Then run every 30 seconds
  setInterval(autoAssignPendingWithdrawals, 30000);
  
  console.log('✅ Auto-assignment service started (runs every 30s)');
};
