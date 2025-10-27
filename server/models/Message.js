import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: false,  // Not required if attachment is present
  },
  attachment: {
    filename: String,
    url: String,
    size: Number,
    mimetype: String,
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    type: String,
  }],
  isSystemMessage: {
    type: Boolean,
    default: false,
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  }],
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
}, {
  timestamps: true,
});

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  relatedGig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
  },
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {},
  },
}, {
  timestamps: true,
});

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

export const Message = mongoose.model('Message', messageSchema);
export const Conversation = mongoose.model('Conversation', conversationSchema);
