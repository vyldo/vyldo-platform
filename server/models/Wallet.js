import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['credit', 'debit', 'fee', 'refund', 'withdrawal', 'hold', 'release'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  relatedWithdrawal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Withdrawal',
  },
  hiveTransaction: {
    txId: String,
    from: String,
    to: String,
    memo: String,
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  balance: {
    available: {
      type: Number,
      default: 0,
      min: 0,
    },
    pending: {
      type: Number,
      default: 0,
      min: 0,
    },
    held: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  totalEarned: {
    type: Number,
    default: 0,
  },
  totalWithdrawn: {
    type: Number,
    default: 0,
  },
  totalFees: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: 'HIVE',
  },
}, {
  timestamps: true,
});

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ relatedOrder: 1 });

walletSchema.index({ user: 1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);
export const Wallet = mongoose.model('Wallet', walletSchema);
