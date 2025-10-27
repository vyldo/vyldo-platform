import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, MessageCircle, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../lib/axios';

export default function HelpCenter() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    subject: '',
    category: 'other',
    priority: 'medium',
    description: ''
  });

  const { data: tickets, isLoading } = useQuery(['supportTickets', statusFilter], async () => {
    const url = statusFilter === 'all' 
      ? '/support/tickets' 
      : `/support/tickets?status=${statusFilter}`;
    const res = await api.get(url);
    return res.data.tickets;
  });

  const createMutation = useMutation(
    async (data) => await api.post('/support/tickets', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('supportTickets');
        setShowCreateModal(false);
        setFormData({ subject: '', category: 'other', priority: 'medium', description: '' });
        alert('Support ticket created successfully!');
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'in_progress':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
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

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Please Login</h1>
        <p className="text-gray-600 mb-6">You need to be logged in to access the help center</p>
        <Link to="/login" className="btn-primary">Login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
          <p className="text-gray-600 mt-2">Get support for your issues</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Ticket
        </button>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['all', 'open', 'in_progress', 'solved', 'closed'].map((status) => (
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

      {/* Tickets List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : tickets?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No support tickets found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 btn-primary"
            >
              Create Your First Ticket
            </button>
          </div>
        ) : (
          tickets.map((ticket) => (
            <Link
              key={ticket._id}
              to={`/help-center/${ticket._id}`}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(ticket.status)}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{ticket.subject}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{ticket.description}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                  {ticket.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="capitalize">Category: {ticket.category}</span>
                <span>•</span>
                <span className="capitalize">Priority: {ticket.priority}</span>
                <span>•</span>
                <span>{ticket.messages?.length || 0} messages</span>
                <span>•</span>
                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                {ticket.assignedTo && (
                  <>
                    <span>•</span>
                    <span>Assigned to: {ticket.assignedTo.displayName}</span>
                  </>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Create Support Ticket</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="technical">Technical Issue</option>
                    <option value="payment">Payment Issue</option>
                    <option value="account">Account Issue</option>
                    <option value="order">Order Issue</option>
                    <option value="gig">Gig Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="6"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Please provide detailed information about your issue..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createMutation.isLoading}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {createMutation.isLoading ? 'Creating...' : 'Create Ticket'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300"
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
