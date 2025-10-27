import express from 'express';
import Order from '../models/Order.js';
import Gig from '../models/Gig.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { calculatePlatformFee } from '../utils/fees.js';
import { verifyHiveTransaction, validateMemoFormat } from '../utils/hiveVerification.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { gigId, packageType, requirements, transactionId, memo, requirementImages } = req.body;
    
    console.log('📝 Creating order:', { gigId, packageType, hasTransactionId: !!transactionId });
    
    const gig = await Gig.findById(gigId).populate('seller');
    
    if (!gig) {
      return res.status(400).json({ message: 'Gig not found' });
    }
    
    if (!gig.isActive) {
      return res.status(400).json({ message: 'This gig is no longer active' });
    }

    const packageData = gig.packages[packageType];
    
    if (!packageData) {
      return res.status(400).json({ message: `Package "${packageType}" not found` });
    }
    
    console.log('💰 Calculating fees for amount:', packageData.price);
    const feeCalculation = calculatePlatformFee(packageData.price);
    console.log('✅ Fee calculation:', feeCalculation);
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + packageData.deliveryTime);

    // Determine order status based on payment
    let orderStatus = 'pending'; // Default: pending payment
    let paymentData = null;
    let paymentVerified = false;
    
    if (transactionId && memo) {
      // Verify transaction on blockchain
      console.log('🔐 Verifying payment on blockchain...');
      
      // 1. Validate memo format
      if (!validateMemoFormat(memo)) {
        return res.status(400).json({ 
          message: 'Invalid memo format. Please use the generated memo exactly as shown.' 
        });
      }

      // 2. Check if this transaction ID has already been used
      const existingOrder = await Order.findOne({ 'payment.transactionId': transactionId });
      if (existingOrder) {
        console.log('❌ Transaction ID already used:', transactionId);
        return res.status(400).json({ 
          message: 'This transaction ID has already been used for another order.' 
        });
      }

      // 3. Check if this memo has already been used
      const existingMemo = await Order.findOne({ 'payment.memo': memo });
      if (existingMemo) {
        console.log('❌ Memo already used:', memo);
        return res.status(400).json({ 
          message: 'This memo has already been used. Please generate a new order.' 
        });
      }

      // 4. Verify transaction on Hive blockchain
      const verification = await verifyHiveTransaction(
        transactionId,
        packageData.price,
        memo,
        'vyldo-escrow'
      );

      if (verification.verified) {
        // Payment verified - order is active
        console.log('✅ Payment verified! Order will be active.');
        orderStatus = 'active';
        paymentVerified = true;
        paymentData = {
          transactionId,
          memo,
          amount: packageData.price,
          verified: true,
          verifiedAt: new Date(),
          submittedAt: new Date()
        };
      } else {
        // Verification failed - order stays pending
        console.log('❌ Payment verification failed:', verification.error);
        return res.status(400).json({ 
          message: `Payment verification failed: ${verification.error}` 
        });
      }
    }

    console.log('📦 Creating order with status:', orderStatus);

    const order = await Order.create({
      buyer: req.user._id,
      seller: gig.seller._id,
      gig: gigId,
      packageType,
      packageDetails: {
        title: packageData.title,
        description: packageData.description,
        price: packageData.price,
        deliveryTime: packageData.deliveryTime,
        revisions: packageData.revisions,
        features: packageData.features
      },
      totalAmount: packageData.price,
      platformFee: feeCalculation.platformFee,
      sellerEarnings: feeCalculation.sellerEarnings,
      requirements,
      requirementImages: requirementImages || [],
      dueDate,
      status: orderStatus,
      payment: paymentData
    });

    console.log('✅ Order created:', order._id);

    res.status(201).json({ 
      success: true, 
      order,
      message: transactionId 
        ? 'Order created! Payment verification in progress.' 
        : 'Order created! Please complete payment to activate.'
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      message: 'Failed to create order',
      error: error.message 
    });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const { status, type = 'all' } = req.query;
    const query = {};

    if (type === 'buying') {
      // Buyer sees all their orders
      query.buyer = req.user._id;
    } 
    else if (type === 'selling') {
      // Seller sees only verified/active orders (not pending payment)
      query.seller = req.user._id;
      query.status = { 
        $nin: ['pending', 'pending_verification'] 
      };
    } 
    else {
      // All orders: buyer sees all, seller sees only verified
      query.$or = [
        { buyer: req.user._id },
        { 
          seller: req.user._id, 
          status: { $nin: ['pending', 'pending_verification'] }
        }
      ];
    }

    if (status) query.status = status;

    console.log('📋 Fetching orders with query:', JSON.stringify(query));

    const orders = await Order.find(query)
      .populate('buyer', 'displayName username avatar')
      .populate('seller', 'displayName username avatar sellerLevel isVerified verifiedText verifiedBadgeType verifiedBadgeImage')
      .populate('gig', 'title images')
      .sort('-createdAt');

    console.log(`✅ Found ${orders.length} orders`);

    res.json({ success: true, orders });
  } catch (error) {
    console.error('❌ Failed to fetch orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'displayName username avatar email')
      .populate('seller', 'displayName username avatar email totalOrders rating sellerLevel createdAt isVerified verifiedText verifiedBadgeType verifiedBadgeImage')
      .populate('gig', 'title images');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Calculate seller's actual stats
    const sellerCompletedOrders = await Order.countDocuments({
      seller: order.seller._id,
      status: 'completed'
    });

    // Calculate seller's average rating
    const Review = (await import('../models/Review.js')).default;
    const sellerReviews = await Review.find({ seller: order.seller._id });
    const sellerAvgRating = sellerReviews.length > 0
      ? sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length
      : 0;

    // Convert to plain object and enhance seller stats
    const orderObj = order.toObject();
    if (orderObj.seller) {
      orderObj.seller.totalOrders = sellerCompletedOrders;
      orderObj.seller.rating = {
        average: sellerAvgRating,
        count: sellerReviews.length
      };
    }

    // Debug log
    console.log(`📦 Order ${order._id} fetched`);
    console.log('💰 Package Details:', orderObj.packageDetails);
    console.log('💵 Platform Fee:', orderObj.platformFee);
    console.log('🔄 Revisions:', orderObj.revisionsUsed, '/', orderObj.packageDetails?.revisions);
    console.log(`👤 Seller: ${sellerCompletedOrders} orders, ${sellerAvgRating.toFixed(1)} rating`);

    res.json({ success: true, order: orderObj });
  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

// Update payment for pending orders (re-payment)
router.patch('/:id/payment', protect, async (req, res) => {
  try {
    const { transactionId, memo } = req.body;
    const order = await Order.findById(req.params.id).populate('gig');
    
    console.log('🔄 Updating payment for order:', req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Only allow payment update for pending orders
    if (order.status !== 'pending' && order.status !== 'pending_verification') {
      return res.status(400).json({ 
        message: 'Payment can only be updated for pending orders' 
      });
    }

    if (!transactionId || !memo) {
      return res.status(400).json({ 
        message: 'Transaction ID and memo are required' 
      });
    }

    console.log('🔐 Verifying new payment...');
    
    // 1. Validate memo format
    if (!validateMemoFormat(memo)) {
      return res.status(400).json({ 
        message: 'Invalid memo format. Please use the generated memo exactly as shown.' 
      });
    }

    // 2. Check if this transaction ID has already been used (excluding current order)
    const existingOrder = await Order.findOne({ 
      'payment.transactionId': transactionId,
      _id: { $ne: order._id }
    });
    if (existingOrder) {
      console.log('❌ Transaction ID already used:', transactionId);
      return res.status(400).json({ 
        message: 'This transaction ID has already been used for another order.' 
      });
    }

    // 3. Verify transaction on Hive blockchain
    const verification = await verifyHiveTransaction(
      transactionId,
      order.totalAmount,
      memo,
      'vyldo-escrow'
    );

    if (!verification.verified) {
      console.log('❌ Transaction verification failed:', verification.error);
      return res.status(400).json({ 
        message: `Payment verification failed: ${verification.error}` 
      });
    }

    console.log('✅ Payment verified successfully');

    // Update order with verified payment
    order.payment = {
      transactionId,
      memo,
      amount: order.totalAmount,
      verified: true,
      verifiedAt: new Date()
    };
    order.status = 'active';
    await order.save();

    console.log('✅ Order activated:', order._id);

    res.json({ 
      success: true, 
      order,
      message: 'Payment verified! Order is now active.' 
    });
  } catch (error) {
    console.error('❌ Payment update error:', error);
    res.status(500).json({ 
      message: 'Failed to update payment',
      error: error.message 
    });
  }
});

// Deliver order (seller) - with file upload support
router.post('/:id/deliver', protect, upload.array('files', 10), async (req, res) => {
  try {
    const { message } = req.body;
    const order = await Order.findById(req.params.id);
    
    console.log('📦 Delivering order:', req.params.id);
    console.log('📎 Files uploaded:', req.files?.length || 0);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Allow delivery for active orders or orders in revision
    if (order.status !== 'active' && order.status !== 'in_revision') {
      return res.status(400).json({ 
        message: 'Can only deliver active orders or orders in revision' 
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ 
        message: 'Delivery message is required' 
      });
    }

    // Process uploaded files
    const uploadedFiles = req.files ? req.files.map(file => ({
      filename: file.originalname,
      path: `/uploads/deliverables/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date()
    })) : [];

    console.log('✅ Processed files:', uploadedFiles.length);

    // Add deliverable
    order.deliverables.push({
      message: message.trim(),
      files: uploadedFiles,
      submittedAt: new Date()
    });
    
    order.status = 'delivered';
    order.deliveredAt = new Date();
    await order.save();

    console.log('✅ Order delivered with', uploadedFiles.length, 'files');

    res.json({ 
      success: true, 
      order,
      message: 'Order delivered successfully!',
      filesUploaded: uploadedFiles.length
    });
  } catch (error) {
    console.error('❌ Delivery error:', error);
    res.status(500).json({ 
      message: 'Failed to deliver order',
      error: error.message 
    });
  }
});

// Request revision (buyer)
router.post('/:id/request-revision', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const order = await Order.findById(req.params.id);
    
    console.log('🔄 Requesting revision:', req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ 
        message: 'Can only request revision for delivered orders' 
      });
    }

    // Check if revisions are available
    const maxRevisions = order.packageDetails?.revisions || 0;
    const usedRevisions = order.revisionsUsed || 0;
    
    console.log(`📊 Revision check: ${usedRevisions} used / ${maxRevisions} max`);
    
    if (maxRevisions === 0) {
      return res.status(400).json({ 
        message: 'This package does not include revisions.' 
      });
    }
    
    if (usedRevisions >= maxRevisions) {
      return res.status(400).json({ 
        message: `No revisions left. You have used ${usedRevisions} of ${maxRevisions} revisions.` 
      });
    }

    // Add revision request
    order.revisionRequests.push({
      message: message || 'Revision requested',
      requestedAt: new Date()
    });

    order.revisionsUsed = usedRevisions + 1;
    order.status = 'in_revision';
    await order.save();

    const remainingRevisions = maxRevisions - order.revisionsUsed;
    
    console.log(`✅ Revision requested (${order.revisionsUsed}/${maxRevisions})`);

    res.json({ 
      success: true, 
      order,
      message: 'Revision requested successfully!',
      revisionsLeft: remainingRevisions
    });
  } catch (error) {
    console.error('❌ Revision request error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to request revision',
      error: error.message 
    });
  }
});

// Accept delivery (buyer)
router.patch('/:id/accept', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    console.log('✅ Accepting delivery:', req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ 
        message: 'Can only accept delivered orders' 
      });
    }

    order.status = 'completed';
    order.completedAt = new Date();
    await order.save();

    // Update gig totalOrders count
    await Gig.findByIdAndUpdate(order.gig, {
      $inc: { totalOrders: 1 }
    });

    // Update seller totalOrders count
    await User.findByIdAndUpdate(order.seller, {
      $inc: { totalOrders: 1 }
    });

    // Auto-update seller level
    try {
      const { calculateSellerLevel } = await import('../utils/sellerLevel.js');
      const seller = await User.findById(order.seller);
      
      const completedOrders = await Order.countDocuments({
        seller: order.seller,
        status: 'completed'
      });

      const orders = await Order.find({
        seller: order.seller,
        status: 'completed'
      });

      const totalEarnings = orders.reduce((sum, o) => sum + (o.sellerEarnings || 0), 0);
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

      const levelInfo = calculateSellerLevel(seller, stats);
      
      if (seller.sellerLevel !== levelInfo.level) {
        seller.sellerLevel = levelInfo.level;
        await seller.save();
        console.log(`🎖️ ${seller.username} level updated to ${levelInfo.level}`);
      }
    } catch (error) {
      console.error('Error updating seller level:', error);
    }

    console.log('✅ Order completed and counts updated');

    res.json({ 
      success: true, 
      order,
      message: 'Order completed! Payment will be released to seller.' 
    });
  } catch (error) {
    console.error('❌ Accept error:', error);
    res.status(500).json({ 
      message: 'Failed to accept delivery',
      error: error.message 
    });
  }
});

// Cancel order (buyer)
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    
    console.log('❌ Cancelling order:', req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Can only cancel pending orders
    if (order.status !== 'pending' && order.status !== 'pending_verification') {
      return res.status(400).json({ 
        message: 'Can only cancel pending orders' 
      });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ 
        message: 'Cancellation reason is required' 
      });
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason.trim();
    await order.save();

    console.log('✅ Order cancelled');

    res.json({ 
      success: true, 
      order,
      message: 'Order cancelled successfully' 
    });
  } catch (error) {
    console.error('❌ Cancel error:', error);
    res.status(500).json({ 
      message: 'Failed to cancel order',
      error: error.message 
    });
  }
});

// Download deliverable file
router.get('/:id/download/:fileIndex', protect, async (req, res) => {
  try {
    const { id, fileIndex } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization - buyer or seller can download
    if (order.buyer.toString() !== req.user._id.toString() && 
        order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to download files' });
    }

    // Find the file across all deliverables
    let fileToDownload = null;
    let allFiles = [];
    
    // Collect all files from all deliverables
    for (const deliverable of order.deliverables) {
      if (deliverable.files && Array.isArray(deliverable.files)) {
        allFiles = allFiles.concat(deliverable.files);
      }
    }

    // Get the specific file by index
    if (allFiles[fileIndex]) {
      fileToDownload = allFiles[fileIndex];
    }

    if (!fileToDownload) {
      return res.status(404).json({ 
        message: 'File not found',
        totalFiles: allFiles.length,
        requestedIndex: fileIndex
      });
    }

    const filePath = path.join(__dirname, '../..', fileToDownload.path);
    
    console.log('📥 Downloading file:', fileToDownload.filename, 'from', filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('❌ File not found on disk:', filePath);
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileToDownload.filename)}"`);
    res.setHeader('Content-Type', fileToDownload.mimetype || 'application/octet-stream');
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('❌ File stream error:', error);
      res.status(500).json({ message: 'Error downloading file' });
    });

  } catch (error) {
    console.error('❌ Download error:', error);
    res.status(500).json({ message: 'Failed to download file' });
  }
});

export default router;
