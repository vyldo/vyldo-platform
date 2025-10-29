import express from 'express';
import Gig from '../models/Gig.js';
import User from '../models/User.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import Review from '../models/Review.js';
import { rankGigs, rankSearchResults } from '../utils/gigRanking.js';
import { upload, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

router.post('/', protect, upload.array('images', 5), handleUploadError, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user.profileCompletion < 60) {
      return res.status(400).json({ 
        message: 'Please complete your profile to at least 60% before creating a gig',
        profileCompletion: user.profileCompletion
      });
    }

    const gigData = JSON.parse(req.body.data);
    
    const images = req.files ? req.files.map(file => `/uploads/gigs/${file.filename}`) : [];

    // Clean up packages - only keep filled ones
    const packages = {
      basic: gigData.packages.basic // Basic is always required
    };
    
    // Add Standard only if it has price and title
    if (gigData.packages.standard?.price && gigData.packages.standard?.title && 
        gigData.packages.standard.price !== '' && gigData.packages.standard.title !== '') {
      packages.standard = gigData.packages.standard;
    }
    
    // Add Premium only if it has price and title
    if (gigData.packages.premium?.price && gigData.packages.premium?.title && 
        gigData.packages.premium.price !== '' && gigData.packages.premium.title !== '') {
      packages.premium = gigData.packages.premium;
    }

    // Prepare gig data
    const gigToCreate = {
      title: gigData.title,
      description: gigData.description,
      category: gigData.category,
      subcategory: gigData.subcategory,
      tags: gigData.tags || [],
      servicesInclude: gigData.servicesInclude || [],
      whyChooseMe: gigData.whyChooseMe || '',
      whatsIncluded: gigData.whatsIncluded || [],
      faqs: gigData.faqs || [],
      packages,
      seller: req.user._id,
      images,
    };

    const gig = await Gig.create(gigToCreate);

    res.status(201).json({
      success: true,
      gig,
    });
  } catch (error) {
    console.error('Gig creation error:', error);
    res.status(500).json({ message: 'Failed to create gig', error: error.message });
  }
});

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      category, 
      subcategory, 
      minPrice, 
      maxPrice, 
      deliveryTime, 
      rating,
      search,
      sort = '-createdAt',
      page = 1,
      limit = 12
    } = req.query;

    const query = { isActive: true, isPaused: false };

    if (category) {
      query.category = category;
    }

    if (subcategory) {
      query.subcategory = subcategory;
    }

    if (minPrice || maxPrice) {
      query.$or = [
        { 'packages.basic.price': {} },
        { 'packages.standard.price': {} },
        { 'packages.premium.price': {} }
      ];
      
      if (minPrice) {
        query.$or.forEach(item => {
          const key = Object.keys(item)[0];
          item[key].$gte = parseFloat(minPrice);
        });
      }
      
      if (maxPrice) {
        query.$or.forEach(item => {
          const key = Object.keys(item)[0];
          item[key].$lte = parseFloat(maxPrice);
        });
      }
    }

    if (deliveryTime) {
      query.$or = [
        { 'packages.basic.deliveryTime': { $lte: parseInt(deliveryTime) } },
        { 'packages.standard.deliveryTime': { $lte: parseInt(deliveryTime) } },
        { 'packages.premium.deliveryTime': { $lte: parseInt(deliveryTime) } }
      ];
    }

    if (rating) {
      query['rating.average'] = { $gte: parseFloat(rating) };
    }

    if (search) {
      // Smart search - case insensitive, partial matching
      const searchRegex = new RegExp(search.split(' ').join('|'), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
        { category: searchRegex },
        { subcategory: searchRegex }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const gigs = await Gig.find(query)
      .populate('seller', 'displayName username avatar rating sellerLevel isVerified verifiedText verifiedBadgeType verifiedBadgeImage')
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Gig.countDocuments(query);

    // Update each gig's stats
    const Order = (await import('../models/Order.js')).default;
    const Review = (await import('../models/Review.js')).default;

    const gigsWithStats = await Promise.all(gigs.map(async (gig) => {
      // Count completed orders
      const completedOrders = await Order.countDocuments({
        gig: gig._id,
        status: 'completed'
      });

      // Get reviews
      const gigReviews = await Review.find({ gig: gig._id });
      const avgRating = gigReviews.length > 0
        ? gigReviews.reduce((sum, r) => sum + r.rating, 0) / gigReviews.length
        : 0;

      // Get seller stats
      const sellerOrders = await Order.countDocuments({
        seller: gig.seller._id,
        status: 'completed'
      });

      const sellerReviews = await Review.find({ seller: gig.seller._id });
      const sellerAvgRating = sellerReviews.length > 0
        ? sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length
        : 0;

      const gigObj = gig.toObject();
      gigObj.totalOrders = completedOrders;
      gigObj.rating = {
        average: avgRating,
        count: gigReviews.length
      };
      gigObj.seller.totalOrders = sellerOrders;
      gigObj.seller.rating = {
        average: sellerAvgRating,
        count: sellerReviews.length
      };

      // Add seller stats for ranking
      gigObj.seller.completedOrders = sellerOrders;
      gigObj.seller.cancelledOrders = await Order.countDocuments({
        seller: gig.seller._id,
        status: 'cancelled'
      });
      gigObj.seller.totalOrders = await Order.countDocuments({
        seller: gig.seller._id
      });

      return gigObj;
    }));

    // Apply intelligent ranking algorithm
    let rankedGigs = gigsWithStats;
    try {
      if (search) {
        // Use search-specific ranking
        rankedGigs = rankSearchResults(gigsWithStats, search);
      } else {
        // Use general ranking
        rankedGigs = rankGigs(gigsWithStats);
      }
    } catch (rankError) {
      console.error('⚠️ Ranking error, using default order:', rankError);
      // Fallback to original order if ranking fails
      rankedGigs = gigsWithStats;
    }

    // Apply pagination after ranking
    const paginatedGigs = rankedGigs.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      gigs: paginatedGigs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: rankedGigs.length,
        pages: Math.ceil(rankedGigs.length / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Gigs fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch gigs' });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate('seller', 'displayName username avatar rating totalOrders bio skills languages sellerLevel createdAt isVerified verifiedText verifiedBadgeType verifiedBadgeImage')
      .populate('category', 'name slug');

    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    // Count completed orders for this gig
    const Order = (await import('../models/Order.js')).default;
    const completedOrdersCount = await Order.countDocuments({
      gig: gig._id,
      status: 'completed'
    });

    // Calculate seller's actual stats
    const sellerCompletedOrders = await Order.countDocuments({
      seller: gig.seller._id,
      status: 'completed'
    });

    // Calculate seller's average rating
    const Review = (await import('../models/Review.js')).default;
    const sellerReviews = await Review.find({ seller: gig.seller._id });
    const sellerAvgRating = sellerReviews.length > 0
      ? sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length
      : 0;

    // Calculate gig's average rating
    const gigReviews = await Review.find({ gig: gig._id });
    const gigAvgRating = gigReviews.length > 0
      ? gigReviews.reduce((sum, r) => sum + r.rating, 0) / gigReviews.length
      : 0;

    // Update gig stats
    gig.totalOrders = completedOrdersCount;
    gig.rating = {
      average: gigAvgRating,
      count: gigReviews.length
    };
    gig.views += 1;
    await gig.save();

    // Convert to plain object and enhance with calculated stats
    const gigObj = gig.toObject();
    
    // Override seller stats with calculated values
    if (gigObj.seller) {
      gigObj.seller.totalOrders = sellerCompletedOrders;
      gigObj.seller.rating = {
        average: sellerAvgRating,
        count: sellerReviews.length
      };
    }

    console.log(`📊 Gig stats: ${completedOrdersCount} orders, ${gigAvgRating.toFixed(1)} rating (${gigReviews.length} reviews)`);
    console.log(`👤 Seller stats: ${sellerCompletedOrders} orders, ${sellerAvgRating.toFixed(1)} rating (${sellerReviews.length} reviews)`);

    res.json({
      success: true,
      gig: gigObj,
    });
  } catch (error) {
    console.error('Gig fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch gig' });
  }
});

router.put('/:id', protect, upload.array('images', 5), async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this gig' });
    }

    const gigData = JSON.parse(req.body.data);
    
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/gigs/${file.filename}`);
      gigData.images = [...(gigData.images || []), ...newImages];
    }

    Object.assign(gig, gigData);
    await gig.save();

    res.json({
      success: true,
      gig,
    });
  } catch (error) {
    console.error('Gig update error:', error);
    res.status(500).json({ message: 'Failed to update gig' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this gig' });
    }

    await gig.deleteOne();

    res.json({
      success: true,
      message: 'Gig deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete gig' });
  }
});

router.get('/seller/:sellerId', async (req, res) => {
  try {
    const gigs = await Gig.find({ 
      seller: req.params.sellerId,
      isActive: true 
    })
    .populate('category', 'name slug')
    .sort('-createdAt');

    // Update each gig's stats
    const Order = (await import('../models/Order.js')).default;
    const Review = (await import('../models/Review.js')).default;

    const gigsWithStats = await Promise.all(gigs.map(async (gig) => {
      // Count completed orders for this gig
      const completedOrders = await Order.countDocuments({
        gig: gig._id,
        status: 'completed'
      });

      // Get gig reviews
      const gigReviews = await Review.find({ gig: gig._id });
      const avgRating = gigReviews.length > 0
        ? gigReviews.reduce((sum, r) => sum + r.rating, 0) / gigReviews.length
        : 0;

      return {
        ...gig.toObject(),
        totalOrders: completedOrders,
        rating: {
          average: avgRating,
          count: gigReviews.length
        }
      };
    }));

    res.json({
      success: true,
      gigs: gigsWithStats,
    });
  } catch (error) {
    console.error('Seller gigs fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch seller gigs' });
  }
});

router.get('/:id/related', async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    const relatedGigs = await Gig.find({
      _id: { $ne: gig._id },
      category: gig.category,
      isActive: true,
      isPaused: false,
    })
    .populate('seller', 'displayName username avatar rating sellerLevel isVerified verifiedText verifiedBadgeType verifiedBadgeImage')
    .limit(6)
    .sort('-rating.average');

    res.json({
      success: true,
      gigs: relatedGigs,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch related gigs' });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, category, subcategory, isPaused } = req.body;

    if (title) gig.title = title;
    if (description) gig.description = description;
    if (category) gig.category = category;
    if (subcategory) gig.subcategory = subcategory;
    if (isPaused !== undefined) gig.isPaused = isPaused;

    await gig.save();

    res.json({
      success: true,
      gig,
    });
  } catch (error) {
    console.error('Gig update error:', error);
    res.status(500).json({ message: 'Failed to update gig' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Soft delete - just mark as inactive
    gig.isActive = false;
    await gig.save();

    res.json({
      success: true,
      message: 'Gig deleted successfully',
    });
  } catch (error) {
    console.error('Gig delete error:', error);
    res.status(500).json({ message: 'Failed to delete gig' });
  }
});

router.patch('/:id/pause', protect, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    gig.isPaused = !gig.isPaused;
    await gig.save();

    res.json({
      success: true,
      gig,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update gig status' });
  }
});

export default router;
