import express from 'express';
import SupportTicket from '../models/SupportTicket.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is admin or support team
const requireSupport = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'team') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  // Check if team member has support permission
  if (req.user.role === 'team' && !req.user.permissions?.manageSupport) {
    return res.status(403).json({ message: 'No permission to manage support tickets' });
  }
  
  next();
};

// Get all tickets (admin/support)
router.get('/tickets', protect, requireSupport, async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    const tickets = await SupportTicket.find(query)
      .populate('user', 'displayName email avatar phone')
      .populate('assignedTo', 'displayName username avatar')
      .populate('messages.sender', 'displayName username avatar role')
      .sort('-createdAt');

    res.json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tickets' });
  }
});

// Assign ticket to support member
router.patch('/tickets/:id/assign', protect, requireSupport, async (req, res) => {
  try {
    const { assignedTo } = req.body;
    
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { 
        assignedTo,
        status: assignedTo ? 'in_progress' : 'open'
      },
      { new: true }
    ).populate('assignedTo', 'displayName username');

    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ message: 'Failed to assign ticket' });
  }
});

// Update ticket status
router.patch('/tickets/:id/status', protect, requireSupport, async (req, res) => {
  try {
    const { status } = req.body;
    
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status' });
  }
});

// Close ticket
router.patch('/tickets/:id/close', protect, requireSupport, async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'closed',
        resolvedAt: new Date(),
        resolvedBy: req.user._id
      },
      { new: true }
    );

    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ message: 'Failed to close ticket' });
  }
});

export default router;
