import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .populate('relatedUser', 'displayName username avatar')
      .sort('-createdAt')
      .limit(50);

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

router.patch('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark as read' });
  }
});

router.patch('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark all as read' });
  }
});

export default router;
