import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import GigDetail from './pages/GigDetail';
import CreateGig from './pages/CreateGig';
import EditGig from './pages/EditGig';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Checkout from './pages/Checkout';
import Messages from './pages/Messages';
import Wallet from './pages/Wallet';
import Withdrawals from './pages/Withdrawals';
import Search from './pages/Search';
import Category from './pages/Category';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import TeamManagement from './pages/admin/TeamManagement';
import TeamAnalytics from './pages/admin/TeamAnalytics';
import UserManagement from './pages/admin/UserManagement';
import GigManagement from './pages/admin/GigManagement';
import WithdrawalManagement from './pages/admin/WithdrawalManagement';
import SupportManagement from './pages/admin/SupportManagement';
import HeroSettings from './pages/admin/HeroSettings';
import HelpCenter from './pages/HelpCenter';
import TicketDetail from './pages/TicketDetail';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TrustAndSafety from './pages/TrustAndSafety';
import Notifications from './pages/Notifications';

// eslint-disable-next-line react/prop-types
function PrivateRoute({ children }) {
  const { user } = useAuthStore();
  return user ? children : <Navigate to="/login" />;
}

// eslint-disable-next-line react/prop-types
function AdminRoute({ children }) {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (user.role !== 'admin' && user.role !== 'team') {
    return <Navigate to="/" />;
  }
  
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="search" element={<Search />} />
        <Route path="category/:slug" element={<Category />} />
        <Route path="gigs/:id" element={<GigDetail />} />
        <Route path="profile/:username" element={<Profile />} />
        
        <Route path="dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="gigs/create" element={<PrivateRoute><CreateGig /></PrivateRoute>} />
        <Route path="gigs/:id/edit" element={<PrivateRoute><EditGig /></PrivateRoute>} />
        <Route path="gigs/:gigId/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
        <Route path="profile/edit" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
        <Route path="orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path="orders/:id" element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
        <Route path="messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
        <Route path="wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
        <Route path="withdrawals" element={<PrivateRoute><Withdrawals /></PrivateRoute>} />
        <Route path="admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="admin/team" element={<AdminRoute><TeamManagement /></AdminRoute>} />
        <Route path="admin/analytics" element={<AdminRoute><TeamAnalytics /></AdminRoute>} />
        <Route path="admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
        <Route path="admin/gigs" element={<AdminRoute><GigManagement /></AdminRoute>} />
        <Route path="admin/withdrawals" element={<AdminRoute><WithdrawalManagement /></AdminRoute>} />
        <Route path="admin/support" element={<AdminRoute><SupportManagement /></AdminRoute>} />
        <Route path="admin/hero-settings" element={<AdminRoute><HeroSettings /></AdminRoute>} />
        <Route path="help-center" element={<PrivateRoute><HelpCenter /></PrivateRoute>} />
        <Route path="help-center/:id" element={<PrivateRoute><TicketDetail /></PrivateRoute>} />
        <Route path="terms-of-service" element={<TermsOfService />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="trust-and-safety" element={<TrustAndSafety />} />
      </Route>
    </Routes>
  );
}

export default App;
