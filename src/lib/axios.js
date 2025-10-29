import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// XSS Protection: Sanitize input
const sanitizeInput = (data) => {
  if (typeof data === 'string') {
    return data
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  if (typeof data === 'object' && data !== null) {
    const sanitized = Array.isArray(data) ? [] : {};
    for (const key in data) {
      sanitized[key] = sanitizeInput(data[key]);
    }
    return sanitized;
  }
  return data;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF protection
  },
  timeout: 300000, // 5 minute timeout for large file uploads
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add request timestamp for replay attack prevention
  config.headers['X-Request-Time'] = Date.now();
  
  // Sanitize request data (only for POST/PUT/PATCH and non-file uploads)
  // Skip sanitization for settings endpoints (they contain file paths)
  const skipSanitization = config.url?.includes('/settings/');
  
  if (!skipSanitization && config.data && !(config.data instanceof FormData) && ['post', 'put', 'patch'].includes(config.method?.toLowerCase())) {
    config.data = sanitizeInput(config.data);
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle different error scenarios
    if (error.response?.status === 401) {
      // Unauthorized - logout user
      useAuthStore.getState().logout();
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Forbidden - show access denied
      console.error('Access denied:', error.response.data);
    } else if (error.response?.status === 429) {
      // Rate limit exceeded
      console.error('Too many requests. Please try again later.');
    } else if (error.response?.status >= 500) {
      // Server error
      console.error('Server error. Please try again later.');
    }
    
    // Log security-related errors
    if (error.response?.data?.security) {
      console.warn('Security alert:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;
