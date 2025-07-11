import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Token is handled via HTTP-only cookies, no need to add Authorization header
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear local storage and cookies
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');

      // Clear token cookie
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

      // Only redirect if not already on auth pages
      const currentPath = window.location.pathname;
      const authPaths = ['/login', '/register', '/forgot-password', '/', '/reset-password'];

      if (!authPaths.some(path => currentPath.startsWith(path))) {
        console.log('401 error - redirecting to login');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const API = {
  get: (url, config = {}) => instance.get(url, config),
  post: (url, data = {}, config = {}) => instance.post(url, data, config),
  put: (url, data = {}, config = {}) => instance.put(url, data, config),
  delete: (url, config = {}) => instance.delete(url, config),
  patch: (url, data = {}, config = {}) => instance.patch(url, data, config),

  // Authentication endpoints
  auth: {
    login: (credentials) => instance.post('/users/login', credentials),
    register: (userData) => instance.post('/users/register', userData),
    logout: () => instance.get('/users/logout'),
    forgotPassword: (email) => instance.post('/users/password/forgot', { email }),
    resetPassword: (token, password, confirmPassword) =>
      instance.put(`/users/password/reset/${token}`, { password, confirmPassword }),
    changePassword: (oldPassword, newPassword) =>
      instance.put('/users/password/change', { oldPassword, newPassword }),
    getCurrentUser: () => instance.get('/users/me'),

    // Initialize Google OAuth
    initGoogleAuth: () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

      if (!clientId || !redirectUri) {
        throw new Error('Google OAuth configuration missing');
      }

      const scopes = [
        'openid',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ].join(' ');

      const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(clientId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(scopes)}` +
        `&access_type=offline` +
        `&prompt=consent`;

      return { url };
    },

    handleGoogleCallback: (code) =>
      instance.post('/auth/google/callback', {
        code,
        redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI
      }),
  },

  // User management endpoints
  users: {
    getAll: (params = {}) => instance.get('/users/admin/users', { params }),
    getById: (id) => instance.get(`/users/admin/user/${id}`),
    create: (userData) => instance.post('/users/register', userData),
    update: (id, userData) => instance.put(`/users/admin/user/${id}`, userData),
    delete: (id) => instance.delete(`/users/admin/user/${id}`),
    updateStatus: (id, status) => instance.put(`/users/admin/user/${id}/status`, { status }),
    unlock: (id) => instance.put(`/users/admin/user/${id}/unlock`),
    getStats: () => instance.get('/users/admin/stats'),
    search: (params = {}) => instance.get('/users/admin/search', { params }),
    quickSearch: (query, limit = 5) => instance.get('/users/admin/quick-search', {
      params: { q: query, limit }
    }),
    getSuggestions: (field, term, limit = 10) => instance.get('/users/admin/suggestions', {
      params: { field, term, limit }
    }),
    advancedSearch: (params = {}) => instance.get('/users/admin/advanced-search', { params })
  },

  // Role management endpoints
  roles: {
    getAll: (params = {}) => instance.get('/roles', { params }),
    getById: (id) => instance.get(`/roles/${id}`),
    create: (roleData) => instance.post('/roles', roleData),
    update: (id, roleData) => instance.put(`/roles/${id}`, roleData),
    delete: (id) => instance.delete(`/roles/${id}`),
    getPermissions: () => instance.get('/roles/permissions'),
    updatePermissions: (id, permissions) => instance.put(`/roles/${id}/permissions`, { permissions }),
    search: (params = {}) => instance.get('/roles/search', { params }),
    getStats: () => instance.get('/roles/stats')
  },

  // Log management endpoints
  logs: {
    getAll: (params = {}) => instance.get('/logs', { params }),
    getById: (id) => instance.get(`/logs/${id}`),
    delete: (id) => instance.delete(`/logs/${id}`),
    export: (params = {}) => instance.get('/logs/export', { params, responseType: 'blob' })
  }
};

export default API;
