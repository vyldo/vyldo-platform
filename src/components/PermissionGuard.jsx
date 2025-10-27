import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useQuery } from 'react-query';
import { ShieldAlert } from 'lucide-react';
import api from '../lib/axios';

export default function PermissionGuard({ permission, children }) {
  const { user, updateUser } = useAuthStore();

  // Fetch fresh user data to get updated permissions
  const { data: freshUser } = useQuery('currentUser', async () => {
    const res = await api.get('/auth/me');
    return res.data.user;
  }, {
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always fetch fresh data
  });

  // Update local user data when fresh data arrives
  useEffect(() => {
    if (freshUser) {
      updateUser(freshUser);
    }
  }, [freshUser, updateUser]);

  // Use fresh user data if available, otherwise use cached
  const currentUser = freshUser || user;

  // Admin has all permissions
  if (currentUser?.role === 'admin') {
    return children;
  }

  // Check if team member has required permission
  if (currentUser?.role === 'team' && currentUser?.permissions?.[permission]) {
    return children;
  }

  // No permission - show error
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Required permission: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{permission}</span>
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/admin"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Dashboard
          </a>
          <a
            href="/"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Go to Home
          </a>
        </div>
      </div>
    </div>
  );
}
