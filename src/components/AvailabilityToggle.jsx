import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Power, Lock } from 'lucide-react';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';

export default function AvailabilityToggle({ variant = 'button' }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showTooltip, setShowTooltip] = useState(false);

  // Only show for team members and admins
  if (!user || (user.role !== 'team' && user.role !== 'admin')) {
    return null;
  }

  // Check if user has withdrawal or support permissions
  const hasPermissions = user.permissions?.manageWithdrawals || user.permissions?.manageSupport;
  if (!hasPermissions) {
    return null;
  }

  const { data: availability, isLoading } = useQuery(
    'userAvailability',
    async () => {
      const res = await api.get('/users/availability');
      return res.data;
    },
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const toggleMutation = useMutation(
    async (isAvailable) => await api.put('/users/availability', { isAvailable }),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('userAvailability');
        
        if (data.data.reassigned) {
          const { withdrawalsReassigned, ticketsReassigned } = data.data.reassigned;
          alert(`${data.data.message}\n${withdrawalsReassigned} withdrawals and ${ticketsReassigned} tickets reassigned to other members.`);
        } else {
          // Show subtle notification
          const message = data.data.message;
          if (window.Notification && Notification.permission === 'granted') {
            new Notification('Vyldo', { body: message });
          }
        }
      },
      onError: (error) => {
        if (error.response?.data?.lockedByAdmin) {
          alert('Your availability is controlled by admin. Please contact admin to change your status.');
        } else {
          alert(error.response?.data?.message || 'Failed to update availability');
        }
      }
    }
  );

  const handleToggle = () => {
    if (availability?.lockedByAdmin) {
      alert('Your availability is locked by admin. Please contact admin to change.');
      return;
    }

    const newStatus = !availability?.isAvailable;
    const message = newStatus
      ? 'Go online? You will start receiving new tasks.'
      : 'Go offline? Your pending tasks will be reassigned to other team members.';

    if (confirm(message)) {
      toggleMutation.mutate(newStatus);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const isAvailable = availability?.isAvailable || false;
  const isLocked = availability?.lockedByAdmin || false;

  // Compact button variant (for navbar)
  if (variant === 'compact') {
    return (
      <div className="relative">
        <button
          onClick={handleToggle}
          disabled={toggleMutation.isLoading || isLocked}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            isAvailable
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
          title={isLocked ? 'Locked by admin' : (isAvailable ? 'You are available' : 'You are offline')}
        >
          {isLocked && <Lock className="w-3 h-3" />}
          <Power className="w-4 h-4" />
          <span className="hidden sm:inline">
            {isAvailable ? 'Available' : 'Offline'}
          </span>
        </button>

        {showTooltip && (
          <div className="absolute top-full mt-2 right-0 bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap z-50">
            {isLocked ? '🔒 Locked by admin' : (isAvailable ? 'Click to go offline' : 'Click to go online')}
          </div>
        )}
      </div>
    );
  }

  // Full button variant (for pages)
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Power className="w-5 h-5" />
            Task Availability
            {isLocked && <Lock className="w-4 h-4 text-yellow-600" />}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {isAvailable 
              ? 'You are receiving new tasks' 
              : 'You are not receiving new tasks'}
          </p>
          {isLocked && (
            <p className="text-xs text-yellow-600 mt-1">
              🔒 Status locked by admin
            </p>
          )}
        </div>

        <button
          onClick={handleToggle}
          disabled={toggleMutation.isLoading || isLocked}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            isAvailable
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          } ${(toggleMutation.isLoading || isLocked) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Power className="w-5 h-5" />
          {isAvailable ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      {/* Task Stats */}
      {availability?.taskStats && (
        <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Withdrawals Handled</p>
            <p className="text-lg font-semibold text-gray-900">
              {availability.taskStats.withdrawalsHandled || 0}
            </p>
            <p className="text-xs text-gray-500">
              {(availability.taskStats.withdrawalsValue || 0).toFixed(3)} HIVE
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Tickets Handled</p>
            <p className="text-lg font-semibold text-gray-900">
              {availability.taskStats.ticketsHandled || 0}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
