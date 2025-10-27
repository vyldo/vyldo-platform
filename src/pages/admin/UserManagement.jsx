import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Search, Ban, CheckCircle, Eye, Award, BadgeCheck } from 'lucide-react';
import PermissionGuard from '../../components/PermissionGuard';
import SellerLevelBadge from '../../components/SellerLevelBadge';
import VerifiedBadge from '../../components/VerifiedBadge';
import api from '../../lib/axios';

export default function UserManagement() {
  return (
    <PermissionGuard permission="manageUsers">
      <UserManagementContent />
    </PermissionGuard>
  );
}

function UserManagementContent() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [changingLevel, setChangingLevel] = useState(null);
  const [newLevel, setNewLevel] = useState('');
  const [changingVerified, setChangingVerified] = useState(null);
  const [verifiedStatus, setVerifiedStatus] = useState(false);
  const [verifiedText, setVerifiedText] = useState('Verified Account');
  const [badgeType, setBadgeType] = useState('default');
  const [customBadgeImage, setCustomBadgeImage] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(['users', page, search], async () => {
    const res = await api.get(`/admin/users?page=${page}&limit=20&search=${search}`);
    return res.data;
  });

  const suspendMutation = useMutation(
    async ({ id, reason }) => await api.patch(`/admin/users/${id}/suspend`, { reason }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        setSelectedUser(null);
        setSuspendReason('');
        alert('User suspended successfully!');
      }
    }
  );

  const unsuspendMutation = useMutation(
    async (id) => await api.patch(`/admin/users/${id}/unsuspend`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        alert('User unsuspended successfully!');
      }
    }
  );

  const changeLevelMutation = useMutation(
    async ({ id, level }) => await api.patch(`/admin/users/${id}/seller-level`, { sellerLevel: level }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        setChangingLevel(null);
        setNewLevel('');
        alert('Seller level updated successfully!');
      }
    }
  );

  const changeVerifiedMutation = useMutation(
    async ({ id, isVerified, verifiedText, verifiedBadgeType, verifiedBadgeImage }) => 
      await api.patch(`/admin/users/${id}/verified`, { 
        isVerified, 
        verifiedText, 
        verifiedBadgeType, 
        verifiedBadgeImage 
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        setChangingVerified(null);
        setVerifiedStatus(false);
        setVerifiedText('Verified Account');
        setBadgeType('default');
        setCustomBadgeImage('');
        alert('Verified status updated successfully!');
      }
    }
  );

  const handleSuspend = (user) => {
    setSelectedUser(user);
  };

  const confirmSuspend = () => {
    if (!suspendReason.trim()) {
      alert('Please provide a reason for suspension');
      return;
    }
    suspendMutation.mutate({ id: selectedUser._id, reason: suspendReason });
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
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">View and manage user accounts</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data?.users?.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar || '/avatar.jpg'}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{user.displayName}</div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'team' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <SellerLevelBadge level={user.sellerLevel} size="sm" showNewSeller={true} />
                </td>
                <td className="px-6 py-4">
                  <VerifiedBadge 
                    isVerified={user.isVerified} 
                    verifiedText={user.verifiedText}
                    badgeType={user.verifiedBadgeType}
                    customImage={user.verifiedBadgeImage}
                    size="sm" 
                  />
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.totalOrders || 0}</td>
                <td className="px-6 py-4">
                  {user.isSuspended ? (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Suspended</span>
                  ) : (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setChangingLevel(user); setNewLevel(user.sellerLevel || 'new_seller'); }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Change Seller Level"
                    >
                      <Award className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { 
                        setChangingVerified(user); 
                        setVerifiedStatus(user.isVerified || false); 
                        setVerifiedText(user.verifiedText || 'Verified Account');
                        setBadgeType(user.verifiedBadgeType || 'default');
                        setCustomBadgeImage(user.verifiedBadgeImage || '');
                      }}
                      className="p-2 text-cyan-600 hover:bg-cyan-50 rounded"
                      title="Manage Verified Status"
                    >
                      <BadgeCheck className="w-4 h-4" />
                    </button>
                    {user.role !== 'admin' && (
                      user.isSuspended ? (
                        <button
                          onClick={() => unsuspendMutation.mutate(user._id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                          title="Unsuspend"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSuspend(user)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Suspend"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data?.users?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No users found</p>
          </div>
        )}
      </div>

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

      {/* Suspend Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Suspend User</h2>
            <p className="text-gray-600 mb-4">
              You are about to suspend <strong>{selectedUser.displayName}</strong>
            </p>
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
            <div className="flex gap-3">
              <button
                onClick={confirmSuspend}
                disabled={suspendMutation.isLoading}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Suspend User
              </button>
              <button
                onClick={() => { setSelectedUser(null); setSuspendReason(''); }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Seller Level Modal */}
      {changingLevel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Change Seller Level</h2>
            <p className="text-gray-600 mb-4">
              Change seller level for <strong>{changingLevel.displayName}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Seller Level *</label>
              <select
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="new_seller">New Seller</option>
                <option value="level_1">Level 1</option>
                <option value="level_2">Level 2</option>
                <option value="top_rated">Top Rated Seller</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Current: <SellerLevelBadge level={changingLevel.sellerLevel} size="sm" showNewSeller={true} />
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => changeLevelMutation.mutate({ id: changingLevel._id, level: newLevel })}
                disabled={changeLevelMutation.isLoading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Update Level
              </button>
              <button
                onClick={() => { setChangingLevel(null); setNewLevel(''); }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Verified Status Modal */}
      {changingVerified && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Manage Verified Status</h2>
            <p className="text-gray-600 mb-4">
              Manage verified badge for <strong>{changingVerified.displayName}</strong>
            </p>
            <div className="mb-4">
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={verifiedStatus}
                  onChange={(e) => setVerifiedStatus(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Verified Account</span>
              </label>
              
              {verifiedStatus && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Verified Text (Tooltip)</label>
                    <input
                      type="text"
                      value={verifiedText}
                      onChange={(e) => setVerifiedText(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Official Account, Verified Creator"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This text will show when users hover over the verified badge
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Badge Type</label>
                    <select
                      value={badgeType}
                      onChange={(e) => setBadgeType(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="default">🔵 Default (Blue Check)</option>
                      <option value="gold">🏆 Gold (Award)</option>
                      <option value="premium">👑 Premium (Crown)</option>
                      <option value="official">🛡️ Official (Shield)</option>
                      <option value="partner">⭐ Partner (Star)</option>
                      <option value="custom">🖼️ Custom Image</option>
                    </select>
                  </div>

                  {badgeType === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Custom Badge Image URL</label>
                      <input
                        type="text"
                        value={customBadgeImage}
                        onChange={(e) => {
                          // Clean the URL as user types
                          const cleanUrl = e.target.value
                            .replace(/&#x2F;/g, '/')
                            .replace(/&amp;/g, '&')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&quot;/g, '"')
                            .replace(/&#x27;/g, "'");
                          setCustomBadgeImage(cleanUrl);
                        }}
                        onPaste={(e) => {
                          e.preventDefault();
                          // Clean pasted content
                          const pastedText = e.clipboardData.getData('text');
                          const cleanUrl = pastedText
                            .replace(/&#x2F;/g, '/')
                            .replace(/&amp;/g, '&')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&quot;/g, '"')
                            .replace(/&#x27;/g, "'")
                            .trim();
                          setCustomBadgeImage(cleanUrl);
                        }}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="https://example.com/badge.png or /uploads/badge.png"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter image URL. Recommended: 24x24px transparent PNG
                      </p>
                      {customBadgeImage && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <img 
                              src={customBadgeImage} 
                              alt="Badge preview" 
                              className="w-8 h-8 object-contain border border-gray-300 rounded p-1 bg-white" 
                              onError={(e) => {
                                console.error('Preview image failed to load:', customBadgeImage);
                                e.target.style.display = 'none';
                              }}
                              onLoad={() => {
                                e.target.style.display = 'block';
                              }}
                            />
                            <div>
                              <span className="text-xs text-green-600 font-semibold">✓ Preview</span>
                              <p className="text-xs text-gray-500 mt-1 break-all">{customBadgeImage}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-3">
                Current: {changingVerified.isVerified ? (
                  <VerifiedBadge 
                    isVerified={true} 
                    verifiedText={changingVerified.verifiedText}
                    badgeType={changingVerified.verifiedBadgeType}
                    customImage={changingVerified.verifiedBadgeImage}
                    size="sm" 
                  />
                ) : (
                  <span className="text-gray-400">Not Verified</span>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Clean the URL - remove any HTML encoding
                  const cleanImageUrl = customBadgeImage
                    .replace(/&#x2F;/g, '/')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&#x27;/g, "'")
                    .trim();

                  console.log('🔄 Updating verified status:', {
                    id: changingVerified._id,
                    isVerified: verifiedStatus,
                    verifiedText: verifiedText,
                    verifiedBadgeType: badgeType,
                    verifiedBadgeImage: cleanImageUrl
                  });
                  
                  changeVerifiedMutation.mutate({ 
                    id: changingVerified._id, 
                    isVerified: verifiedStatus, 
                    verifiedText: verifiedText,
                    verifiedBadgeType: badgeType,
                    verifiedBadgeImage: cleanImageUrl
                  });
                }}
                disabled={changeVerifiedMutation.isLoading}
                className="flex-1 bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700 disabled:opacity-50"
              >
                Update Status
              </button>
              <button
                onClick={() => { 
                  setChangingVerified(null); 
                  setVerifiedStatus(false); 
                  setVerifiedText('Verified Account');
                  setBadgeType('default');
                  setCustomBadgeImage('');
                }}
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
