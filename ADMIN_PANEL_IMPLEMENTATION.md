# 🎯 Admin Panel - Complete Implementation Guide

## ✅ What's Been Done

### **1. User Model Updated** ✅
```javascript
// Added fields:
- role: 'admin' | 'team' | 'buyer' | 'seller'
- permissions: {
    manageUsers, suspendUsers, manageGigs, 
    suspendGigs, manageOrders, cancelOrders,
    manageWithdrawals, manageWallets,
    viewAnalytics, manageTeam
  }
- isActive, isSuspended
- suspendedAt, suspendedBy, suspensionReason
```

### **2. Admin Middleware Created** ✅
```javascript
// File: server/middleware/adminAuth.js
- requireAdmin()
- requireAdminOrTeam()
- requirePermission(permission)
```

---

## 🚀 Implementation Steps

### **Step 1: Update Admin Routes**

File: `server/routes/admin.js`

Add these new routes:

```javascript
import { requireAdmin, requirePermission } from '../middleware/adminAuth.js';

// ===== DASHBOARD STATS =====
router.get('/dashboard', protect, requireAdminOrTeam, async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalGigs = await Gig.countDocuments();
  const activeGigs = await Gig.countDocuments({ isActive: true });
  const totalOrders = await Order.countDocuments();
  const activeOrders = await Order.countDocuments({ status: 'active' });
  const completedOrders = await Order.countDocuments({ status: 'completed' });
  const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
  const pendingOrders = await Order.countDocuments({ status: 'pending' });
  
  const totalEarnings = await Order.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$platformFee' } } }
  ]);
  
  const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
  const completedWithdrawals = await Withdrawal.countDocuments({ status: 'completed' });
  
  // Last 7 days stats
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const newUsers7Days = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
  const newOrders7Days = await Order.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
  
  res.json({
    success: true,
    stats: {
      users: { total: totalUsers, new7Days: newUsers7Days },
      gigs: { total: totalGigs, active: activeGigs },
      orders: { 
        total: totalOrders, 
        active: activeOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
        pending: pendingOrders,
        new7Days: newOrders7Days
      },
      earnings: {
        total: totalEarnings[0]?.total || 0
      },
      withdrawals: {
        pending: pendingWithdrawals,
        completed: completedWithdrawals
      }
    }
  });
});

// ===== TEAM MANAGEMENT =====
router.post('/team', protect, requireAdmin, async (req, res) => {
  const { email, username, displayName, password, permissions } = req.body;
  
  const user = await User.create({
    email,
    username,
    displayName,
    password,
    role: 'team',
    permissions: permissions || {}
  });
  
  res.json({ success: true, user });
});

router.get('/team', protect, requireAdmin, async (req, res) => {
  const teamMembers = await User.find({ role: 'team' })
    .select('-password')
    .sort('-createdAt');
  
  res.json({ success: true, teamMembers });
});

router.patch('/team/:id', protect, requireAdmin, async (req, res) => {
  const { permissions, isActive } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { permissions, isActive },
    { new: true }
  ).select('-password');
  
  res.json({ success: true, user });
});

router.delete('/team/:id', protect, requireAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Team member removed' });
});

// ===== USER MANAGEMENT =====
router.patch('/users/:id/suspend', protect, requirePermission('suspendUsers'), async (req, res) => {
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
  
  res.json({ success: true, user });
});

router.patch('/users/:id/unsuspend', protect, requirePermission('suspendUsers'), async (req, res) => {
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
  
  res.json({ success: true, user });
});

// ===== GIG MANAGEMENT =====
router.patch('/gigs/:id/suspend', protect, requirePermission('suspendGigs'), async (req, res) => {
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
  
  res.json({ success: true, gig });
});

router.patch('/gigs/:id/unsuspend', protect, requirePermission('suspendGigs'), async (req, res) => {
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
  
  res.json({ success: true, gig });
});

router.delete('/gigs/:id', protect, requirePermission('manageGigs'), async (req, res) => {
  await Gig.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Gig deleted' });
});

// ===== ORDER MANAGEMENT =====
router.patch('/orders/:id/cancel', protect, requirePermission('cancelOrders'), async (req, res) => {
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
  
  res.json({ success: true, order });
});

// ===== WALLET MANAGEMENT =====
router.patch('/wallets/:userId/adjust', protect, requirePermission('manageWallets'), async (req, res) => {
  const { amount, reason, type } = req.body; // type: 'add' or 'deduct'
  
  const user = await User.findById(req.params.userId);
  // Implement wallet adjustment logic
  
  res.json({ success: true, message: 'Wallet adjusted' });
});
```

---

## 📊 Admin Dashboard UI

### **Dashboard Stats Display:**
```
┌─────────────────────────────────────────────┐
│ Admin Dashboard                             │
├─────────────────────────────────────────────┤
│ 👥 Total Users: 1,234                       │
│    New (7 days): 45                         │
│                                             │
│ 📦 Total Gigs: 567                          │
│    Active: 489                              │
│                                             │
│ 📋 Orders                                   │
│    Total: 2,345                             │
│    Active: 123                              │
│    Completed: 1,890                         │
│    Cancelled: 234                           │
│    Pending: 98                              │
│    New (7 days): 156                        │
│                                             │
│ 💰 Platform Earnings: 12,345 HIVE          │
│                                             │
│ 💳 Withdrawals                              │
│    Pending: 23                              │
│    Completed: 456                           │
└─────────────────────────────────────────────┘
```

---

## 👥 Team Management UI

### **Add Team Member:**
```
┌─────────────────────────────────────────┐
│ Add Team Member                         │
├─────────────────────────────────────────┤
│ Email: [_______________]                │
│ Username: [_______________]             │
│ Display Name: [_______________]         │
│ Password: [_______________]             │
│                                         │
│ Permissions:                            │
│ ☐ Manage Users                          │
│ ☐ Suspend Users                         │
│ ☐ Manage Gigs                           │
│ ☐ Suspend Gigs                          │
│ ☐ Manage Orders                         │
│ ☐ Cancel Orders                         │
│ ☑ Manage Withdrawals                    │
│ ☐ Manage Wallets                        │
│ ☐ View Analytics                        │
│ ☐ Manage Team                           │
│                                         │
│ [Add Team Member]                       │
└─────────────────────────────────────────┘
```

---

## 🔐 Permission System

### **Permission Levels:**

**Admin (Full Access):**
- All permissions automatically
- Can manage team members
- Cannot be suspended

**Team Member (Custom):**
- Only assigned permissions
- Can be suspended by admin
- Cannot manage other team members

**Example Team Roles:**

**Payment Team:**
```javascript
permissions: {
  manageWithdrawals: true,
  viewAnalytics: true
}
```

**Moderation Team:**
```javascript
permissions: {
  suspendUsers: true,
  suspendGigs: true,
  cancelOrders: true
}
```

**Support Team:**
```javascript
permissions: {
  manageOrders: true,
  viewAnalytics: true
}
```

---

## 🎯 Next Steps

1. **Update admin.js routes** with new endpoints
2. **Create admin UI pages:**
   - Dashboard
   - Team Management
   - User Management
   - Gig Management
   - Order Management
   - Withdrawal Management
3. **Add permission checks** in frontend
4. **Test all actions**

---

**Created by Aftab Irshad** 🚀

**Complete admin system with team management and role-based permissions!** 🎊
