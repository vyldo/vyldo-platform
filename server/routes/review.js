import express from 'express';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Gig from '../models/Gig.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { orderId, rating, comment, communication, serviceAsDescribed } = req.body;

    const order = await Order.findById(orderId);
    if (!order || order.status !== 'completed') {
      return res.status(400).json({ message: 'Cannot review this order' });
    }

    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const existingReview = await Review.findOne({ order: orderId });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists' });
    }

    const review = await Review.create({
      order: orderId,
      gig: order.gig,
      seller: order.seller,
      buyer: req.user._id,
      rating,
      comment,
      communication,
      serviceAsDescribed,
    });

    const gig = await Gig.findById(order.gig);
    const reviews = await Review.find({ gig: order.gig });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    gig.rating.average = avgRating;
    gig.rating.count = reviews.length;
    await gig.save();

    const seller = await User.findById(order.seller);
    const sellerReviews = await Review.find({ seller: order.seller });
    const sellerAvgRating = sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length;
    
    seller.rating.average = sellerAvgRating;
    seller.rating.count = sellerReviews.length;
    await seller.save();

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create review' });
  }
});

router.get('/gig/:gigId', async (req, res) => {
  try {
    const reviews = await Review.find({ gig: req.params.gigId, isPublic: true })
      .populate('buyer', 'displayName username avatar')
      .sort('-createdAt');

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

export default router;
