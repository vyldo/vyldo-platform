import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['technical', 'payment', 'account', 'order', 'gig', 'other'],
    default: 'other',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'waiting_reply', 'solved', 'closed'],
    default: 'open',
  },
  description: {
    type: String,
    required: true,
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isStaff: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedAt: {
    type: Date,
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

supportTicketSchema.index({ user: 1, status: 1 });
supportTicketSchema.index({ status: 1, createdAt: -1 });
supportTicketSchema.index({ assignedTo: 1 });

export default mongoose.model('SupportTicket', supportTicketSchema);
