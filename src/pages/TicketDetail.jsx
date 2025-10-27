import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Send, CheckCircle, ArrowLeft, User as UserIcon } from 'lucide-react';
import api from '../lib/axios';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const [message, setMessage] = useState('');

  const [accessDenied, setAccessDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { data: ticketData, isLoading } = useQuery(
    ['ticket', id], 
    async () => {
      try {
        const res = await api.get(`/support/tickets/${id}`);
        return res.data;
      } catch (error) {
        if (error.response?.status === 403) {
          setAccessDenied(true);
          setErrorMessage(error.response?.data?.message || 'Access denied');
        }
        throw error;
      }
    },
    {
      retry: false,
    }
  );

  const ticket = ticketData?.ticket;
  const canReply = ticketData?.canReply;

  const sendMessageMutation = useMutation(
    async (data) => await api.post(`/support/tickets/${id}/messages`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['ticket', id]);
        setMessage('');
      }
    }
  );

  const solveMutation = useMutation(
    async () => await api.patch(`/support/tickets/${id}/solve`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['ticket', id]);
        alert('Ticket marked as solved!');
      }
    }
  );

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessageMutation.mutate({ message });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>;
  }

  if (accessDenied) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <p className="text-sm text-gray-500 mb-8">
            You need "Manage Support" permission to view and reply to support tickets.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/help-center')}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Back to Help Center
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return <div className="max-w-7xl mx-auto px-4 py-8">Ticket not found</div>;
  }

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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/help-center')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Help Center
        </button>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{ticket.subject}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="capitalize">Category: {ticket.category}</span>
                <span>•</span>
                <span className="capitalize">Priority: {ticket.priority}</span>
                <span>•</span>
                <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(ticket.status)}`}>
              {ticket.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {ticket.assignedTo && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <UserIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-900">
                Assigned to: <strong>{ticket.assignedTo.displayName}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Conversation</h2>
        
        <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4">
          {ticket.messages?.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${msg.sender._id === user._id ? 'flex-row-reverse' : ''}`}
            >
              <img
                src={msg.sender.avatar || '/avatar.jpg'}
                alt={msg.sender.displayName}
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
              <div className={`flex-1 ${msg.sender._id === user._id ? 'text-right' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">
                    {msg.sender.displayName}
                    {msg.isStaff && (
                      <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                        Support Team
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
                <div
                  className={`inline-block px-4 py-2 rounded-lg ${
                    msg.sender._id === user._id
                      ? 'bg-primary-600 text-white'
                      : msg.isStaff
                      ? 'bg-purple-50 text-gray-900 border border-purple-200'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        {canReply && ticket.status !== 'closed' && ticket.status !== 'solved' ? (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              disabled={sendMessageMutation.isLoading || !message.trim()}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>
        ) : ticket.status !== 'closed' && ticket.status !== 'solved' && !canReply ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
            <p className="text-red-800 font-medium">
              ⚠️ You do not have permission to reply to this ticket
            </p>
            <p className="text-sm text-red-600 mt-1">
              Contact an administrator to get "Manage Support" permission
            </p>
          </div>
        ) : null}

        {/* Mark as Solved Button */}
        {ticket.status !== 'solved' && ticket.status !== 'closed' && ticket.user._id === user._id && (
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={() => {
                if (window.confirm('Mark this ticket as solved?')) {
                  solveMutation.mutate();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <CheckCircle className="w-5 h-5" />
              Mark as Solved
            </button>
          </div>
        )}

        {ticket.status === 'solved' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              ✅ This ticket has been marked as solved
            </p>
            {ticket.resolvedAt && (
              <p className="text-sm text-green-700 mt-1">
                Resolved on {new Date(ticket.resolvedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
