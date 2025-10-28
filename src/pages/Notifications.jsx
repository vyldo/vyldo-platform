import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';

export default function Notifications() {
  const [filter, setFilter] = useState('all'); // all, unread, read
  const queryClient = useQueryClient();

  const { data: notificationsData, isLoading, error } = useQuery(
    'notifications', 
    async () => {
      const res = await api.get('/notifications');
      return res.data.notifications || [];
    },
    {
      retry: 1,
      onError: (err) => {
        console.error('Failed to fetch notifications:', err);
      }
    }
  );

  const markAsReadMutation = useMutation(
    async (id) => await api.patch(`/notifications/${id}/read`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
      }
    }
  );

  const markAllAsReadMutation = useMutation(
    async () => await api.patch('/notifications/read-all'),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
      }
    }
  );

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification._id);
    }
  };

  const filteredNotifications = notificationsData?.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
    return true;
  }) || [];

  const unreadCount = notificationsData?.filter(n => !n.isRead).length || 0;

  const getNotificationIcon = (type) => {
    const icons = {
      order_placed: '🛒',
      order_delivered: '📦',
      order_completed: '✅',
      order_cancelled: '❌',
      message_received: '💬',
      review_received: '⭐',
      withdrawal_processed: '💰',
      withdrawal_rejected: '🚫',
      payment_received: '💵',
      system_announcement: '📢',
    };
    return icons[type] || '🔔';
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <Bell className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 mb-2">Failed to Load Notifications</h2>
          <p className="text-red-700 mb-4">Please try refreshing the page</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="w-8 h-8" />
            Notifications
          </h1>
          <p className="text-gray-600 mt-2">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          All ({notificationsData?.length || 0})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            filter === 'unread'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            filter === 'read'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Read ({(notificationsData?.length || 0) - unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No notifications to show</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <Link
              key={notification._id}
              to={notification.link || '#'}
              onClick={() => handleNotificationClick(notification)}
              className={`block p-4 rounded-lg border transition-all hover:shadow-md ${
                notification.isRead
                  ? 'bg-white border-gray-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1"></span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-2">{notification.message}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{new Date(notification.createdAt).toLocaleString()}</span>
                    {notification.relatedUser && (
                      <span className="flex items-center gap-1">
                        <img
                          src={notification.relatedUser.avatar || '/avatar.jpg'}
                          alt={notification.relatedUser.displayName}
                          className="w-5 h-5 rounded-full"
                        />
                        {notification.relatedUser.displayName}
                      </span>
                    )}
                  </div>
                </div>
                {notification.link && (
                  <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
