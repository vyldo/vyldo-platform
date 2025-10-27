import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import PermissionGuard from '../../components/PermissionGuard';
import { MessageCircle, Clock, CheckCircle, User as UserIcon, XCircle } from 'lucide-react';
import api from '../../lib/axios';

function SupportManagementContent() {
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState('open');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery(['adminTickets', statusFilter], async () => {
    const url = statusFilter === 'all' 
      ? '/admin/support/tickets' 
      : `/admin/support/tickets?status=${statusFilter}`;
    const res = await api.get(url);
    return res.data.tickets;
  });

  const { data: teamMembers } = useQuery('supportTeam', async () => {
    const res = await api.get('/admin/team');
    return res.data.teamMembers.filter(m => m.permissions?.manageSupport);
  });

  const assignMutation = useMutation(
    async ({ ticketId, assignedTo }) => 
      await api.patch(`/admin/support/tickets/${ticketId}/assign`, { assignedTo }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminTickets');
        setSelectedTicket(null);
        alert('Ticket assigned successfully!');
      }
    }
  );

  const closeMutation = useMutation(
    async (ticketId) => await api.patch(`/admin/support/tickets/${ticketId}/close`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminTickets');
        alert('Ticket closed successfully!');
      }
    }
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'in_progress':
        return <MessageCircle className="w-5 h-5 text-yellow-600" />;
      case 'solved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'closed':
        return <XCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <MessageCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'waiting_reply':
        return 'bg-orange-100 text-orange-800';
      case 'solved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Support Ticket Management</h1>
        <p className="text-gray-600 mt-2">Manage and respond to user support tickets</p>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['all', 'open', 'in_progress', 'waiting_reply', 'solved', 'closed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              statusFilter === status
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  Loading tickets...
                </td>
              </tr>
            ) : tickets?.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  No tickets found
                </td>
              </tr>
            ) : (
              tickets?.map((ticket) => (
                <tr key={ticket._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2">
                      {getStatusIcon(ticket.status)}
                      <div>
                        <div className="font-semibold text-gray-900">{ticket.subject}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{ticket.description}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(ticket.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={ticket.user?.avatar || '/avatar.jpg'}
                        alt={ticket.user?.displayName}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="font-medium text-sm">{ticket.user?.displayName}</div>
                        <div className="text-xs text-gray-500">{ticket.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm capitalize">{ticket.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {ticket.assignedTo ? (
                      <div className="text-sm">
                        <div className="font-medium">{ticket.assignedTo.displayName}</div>
                        <div className="text-xs text-gray-500">@{ticket.assignedTo.username}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        to={`/help-center/${ticket._id}`}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="px-3 py-1 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 text-sm"
                      >
                        Assign
                      </button>
                      {ticket.status !== 'closed' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Close this ticket?')) {
                              closeMutation.mutate(ticket._id);
                            }
                          }}
                          className="px-3 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 text-sm"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Assign Ticket</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Ticket: {selectedTicket.subject}</p>
              <p className="text-sm text-gray-600">User: {selectedTicket.user?.displayName}</p>
            </div>

            <div className="space-y-2 mb-6">
              <label className="block text-sm font-medium text-gray-700">
                Assign to Support Team Member:
              </label>
              {teamMembers?.length === 0 ? (
                <p className="text-sm text-gray-500">No support team members available</p>
              ) : (
                <div className="space-y-2">
                  {teamMembers?.map((member) => (
                    <button
                      key={member._id}
                      onClick={() => {
                        assignMutation.mutate({
                          ticketId: selectedTicket._id,
                          assignedTo: member._id
                        });
                      }}
                      className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <img
                        src={member.avatar || '/avatar.jpg'}
                        alt={member.displayName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="text-left">
                        <div className="font-medium">{member.displayName}</div>
                        <div className="text-sm text-gray-500">@{member.username}</div>
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      assignMutation.mutate({
                        ticketId: selectedTicket._id,
                        assignedTo: null
                      });
                    }}
                    className="w-full p-3 border border-dashed rounded-lg hover:bg-gray-50 text-gray-600"
                  >
                    Unassign
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedTicket(null)}
              className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SupportManagement() {
  return (
    <PermissionGuard permission="manageSupport">
      <SupportManagementContent />
    </PermissionGuard>
  );
}
