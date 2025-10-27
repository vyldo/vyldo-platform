import { useState } from 'react';
import { useQuery } from 'react-query';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';
import { DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function Withdrawals() {
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    hiveAccount: user?.hiveAccount || '',
    memo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { data: withdrawals, refetch } = useQuery('withdrawals', async () => {
    const res = await api.get('/withdrawals');
    return res.data.withdrawals;
  });

  const { data: wallet } = useQuery('wallet', async () => {
    const res = await api.get('/wallet');
    return res.data.wallet;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/withdrawals', formData);
      setShowModal(false);
      setFormData({ amount: '', hiveAccount: user?.hiveAccount || '', memo: '' });
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'in_progress':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Withdrawals</h1>
          <p className="text-gray-600 mt-2">Request and track your HIVE withdrawals</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <DollarSign className="w-5 h-5 inline mr-2" />
          Request Withdrawal
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
          <p className="text-primary-100 text-sm mb-1">Available Balance</p>
          <p className="text-3xl font-bold">
            {wallet?.balance?.available?.toFixed(3) || '0.000'} <span className="text-lg text-primary-200">HIVE</span>
          </p>
          <p className="text-primary-200 text-xs mt-2">Ready to withdraw</p>
        </div>
        
        <div className="card">
          <p className="text-gray-600 text-sm mb-1">Pending Withdrawals</p>
          <p className="text-3xl font-bold text-yellow-600">
            {withdrawals?.filter(w => w.status === 'pending' || w.status === 'in_progress').reduce((sum, w) => sum + w.amount, 0).toFixed(3) || '0.000'} <span className="text-lg text-gray-600">HIVE</span>
          </p>
          <p className="text-gray-500 text-xs mt-2">Being processed</p>
        </div>
        
        <div className="card">
          <p className="text-gray-600 text-sm mb-1">Total Withdrawn</p>
          <p className="text-3xl font-bold text-green-600">
            {withdrawals?.filter(w => w.status === 'completed').reduce((sum, w) => sum + w.amount, 0).toFixed(3) || '0.000'} <span className="text-lg text-gray-600">HIVE</span>
          </p>
          <p className="text-gray-500 text-xs mt-2">All time</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-6">Withdrawal History</h2>
        
        {!withdrawals || withdrawals.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No withdrawal requests yet</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              Request Your First Withdrawal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {withdrawals.map((withdrawal) => (
              <div key={withdrawal._id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(withdrawal.status)}
                    <div>
                      <p className="font-bold text-2xl text-gray-900">
                        {withdrawal.amount.toFixed(3)} HIVE
                      </p>
                      <p className="text-sm text-gray-600">
                        Requested on {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(withdrawal.status)}`}>
                    {withdrawal.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Hive Account</p>
                    <p className="font-semibold text-gray-900">@{withdrawal.hiveAccount}</p>
                  </div>
                  {withdrawal.memo && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Memo</p>
                      <p className="font-semibold text-gray-900">{withdrawal.memo}</p>
                    </div>
                  )}
                </div>

                {withdrawal.status === 'completed' && withdrawal.hiveTransaction && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-green-900 mb-2">Transaction Details</p>
                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-green-700">TX ID:</span>
                        <span className="ml-2 font-mono text-green-900">{withdrawal.hiveTransaction.txId}</span>
                      </div>
                      <div>
                        <span className="text-green-700">Processed:</span>
                        <span className="ml-2 text-green-900">
                          {new Date(withdrawal.processedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {withdrawal.status === 'rejected' && withdrawal.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-red-900 mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-700">{withdrawal.rejectionReason}</p>
                  </div>
                )}

                {withdrawal.notes && withdrawal.notes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 mb-2">Team Notes</p>
                    <div className="space-y-2">
                      {withdrawal.notes.map((note, index) => (
                        <div key={index} className="text-sm bg-gray-50 p-3 rounded">
                          <p className="text-gray-700">{note.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(note.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-4">Request Withdrawal</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="mb-6 p-4 bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-lg">
              <p className="text-sm text-primary-900 mb-1">
                <strong>Available Balance:</strong>
              </p>
              <p className="text-2xl font-bold text-primary-700">
                {wallet?.balance?.available?.toFixed(3) || '0.000'} HIVE
              </p>
              <p className="text-xs text-primary-600 mt-1">Ready to withdraw</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (HIVE) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.001"
                  max={wallet?.balance?.available || 0}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input-field"
                  placeholder="0.000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: {wallet?.balance?.available?.toFixed(3) || '0.000'} HIVE
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hive Account *
                </label>
                <input
                  type="text"
                  required
                  value={formData.hiveAccount}
                  onChange={(e) => setFormData({ ...formData, hiveAccount: e.target.value })}
                  className="input-field"
                  placeholder="your-hive-username"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your Hive username without @
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Memo (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.memo}
                  onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                  className="input-field"
                  placeholder="Add a memo for your transaction..."
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900">
                  <strong>Note:</strong> Your withdrawal request will be reviewed by our payment team. 
                  Once approved, HIVE will be sent to your account within 24-48 hours.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
