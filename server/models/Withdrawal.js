import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  hiveAccount: {
    type: String,
    required: true,
    trim: true,
  },
  memo: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'rejected'],
    default: 'pending',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedAt: Date,
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  lockedAt: Date,
  lockExpiry: Date,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  processedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
    default: '',
  },
  hiveTransaction: {
    txId: String,
    blockNum: Number,
    timestamp: Date,
  },
  notes: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  ipAddress: {
    type: String,
  },
}, {
  timestamps: true,
});

withdrawalSchema.index({ user: 1, status: 1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });
withdrawalSchema.index({ createdAt: -1 });

export default mongoose.model('Withdrawal', withdrawalSchema);
