import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true,
  },
  packageType: {
    type: String,
    enum: ['basic', 'standard', 'premium'],
    required: true,
  },
  packageDetails: {
    title: String,
    description: String,
    price: Number,
    deliveryTime: Number,
    revisions: Number,
    features: [String],
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  platformFee: {
    type: Number,
    required: true,
  },
  sellerEarnings: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'pending_verification', 'active', 'delivered', 'in_revision', 'revision_requested', 'completed', 'cancelled', 'disputed', 'refunded'],
    default: 'pending',
  },
  requirements: {
    type: String,
    default: '',
  },
  requirementImages: [{
    type: String
  }],
  deliverables: [{
    message: String,
    files: [{
      filename: String,
      path: String,
      size: Number,
      mimetype: String,
      uploadedAt: Date
    }],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  revisionRequests: [{
    message: String,
    requestedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  revisionsUsed: {
    type: Number,
    default: 0,
  },
  dueDate: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  cancelledAt: {
    type: Date,
  },
  cancellationReason: {
    type: String,
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  cancelReason: {
    type: String,
    default: '',
  },
  dispute: {
    isDisputed: {
      type: Boolean,
      default: false,
    },
    reason: String,
    openedAt: Date,
    resolvedAt: Date,
    resolution: String,
  },
  payment: {
    transactionId: {
      type: String,
      unique: true,
      sparse: true
    },
    memo: {
      type: String,
      unique: true,
      sparse: true
    },
    amount: Number,
    verified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    submittedAt: Date
  },
  hiveTransaction: {
    txId: String,
    amount: Number,
    from: String,
    to: String,
    memo: String,
    timestamp: Date,
  },
  escrowReleased: {
    type: Boolean,
    default: false,
  },
  escrowReleasedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

orderSchema.index({ buyer: 1, status: 1 });
orderSchema.index({ seller: 1, status: 1 });
orderSchema.index({ gig: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model('Order', orderSchema);
