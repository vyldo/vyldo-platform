import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { CheckCircle, XCircle, Eye, Clock, User, FileText, RefreshCw, Lock } from 'lucide-react';
import PermissionGuard from '../../components/PermissionGuard';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';

export default function WithdrawalManagement() {
  return (
    <PermissionGuard permission="manageWithdrawals">
      <WithdrawalManagementContent />
    </PermissionGuard>
  );
}

function WithdrawalManagementContent() {
  const { user } = useAuthStore();
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [txId, setTxId] = useState('');
  const [blockNum, setBlockNum] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [note, setNote] = useState('');
  const [viewingUser, setViewingUser] = useState(null);
  const [viewingDetails, setViewingDetails] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [showOnlyMine, setShowOnlyMine] = useState(user?.role === 'team'); // Team members see only their tasks by default
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data: withdrawals, isLoading, refetch } = useQuery(
    ['withdrawals', statusFilter], 
    async () => {
      const res = await api.get(`/admin/withdrawals?status=${statusFilter}`);
      return res.data.withdrawals;
    },
    {
      refetchInterval: 30000, // Auto-refresh every 30 seconds
      refetchOnWindowFocus: true, // Refresh when window gets focus
    }
  );

  // Filter withdrawals based on assignment
  const filteredWithdrawals = withdrawals?.filter(withdrawal => {
    // Admin can see all if showOnlyMine is false
    if (user?.role === 'admin' && !showOnlyMine) {
      return true;
    }
    
    // Show only assigned to current user
    if (user?.role === 'team' || showOnlyMine) {
      return withdrawal.assignedTo?._id === user?._id || withdrawal.assignedTo === user?._id;
    }
    
    return true;
  }) || [];

  const processMutation = useMutation(
    async (data) => await api.patch(`/admin/withdrawals/${data.id}/process`, data.payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('withdrawals');
        setSelectedWithdrawal(null);
        setActionType('');
        setTxId('');
        setBlockNum('');
        setRejectionReason('');
        setNote('');
        alert('Withdrawal processed successfully!');
      },
      onError: (error) => {
        alert(error.response?.data?.message || 'Failed to process withdrawal');
      }
    }
  );

  const handleAction = (withdrawal, type) => {
    setSelectedWithdrawal(withdrawal);
    setActionType(type);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (actionType === 'approve') {
      if (!txId.trim()) {
        alert('Please enter transaction ID');
        return;
      }
      processMutation.mutate({
        id: selectedWithdrawal._id,
        payload: {
          status: 'completed',
          txId: txId.trim(),
          blockNum: blockNum.trim() || undefined,
          note: note.trim() || undefined
        }
      });
    } else if (actionType === 'reject') {
      if (!rejectionReason.trim()) {
        alert('Please provide rejection reason');
        return;
      }
      processMutation.mutate({
        id: selectedWithdrawal._id,
        payload: {
          status: 'rejected',
          rejectionReason: rejectionReason.trim(),
          note: note.trim() || undefined
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Withdrawal Management</h1>
          <p className="text-gray-600 mt-2">
            {user?.role === 'team' 
              ? `Showing withdrawals assigned to you (${filteredWithdrawals.length})`
              : `Review and process withdrawal requests (${filteredWithdrawals.length})`
            }
          </p>
        </div>
        <div className="flex gap-3">
          {/* Reload Button */}
          <button
            onClick={async () => {
              setIsRefreshing(true);
              await refetch();
              setTimeout(() => setIsRefreshing(false), 500);
            }}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Reload tasks"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Loading...' : 'Reload'}
          </button>
          
          {/* Show Only Mine Toggle (Admin only) */}
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowOnlyMine(!showOnlyMine)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showOnlyMine
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <User className="w-4 h-4" />
              {showOnlyMine ? 'My Tasks' : 'All Tasks'}
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            statusFilter === 'pending'
              ? 'border-yellow-600 text-yellow-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          ⏳ Pending
        </button>
        <button
          onClick={() => setStatusFilter('completed')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            statusFilter === 'completed'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          ✅ Completed
        </button>
        <button
          onClick={() => setStatusFilter('rejected')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            statusFilter === 'rejected'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          ❌ Rejected
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hive Account</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              {statusFilter !== 'pending' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Processed By</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredWithdrawals?.map((withdrawal) => (
              <tr key={withdrawal._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={withdrawal.user?.avatar || '/avatar.jpg'}
                      alt={withdrawal.user?.displayName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{withdrawal.user?.displayName}</div>
                      <div className="text-sm text-gray-500">{withdrawal.user?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{withdrawal.amount} HIVE</div>
                  <div className="text-sm text-gray-500">Fee: {withdrawal.fee} HIVE</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">@{withdrawal.hiveAccount}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(withdrawal.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      withdrawal.status === 'completed' ? 'bg-green-100 text-green-800' :
                      withdrawal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {withdrawal.status}
                    </span>
                    {/* Show lock indicator if locked by someone */}
                    {withdrawal.lockedBy && withdrawal.lockExpiry && new Date(withdrawal.lockExpiry) > new Date() && (
                      <div className="flex items-center gap-1 text-xs text-orange-600" title={`Locked by ${withdrawal.lockedBy?.displayName || 'someone'}`}>
                        <Lock className="w-3 h-3" />
                        {withdrawal.lockedBy?._id === user?._id ? 'You' : withdrawal.lockedBy?.displayName}
                      </div>
                    )}
                  </div>
                </td>
                {statusFilter !== 'pending' && (
                  <td className="px-6 py-4">
                    {withdrawal.processedBy ? (
                      <div>
                        <div className="font-medium text-sm">{withdrawal.processedBy.displayName}</div>
                        <div className="text-xs text-gray-500">@{withdrawal.processedBy.username}</div>
                        {withdrawal.processedAt && (
                          <div className="text-xs text-gray-400">
                            {new Date(withdrawal.processedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewingDetails(withdrawal)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                      title="View Full Details"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewingUser(withdrawal.user)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="View User Profile"
                    >
                      <User className="w-4 h-4" />
                    </button>
                    {withdrawal.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(withdrawal, 'approve')}
                          className="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(withdrawal, 'reject')}
                          className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                    {withdrawal.status === 'completed' && withdrawal.hiveTransaction?.txId && (
                      <span className="text-xs text-green-600 font-medium">
                        TX: {withdrawal.hiveTransaction.txId.substring(0, 8)}...
                      </span>
                    )}
                    {withdrawal.status === 'rejected' && withdrawal.rejectionReason && (
                      <span className="text-xs text-red-600" title={withdrawal.rejectionReason}>
                        Reason: {withdrawal.rejectionReason.substring(0, 20)}...
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {withdrawals?.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No pending withdrawals</p>
          </div>
        )}
      </div>

      {/* Process Modal */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {actionType === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}
            </h2>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">User:</span>
                <span className="font-medium">{selectedWithdrawal.user?.displayName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-sm">{selectedWithdrawal.user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-lg text-green-600">{selectedWithdrawal.amount} HIVE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fee:</span>
                <span className="font-medium">{selectedWithdrawal.fee || 0} HIVE</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Hive Account:</span>
                  <span className="font-bold text-blue-600">@{selectedWithdrawal.hiveAccount}</span>
                </div>
                {selectedWithdrawal.memo && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Memo:</span>
                    <span className="font-medium text-sm">{selectedWithdrawal.memo}</span>
                  </div>
                )}
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Requested:</span>
                  <span className="text-sm">{new Date(selectedWithdrawal.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 font-medium mb-1">
                💡 Payment Instructions:
              </p>
              <p className="text-xs text-blue-700">
                Send {selectedWithdrawal.amount} HIVE to @{selectedWithdrawal.hiveAccount}
                {selectedWithdrawal.memo && ` with memo: "${selectedWithdrawal.memo}"`}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {actionType === 'approve' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={txId}
                      onChange={(e) => setTxId(e.target.value)}
                      placeholder="Enter Hive transaction ID"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Block Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={blockNum}
                      onChange={(e) => setBlockNum(e.target.value)}
                      placeholder="Enter block number"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason *
                  </label>
                  <textarea
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows="4"
                    placeholder="Enter reason for rejection..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows="3"
                  placeholder="Add any additional notes..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={processMutation.isLoading}
                  className={`flex-1 text-white py-3 rounded-lg disabled:opacity-50 ${
                    actionType === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionType === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedWithdrawal(null);
                    setActionType('');
                    setTxId('');
                    setBlockNum('');
                    setRejectionReason('');
                    setNote('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">User Details</h2>
              <button
                onClick={() => setViewingUser(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={viewingUser.avatar || '/avatar.jpg'}
                  alt={viewingUser.displayName}
                  className="w-20 h-20 rounded-full"
                />
                <div>
                  <h3 className="text-xl font-bold">{viewingUser.displayName}</h3>
                  <p className="text-gray-600">@{viewingUser.username}</p>
                  <p className="text-sm text-gray-500">{viewingUser.email}</p>
                </div>
              </div>

              {/* Account Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Role</p>
                  <p className="font-bold capitalize">{viewingUser.role}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                  <p className="font-bold">{viewingUser.totalOrders || 0}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Rating</p>
                  <p className="font-bold">{viewingUser.rating?.average?.toFixed(1) || '0.0'} ⭐</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Member Since</p>
                  <p className="font-bold text-sm">{new Date(viewingUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Hive Account */}
              {viewingUser.hiveAccount && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900 font-medium mb-1">Hive Account</p>
                  <p className="font-bold text-blue-700">@{viewingUser.hiveAccount}</p>
                </div>
              )}

              {/* Status */}
              <div className="flex gap-4">
                <div className="flex-1 p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Account Status</p>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    viewingUser.isSuspended 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {viewingUser.isSuspended ? 'Suspended' : 'Active'}
                  </span>
                </div>
                <div className="flex-1 p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Profile Completion</p>
                  <p className="font-bold">{viewingUser.profileCompletion || 0}%</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <a
                  href={`/profile/${viewingUser.username}`}
                  target="_blank"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-center"
                >
                  View Full Profile
                </a>
                <button
                  onClick={() => setViewingUser(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Details Modal */}
      {viewingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Withdrawal Details</h2>
              <button
                onClick={() => setViewingDetails(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Withdrawal Status Banner */}
              <div className={`p-4 rounded-lg border-2 ${
                viewingDetails.status === 'completed' ? 'bg-green-50 border-green-200' :
                viewingDetails.status === 'rejected' ? 'bg-red-50 border-red-200' :
                viewingDetails.status === 'in_progress' ? 'bg-blue-50 border-blue-200' :
                'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-1">
                      Status: <span className="uppercase">{viewingDetails.status}</span>
                    </h3>
                    <p className="text-sm text-gray-600">
                      Requested on {new Date(viewingDetails.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-900">{viewingDetails.amount} HIVE</p>
                    <p className="text-sm text-gray-600">Fee: {viewingDetails.fee || 0} HIVE</p>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  User Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={viewingDetails.user?.avatar || '/avatar.jpg'}
                      alt={viewingDetails.user?.displayName}
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <p className="font-bold text-lg">{viewingDetails.user?.displayName}</p>
                      <p className="text-gray-600">@{viewingDetails.user?.username}</p>
                      <p className="text-sm text-gray-500">{viewingDetails.user?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded border">
                      <p className="text-xs text-gray-600 mb-1">Role</p>
                      <p className="font-bold capitalize">{viewingDetails.user?.role}</p>
                    </div>
                    <div className="p-3 bg-white rounded border">
                      <p className="text-xs text-gray-600 mb-1">Total Orders</p>
                      <p className="font-bold">{viewingDetails.user?.totalOrders || 0}</p>
                    </div>
                    <div className="p-3 bg-white rounded border">
                      <p className="text-xs text-gray-600 mb-1">Rating</p>
                      <p className="font-bold">{viewingDetails.user?.rating?.average?.toFixed(1) || '0.0'} ⭐</p>
                    </div>
                    <div className="p-3 bg-white rounded border">
                      <p className="text-xs text-gray-600 mb-1">Member Since</p>
                      <p className="font-bold text-xs">{new Date(viewingDetails.user?.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded border">
                    <p className="text-xs text-gray-600 mb-1">Account Status</p>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      viewingDetails.user?.isSuspended 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {viewingDetails.user?.isSuspended ? '🚫 Suspended' : '✅ Active'}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <p className="text-xs text-gray-600 mb-1">Profile Completion</p>
                    <p className="font-bold">{viewingDetails.user?.profileCompletion || 0}%</p>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="text-lg font-bold mb-4 text-blue-900">💰 Transaction Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600 mb-1">Hive Account</p>
                    <p className="font-bold text-blue-700">@{viewingDetails.hiveAccount}</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600 mb-1">Amount Requested</p>
                    <p className="font-bold text-green-700">{viewingDetails.amount} HIVE</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600 mb-1">Platform Fee</p>
                    <p className="font-bold text-red-700">{viewingDetails.fee || 0} HIVE</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600 mb-1">Net Amount</p>
                    <p className="font-bold text-green-700">{(viewingDetails.amount - (viewingDetails.fee || 0)).toFixed(3)} HIVE</p>
                  </div>
                </div>
                {viewingDetails.memo && (
                  <div className="mt-3 bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600 mb-1">Memo</p>
                    <p className="font-medium">{viewingDetails.memo}</p>
                  </div>
                )}
                {viewingDetails.ipAddress && (
                  <div className="mt-3 bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600 mb-1">IP Address</p>
                    <p className="font-mono text-sm">{viewingDetails.ipAddress}</p>
                  </div>
                )}
              </div>

              {/* Processing Information */}
              {(viewingDetails.status === 'completed' || viewingDetails.status === 'rejected') && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="text-lg font-bold mb-4">📋 Processing Information</h3>
                  <div className="space-y-3">
                    {viewingDetails.processedBy && (
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm text-gray-600 mb-2">Processed By</p>
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-bold">{viewingDetails.processedBy.displayName}</p>
                            <p className="text-sm text-gray-600">@{viewingDetails.processedBy.username}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {viewingDetails.processedAt && (
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm text-gray-600 mb-1">Processed At</p>
                        <p className="font-medium">{new Date(viewingDetails.processedAt).toLocaleString()}</p>
                      </div>
                    )}
                    {viewingDetails.assignedTo && (
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm text-gray-600 mb-2">Assigned To</p>
                        <div>
                          <p className="font-bold">{viewingDetails.assignedTo.displayName}</p>
                          <p className="text-sm text-gray-600">@{viewingDetails.assignedTo.username}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Hive Transaction Details */}
              {viewingDetails.status === 'completed' && viewingDetails.hiveTransaction && (
                <div className="border rounded-lg p-4 bg-green-50">
                  <h3 className="text-lg font-bold mb-4 text-green-900">✅ Hive Blockchain Transaction</h3>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                      <p className="font-mono text-sm font-bold break-all">{viewingDetails.hiveTransaction.txId}</p>
                    </div>
                    {viewingDetails.hiveTransaction.blockNum && (
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm text-gray-600 mb-1">Block Number</p>
                        <p className="font-mono font-bold">{viewingDetails.hiveTransaction.blockNum}</p>
                      </div>
                    )}
                    {viewingDetails.hiveTransaction.timestamp && (
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm text-gray-600 mb-1">Transaction Timestamp</p>
                        <p className="font-medium">{new Date(viewingDetails.hiveTransaction.timestamp).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rejection Information */}
              {viewingDetails.status === 'rejected' && viewingDetails.rejectionReason && (
                <div className="border rounded-lg p-4 bg-red-50">
                  <h3 className="text-lg font-bold mb-3 text-red-900">❌ Rejection Details</h3>
                  <div className="bg-white p-4 rounded border">
                    <p className="text-sm text-gray-600 mb-2">Rejection Reason</p>
                    <p className="font-medium text-red-800">{viewingDetails.rejectionReason}</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {viewingDetails.notes && viewingDetails.notes.length > 0 && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="text-lg font-bold mb-4">📝 Notes & Comments</h3>
                  <div className="space-y-3">
                    {viewingDetails.notes.map((note, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-sm">{note.author?.displayName || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">@{note.author?.username || 'unknown'}</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(note.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm">{note.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <a
                  href={`/profile/${viewingDetails.user?.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 text-center font-medium"
                >
                  View User Profile
                </a>
                <button
                  onClick={() => setViewingDetails(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
