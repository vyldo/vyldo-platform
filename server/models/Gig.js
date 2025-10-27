import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['basic', 'standard', 'premium'],
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 1,
  },
  deliveryTime: {
    type: Number,
    required: true,
    min: 1,
  },
  revisions: {
    type: Number,
    required: true,
    min: 0,
  },
  features: [{
    type: String,
  }],
});

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
});

const gigSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80,
  },
  description: {
    type: String,
    required: true,
    maxlength: 1200,
  },
  category: {
    type: String,
    required: true,
  },
  subcategory: {
    type: String,
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  images: [{
    type: String,
  }],
  video: {
    type: String,
    default: '',
  },
  packages: {
    basic: {
      type: packageSchema,
      required: true,
    },
    standard: {
      type: packageSchema,
      required: false,
    },
    premium: {
      type: packageSchema,
      required: false,
    },
  },
  servicesInclude: [{
    type: String,
  }],
  whyChooseMe: {
    type: String,
    maxlength: 800,
    default: '',
  },
  whatsIncluded: [{
    type: String,
  }],
  faqs: [faqSchema],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  totalOrders: {
    type: Number,
    default: 0,
  },
  totalRevenue: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isPaused: {
    type: Boolean,
    default: false,
  },
  suspensionReason: String,
  suspendedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  suspendedAt: Date,
  views: {
    type: Number,
    default: 0,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  impressions: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

gigSchema.index({ seller: 1 });
gigSchema.index({ category: 1 });
gigSchema.index({ 'rating.average': -1 });
gigSchema.index({ totalOrders: -1 });
gigSchema.index({ createdAt: -1 });
gigSchema.index({ tags: 1 });
gigSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Gig', gigSchema);
