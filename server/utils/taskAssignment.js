import User from '../models/User.js';
import Withdrawal from '../models/Withdrawal.js';
import SupportTicket from '../models/SupportTicket.js';

/**
 * Get available team members for task assignment
 * Only returns team members who have:
 * - manageWithdrawals or manageSupport permission
 * - isAvailableForTasks = true
 * - Admin is ONLY included if they are marked as available
 */
export const getAvailableTeamMembers = async (taskType) => {
  const permission = taskType === 'withdrawal' ? 'manageWithdrawals' : 'manageSupport';
  
  console.log(`🔍 Looking for team members with permission: ${permission}`);
  
  // First check all team members
  const allTeamMembers = await User.find({
    role: { $in: ['admin', 'team'] },
  }).select('_id displayName role isActive isBanned isAvailableForTasks permissions');
  
  console.log(`📊 Total team members in database: ${allTeamMembers.length}`);
  allTeamMembers.forEach(member => {
    console.log(`   - ${member.displayName} (${member.role}):`, {
      isActive: member.isActive,
      isBanned: member.isBanned,
      isAvailable: member.isAvailableForTasks,
      hasPermission: member.permissions?.[permission.replace('manage', '').replace('Withdrawals', 'Withdrawals').replace('Support', 'Support')] || member.permissions?.manageWithdrawals || member.permissions?.manageSupport
    });
  });
  
  const teamMembers = await User.find({
    role: { $in: ['admin', 'team'] },
    isActive: true,
    isBanned: false,
    isAvailableForTasks: true,
    [`permissions.${permission}`]: true,
  }).select('_id displayName role taskStats permissions isAvailableForTasks');

  console.log(`✅ Found ${teamMembers.length} available team members for ${taskType}`);
  if (teamMembers.length > 0) {
    teamMembers.forEach(member => {
      console.log(`   ✓ ${member.displayName} (${member.role})`);
    });
  } else {
    console.log(`⚠️ NO AVAILABLE TEAM MEMBERS FOUND!`);
  }
  
  return teamMembers;
};

/**
 * Assign task to team member using round-robin algorithm
 * Ensures equal distribution based on task count
 */
export const assignTaskToTeamMember = async (taskType) => {
  try {
    const availableMembers = await getAvailableTeamMembers(taskType);
    
    if (availableMembers.length === 0) {
      console.log('⚠️ No available team members found');
      return null;
    }

    // Sort by task count (ascending) and last assigned time
    availableMembers.sort((a, b) => {
      const aCount = taskType === 'withdrawal' 
        ? (a.taskStats?.withdrawalsHandled || 0)
        : (a.taskStats?.ticketsHandled || 0);
      
      const bCount = taskType === 'withdrawal'
        ? (b.taskStats?.withdrawalsHandled || 0)
        : (b.taskStats?.ticketsHandled || 0);
      
      // If same count, assign to who was assigned longest ago
      if (aCount === bCount) {
        const aTime = a.taskStats?.lastAssignedAt || new Date(0);
        const bTime = b.taskStats?.lastAssignedAt || new Date(0);
        return aTime - bTime;
      }
      
      return aCount - bCount;
    });

    const assignedMember = availableMembers[0];
    
    console.log(`✅ Assigned ${taskType} to ${assignedMember.displayName}`);
    
    return assignedMember._id;
  } catch (error) {
    console.error('❌ Task assignment error:', error);
    return null;
  }
};

/**
 * Update team member stats after task assignment
 */
export const updateTeamMemberStats = async (memberId, taskType, value = 0) => {
  try {
    const updateFields = {
      'taskStats.lastAssignedAt': new Date(),
    };

    if (taskType === 'withdrawal') {
      updateFields['$inc'] = {
        'taskStats.withdrawalsHandled': 1,
        'taskStats.withdrawalsValue': value,
      };
    } else if (taskType === 'ticket') {
      updateFields['$inc'] = {
        'taskStats.ticketsHandled': 1,
      };
    }

    await User.findByIdAndUpdate(memberId, updateFields);
    
    console.log(`📊 Updated stats for team member ${memberId}`);
  } catch (error) {
    console.error('❌ Stats update error:', error);
  }
};

/**
 * Reassign pending tasks when team member goes offline
 */
export const reassignPendingTasks = async (memberId) => {
  try {
    console.log(`🔄 Reassigning tasks from member ${memberId}`);

    // Get pending withdrawals assigned to this member
    const pendingWithdrawals = await Withdrawal.find({
      assignedTo: memberId,
      status: 'pending',
    });

    // Get open tickets assigned to this member
    const openTickets = await SupportTicket.find({
      assignedTo: memberId,
      status: { $in: ['open', 'in_progress'] },
    });

    console.log(`📋 Found ${pendingWithdrawals.length} withdrawals and ${openTickets.length} tickets to reassign`);

    // Reassign withdrawals
    for (const withdrawal of pendingWithdrawals) {
      const newAssignee = await assignTaskToTeamMember('withdrawal');
      if (newAssignee) {
        withdrawal.assignedTo = newAssignee;
        withdrawal.assignedAt = new Date();
        await withdrawal.save();
        await updateTeamMemberStats(newAssignee, 'withdrawal', withdrawal.amount);
        console.log(`✅ Reassigned withdrawal ${withdrawal._id} to ${newAssignee}`);
      }
    }

    // Reassign tickets
    for (const ticket of openTickets) {
      const newAssignee = await assignTaskToTeamMember('ticket');
      if (newAssignee) {
        ticket.assignedTo = newAssignee;
        ticket.assignedAt = new Date();
        await ticket.save();
        await updateTeamMemberStats(newAssignee, 'ticket');
        console.log(`✅ Reassigned ticket ${ticket._id} to ${newAssignee}`);
      }
    }

    console.log(`✅ Reassignment complete`);
    
    return {
      withdrawalsReassigned: pendingWithdrawals.length,
      ticketsReassigned: openTickets.length,
    };
  } catch (error) {
    console.error('❌ Reassignment error:', error);
    return { withdrawalsReassigned: 0, ticketsReassigned: 0 };
  }
};

/**
 * Get team member task statistics
 */
export const getTeamMemberStats = async (memberId = null) => {
  try {
    const query = {
      role: { $in: ['admin', 'team'] },
      isActive: true,
    };

    if (memberId) {
      query._id = memberId;
    }

    const members = await User.find(query)
      .select('displayName email taskStats isAvailableForTasks permissions')
      .lean();

    const stats = await Promise.all(members.map(async (member) => {
      // Count current assigned tasks
      const assignedWithdrawals = await Withdrawal.countDocuments({
        assignedTo: member._id,
        status: { $in: ['pending', 'in_progress'] },
      });

      const assignedTickets = await SupportTicket.countDocuments({
        assignedTo: member._id,
        status: { $in: ['open', 'in_progress'] },
      });

      return {
        _id: member._id,
        displayName: member.displayName,
        email: member.email,
        isAvailable: member.isAvailableForTasks,
        permissions: {
          withdrawals: member.permissions?.manageWithdrawals || false,
          support: member.permissions?.manageSupport || false,
        },
        stats: {
          totalWithdrawalsHandled: member.taskStats?.withdrawalsHandled || 0,
          totalWithdrawalsValue: member.taskStats?.withdrawalsValue || 0,
          totalTicketsHandled: member.taskStats?.ticketsHandled || 0,
          currentWithdrawals: assignedWithdrawals,
          currentTickets: assignedTickets,
          lastAssignedAt: member.taskStats?.lastAssignedAt,
        },
      };
    }));

    return stats;
  } catch (error) {
    console.error('❌ Get stats error:', error);
    return [];
  }
};

/**
 * Lock withdrawal for processing (prevents duplicate processing)
 */
export const lockWithdrawal = async (withdrawalId, userId) => {
  try {
    const now = new Date();
    const lockDuration = 5 * 60 * 1000; // 5 minutes
    const lockExpiry = new Date(now.getTime() + lockDuration);

    // Try to lock the withdrawal
    const withdrawal = await Withdrawal.findOneAndUpdate(
      {
        _id: withdrawalId,
        status: 'pending',
        $or: [
          { lockedBy: null },
          { lockedBy: userId }, // Allow same user to re-lock
          { lockExpiry: { $lt: now } } // Or if lock expired
        ]
      },
      {
        lockedBy: userId,
        lockedAt: now,
        lockExpiry: lockExpiry,
        status: 'in_progress'
      },
      { new: true }
    );

    if (!withdrawal) {
      // Check why lock failed
      const existing = await Withdrawal.findById(withdrawalId);
      if (!existing) {
        return { success: false, message: 'Withdrawal not found' };
      }
      if (existing.status !== 'pending' && existing.status !== 'in_progress') {
        return { success: false, message: `Withdrawal already ${existing.status}` };
      }
      if (existing.lockedBy && existing.lockExpiry > now) {
        const locker = await User.findById(existing.lockedBy).select('displayName');
        return { 
          success: false, 
          message: `Currently being processed by ${locker?.displayName}`,
          lockedBy: existing.lockedBy
        };
      }
    }

    console.log(`🔒 Withdrawal ${withdrawalId} locked by user ${userId}`);
    return { success: true, withdrawal };
  } catch (error) {
    console.error('❌ Lock error:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Unlock withdrawal (release lock)
 */
export const unlockWithdrawal = async (withdrawalId, userId) => {
  try {
    const withdrawal = await Withdrawal.findOneAndUpdate(
      {
        _id: withdrawalId,
        lockedBy: userId,
        status: 'in_progress'
      },
      {
        $unset: { lockedBy: '', lockedAt: '', lockExpiry: '' },
        status: 'pending'
      },
      { new: true }
    );

    if (withdrawal) {
      console.log(`🔓 Withdrawal ${withdrawalId} unlocked`);
      return { success: true };
    }
    
    return { success: false, message: 'Cannot unlock - not locked by you' };
  } catch (error) {
    console.error('❌ Unlock error:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Check for duplicate withdrawal processing
 */
export const checkDuplicateWithdrawal = async (withdrawalId) => {
  try {
    const withdrawal = await Withdrawal.findById(withdrawalId);
    
    if (!withdrawal) {
      return { isDuplicate: false, message: 'Withdrawal not found' };
    }

    if (withdrawal.status === 'completed') {
      return { 
        isDuplicate: true, 
        message: 'Withdrawal already completed',
        processedBy: withdrawal.processedBy,
        processedAt: withdrawal.processedAt,
      };
    }

    const now = new Date();
    if (withdrawal.lockedBy && withdrawal.lockExpiry > now) {
      const processor = await User.findById(withdrawal.lockedBy).select('displayName');
      return {
        isDuplicate: true,
        message: `Currently being processed by ${processor?.displayName}`,
        lockedBy: withdrawal.lockedBy,
      };
    }

    return { isDuplicate: false };
  } catch (error) {
    console.error('❌ Duplicate check error:', error);
    return { isDuplicate: false, error: error.message };
  }
};
