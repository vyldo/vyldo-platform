import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { UserPlus, Edit2, Trash2, Key, Eye, EyeOff, Power, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import PermissionGuard from '../../components/PermissionGuard';
import api from '../../lib/axios';

export default function TeamManagement() {
  const { user } = useAuthStore();
  
  // Only admin can access team management
  if (user?.role !== 'admin') {
    return <PermissionGuard permission="manageTeam" />;
  }
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [lockAvailability, setLockAvailability] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    displayName: '',
    password: '',
    permissions: {
      manageUsers: false,
      suspendUsers: false,
      manageGigs: false,
      suspendGigs: false,
      manageOrders: false,
      cancelOrders: false,
      manageWithdrawals: false,
      manageWallets: false,
      viewAnalytics: false,
      viewTeamAnalytics: false,
      manageSupport: false,
      manageVerified: false,
    }
  });

  const { data: teamMembers, isLoading } = useQuery('teamMembers', async () => {
    const res = await api.get('/admin/team');
    return res.data.teamMembers;
  });

  const addMutation = useMutation(
    async (data) => await api.post('/admin/team', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teamMembers');
        setShowAddModal(false);
        resetForm();
        alert('Team member added successfully!');
      },
      onError: (error) => {
        alert(error.response?.data?.message || 'Failed to add team member');
      }
    }
  );

  const updateMutation = useMutation(
    async ({ id, permissions }) => await api.patch(`/admin/team/${id}`, { permissions }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teamMembers');
        queryClient.invalidateQueries('currentUser'); // Refresh permissions for logged-in user
        setEditingMember(null);
        alert('Team member updated successfully! Permissions updated.');
      },
      onError: (error) => {
        alert(error.response?.data?.message || 'Failed to update team member');
      }
    }
  );

  const deleteMutation = useMutation(
    async (id) => await api.delete(`/admin/team/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teamMembers');
        alert('Team member removed successfully!');
      },
      onError: (error) => {
        alert(error.response?.data?.message || 'Failed to remove team member');
      }
    }
  );

  const toggleAvailabilityMutation = useMutation(
    async ({ id, isAvailable, lockAvailability }) => 
      await api.put(`/admin/team/${id}/availability`, { isAvailable, lockAvailability }),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('teamMembers');
        setShowAvailabilityModal(false);
        setSelectedMember(null);
        setLockAvailability(false);
        
        if (data.data.reassigned) {
          const { withdrawalsReassigned, ticketsReassigned } = data.data.reassigned;
          alert(`${data.data.message}\n${withdrawalsReassigned} withdrawals and ${ticketsReassigned} tickets reassigned.`);
        } else {
          alert(data.data.message);
        }
      },
      onError: (error) => {
        alert(error.response?.data?.message || 'Failed to update availability');
      }
    }
  );

  const resetForm = () => {
    setFormData({
      email: '',
      username: '',
      displayName: '',
      password: '',
      permissions: {
        manageUsers: false,
        suspendUsers: false,
        manageGigs: false,
        suspendGigs: false,
        manageOrders: false,
        cancelOrders: false,
        manageWithdrawals: false,
        manageWallets: false,
        viewAnalytics: false,
        viewTeamAnalytics: false,
        manageSupport: false,
        manageVerified: false,
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingMember) {
      updateMutation.mutate({
        id: editingMember._id,
        permissions: formData.permissions
      });
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      email: member.email,
      username: member.username,
      displayName: member.displayName,
      password: '',
      permissions: member.permissions || {}
    });
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleAvailability = (member) => {
    setSelectedMember(member);
    setLockAvailability(member.availabilityLockedByAdmin || false);
    setShowAvailabilityModal(true);
  };

  const confirmToggleAvailability = () => {
    if (!selectedMember) return;
    
    const newStatus = !selectedMember.isAvailableForTasks;
    toggleAvailabilityMutation.mutate({ 
      id: selectedMember._id, 
      isAvailable: newStatus,
      lockAvailability 
    });
  };

  const permissionsList = [
    { key: 'manageUsers', label: 'Manage Users', desc: 'View and manage user accounts' },
    { key: 'suspendUsers', label: 'Suspend Users', desc: 'Suspend/unsuspend user accounts' },
    { key: 'manageGigs', label: 'Manage Gigs', desc: 'View and delete gigs' },
    { key: 'suspendGigs', label: 'Suspend Gigs', desc: 'Suspend/unsuspend gigs' },
    { key: 'manageOrders', label: 'Manage Orders', desc: 'View all orders' },
    { key: 'cancelOrders', label: 'Cancel Orders', desc: 'Cancel orders' },
    { key: 'manageWithdrawals', label: 'Manage Withdrawals', desc: 'Approve/reject withdrawals' },
    { key: 'manageWallets', label: 'Manage Wallets', desc: 'Adjust wallet balances' },
    { key: 'viewAnalytics', label: 'View Analytics', desc: 'View dashboard statistics' },
    { key: 'viewTeamAnalytics', label: 'View Team Analytics', desc: 'View team performance analytics' },
    { key: 'manageSupport', label: 'Manage Support', desc: 'Handle support tickets' },
    { key: 'manageVerified', label: 'Manage Verified', desc: 'Grant/remove verified badges' },
  ];

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-2">Add and manage team members with custom permissions</p>
        </div>
        <button
          onClick={() => { setShowAddModal(true); setEditingMember(null); resetForm(); }}
          className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Add Team Member
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permissions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Availability</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {teamMembers?.map((member) => (
              <tr key={member._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{member.displayName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.username}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(member.permissions || {}).filter(([_, v]) => v).map(([key]) => (
                      <span key={key} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {member.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleToggleAvailability(member)}
                      disabled={toggleAvailabilityMutation.isLoading}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        member.isAvailableForTasks
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={member.isAvailableForTasks ? 'Available for tasks' : 'Not available'}
                    >
                      <Power className="w-4 h-4" />
                      {member.isAvailableForTasks ? 'Available' : 'Offline'}
                    </button>
                    {member.availabilityLockedByAdmin && (
                      <span className="text-xs text-yellow-600 flex items-center gap-1">
                        🔒 Locked by admin
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(member)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit permissions"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(member._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {teamMembers?.length === 0 && (
          <div className="text-center py-12">
            <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No team members yet. Add your first team member!</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {!editingMember && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Permissions</label>
                <div className="space-y-3">
                  {permissionsList.map((perm) => (
                    <label key={perm.key} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions[perm.key] || false}
                        onChange={(e) => setFormData({
                          ...formData,
                          permissions: { ...formData.permissions, [perm.key]: e.target.checked }
                        })}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{perm.label}</div>
                        <div className="text-sm text-gray-600">{perm.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={addMutation.isLoading || updateMutation.isLoading}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {editingMember ? 'Update Member' : 'Add Member'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingMember(null); resetForm(); }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Availability Toggle Modal */}
      {showAvailabilityModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {selectedMember.isAvailableForTasks ? 'Disable' : 'Enable'} Team Member
            </h3>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                <strong>{selectedMember.displayName}</strong>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                {selectedMember.isAvailableForTasks 
                  ? 'This will set the team member to offline. Their pending tasks will be reassigned to other available members.'
                  : 'This will set the team member to available. They will start receiving new tasks.'}
              </p>

              {/* Lock Checkbox */}
              <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer bg-yellow-50 border-yellow-300">
                <input
                  type="checkbox"
                  checked={lockAvailability}
                  onChange={(e) => setLockAvailability(e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900">🔒 Lock Availability (Admin Override)</div>
                  <div className="text-sm text-gray-600">
                    <strong>Check this to lock:</strong> Team member cannot change their status.<br/>
                    <strong>Uncheck to unlock:</strong> Team member controls their own availability.
                  </div>
                </div>
              </label>

              <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Leave unchecked to let team members manage their own availability. 
                  Only lock if you need to force a specific status.
                </p>
              </div>

              {selectedMember.availabilityLockedByAdmin && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-300 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ℹ️ Currently locked by admin
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmToggleAvailability}
                disabled={toggleAvailabilityMutation.isLoading}
                className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {selectedMember.isAvailableForTasks ? 'Set Offline' : 'Set Available'}
              </button>
              <button
                onClick={() => {
                  setShowAvailabilityModal(false);
                  setSelectedMember(null);
                  setLockAvailability(false);
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300"
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
