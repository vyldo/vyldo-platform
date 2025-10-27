import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true,
  },
  gig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  communication: {
    type: Number,
    min: 1,
    max: 5,
  },
  serviceAsDescribed: {
    type: Number,
    min: 1,
    max: 5,
  },
  recommendToFriend: {
    type: Boolean,
    default: true,
  },
  sellerResponse: {
    comment: String,
    respondedAt: Date,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  helpful: {
    type: Number,
    default: 0,
  },
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

reviewSchema.index({ gig: 1, createdAt: -1 });
reviewSchema.index({ seller: 1 });
reviewSchema.index({ buyer: 1 });
reviewSchema.index({ order: 1 });
reviewSchema.index({ rating: -1 });

export default mongoose.model('Review', reviewSchema);
