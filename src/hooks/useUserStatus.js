import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';

export function useUserStatus() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Check user status every 10 seconds
  const { data: statusData } = useQuery(
    'userStatus',
    async () => {
      const res = await api.get('/auth/me');
      return res.data.user;
    },
    {
      enabled: !!user,
      refetchInterval: 10000, // Check every 10 seconds
      refetchOnWindowFocus: true,
      onSuccess: (data) => {
        // Check if user is suspended or banned
        if (data?.isSuspended || data?.isBanned) {
          logout();
          navigate('/login', { 
            state: { 
              message: data.isSuspended 
                ? `Your account has been suspended. Reason: ${data.suspensionReason || 'Policy violation'}` 
                : `Your account has been banned. Reason: ${data.banReason || 'Terms violation'}`
            } 
          });
        }
      }
    }
  );

  return statusData;
}
