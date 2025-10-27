import { useState } from 'react';
import { useQuery } from 'react-query';
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, AlertCircle, Video, Calendar } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';

export default function AdminPanel() {
  const { user, updateUser } = useAuthStore();
  const [period, setPeriod] = useState('7days');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  
  // Fetch fresh user data
  const { data: freshUser } = useQuery('currentUser', async () => {
    const res = await api.get('/auth/me');
    return res.data.user;
  }, {
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    onSuccess: (data) => {
      if (data) updateUser(data);
    }
  });

  const currentUser = freshUser || user;
  
  const hasPermission = (permission) => {
    if (currentUser?.role === 'admin') return true;
    return currentUser?.permissions?.[permission] || false;
  };

  const { data: statsData, isLoading } = useQuery(
    ['adminStats', period, customDates],
    async () => {
      let url = `/admin/stats?period=${period}`;
      if (period === 'custom' && customDates.start && customDates.end) {
        url = `/admin/stats?startDate=${customDates.start}&endDate=${customDates.end}`;
      }
      const res = await api.get(url);
      return res.data;
    }, 
    {
      enabled: hasPermission('viewAnalytics')
    }
  );

  const stats = statsData?.stats;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users?.total || 0,
      subtitle: `+${stats?.users?.newInPeriod || 0} in period`,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Gigs',
      value: stats?.gigs?.total || 0,
      subtitle: `${stats?.gigs?.active || 0} active, +${stats?.gigs?.newInPeriod || 0} new`,
      icon: Package,
      color: 'bg-green-500',
    },
    {
      title: 'Total Orders',
      value: stats?.orders?.total || 0,
      subtitle: `+${stats?.orders?.newInPeriod || 0} in period`,
      icon: ShoppingCart,
      color: 'bg-purple-500',
    },
    {
      title: 'Active Orders',
      value: stats?.orders?.active || 0,
      subtitle: 'In progress',
      icon: TrendingUp,
      color: 'bg-yellow-500',
    },
    {
      title: 'Completed Orders',
      value: stats?.orders?.completed || 0,
      subtitle: 'All time',
      icon: ShoppingCart,
      color: 'bg-emerald-500',
    },
    {
      title: 'Platform Earnings',
      value: `${(stats?.earnings?.total || 0).toFixed(3)} HIVE`,
      subtitle: `+${(stats?.earnings?.inPeriod || 0).toFixed(3)} in period`,
      icon: DollarSign,
      color: 'bg-indigo-500',
    },
    {
      title: 'Pending Withdrawals',
      value: stats?.withdrawals?.pending || 0,
      subtitle: 'Awaiting approval',
      icon: AlertCircle,
      color: 'bg-red-500',
    },
    {
      title: 'Cancelled Orders',
      value: stats?.orders?.cancelled || 0,
      subtitle: 'All time',
      icon: AlertCircle,
      color: 'bg-gray-500',
    },
    {
      title: 'Pending Orders',
      value: stats?.orders?.pending || 0,
      subtitle: 'Awaiting payment',
      icon: ShoppingCart,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Platform overview and statistics</p>
          </div>
          
          {/* Period Selector */}
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="24hours">Last 24 Hours</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="1year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range */}
        {period === 'custom' && (
          <div className="mt-4 flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={customDates.start}
                onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={customDates.end}
                onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {hasPermission('manageUsers') && (
              <a href="/admin/users" className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <h3 className="font-semibold text-blue-900">Manage Users</h3>
                <p className="text-sm text-blue-700">View, suspend, or manage user accounts</p>
              </a>
            )}
            {hasPermission('manageGigs') && (
              <a href="/admin/gigs" className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <h3 className="font-semibold text-green-900">Manage Gigs</h3>
                <p className="text-sm text-green-700">Review and moderate gig listings</p>
              </a>
            )}
            {hasPermission('manageWithdrawals') && (
              <a href="/admin/withdrawals" className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <h3 className="font-semibold text-purple-900">Process Withdrawals</h3>
                <p className="text-sm text-purple-700">
                  Approve or reject withdrawal requests ({stats?.withdrawals?.pending || 0} pending)
                </p>
              </a>
            )}
            {hasPermission('manageSupport') && (
              <a href="/admin/support" className="block p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors">
                <h3 className="font-semibold text-teal-900">Support Tickets</h3>
                <p className="text-sm text-teal-700">Manage and respond to user support tickets</p>
              </a>
            )}
            {hasPermission('viewAnalytics') && (
              <a href="/admin/analytics" className="block p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-5 h-5 text-orange-900" />
                  <h3 className="font-semibold text-orange-900">Team Analytics</h3>
                </div>
                <p className="text-sm text-orange-700">View team performance and withdrawal statistics</p>
              </a>
            )}
            {hasPermission('manageSettings') && (
              <a href="/admin/hero-settings" className="block p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Video className="w-5 h-5 text-pink-900" />
                  <h3 className="font-semibold text-pink-900">Hero Video Settings</h3>
                </div>
                <p className="text-sm text-pink-700">Manage home page hero video and content</p>
              </a>
            )}
            {user?.role === 'admin' && (
              <a href="/admin/team" className="block p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                <h3 className="font-semibold text-indigo-900">Team Management</h3>
                <p className="text-sm text-indigo-700">Add and manage team members (Admin only)</p>
              </a>
            )}
            {!hasPermission('manageUsers') && !hasPermission('manageGigs') && !hasPermission('manageWithdrawals') && !hasPermission('manageSupport') && user?.role !== 'admin' && (
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600">No quick actions available. Contact admin for permissions.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New user registered</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New gig published</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Order completed</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Withdrawal requested</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
