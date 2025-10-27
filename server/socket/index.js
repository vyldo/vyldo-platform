import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { Message, Conversation } from '../models/Message.js';

const userSockets = new Map();

export const setupSocketHandlers = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vyldo-secret-jwt-key');
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    userSockets.set(socket.userId, socket.id);
    socket.join(`user:${socket.userId}`);

    socket.emit('connected', { userId: socket.userId });

    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, attachments } = data;

        const conversation = await Conversation.findById(conversationId);
        
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        if (!conversation.participants.includes(socket.userId)) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        const message = await Message.create({
          conversation: conversationId,
          sender: socket.userId,
          content,
          attachments: attachments || [],
        });

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'displayName avatar username');

        conversation.lastMessage = message._id;
        
        conversation.participants.forEach(participantId => {
          const participantIdStr = participantId.toString();
          if (participantIdStr !== socket.userId) {
            const currentCount = conversation.unreadCount.get(participantIdStr) || 0;
            conversation.unreadCount.set(participantIdStr, currentCount + 1);
          }
        });

        await conversation.save();

        io.to(`conversation:${conversationId}`).emit('new_message', populatedMessage);

        conversation.participants.forEach(participantId => {
          const participantIdStr = participantId.toString();
          if (participantIdStr !== socket.userId) {
            io.to(`user:${participantIdStr}`).emit('conversation_updated', {
              conversationId,
              lastMessage: populatedMessage,
              unreadCount: conversation.unreadCount.get(participantIdStr) || 0,
            });
          }
        });

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('mark_as_read', async (data) => {
      try {
        const { conversationId } = data;

        const conversation = await Conversation.findById(conversationId);
        
        if (!conversation) {
          return;
        }

        if (!conversation.participants.includes(socket.userId)) {
          return;
        }

        await Message.updateMany(
          {
            conversation: conversationId,
            sender: { $ne: socket.userId },
            'readBy.user': { $ne: socket.userId },
          },
          {
            $push: {
              readBy: {
                user: socket.userId,
                readAt: new Date(),
              },
            },
          }
        );

        conversation.unreadCount.set(socket.userId, 0);
        await conversation.save();

        socket.emit('messages_read', { conversationId });

      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    socket.on('typing_start', (data) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        username: socket.user.displayName,
      });
    });

    socket.on('typing_stop', (data) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
        userId: socket.userId,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      userSockets.delete(socket.userId);
    });
  });
};

export const getSocketIdByUserId = (userId) => {
  return userSockets.get(userId.toString());
};

export const isUserOnline = (userId) => {
  return userSockets.has(userId.toString());
};
