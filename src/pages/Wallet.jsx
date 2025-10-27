import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import { Wallet as WalletIcon, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';

export default function Wallet() {
  const [filter, setFilter] = useState('all');

  const { data: walletData } = useQuery('wallet', async () => {
    const res = await api.get('/wallet');
    return res.data;
  });

  const wallet = walletData?.wallet;

  // Get completed orders as transactions
  const { data: completedOrders } = useQuery('completed-orders-wallet', async () => {
    const res = await api.get('/orders?type=selling&status=completed');
    return res.data.orders;
  });

  // Convert orders to transaction format
  const transactions = completedOrders?.map(order => ({
    _id: order._id,
    type: 'credit',
    description: `Payment from order: ${order.gig?.title || 'Order'}`,
    amount: order.sellerEarnings || 0,
    createdAt: order.completedAt,
    balanceAfter: 0 // Will calculate
  })) || [];

  const getTransactionIcon = (type) => {
    if (['credit', 'release', 'refund'].includes(type)) {
      return <ArrowDownRight className="w-5 h-5 text-green-600" />;
    }
    return <ArrowUpRight className="w-5 h-5 text-red-600" />;
  };

  const getTransactionColor = (type) => {
    if (['credit', 'release', 'refund'].includes(type)) {
      return 'text-green-600';
    }
    return 'text-red-600';
  };

  const filteredTransactions = transactions?.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'income') return ['credit', 'release', 'refund'].includes(tx.type);
    if (filter === 'expenses') return ['debit', 'fee', 'withdrawal', 'hold'].includes(tx.type);
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Wallet</h1>
          <p className="text-gray-600 mt-2">Manage your HIVE earnings and transactions</p>
        </div>
        <Link to="/withdrawals" className="btn-primary">
          <DollarSign className="w-5 h-5 inline mr-2" />
          Request Withdrawal
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-primary-100 text-sm">Available Balance</p>
            <WalletIcon className="w-8 h-8 text-primary-200" />
          </div>
          <p className="text-4xl font-bold mb-1">
            {wallet?.balance?.available?.toFixed(3) || '0.000'}
          </p>
          <p className="text-primary-100 text-sm">HIVE</p>
          <p className="text-primary-200 text-xs mt-2">Ready to withdraw</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Pending Earnings</p>
            <TrendingUp className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {wallet?.balance?.pending?.toFixed(3) || '0.000'}
          </p>
          <p className="text-gray-600 text-sm">HIVE</p>
          <p className="text-gray-500 text-xs mt-2">From active/delivered orders</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Total Earnings</p>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {wallet?.totalEarnings?.toFixed(3) || '0.000'}
          </p>
          <p className="text-gray-600 text-sm">HIVE</p>
          <p className="text-gray-500 text-xs mt-2">All time earnings</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Transaction History</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('income')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'income' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setFilter('expenses')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'expenses' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Expenses
            </button>
          </div>
        </div>

        {!filteredTransactions || filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <WalletIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No transactions yet</p>
            <p className="text-sm text-gray-500">Your transaction history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div key={transaction._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-full">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 capitalize mt-1">
                      Type: {transaction.type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                    {['credit', 'release', 'refund'].includes(transaction.type) ? '+' : '-'}
                    {Math.abs(transaction.amount).toFixed(3)} HIVE
                  </p>
                  <p className="text-sm text-gray-600">
                    Balance: {transaction.balanceAfter?.toFixed(3)} HIVE
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="card bg-blue-50 border border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-2">About Platform Fees</h3>
          <p className="text-sm text-blue-800 mb-3">
            We charge a tiered fee based on your order value:
          </p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 1-2000 HIVE: <strong>9% fee</strong></li>
            <li>• 2000-5000 HIVE: <strong>8% fee</strong></li>
            <li>• 5000-9000 HIVE: <strong>7% fee</strong></li>
            <li>• 9000+ HIVE: <strong>6% fee</strong></li>
          </ul>
        </div>

        <div className="card bg-green-50 border border-green-200">
          <h3 className="text-lg font-bold text-green-900 mb-2">Withdrawal Information</h3>
          <p className="text-sm text-green-800 mb-3">
            Request withdrawals to your Hive account anytime.
          </p>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Minimum withdrawal: 1 HIVE</li>
            <li>• Processing time: 24-48 hours</li>
            <li>• Manual approval required</li>
            <li>• No withdrawal fees</li>
          </ul>
          <Link to="/withdrawals" className="btn-primary mt-4 inline-block">
            Request Withdrawal
          </Link>
        </div>
      </div>
    </div>
  );
}
