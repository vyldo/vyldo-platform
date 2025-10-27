import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'order_placed',
      'order_delivered',
      'order_completed',
      'order_cancelled',
      'order_disputed',
      'message_received',
      'review_received',
      'withdrawal_processed',
      'withdrawal_rejected',
      'payment_received',
      'gig_approved',
      'gig_rejected',
      'profile_verified',
      'system_announcement',
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    default: '',
  },
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  relatedGig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
