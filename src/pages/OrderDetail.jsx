import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { 
  ArrowLeft, Package, Clock, CheckCircle, XCircle, 
  MessageCircle, Download, Upload, AlertCircle, Star, Copy, Check, CreditCard 
} from 'lucide-react';
import SellerLevelBadge from '../components/SellerLevelBadge';
import VerifiedBadge from '../components/VerifiedBadge';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [deliveryFiles, setDeliveryFiles] = useState([]);
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [showRePaymentModal, setShowRePaymentModal] = useState(false);
  const [newTransactionId, setNewTransactionId] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [revisionMessage, setRevisionMessage] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState(false);

  const { data: order, isLoading } = useQuery(['order', id], async () => {
    const res = await api.get(`/orders/${id}`);
    return res.data.order;
  });

  const deliverMutation = useMutation(
    async () => {
      const formData = new FormData();
      formData.append('message', deliveryMessage);
      
      // Add all files to FormData
      deliveryFiles.forEach(file => {
        formData.append('files', file);
      });
      
      return await api.post(`/orders/${id}/deliver`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['order', id]);
        setDeliveryFiles([]);
        setDeliveryMessage('');
        alert('Order delivered successfully!');
      },
      onError: (error) => {
        alert(error.response?.data?.message || 'Failed to deliver order');
      }
    }
  );

  const rePaymentMutation = useMutation(
    async ({ transactionId, memo }) => {
      const res = await api.patch(`/orders/${id}/payment`, {
        transactionId,
        memo
      });
      return res.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['order', id]);
        setShowRePaymentModal(false);
        setNewTransactionId('');
        alert('Payment verified! Order is now active.');
      },
      onError: (error) => {
        alert(error.response?.data?.message || 'Failed to update payment');
      }
    }
  );

  const acceptMutation = useMutation(
    async () => await api.patch(`/orders/${id}/accept`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['order', id]);
        alert('Order completed successfully! Payment released to seller.');
      },
      onError: (error) => {
        alert(error.response?.data?.message || 'Failed to accept delivery');
      }
    }
  );

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'account') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else if (type === 'memo') {
      setCopiedMemo(true);
      setTimeout(() => setCopiedMemo(false), 2000);
    }
  };

  const cancelMutation = useMutation(
    async () => await api.patch(`/orders/${id}/cancel`, { reason: cancelReason }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['order', id]);
        setShowCancelModal(false);
        setCancelReason('');
        alert('Order cancelled successfully');
      },
      onError: (error) => {
        alert(error.response?.data?.message || 'Failed to cancel order');
      }
    }
  );

  const revisionMutation = useMutation(
    async () => await api.post(`/orders/${id}/request-revision`, {
      message: revisionMessage
    }),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['order', id]);
        setShowRevisionModal(false);
        setRevisionMessage('');
        alert(`Revision requested! ${data.data.revisionsLeft} revision(s) remaining.`);
      },
      onError: (error) => {
        alert(error.response?.data?.message || 'Failed to request revision');
      }
    }
  );

  const reviewMutation = useMutation(
    async () => await api.post(`/reviews`, { 
      orderId: id, 
      rating, 
      comment: review 
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['order', id]);
        setRating(0);
        setReview('');
        alert('Review submitted successfully!');
      },
      onError: (error) => {
        alert(error.response?.data?.message || 'Failed to submit review');
      }
    }
  );

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="skeleton h-8 w-1/3"></div>
          <div className="skeleton h-64"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold">Order not found</h2>
        <Link to="/orders" className="btn-primary mt-4 inline-block">Back to Orders</Link>
      </div>
    );
  }

  // Debug: Log order data
  console.log('📦 Order Data:', order);
  console.log('💰 Package Details:', order.packageDetails);
  console.log('💵 Platform Fee:', order.platformFee);
  console.log('🔄 Revisions:', order.revisionsUsed, '/', order.packageDetails?.revisions);

  const isBuyer = user?._id === order.buyer?._id;
  const isSeller = user?._id === order.seller?._id;

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-blue-100 text-blue-800',
      delivered: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      disputed: 'bg-orange-100 text-orange-800',
      in_revision: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      active: Package,
      delivered: Upload,
      completed: CheckCircle,
      cancelled: XCircle,
      disputed: AlertCircle
    };
    const Icon = icons[status] || Package;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-5 h-5" />
          Back to Orders
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order #{order._id?.slice(-8)}</h1>
            <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2 ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gig Info */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Gig Details</h2>
            <Link to={`/gigs/${order.gig?._id}`} className="flex gap-4 hover:bg-gray-50 p-3 rounded-lg transition">
              <img
                src={order.gig?.images?.[0] || '/placeholder.jpg'}
                alt={order.gig?.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{order.gig?.title}</h3>
                <p className="text-sm text-gray-600 mb-2">Package: {order.package?.name}</p>
                <p className="text-gray-700">{order.package?.title}</p>
              </div>
            </Link>
          </div>

          {/* Requirements */}
          {order.requirements && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Requirements</h2>
              <p className="text-gray-700 whitespace-pre-line">{order.requirements}</p>
            </div>
          )}

          {/* Delivery */}
          {(order.status === 'delivered' || order.status === 'completed') && order.deliverables?.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Delivery
              </h2>
              {order.deliverables.map((delivery, idx) => (
                <div key={idx} className="mb-4 pb-4 border-b last:border-0">
                  <p className="text-sm text-gray-500 mb-2">
                    Delivered on {new Date(delivery.submittedAt).toLocaleString()}
                  </p>
                  <p className="text-gray-700 mb-4 whitespace-pre-line">{delivery.message}</p>
                  {delivery.files?.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-semibold text-sm">Attached Files ({delivery.files.length}):</p>
                      {delivery.files.map((file, fileIdx) => {
                        // Calculate global file index
                        let globalIndex = 0;
                        for (let i = 0; i < idx; i++) {
                          globalIndex += order.deliverables[i].files?.length || 0;
                        }
                        globalIndex += fileIdx;
                        
                        const handleDownload = async (e) => {
                          e.preventDefault();
                          try {
                            const response = await api.get(`/orders/${id}/download/${globalIndex}`, {
                              responseType: 'blob'
                            });
                            
                            // Create download link
                            const url = window.URL.createObjectURL(new Blob([response.data]));
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', file.filename || `file-${fileIdx + 1}`);
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                            window.URL.revokeObjectURL(url);
                          } catch (error) {
                            console.error('Download error:', error);
                            alert('Failed to download file');
                          }
                        };
                        
                        return (
                          <button
                            key={fileIdx}
                            onClick={handleDownload}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition w-full text-left"
                          >
                            <Download className="w-4 h-4 text-primary-600" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{file.filename || `File ${fileIdx + 1}`}</p>
                              {file.size && (
                                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Buyer Actions for Delivered Order */}
              {isBuyer && order.status === 'delivered' && (
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => {
                      if (window.confirm('Accept this delivery? This will complete the order and release payment to the seller.')) {
                        acceptMutation.mutate();
                      }
                    }}
                    className="btn-primary w-full"
                    disabled={acceptMutation.isLoading}
                  >
                    {acceptMutation.isLoading ? 'Processing...' : 'Accept Delivery'}
                  </button>
                  
                  {/* Request Revision Button */}
                  {(() => {
                    const maxRevisions = order.packageDetails?.revisions || order.package?.revisions || 0;
                    const usedRevisions = order.revisionsUsed || 0;
                    const remainingRevisions = maxRevisions - usedRevisions;
                    
                    if (remainingRevisions > 0) {
                      return (
                        <button
                          onClick={() => setShowRevisionModal(true)}
                          className="btn-outline w-full"
                        >
                          Request Revision ({remainingRevisions} left)
                        </button>
                      );
                    } else if (maxRevisions > 0) {
                      return (
                        <p className="text-sm text-gray-500 text-center">No revisions remaining</p>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Deliver Order (Seller) */}
          {isSeller && (order.status === 'active' || order.status === 'in_revision') && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">
                {order.status === 'in_revision' ? 'Submit Revision' : 'Deliver Order'}
              </h2>
              {order.status === 'in_revision' && order.revisionRequests?.length > 0 && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm font-semibold text-orange-800 mb-1">Revision Requested:</p>
                  <p className="text-sm text-orange-700">{order.revisionRequests[order.revisionRequests.length - 1].message}</p>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Message</label>
                  <textarea
                    rows={4}
                    value={deliveryMessage}
                    onChange={(e) => setDeliveryMessage(e.target.value)}
                    className="input-field"
                    placeholder="Describe what you've delivered..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attach Files (Max 10 files, 2GB each)</label>
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.zip,.rar,.7z,.psd,.ai,.mp4,.mov"
                    onChange={(e) => setDeliveryFiles(Array.from(e.target.files))}
                    className="input-field"
                  />
                  {deliveryFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-semibold text-gray-700">{deliveryFiles.length} file(s) selected:</p>
                      {deliveryFiles.map((file, idx) => (
                        <p key={idx} className="text-xs text-gray-600">
                          • {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deliverMutation.mutate()}
                  disabled={!deliveryMessage || deliverMutation.isLoading}
                  className="btn-primary w-full"
                >
                  {deliverMutation.isLoading ? 'Delivering...' : 'Deliver Order'}
                </button>
              </div>
            </div>
          )}

          {/* Review (Buyer) */}
          {isBuyer && order.status === 'completed' && !order.review && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Leave a Review</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                  <textarea
                    rows={4}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="input-field"
                    placeholder="Share your experience..."
                  />
                </div>
                <button
                  onClick={() => reviewMutation.mutate()}
                  disabled={!rating || !review || reviewMutation.isLoading}
                  className="btn-primary w-full"
                >
                  {reviewMutation.isLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Package Price</span>
                <span className="font-semibold">{order.packageDetails?.price || order.package?.price || 0} HIVE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee</span>
                <span className="font-semibold">{order.platformFee?.toFixed(3) || '0.000'} HIVE</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-bold text-lg">{order.totalAmount || 0} HIVE</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Time</span>
                <span>{order.packageDetails?.deliveryTime || order.package?.deliveryTime || 0} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Revisions</span>
                <span>{order.revisionsUsed || 0} / {order.packageDetails?.revisions || order.package?.revisions || 0}</span>
              </div>
            </div>
          </div>

          {/* Buyer/Seller Info */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">{isBuyer ? 'Seller' : 'Buyer'}</h2>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={isBuyer ? order.seller?.avatar : order.buyer?.avatar}
                alt="User"
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{isBuyer ? order.seller?.displayName : order.buyer?.displayName}</p>
                  {isBuyer && (
                    <>
                      <SellerLevelBadge level={order.seller?.sellerLevel} size="sm" showNewSeller={true} />
                      <VerifiedBadge 
                        isVerified={order.seller?.isVerified} 
                        verifiedText={order.seller?.verifiedText}
                        badgeType={order.seller?.verifiedBadgeType}
                        customImage={order.seller?.verifiedBadgeImage}
                        size="sm" 
                      />
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600">@{isBuyer ? order.seller?.username : order.buyer?.username}</p>
                
                {/* Seller Stats (only show for buyer viewing seller) */}
                {isBuyer && order.seller && (
                  <div className="mt-2 space-y-1">
                    {order.seller.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{order.seller.rating.average?.toFixed(1) || '0.0'}</span>
                        <span className="text-gray-500">({order.seller.rating.count || 0} reviews)</span>
                      </div>
                    )}
                    {order.seller.totalOrders !== undefined && (
                      <p className="text-sm text-gray-600">
                        💼 {order.seller.totalOrders} orders completed
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <Link
              to={`/messages?user=${isBuyer ? order.seller?._id : order.buyer?._id}`}
              className="btn-outline w-full flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Send Message
            </Link>
          </div>

          {/* Actions */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Actions</h2>
            <div className="space-y-2">
              {isBuyer && order.status === 'delivered' && (
                <button
                  onClick={() => {
                    if (window.confirm('Accept this delivery? This will complete the order and release payment to the seller.')) {
                      acceptMutation.mutate();
                    }
                  }}
                  disabled={acceptMutation.isLoading}
                  className="btn-primary w-full"
                >
                  {acceptMutation.isLoading ? 'Processing...' : 'Accept & Complete'}
                </button>
              )}
              {(order.status === 'pending' || order.status === 'active') && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="btn-secondary w-full"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Revision Request Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Request Revision</h3>
            <p className="text-gray-600 mb-4">
              You have {(order.packageDetails?.revisions || order.package?.revisions || 0) - (order.revisionsUsed || 0)} revision(s) remaining.
            </p>
            <textarea
              rows={4}
              value={revisionMessage}
              onChange={(e) => setRevisionMessage(e.target.value)}
              className="input-field mb-4"
              placeholder="Describe what changes you need..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRevisionModal(false);
                  setRevisionMessage('');
                }}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => revisionMutation.mutate()}
                disabled={!revisionMessage.trim() || revisionMutation.isLoading}
                className="btn-primary flex-1"
              >
                {revisionMutation.isLoading ? 'Requesting...' : 'Request Revision'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Cancel Order</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to cancel this order? This action cannot be undone.</p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="input-field mb-4"
              placeholder="Reason for cancellation (optional)"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="btn-outline flex-1"
              >
                Keep Order
              </button>
              <button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isLoading}
                className="btn-secondary flex-1"
              >
                {cancelMutation.isLoading ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
