import { useState } from 'react';
import { useQuery } from 'react-query';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { Briefcase, ShoppingBag, Wallet, TrendingUp, Package, DollarSign } from 'lucide-react';
import api from '../lib/axios';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [viewMode, setViewMode] = useState('seller');

  const { data: stats } = useQuery('dashboard-stats', async () => {
    const res = await api.get('/users/stats');
    return res.data.stats;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {user?.displayName}!</h1>
        
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('seller')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'seller' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Seller Dashboard
          </button>
          <button
            onClick={() => setViewMode('buyer')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'buyer' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Buyer Dashboard
          </button>
        </div>
      </div>

      {viewMode === 'seller' ? (
        <>
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Orders</p>
                  <p className="text-2xl font-bold">{stats?.activeOrders || 0}</p>
                </div>
                <Briefcase className="w-10 h-10 text-primary-600" />
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Gigs</p>
                  <p className="text-2xl font-bold">{stats?.totalGigs || 0}</p>
                </div>
                <ShoppingBag className="w-10 h-10 text-green-600" />
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Available Balance</p>
                  <p className="text-2xl font-bold">{stats?.balance?.toFixed(3) || '0.000'} HIVE</p>
                </div>
                <Wallet className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Earnings</p>
                  <p className="text-2xl font-bold">{stats?.totalEarnings?.toFixed(3) || '0.000'} HIVE</p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link to="/gigs/create" className="block p-3 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors">
                  <Package className="w-5 h-5 inline mr-2" />
                  Create New Gig
                </Link>
                <Link to="/orders?type=selling" className="block p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  <Briefcase className="w-5 h-5 inline mr-2" />
                  View Selling Orders
                </Link>
                <Link to="/wallet" className="block p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  <Wallet className="w-5 h-5 inline mr-2" />
                  Manage Wallet
                </Link>
                <Link to="/withdrawals" className="block p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  <DollarSign className="w-5 h-5 inline mr-2" />
                  Request Withdrawal
                </Link>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold mb-4">Profile Completion</h2>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-semibold">{user?.profileCompletion || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${user?.profileCompletion || 0}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {user?.profileCompletion >= 60 
                  ? '✓ You can create gigs!' 
                  : `Complete ${60 - (user?.profileCompletion || 0)}% more to create gigs`}
              </p>
              <Link to="/profile/edit" className="btn-primary w-full text-center block">
                Complete Profile
              </Link>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Purchases</p>
                  <p className="text-2xl font-bold">{stats?.activePurchases || 0}</p>
                </div>
                <ShoppingBag className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Purchases</p>
                  <p className="text-2xl font-bold">{stats?.totalPurchases || 0}</p>
                </div>
                <Package className="w-10 h-10 text-green-600" />
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Spent</p>
                  <p className="text-2xl font-bold">{stats?.totalSpent?.toFixed(3) || '0.000'} HIVE</p>
                </div>
                <DollarSign className="w-10 h-10 text-purple-600" />
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Saved Services</p>
                  <p className="text-2xl font-bold">{stats?.savedGigs || 0}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link to="/search" className="block p-3 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors">
                  <ShoppingBag className="w-5 h-5 inline mr-2" />
                  Browse Services
                </Link>
                <Link to="/orders?type=buying" className="block p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  <Package className="w-5 h-5 inline mr-2" />
                  View My Purchases
                </Link>
                <Link to="/messages" className="block p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  <Briefcase className="w-5 h-5 inline mr-2" />
                  Messages
                </Link>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              <p className="text-gray-600 text-sm">Your recent purchases and interactions will appear here</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
