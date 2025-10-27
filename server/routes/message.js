import express from 'express';
import { Message, Conversation } from '../models/Message.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/conversations', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
    .populate('participants', 'displayName username avatar')
    .populate('lastMessage')
    .populate('relatedGig', 'title')
    .sort('-updatedAt');

    res.json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
});

router.get('/conversations/:id/messages', protect, async (req, res) => {
  try {
    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'displayName username avatar')
      .sort('createdAt');

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Send message to existing conversation (with file upload)
router.post('/conversations/:id/messages', protect, upload.single('attachment'), async (req, res) => {
  try {
    const { content } = req.body;
    
    // Either content or attachment is required
    if ((!content || !content.trim()) && !req.file) {
      return res.status(400).json({ message: 'Message content or attachment is required' });
    }

    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Prepare message data
    const messageData = {
      conversation: req.params.id,
      sender: req.user._id,
    };

    if (content && content.trim()) {
      messageData.content = content.trim();
    }

    // Add attachment if file was uploaded
    if (req.file) {
      messageData.attachment = {
        filename: req.file.originalname,
        url: `/uploads/messages/${req.file.filename}`,
        mimetype: req.file.mimetype,
        size: req.file.size
      };
    }

    const message = await Message.create(messageData);

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'displayName username avatar');

    console.log('✅ Message sent with attachment:', !!req.file);

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Create new conversation or get existing
router.post('/conversations', protect, async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId] }
    }).populate('participants', 'displayName username avatar');

    // Create new conversation if doesn't exist
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId]
      });
      
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'displayName username avatar');
    }

    // Send initial message if provided
    if (content && content.trim()) {
      const message = await Message.create({
        conversation: conversation._id,
        sender: req.user._id,
        content: content.trim()
      });

      conversation.lastMessage = message._id;
      await conversation.save();
    }

    res.status(201).json({ success: true, conversation });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: 'Failed to create conversation' });
  }
});

export default router;
