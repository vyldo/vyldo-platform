import Notification from '../models/Notification.js';
import { io } from '../index.js';

export const createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    
    const populatedNotification = await Notification.findById(notification._id)
      .populate('relatedUser', 'displayName avatar username')
      .populate('relatedOrder')
      .populate('relatedGig', 'title');

    if (io) {
      io.to(`user:${data.user}`).emit('notification', populatedNotification);
    }

    return populatedNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

export const notifyOrderPlaced = async (order, buyer, seller) => {
  await createNotification({
    user: seller._id,
    type: 'order_placed',
    title: 'New Order Received',
    message: `${buyer.displayName} placed an order for your gig`,
    link: `/orders/${order._id}`,
    relatedOrder: order._id,
    relatedUser: buyer._id,
  });
};

export const notifyOrderDelivered = async (order, seller, buyer) => {
  await createNotification({
    user: buyer._id,
    type: 'order_delivered',
    title: 'Order Delivered',
    message: `${seller.displayName} has delivered your order`,
    link: `/orders/${order._id}`,
    relatedOrder: order._id,
    relatedUser: seller._id,
  });
};

export const notifyOrderCompleted = async (order, buyer, seller) => {
  await createNotification({
    user: seller._id,
    type: 'order_completed',
    title: 'Order Completed',
    message: `${buyer.displayName} marked your order as complete`,
    link: `/orders/${order._id}`,
    relatedOrder: order._id,
    relatedUser: buyer._id,
  });
};

export const notifyPaymentReceived = async (userId, amount) => {
  await createNotification({
    user: userId,
    type: 'payment_received',
    title: 'Payment Received',
    message: `You received ${amount} HIVE`,
    link: '/wallet',
  });
};

export const notifyWithdrawalProcessed = async (userId, amount, status) => {
  const title = status === 'completed' ? 'Withdrawal Completed' : 'Withdrawal Rejected';
  const message = status === 'completed' 
    ? `Your withdrawal of ${amount} HIVE has been processed`
    : `Your withdrawal request of ${amount} HIVE was rejected`;

  await createNotification({
    user: userId,
    type: status === 'completed' ? 'withdrawal_processed' : 'withdrawal_rejected',
    title,
    message,
    link: '/wallet/withdrawals',
  });
};

export const notifyMessageReceived = async (recipientId, senderId, senderName) => {
  await createNotification({
    user: recipientId,
    type: 'message_received',
    title: 'New Message',
    message: `${senderName} sent you a message`,
    link: '/messages',
    relatedUser: senderId,
  });
};

export const notifyReviewReceived = async (sellerId, buyerId, buyerName, gigId) => {
  await createNotification({
    user: sellerId,
    type: 'review_received',
    title: 'New Review',
    message: `${buyerName} left a review on your gig`,
    link: `/gigs/${gigId}`,
    relatedUser: buyerId,
    relatedGig: gigId,
  });
};
