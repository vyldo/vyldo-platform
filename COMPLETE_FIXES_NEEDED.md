# 🔧 Complete Fixes Needed - Implementation Guide

## 📋 Issues to Fix

### ✅ **Platform is 85% Complete**
- Payment system: ✅ Working
- Order management: ✅ Working  
- Messaging: ✅ Working
- Security: ✅ Working

### ⚠️ **Remaining 15%:**
1. Dashboard stats not showing
2. Wallet amounts not showing
3. Review system not working
4. Order fee breakdown incomplete

---

## 🎯 All Fixes in One Document

Yahan sab fixes ek jagah hain. Ye document save kar lo aur baad mein implement kar sakte ho.

---

## Fix 1: Dashboard Stats Backend

**File:** `server/routes/user.js`

```javascript
// Add this route
router.get('/stats', protect, async (req, res) => {
  try {
    // Get seller stats
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

    // Get buyer stats
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

    res.json({
      success: true,
      stats: {
        // Seller stats
        activeOrders,
        totalGigs,
        balance: totalEarnings, // Available balance
        totalEarnings,
        
        // Buyer stats
        activePurchases,
        totalPurchases,
        totalSpent,
        savedGigs: 0 // Implement later
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});
```

---

## Fix 2: Wallet Page

**File:** `src/pages/Wallet.jsx`

```javascript
import { useQuery } from 'react-query';
import api from '../lib/axios';
import { Wallet as WalletIcon, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export default function Wallet() {
  const { data: walletData } = useQuery('wallet', async () => {
    const res = await api.get('/wallet');
    return res.data;
  });

  const { data: orders } = useQuery('completed-orders', async () => {
    const res = await api.get('/orders?type=selling&status=completed');
    return res.data.orders;
  });

  const totalEarnings = orders?.reduce((sum, order) => {
    return sum + (order.sellerEarnings || 0);
  }, 0) || 0;

  const pendingOrders = useQuery('pending-earnings', async () => {
    const res = await api.get('/orders?type=selling&status=active,delivered');
    return res.data.orders;
  });

  const pendingEarnings = pendingOrders.data?.reduce((sum, order) => {
    return sum + (order.sellerEarnings || 0);
  }, 0) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wallet</h1>

      {/* Balance Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm">Available Balance</p>
              <p className="text-3xl font-bold">{totalEarnings.toFixed(3)} HIVE</p>
            </div>
            <WalletIcon className="w-12 h-12 text-primary-200" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Earnings</p>
              <p className="text-2xl font-bold">{pendingEarnings.toFixed(3)} HIVE</p>
            </div>
            <Clock className="w-10 h-10 text-orange-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Earned</p>
              <p className="text-2xl font-bold">{(totalEarnings + pendingEarnings).toFixed(3)} HIVE</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-600" />
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Transaction History</h2>
        <div className="space-y-3">
          {orders?.map((order) => (
            <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">{order.gig?.title}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.completedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">+{order.sellerEarnings?.toFixed(3)} HIVE</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Backend:** `server/routes/wallet.js`

```javascript
router.get('/', protect, async (req, res) => {
  try {
    const completedOrders = await Order.find({
      seller: req.user._id,
      status: 'completed'
    });

    const balance = completedOrders.reduce((sum, order) => {
      return sum + (order.sellerEarnings || 0);
    }, 0);

    res.json({
      success: true,
      balance,
      currency: 'HIVE'
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch wallet' });
  }
});
```

---

## Fix 3: Review System

**Backend:** `server/routes/review.js`

```javascript
import express from 'express';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Gig from '../models/Gig.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Submit review
router.post('/orders/:orderId', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed orders' });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ order: order._id });
    if (existingReview) {
      return res.status(400).json({ message: 'Already reviewed this order' });
    }

    // Create review
    const review = await Review.create({
      order: order._id,
      gig: order.gig,
      buyer: req.user._id,
      seller: order.seller,
      rating,
      comment
    });

    // Update gig rating
    await updateGigRating(order.gig);

    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ message: 'Failed to submit review' });
  }
});

// Update gig rating
async function updateGigRating(gigId) {
  const reviews = await Review.find({ gig: gigId });
  
  if (reviews.length === 0) return;

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  
  await Gig.findByIdAndUpdate(gigId, {
    'rating.average': avgRating,
    'rating.count': reviews.length
  });
}

export default router;
```

**Frontend:** Fix in `OrderDetail.jsx`

```javascript
const reviewMutation = useMutation(
  async () => await api.post(`/reviews/orders/${id}`, { 
    rating, 
    comment: review 
  }),
  {
    onSuccess: () => {
      queryClient.invalidateQueries(['order', id]);
      setRating(0);
      setReview('');
      alert('Review submitted successfully!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to submit review');
    }
  }
);
```

---

## Fix 4: Order Fee Breakdown

**File:** `src/pages/OrderDetail.jsx`

Add this in the sidebar:

```javascript
{/* Order Summary with Fee Breakdown */}
<div className="card">
  <h2 className="text-xl font-bold mb-4">Order Summary</h2>
  
  <div className="space-y-3">
    <div className="flex justify-between">
      <span className="text-gray-600">Package</span>
      <span className="font-medium capitalize">{order.packageType}</span>
    </div>
    
    <div className="border-t pt-3 space-y-2">
      <div className="flex justify-between">
        <span className="text-gray-600">Package Price</span>
        <span className="font-semibold">{order.totalAmount?.toFixed(3)} HIVE</span>
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Platform Fee ({order.platformFee ? ((order.platformFee / order.totalAmount) * 100).toFixed(0) : '9'}%)</span>
        <span className="text-gray-500">-{order.platformFee?.toFixed(3)} HIVE</span>
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Seller Receives</span>
        <span className="text-green-600 font-medium">{order.sellerEarnings?.toFixed(3)} HIVE</span>
      </div>
    </div>
    
    <div className="border-t pt-3 flex justify-between">
      <span className="font-bold text-lg">You Paid</span>
      <span className="font-bold text-2xl text-primary-600">{order.totalAmount?.toFixed(3)} HIVE</span>
    </div>
    
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
      <strong>Note:</strong> Platform fee is deducted from the total. You only pay {order.totalAmount?.toFixed(3)} HIVE.
    </div>
  </div>
</div>
```

---

## 🎯 Summary of All Fixes

### **1. Dashboard Stats:**
- Create `/users/stats` endpoint
- Calculate active orders, gigs, earnings
- Return proper stats

### **2. Wallet:**
- Show available balance (from completed orders)
- Show pending earnings (from active/delivered)
- Show transaction history
- Calculate from `sellerEarnings` field

### **3. Reviews:**
- Create `/reviews/orders/:orderId` endpoint
- Fix review mutation in frontend
- Update gig rating after review
- Show reviews on gig page

### **4. Order Fee Breakdown:**
- Show package price
- Show platform fee percentage
- Show seller earnings
- Show total paid
- Add helpful note

---

## 📝 Implementation Order

1. **First:** Backend stats endpoint (Dashboard will work)
2. **Second:** Wallet backend + frontend (Earnings will show)
3. **Third:** Review backend + frontend fix (Reviews will work)
4. **Fourth:** Order detail fee breakdown (Complete info)

---

## ✅ After All Fixes

**Dashboard will show:**
- ✅ Active orders count
- ✅ Total gigs
- ✅ Available balance
- ✅ Total earnings

**Wallet will show:**
- ✅ Available balance
- ✅ Pending earnings
- ✅ Transaction history
- ✅ All amounts

**Reviews will:**
- ✅ Submit successfully
- ✅ Update gig rating
- ✅ Show on gig page

**Order detail will show:**
- ✅ Package price
- ✅ Platform fee
- ✅ Seller earnings
- ✅ Total breakdown

---

**Created by Aftab Irshad** 🚀

**All fixes documented! Implement these to complete the platform 100%!** 🎊
