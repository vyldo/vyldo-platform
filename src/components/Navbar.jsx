import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Search, Menu, X, Bell, MessageCircle, User, LogOut, Briefcase, Wallet, Settings, Shield } from 'lucide-react';
import { useState } from 'react';
import AvailabilityToggle from './AvailabilityToggle';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="https://images.hive.blog/DQmTpydjYqPqF4qJuLXfHXzWs1VeuNhAawMrsqjt9qDiyEJ/Logo.png" 
                alt="Vyldo" 
                className="h-8 sm:h-10 w-auto object-contain"
              />
            </Link>

            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for services..."
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
            </form>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                {/* Availability Toggle for Team Members */}
                <AvailabilityToggle variant="compact" />
                
                <Link to="/messages" className="text-gray-600 hover:text-gray-900 p-2">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                </Link>
                <Link to="/notifications" className="text-gray-600 hover:text-gray-900 p-2">
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.displayName} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">{user.displayName?.[0]?.toUpperCase()}</span>
                      </div>
                    )}
                    <span className="font-medium text-gray-700">{user.displayName}</span>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                      <Link
                        to={`/profile/${user.username}`}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="w-5 h-5" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Briefcase className="w-5 h-5" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/wallet"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Wallet className="w-5 h-5" />
                        <span>Wallet</span>
                      </Link>
                      <Link
                        to="/profile/edit"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="w-5 h-5" />
                        <span>Settings</span>
                      </Link>
                      {(user.role === 'admin' || user.role === 'team') && (
                        <>
                          <hr className="my-2" />
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-4 py-2 text-purple-600 hover:bg-purple-50"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Shield className="w-5 h-5" />
                            <span>Admin Panel</span>
                          </Link>
                        </>
                      )}
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 w-full"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 font-medium hover:text-primary-600 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary">
                  Join Now
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for services..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
                />
              </div>
            </form>

            {user ? (
              <div className="space-y-2">
                <Link to="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  Dashboard
                </Link>
                <Link to="/messages" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  Messages
                </Link>
                <Link to="/wallet" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  Wallet
                </Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link to="/login" className="block btn-secondary w-full text-center">
                  Sign In
                </Link>
                <Link to="/register" className="block btn-primary w-full text-center">
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
