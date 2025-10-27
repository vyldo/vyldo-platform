import express from 'express';
import SupportTicket from '../models/SupportTicket.js';
import { protect } from '../middleware/auth.js';
import { assignTaskToTeamMember, updateTeamMemberStats } from '../utils/taskAssignment.js';

const router = express.Router();

// Create new ticket
router.post('/tickets', protect, async (req, res) => {
  try {
    const { subject, category, priority, description } = req.body;

    // Auto-assign to available team member
    const assignedTo = await assignTaskToTeamMember('ticket');

    const ticket = await SupportTicket.create({
      user: req.user._id,
      subject,
      category,
      priority,
      description,
      assignedTo: assignedTo || null,
      assignedAt: assignedTo ? new Date() : null,
      messages: [{
        sender: req.user._id,
        message: description,
        isStaff: false,
      }],
    });

    // Update team member stats if assigned
    if (assignedTo) {
      await updateTeamMemberStats(assignedTo, 'ticket');
      console.log(`✅ Ticket ${ticket._id} assigned to team member ${assignedTo}`);
    } else {
      console.log('⚠️ No available team members, ticket unassigned');
    }

    await ticket.populate('user', 'displayName email avatar');

    res.status(201).json({ success: true, ticket });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Failed to create ticket' });
  }
});

// Get user's tickets
router.get('/tickets', protect, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id };
    
    if (status) query.status = status;

    const tickets = await SupportTicket.find(query)
      .populate('user', 'displayName email avatar')
      .populate('assignedTo', 'displayName username')
      .populate('messages.sender', 'displayName username avatar role')
      .sort('-createdAt');

    res.json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tickets' });
  }
});

// Get single ticket
router.get('/tickets/:id', protect, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('user', 'displayName email avatar phone')
      .populate('assignedTo', 'displayName username avatar')
      .populate('messages.sender', 'displayName username avatar role');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user is staff with support permission
    const isStaff = req.user.role === 'admin' || 
                    (req.user.role === 'team' && req.user.permissions?.manageSupport);
    
    // Check if user owns the ticket
    const isTicketOwner = ticket.user._id.toString() === req.user._id.toString();

    // Deny access if not owner and not staff with permission
    if (!isTicketOwner && !isStaff) {
      return res.status(403).json({ 
        message: 'Access denied. You do not have permission to view this ticket.',
        hasPermission: false 
      });
    }

    res.json({ success: true, ticket, canReply: isTicketOwner || isStaff });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch ticket' });
  }
});

// Add message to ticket
router.post('/tickets/:id/messages', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user is staff
    const isStaff = req.user.role === 'admin' || 
                    (req.user.role === 'team' && req.user.permissions?.manageSupport);

    // Check access permissions
    const isTicketOwner = ticket.user.toString() === req.user._id.toString();
    
    if (!isTicketOwner && !isStaff) {
      return res.status(403).json({ message: 'Access denied. You do not have permission to reply to this ticket.' });
    }

    // If staff member, check if they have support permission
    if (req.user.role === 'team' && !req.user.permissions?.manageSupport) {
      return res.status(403).json({ message: 'Access denied. You need "Manage Support" permission to reply to tickets.' });
    }

    ticket.messages.push({
      sender: req.user._id,
      message,
      isStaff,
    });

    // Update status if staff replied
    if (isStaff && ticket.status === 'open') {
      ticket.status = 'in_progress';
    } else if (!isStaff && ticket.status === 'waiting_reply') {
      ticket.status = 'in_progress';
    }

    await ticket.save();
    await ticket.populate('messages.sender', 'displayName username avatar role');

    res.json({ success: true, ticket });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ message: 'Failed to add message' });
  }
});

// Mark ticket as solved (user only)
router.patch('/tickets/:id/solve', protect, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only ticket owner can mark as solved' });
    }

    ticket.status = 'solved';
    ticket.resolvedAt = new Date();
    await ticket.save();

    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update ticket' });
  }
});

export default router;
