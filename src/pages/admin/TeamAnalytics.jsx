import { useState } from 'react';
import { useQuery } from 'react-query';
import { BarChart3, TrendingUp, Users, DollarSign, CheckCircle, XCircle, Calendar, User, Eye } from 'lucide-react';
import PermissionGuard from '../../components/PermissionGuard';
import api from '../../lib/axios';

export default function TeamAnalytics() {
  return (
    <PermissionGuard permission="viewAnalytics">
      <TeamAnalyticsContent />
    </PermissionGuard>
  );
}

function TeamAnalyticsContent() {
  const [period, setPeriod] = useState('daily');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [selectedMember, setSelectedMember] = useState(null);
  const [filterUser, setFilterUser] = useState('all');
  const [viewingDetails, setViewingDetails] = useState(null);
  const [viewingTransaction, setViewingTransaction] = useState(null);
  const [viewingTicket, setViewingTicket] = useState(null);

  // Fetch team comparison data
  const { data: comparisonData, isLoading } = useQuery(
    ['teamComparison', period, customDates],
    async () => {
      let url = `/admin/team/progress/comparison?period=${period}`;
      if (period === 'custom' && customDates.start && customDates.end) {
        url = `/admin/team/progress/comparison?period=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
      }
      const res = await api.get(url);
      return res.data;
    },
    {
      enabled: period !== 'custom' || (customDates.start && customDates.end)
    }
  );

  // Fetch individual member details when selected
  const { data: memberDetails } = useQuery(
    ['memberProgress', selectedMember, period, customDates],
    async () => {
      let url = `/admin/team/${selectedMember}/progress?period=${period}`;
      if (period === 'custom' && customDates.start && customDates.end) {
        url = `/admin/team/${selectedMember}/progress?period=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
      }
      const res = await api.get(url);
      return res.data;
    },
    {
      enabled: !!selectedMember && (period !== 'custom' || (customDates.start && customDates.end))
    }
  );

  // Fetch detailed withdrawal history
  const { data: withdrawalHistory } = useQuery(
    ['withdrawalHistory', filterUser, period, customDates],
    async () => {
      let url = `/admin/team/withdrawal-history?period=${period}`;
      if (filterUser !== 'all') {
        url += `&userId=${filterUser}`;
      }
      if (period === 'custom' && customDates.start && customDates.end) {
        url += `&startDate=${customDates.start}&endDate=${customDates.end}`;
      }
      const res = await api.get(url);
      return res.data;
    },
    {
      enabled: period !== 'custom' || (customDates.start && customDates.end)
    }
  );

  // Fetch detailed ticket history
  const { data: ticketHistory } = useQuery(
    ['ticketHistory', filterUser, period, customDates],
    async () => {
      let url = `/admin/team/ticket-history?period=${period}`;
      if (filterUser !== 'all') {
        url += `&userId=${filterUser}`;
      }
      if (period === 'custom' && customDates.start && customDates.end) {
        url += `&startDate=${customDates.start}&endDate=${customDates.end}`;
      }
      const res = await api.get(url);
      return res.data;
    },
    {
      enabled: period !== 'custom' || (customDates.start && customDates.end)
    }
  );

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

  const allTeamMembers = comparisonData?.teamMembers || [];

  // Export report function
  const handleExportReport = async () => {
    try {
      let url = `/admin/team/export-report?period=${period}`;
      
      // Add user filter
      if (filterUser !== 'all') {
        url += `&userId=${filterUser}`;
      }
      
      // Add custom dates
      if (period === 'custom' && customDates.start && customDates.end) {
        url += `&startDate=${customDates.start}&endDate=${customDates.end}`;
      }
      
      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      const fileName = filterUser === 'all' 
        ? `All_Users_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`
        : `${allTeamMembers.find(m => m._id === filterUser)?.displayName}_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export report');
    }
  };
  
  // Filter team members based on selected user
  const teamMembers = filterUser === 'all' 
    ? allTeamMembers 
    : allTeamMembers.filter(m => m._id === filterUser);
  
  // Recalculate summary for filtered data
  const summary = filterUser === 'all' 
    ? comparisonData?.summary || {}
    : {
        totalMembers: teamMembers.length,
        availableMembers: teamMembers.filter(m => m.isAvailable).length,
        totalWithdrawalsProcessed: teamMembers.reduce((sum, m) => sum + m.performance.withdrawalsProcessed, 0),
        totalWithdrawalsCompleted: teamMembers.reduce((sum, m) => sum + m.performance.withdrawalsCompleted, 0),
        totalWithdrawalsRejected: teamMembers.reduce((sum, m) => sum + m.performance.withdrawalsRejected, 0),
        totalWithdrawalsCompletedValue: teamMembers.reduce((sum, m) => sum + m.performance.withdrawalsValue, 0),
        totalWithdrawalsRejectedValue: teamMembers.reduce((sum, m) => sum + (m.performance.withdrawalsRejectedValue || 0), 0),
        totalWithdrawalsValue: teamMembers.reduce((sum, m) => sum + (m.performance.totalValue || m.performance.withdrawalsValue), 0),
        totalTicketsResolved: teamMembers.reduce((sum, m) => sum + m.performance.ticketsResolved, 0)
      };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Analytics</h1>
            <p className="text-gray-600 mt-2">
              {filterUser === 'all' 
                ? 'Monitor team member performance and withdrawal processing' 
                : `Viewing analytics for: ${allTeamMembers.find(m => m._id === filterUser)?.displayName || 'User'}`
              }
            </p>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-4">
            {/* User Filter */}
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600" />
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Users</option>
                {allTeamMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.displayName}
                  </option>
                ))}
              </select>
            </div>

            {/* Period Selector */}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="daily">Today</option>
                <option value="weekly">Last 7 Days</option>
                <option value="monthly">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Export Button */}
            <button
              onClick={() => handleExportReport()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
              disabled={!comparisonData}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Report
            </button>
          </div>
        </div>

        {/* Custom Date Range */}
        {period === 'custom' && (
          <div className="mt-4 flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={customDates.start}
                onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={customDates.end}
                onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            {customDates.start && customDates.end && (
              <div className="mt-6">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    // Force refetch by updating the query
                    setCustomDates({ ...customDates });
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Team Members</h3>
          <p className="text-3xl font-bold text-gray-900">{summary.totalMembers || 0}</p>
          <p className="text-sm text-gray-500">{summary.availableMembers || 0} available</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">✓ Approved</h3>
          <p className="text-3xl font-bold text-green-700">{summary.totalWithdrawalsCompleted || 0}</p>
          <p className="text-sm text-green-600">{(summary.totalWithdrawalsCompletedValue || 0).toFixed(2)} HIVE</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-500 p-3 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">✗ Rejected</h3>
          <p className="text-3xl font-bold text-red-700">{summary.totalWithdrawalsRejected || 0}</p>
          <p className="text-sm text-red-600">{(summary.totalWithdrawalsRejectedValue || 0).toFixed(2)} HIVE</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">💰 Total Value</h3>
          <p className="text-3xl font-bold text-purple-700">{(summary.totalWithdrawalsValue || 0).toFixed(2)}</p>
          <p className="text-sm text-gray-500">HIVE (All)</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-teal-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Tickets Resolved</h3>
          <p className="text-3xl font-bold text-gray-900">{summary.totalTicketsResolved || 0}</p>
          <p className="text-sm text-gray-500">
            {period === 'daily' ? 'Today' : period === 'weekly' ? 'This week' : period === 'monthly' ? 'This month' : 'Custom'}
          </p>
        </div>
      </div>

      {/* Team Members Performance Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Team Performance Comparison
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Withdrawals</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value (HIVE)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tickets</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">All Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teamMembers.map((member, index) => (
                <tr key={member._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-500' :
                        'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{member.displayName}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      member.isAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {member.isAvailable ? '🟢 Online' : '⚫ Offline'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-lg text-gray-900">
                      {member.performance.withdrawalsProcessed}
                    </div>
                    <div className="text-xs text-green-600">✓ {member.performance.withdrawalsCompleted} completed</div>
                    <div className="text-xs text-red-600">✗ {member.performance.withdrawalsRejected} rejected</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-green-700">
                      {member.performance.withdrawalsValue.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">HIVE</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-lg text-gray-900">
                      {member.performance.ticketsResolved}
                    </div>
                    <div className="text-xs text-gray-500">resolved</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="text-yellow-700 font-medium">
                        {member.performance.currentPending.withdrawals} withdrawals
                      </div>
                      <div className="text-blue-700 font-medium">
                        {member.performance.currentPending.tickets} tickets
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-700">
                        {member.totalStats.allTimeWithdrawals} withdrawals
                      </div>
                      <div className="text-xs text-gray-500">
                        {member.totalStats.allTimeValue.toFixed(2)} HIVE
                      </div>
                      <div className="text-xs text-gray-500">
                        {member.totalStats.allTimeTickets} tickets
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setViewingDetails(member)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                    >
                      <Eye className="w-4 h-4" />
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {teamMembers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No team members found</p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Withdrawal History */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Withdrawal Transaction History
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {filterUser === 'all' ? 'All team members' : allTeamMembers.find(m => m._id === filterUser)?.displayName} - 
            {period === 'daily' ? ' Today' : period === 'weekly' ? ' Last 7 Days' : period === 'monthly' ? ' Last 30 Days' : ' Custom Range'}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Processed By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hive Account</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Processed At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {withdrawalHistory?.withdrawals?.map((withdrawal) => (
                <tr 
                  key={withdrawal._id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setViewingTransaction(withdrawal)}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{withdrawal.processedBy?.displayName}</div>
                    <div className="text-sm text-gray-500">@{withdrawal.processedBy?.username}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{withdrawal.user?.displayName}</div>
                    <div className="text-sm text-gray-500">{withdrawal.user?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-lg text-gray-900">{withdrawal.amount} HIVE</div>
                    {withdrawal.fee > 0 && (
                      <div className="text-xs text-gray-500">Fee: {withdrawal.fee} HIVE</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm text-blue-700">@{withdrawal.hiveAccount}</div>
                    {withdrawal.memo && (
                      <div className="text-xs text-gray-500 max-w-xs truncate">{withdrawal.memo}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      withdrawal.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {withdrawal.status === 'completed' ? '✓ Completed' : '✗ Rejected'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {new Date(withdrawal.processedAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(withdrawal.processedAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {withdrawal.status === 'completed' && withdrawal.hiveTransaction?.txId ? (
                      <div>
                        <div className="font-mono text-xs text-green-700 break-all">
                          {withdrawal.hiveTransaction.txId.substring(0, 12)}...
                        </div>
                        {withdrawal.hiveTransaction.blockNum && (
                          <div className="text-xs text-gray-500">
                            Block: {withdrawal.hiveTransaction.blockNum}
                          </div>
                        )}
                      </div>
                    ) : withdrawal.status === 'rejected' && withdrawal.rejectionReason ? (
                      <div className="text-xs text-red-700 max-w-xs truncate" title={withdrawal.rejectionReason}>
                        {withdrawal.rejectionReason}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!withdrawalHistory?.withdrawals || withdrawalHistory.withdrawals.length === 0) && (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No withdrawal transactions found for this period</p>
            </div>
          )}
        </div>

        {withdrawalHistory?.summary && (
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Processed</p>
                <p className="text-lg font-bold text-gray-900">{withdrawalHistory.summary.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-lg font-bold text-green-700">{withdrawalHistory.summary.completed}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-lg font-bold text-red-700">{withdrawalHistory.summary.rejected}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-lg font-bold text-purple-700">{withdrawalHistory.summary.totalValue.toFixed(2)} HIVE</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Ticket History */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Support Ticket History
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {filterUser === 'all' ? 'All team members' : allTeamMembers.find(m => m._id === filterUser)?.displayName} - 
            {period === 'daily' ? ' Today' : period === 'weekly' ? ' Last 7 Days' : period === 'monthly' ? ' Last 30 Days' : ' Custom Range'}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resolved By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resolved At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ticketHistory?.tickets?.map((ticket) => (
                <tr 
                  key={ticket._id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setViewingTicket(ticket)}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{ticket.resolvedBy?.displayName}</div>
                    <div className="text-sm text-gray-500">@{ticket.resolvedBy?.username}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{ticket.user?.displayName}</div>
                    <div className="text-sm text-gray-500">{ticket.user?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 max-w-xs truncate">{ticket.subject}</div>
                    <div className="text-xs text-gray-500">ID: {ticket._id.substring(0, 8)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {ticket.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                      ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ticket.status === 'solved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {new Date(ticket.resolvedAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(ticket.resolvedAt).toLocaleTimeString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!ticketHistory?.tickets || ticketHistory.tickets.length === 0) && (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No support tickets found for this period</p>
            </div>
          )}
        </div>

        {ticketHistory?.summary && (
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Resolved</p>
                <p className="text-lg font-bold text-gray-900">{ticketHistory.summary.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Solved</p>
                <p className="text-lg font-bold text-green-700">{ticketHistory.summary.solved}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Closed</p>
                <p className="text-lg font-bold text-blue-700">{ticketHistory.summary.closed}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Member Details Modal */}
      {viewingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {viewingDetails.displayName} - Performance Details
              </h2>
              <button
                onClick={() => setViewingDetails(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Member Info */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{viewingDetails.displayName}</h3>
                    <p className="text-gray-600">{viewingDetails.email}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    viewingDetails.isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {viewingDetails.isAvailable ? '🟢 Available' : '⚫ Offline'}
                  </span>
                </div>
              </div>

              {/* Performance Stats - Current Period */}
              <div className="border rounded-lg p-6 bg-gray-50">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {period === 'daily' ? 'Today\'s' : period === 'weekly' ? 'This Week\'s' : 'This Month\'s'} Performance
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-600 mb-1">Total Withdrawals Processed</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {viewingDetails.performance.withdrawalsProcessed}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-600 mb-1">Tickets Resolved</p>
                    <p className="text-3xl font-bold text-blue-700">
                      {viewingDetails.performance.ticketsResolved}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-900 mb-1">✓ Completed</p>
                    <p className="text-2xl font-bold text-green-700">
                      {viewingDetails.performance.withdrawalsCompleted}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {viewingDetails.performance.withdrawalsValue.toFixed(2)} HIVE
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-sm text-red-900 mb-1">✗ Rejected</p>
                    <p className="text-2xl font-bold text-red-700">
                      {viewingDetails.performance.withdrawalsRejected}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      {(viewingDetails.performance.withdrawalsRejectedValue || 0).toFixed(2)} HIVE
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-900 mb-1">💰 Total Value</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {(viewingDetails.performance.totalValue || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-purple-600">HIVE</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900 mb-1">📊 Success Rate</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {viewingDetails.performance.withdrawalsProcessed > 0 
                        ? ((viewingDetails.performance.withdrawalsCompleted / viewingDetails.performance.withdrawalsProcessed) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Currently Pending */}
              <div className="border rounded-lg p-6 bg-yellow-50">
                <h3 className="text-lg font-bold mb-4 text-yellow-900">⏳ Currently Assigned</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-600 mb-1">Pending Withdrawals</p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {viewingDetails.performance.currentPending.withdrawals}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-600 mb-1">Open Tickets</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {viewingDetails.performance.currentPending.tickets}
                    </p>
                  </div>
                </div>
              </div>

              {/* All Time Stats */}
              <div className="border rounded-lg p-6 bg-blue-50">
                <h3 className="text-lg font-bold mb-4 text-blue-900">📊 All Time Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-600 mb-1">Total Withdrawals</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {viewingDetails.totalStats.allTimeWithdrawals}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-600 mb-1">Total Value</p>
                    <p className="text-2xl font-bold text-green-700">
                      {viewingDetails.totalStats.allTimeValue.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">HIVE</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-600 mb-1">Total Tickets</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {viewingDetails.totalStats.allTimeTickets}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setViewingDetails(null)}
                  className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {viewingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Withdrawal Transaction Details</h2>
              <button
                onClick={() => setViewingTransaction(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Status Banner */}
              <div className={`p-4 rounded-lg border-2 ${
                viewingTransaction.status === 'completed' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">
                      {viewingTransaction.status === 'completed' ? '✓ Completed' : '✗ Rejected'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Processed on {new Date(viewingTransaction.processedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{viewingTransaction.amount} HIVE</p>
                    {viewingTransaction.fee > 0 && (
                      <p className="text-sm text-gray-600">Fee: {viewingTransaction.fee} HIVE</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Processed By */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-bold text-blue-900 mb-2">Processed By</h3>
                <div className="bg-white p-3 rounded">
                  <p className="font-bold">{viewingTransaction.processedBy?.displayName}</p>
                  <p className="text-sm text-gray-600">@{viewingTransaction.processedBy?.username}</p>
                  <p className="text-sm text-gray-600">{viewingTransaction.processedBy?.email}</p>
                </div>
              </div>

              {/* User Information */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-bold text-gray-900 mb-2">User Information</h3>
                <div className="bg-white p-3 rounded">
                  <p className="font-bold">{viewingTransaction.user?.displayName}</p>
                  <p className="text-sm text-gray-600">@{viewingTransaction.user?.username}</p>
                  <p className="text-sm text-gray-600">{viewingTransaction.user?.email}</p>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="border rounded-lg p-4 bg-purple-50">
                <h3 className="font-bold text-purple-900 mb-2">Transaction Details</h3>
                <div className="space-y-2">
                  <div className="bg-white p-3 rounded">
                    <p className="text-sm text-gray-600">Hive Account</p>
                    <p className="font-mono font-bold text-blue-700">@{viewingTransaction.hiveAccount}</p>
                  </div>
                  {viewingTransaction.memo && (
                    <div className="bg-white p-3 rounded">
                      <p className="text-sm text-gray-600">Memo</p>
                      <p className="font-medium">{viewingTransaction.memo}</p>
                    </div>
                  )}
                  <div className="bg-white p-3 rounded">
                    <p className="text-sm text-gray-600">Amount Requested</p>
                    <p className="font-bold text-lg">{viewingTransaction.amount} HIVE</p>
                  </div>
                  {viewingTransaction.fee > 0 && (
                    <div className="bg-white p-3 rounded">
                      <p className="text-sm text-gray-600">Platform Fee</p>
                      <p className="font-bold text-red-700">{viewingTransaction.fee} HIVE</p>
                    </div>
                  )}
                  <div className="bg-white p-3 rounded">
                    <p className="text-sm text-gray-600">Net Amount</p>
                    <p className="font-bold text-green-700 text-lg">
                      {(viewingTransaction.amount - (viewingTransaction.fee || 0)).toFixed(3)} HIVE
                    </p>
                  </div>
                </div>
              </div>

              {/* Blockchain Transaction */}
              {viewingTransaction.status === 'completed' && viewingTransaction.hiveTransaction && (
                <div className="border rounded-lg p-4 bg-green-50">
                  <h3 className="font-bold text-green-900 mb-2">Blockchain Transaction</h3>
                  <div className="space-y-2">
                    <div className="bg-white p-3 rounded">
                      <p className="text-sm text-gray-600">Transaction ID</p>
                      <p className="font-mono text-sm font-bold break-all text-green-700">
                        {viewingTransaction.hiveTransaction.txId}
                      </p>
                    </div>
                    {viewingTransaction.hiveTransaction.blockNum && (
                      <div className="bg-white p-3 rounded">
                        <p className="text-sm text-gray-600">Block Number</p>
                        <p className="font-mono font-bold">{viewingTransaction.hiveTransaction.blockNum}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {viewingTransaction.status === 'rejected' && viewingTransaction.rejectionReason && (
                <div className="border rounded-lg p-4 bg-red-50">
                  <h3 className="font-bold text-red-900 mb-2">Rejection Reason</h3>
                  <div className="bg-white p-3 rounded">
                    <p className="text-red-700">{viewingTransaction.rejectionReason}</p>
                  </div>
                </div>
              )}

              {/* IP Address */}
              {viewingTransaction.ipAddress && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-bold text-gray-900 mb-2">Request Information</h3>
                  <div className="bg-white p-3 rounded">
                    <p className="text-sm text-gray-600">IP Address</p>
                    <p className="font-mono text-sm">{viewingTransaction.ipAddress}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t">
              <button
                onClick={() => setViewingTransaction(null)}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {viewingTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Support Ticket Details</h2>
              <button
                onClick={() => setViewingTicket(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Status Banner */}
              <div className={`p-4 rounded-lg border-2 ${
                viewingTicket.status === 'solved' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold capitalize">{viewingTicket.status}</h3>
                    <p className="text-sm text-gray-600">
                      Resolved on {new Date(viewingTicket.resolvedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      viewingTicket.priority === 'high' ? 'bg-red-100 text-red-800' :
                      viewingTicket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {viewingTicket.priority} priority
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                      {viewingTicket.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Resolved By */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-bold text-blue-900 mb-2">Resolved By</h3>
                <div className="bg-white p-3 rounded">
                  <p className="font-bold">{viewingTicket.resolvedBy?.displayName}</p>
                  <p className="text-sm text-gray-600">@{viewingTicket.resolvedBy?.username}</p>
                  <p className="text-sm text-gray-600">{viewingTicket.resolvedBy?.email}</p>
                </div>
              </div>

              {/* User Information */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-bold text-gray-900 mb-2">User Information</h3>
                <div className="bg-white p-3 rounded">
                  <p className="font-bold">{viewingTicket.user?.displayName}</p>
                  <p className="text-sm text-gray-600">@{viewingTicket.user?.username}</p>
                  <p className="text-sm text-gray-600">{viewingTicket.user?.email}</p>
                </div>
              </div>

              {/* Ticket Details */}
              <div className="border rounded-lg p-4 bg-purple-50">
                <h3 className="font-bold text-purple-900 mb-2">Ticket Information</h3>
                <div className="space-y-2">
                  <div className="bg-white p-3 rounded">
                    <p className="text-sm text-gray-600">Ticket ID</p>
                    <p className="font-mono text-sm">{viewingTicket._id}</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-sm text-gray-600">Subject</p>
                    <p className="font-bold">{viewingTicket.subject}</p>
                  </div>
                  {viewingTicket.message && (
                    <div className="bg-white p-3 rounded">
                      <p className="text-sm text-gray-600">Message</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{viewingTicket.message}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-bold text-gray-900 mb-2">Timeline</h3>
                <div className="space-y-2">
                  <div className="bg-white p-3 rounded">
                    <p className="text-sm text-gray-600">Created At</p>
                    <p className="font-medium">{new Date(viewingTicket.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-sm text-gray-600">Resolved At</p>
                    <p className="font-medium">{new Date(viewingTicket.resolvedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <button
                onClick={() => setViewingTicket(null)}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
