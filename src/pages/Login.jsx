import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';
import { LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [suspendedMessage, setSuspendedMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Math CAPTCHA
  const [num1, setNum1] = useState(Math.floor(Math.random() * 10) + 1);
  const [num2, setNum2] = useState(Math.floor(Math.random() * 10) + 1);
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const regenerateCaptcha = () => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
    setCaptchaAnswer('');
  };

  useEffect(() => {
    // Check if redirected from suspension
    if (location.state?.message) {
      setSuspendedMessage(location.state.message);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Verify CAPTCHA
    const correctAnswer = num1 + num2;
    if (parseInt(captchaAnswer) !== correctAnswer) {
      setError('Incorrect CAPTCHA answer. Please try again with new numbers.');
      regenerateCaptcha();
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/login', formData);
      setAuth(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img 
            src="https://images.hive.blog/DQmTpydjYqPqF4qJuLXfHXzWs1VeuNhAawMrsqjt9qDiyEJ/Logo.png" 
            alt="Vyldo" 
            className="h-16 w-auto mx-auto mb-4 object-contain"
          />
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <div className="card">
          {suspendedMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Account Suspended</h3>
                  <p className="text-red-700 text-sm">{suspendedMessage}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Security Check: What is {num1} + {num2}?
              </label>
              <input
                type="number"
                required
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                className="input-field"
                placeholder="Enter the answer"
              />
              <p className="text-xs text-gray-500 mt-1">Please solve this simple math problem to continue</p>
            </div>

            <button
              type="submit"
              disabled={loading || !captchaAnswer}
              className="btn-primary w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{' '}
              <Link to="/terms-of-service" target="_blank" className="text-primary-600 hover:text-primary-700">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link to="/privacy-policy" target="_blank" className="text-primary-600 hover:text-primary-700">
                Privacy Policy
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
