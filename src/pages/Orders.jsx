import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import { ShoppingBag, Package, Clock, CheckCircle, XCircle, Eye, CreditCard, AlertCircle } from 'lucide-react';

export default function Orders() {
  const [viewMode, setViewMode] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [quickFilter, setQuickFilter] = useState('all');
  const [rePaymentModal, setRePaymentModal] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const queryClient = useQueryClient();

  const { data: ordersData } = useQuery(['orders', viewMode, statusFilter], async () => {
    let url = '/orders?';
    if (viewMode !== 'all') url += `type=${viewMode}&`;
    if (statusFilter !== 'all') url += `status=${statusFilter}`;
    const res = await api.get(url);
    return res.data.orders;
  });

  const rePaymentMutation = useMutation(
    async ({ orderId, transactionId, memo }) => {
      const res = await api.patch(`/orders/${orderId}/payment`, {
        transactionId,
        memo
      });
      return res.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orders');
        setRePaymentModal(null);
        setTransactionId('');
        alert('Payment verified! Order is now active.');
      },
      onError: (error) => {
        alert(error.response?.data?.message || 'Failed to update payment');
      }
    }
  );

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-blue-100 text-blue-800',
      delivered: 'bg-purple-100 text-purple-800',
      in_revision: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      disputed: 'bg-orange-100 text-orange-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === 'cancelled') return <XCircle className="w-5 h-5 text-red-600" />;
    if (status === 'active') return <Clock className="w-5 h-5 text-blue-600" />;
    return <Package className="w-5 h-5 text-gray-600" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setViewMode('buying')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'buying' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Buying
            </button>
            <button
              onClick={() => setViewMode('selling')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'selling' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Selling
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">⏳ Pending</option>
            <option value="active">🔵 Active</option>
            <option value="delivered">📦 Delivered</option>
            <option value="in_revision">🔄 In Revision</option>
            <option value="completed">✅ Completed</option>
            <option value="cancelled">❌ Cancelled</option>
          </select>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 pb-4">
          <button
            onClick={() => setQuickFilter('all')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              quickFilter === 'all' 
                ? 'bg-white border-b-2 border-primary-600 text-primary-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setQuickFilter('pending')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              quickFilter === 'pending' 
                ? 'bg-white border-b-2 border-primary-600 text-primary-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ⏳ Pending
          </button>
          <button
            onClick={() => setQuickFilter('active')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              quickFilter === 'active' 
                ? 'bg-white border-b-2 border-primary-600 text-primary-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🔵 Active
          </button>
          <button
            onClick={() => setQuickFilter('delivered')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              quickFilter === 'delivered' 
                ? 'bg-white border-b-2 border-primary-600 text-primary-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📦 Delivered
          </button>
          <button
            onClick={() => setQuickFilter('in_revision')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              quickFilter === 'in_revision' 
                ? 'bg-white border-b-2 border-primary-600 text-primary-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🔄 In Revision
          </button>
          <button
            onClick={() => setQuickFilter('completed')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              quickFilter === 'completed' 
                ? 'bg-white border-b-2 border-primary-600 text-primary-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ✅ Completed
          </button>
          <button
            onClick={() => setQuickFilter('cancelled')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              quickFilter === 'cancelled' 
                ? 'bg-white border-b-2 border-primary-600 text-primary-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ❌ Cancelled
          </button>
        </div>

        {(() => {
          // Filter orders based on quick filter
          let filteredOrders = ordersData || [];
          if (quickFilter !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.status === quickFilter);
          }
          
          return !filteredOrders || filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No orders found</p>
            <p className="text-sm text-gray-500">
              {viewMode === 'buying' ? 'You haven\'t purchased any services yet' : 
               viewMode === 'selling' ? 'You haven\'t received any orders yet' : 
               'Start buying or selling to see your orders here'}
            </p>
            {viewMode !== 'selling' && (
              <Link to="/search" className="btn-primary mt-4 inline-block">
                Browse Services
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={order.gig?.images?.[0] || '/placeholder.jpg'}
                      alt={order.gig?.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div>
                      <Link to={`/orders/${order._id}`} className="text-lg font-semibold text-gray-900 hover:text-primary-600">
                        {order.gig?.title}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        {viewMode === 'buying' ? 'Seller: ' : 'Buyer: '}
                        <span className="font-medium">
                          {viewMode === 'buying' ? order.seller?.displayName : order.buyer?.displayName}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Package: <span className="font-medium capitalize">{order.packageType}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(order.status)}`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{order.totalAmount} HIVE</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">Order Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Delivery Time</p>
                    <p className="font-medium text-gray-900">
                      {order.packageDetails?.deliveryTime} days
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Due Date</p>
                    <p className="font-medium text-gray-900">
                      {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    {(order.status === 'pending' || order.status === 'pending_verification') && viewMode === 'buying' && (
                      <button 
                        onClick={() => setRePaymentModal(order)}
                        className="btn-primary flex items-center gap-2 text-sm"
                      >
                        <CreditCard className="w-4 h-4" />
                        Update Payment
                      </button>
                    )}
                    {order.status === 'active' && viewMode === 'selling' && (
                      <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                        Deliver Order
                      </button>
                    )}
                    {order.status === 'delivered' && viewMode === 'buying' && (
                      <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                        Accept Delivery
                      </button>
                    )}
                    {order.status === 'completed' && (
                      <span className="text-green-600 font-medium text-sm">
                        ✓ Order Completed
                      </span>
                    )}
                  </div>
                  
                  <Link to={`/orders/${order._id}`} className="btn-outline flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        );
        })()}
      </div>

      {/* Re-Payment Modal */}
      {rePaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Update Payment</h3>
                <p className="text-sm text-gray-600">Order #{rePaymentModal._id.slice(-8)}</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Important:</strong> Use the same memo as before
              </p>
              <div className="bg-white rounded p-2 font-mono text-sm break-all">
                {rePaymentModal.payment?.memo || 'VYLDO-' + rePaymentModal._id.slice(-12)}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Transaction ID *
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="input-field"
                  placeholder="Enter your transaction ID"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the correct transaction ID from Hive blockchain
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-900 mb-1">Payment Details:</p>
                <div className="space-y-1 text-gray-600">
                  <p>• Amount: <span className="font-semibold">{rePaymentModal.totalAmount} HIVE</span></p>
                  <p>• To: <span className="font-semibold">vyldo-escrow</span></p>
                  <p>• Memo: Use the one shown above</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setRePaymentModal(null);
                  setTransactionId('');
                }}
                className="btn-outline flex-1"
                disabled={rePaymentMutation.isLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!transactionId.trim()) {
                    alert('Please enter transaction ID');
                    return;
                  }
                  rePaymentMutation.mutate({
                    orderId: rePaymentModal._id,
                    transactionId: transactionId.trim(),
                    memo: rePaymentModal.payment?.memo || 'VYLDO-' + rePaymentModal._id.slice(-12)
                  });
                }}
                className="btn-primary flex-1"
                disabled={!transactionId.trim() || rePaymentMutation.isLoading}
              >
                {rePaymentMutation.isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </span>
                ) : (
                  'Verify Payment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
