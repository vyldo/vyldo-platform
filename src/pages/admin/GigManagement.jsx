import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Search, Ban, CheckCircle, Trash2, Eye } from 'lucide-react';
import PermissionGuard from '../../components/PermissionGuard';
import api from '../../lib/axios';

export default function GigManagement() {
  return (
    <PermissionGuard permission="manageGigs">
      <GigManagementContent />
    </PermissionGuard>
  );
}

function GigManagementContent() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedGig, setSelectedGig] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [actionType, setActionType] = useState(''); // 'suspend' or 'delete'
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(['gigs', page, search], async () => {
    const res = await api.get(`/admin/gigs?page=${page}&limit=20&search=${search}`);
    return res.data;
  });

  const suspendMutation = useMutation(
    async ({ id, reason }) => await api.patch(`/admin/gigs/${id}/suspend`, { reason }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('gigs');
        setSelectedGig(null);
        setSuspendReason('');
        alert('Gig suspended successfully!');
      }
    }
  );

  const unsuspendMutation = useMutation(
    async (id) => await api.patch(`/admin/gigs/${id}/unsuspend`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('gigs');
        alert('Gig unsuspended successfully!');
      }
    }
  );

  const deleteMutation = useMutation(
    async (id) => await api.delete(`/admin/gigs/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('gigs');
        setSelectedGig(null);
        alert('Gig deleted successfully!');
      }
    }
  );

  const handleAction = (gig, type) => {
    setSelectedGig(gig);
    setActionType(type);
  };

  const confirmAction = () => {
    if (actionType === 'suspend') {
      if (!suspendReason.trim()) {
        alert('Please provide a reason for suspension');
        return;
      }
      suspendMutation.mutate({ id: selectedGig._id, reason: suspendReason });
    } else if (actionType === 'delete') {
      deleteMutation.mutate(selectedGig._id);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gig Management</h1>
        <p className="text-gray-600 mt-2">View and manage all gigs on the platform</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search gigs by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.gigs?.map((gig) => (
          <div key={gig._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={gig.images?.[0] || '/placeholder.jpg'}
              alt={gig.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={gig.seller?.avatar || '/avatar.jpg'}
                  alt={gig.seller?.displayName}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm text-gray-600">{gig.seller?.displayName}</span>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{gig.title}</h3>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-gray-900">
                  {gig.packages?.basic?.price} HIVE
                </span>
                <span className={`px-2 py-1 text-xs rounded ${
                  gig.isPaused ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {gig.isPaused ? 'Suspended' : 'Active'}
                </span>
              </div>

              <div className="flex gap-2">
                <a
                  href={`/gigs/${gig._id}`}
                  target="_blank"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                >
                  <Eye className="w-4 h-4" />
                  View
                </a>
                
                {gig.isPaused ? (
                  <button
                    onClick={() => unsuspendMutation.mutate(gig._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Unsuspend
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction(gig, 'suspend')}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100"
                  >
                    <Ban className="w-4 h-4" />
                    Suspend
                  </button>
                )}
                
                <button
                  onClick={() => handleAction(gig, 'delete')}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data?.gigs?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No gigs found</p>
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {data.pagination.pages}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= data.pagination.pages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Action Modal */}
      {selectedGig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {actionType === 'suspend' ? 'Suspend Gig' : 'Delete Gig'}
            </h2>
            <p className="text-gray-600 mb-4">
              {actionType === 'suspend' 
                ? `You are about to suspend "${selectedGig.title}"`
                : `Are you sure you want to permanently delete "${selectedGig.title}"? This action cannot be undone.`
              }
            </p>
            
            {actionType === 'suspend' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter reason for suspension..."
                />
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={confirmAction}
                disabled={suspendMutation.isLoading || deleteMutation.isLoading}
                className={`flex-1 text-white py-2 rounded-lg disabled:opacity-50 ${
                  actionType === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                {actionType === 'suspend' ? 'Suspend Gig' : 'Delete Gig'}
              </button>
              <button
                onClick={() => { setSelectedGig(null); setSuspendReason(''); setActionType(''); }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
