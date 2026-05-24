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
  },

  // Branch management endpoints
  branches: {
    getAll: (params = {}) => instance.get('/branches', { params }),
    getById: (id) => instance.get(`/branches/${id}`),
    create: (data) => instance.post('/branches', data),
    update: (id, data) => instance.put(`/branches/${id}`, data),
    delete: (id) => instance.delete(`/branches/${id}`),
  },

  // CRM endpoints
  crm: {
    leads: {
      getAll: (params = {}) => instance.get('/leads', { params }),
      getById: (id) => instance.get(`/leads/${id}`),
      create: (data) => instance.post('/leads', data),
      update: (id, data) => instance.put(`/leads/${id}`, data),
      delete: (id) => instance.delete(`/leads/${id}`),
      addInteraction: (id, data) => instance.post(`/leads/${id}/interactions`, data),
      reassign: (id, assignedTo) => instance.put(`/leads/${id}/reassign`, { assignedTo }),
      bulkImport: (file) => {
        const form = new FormData();
        form.append('file', file);
        return instance.post('/leads/import', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      },
      getPipelineStats: (params = {}) => instance.get('/leads/stats/pipeline', { params }),
      runEscalation: () => instance.post('/leads/escalation/run'),
    },
    campaigns: {
      getAll: (params = {}) => instance.get('/campaigns', { params }),
      getById: (id) => instance.get(`/campaigns/${id}`),
      create: (data) => instance.post('/campaigns', data),
      update: (id, data) => instance.put(`/campaigns/${id}`, data),
      delete: (id) => instance.delete(`/campaigns/${id}`),
      getROI: (params = {}) => instance.get('/campaigns/roi', { params }),
      getOverallROI: () => instance.get('/campaigns/roi/overall'),
    },
  },
  workflows: {
    getAll: (params = {}) => instance.get('/workflows', { params }),
    getByAdmissionId: (admissionId) => instance.get(`/workflows/admission/${admissionId}`),
    updateTask: (id, taskId, taskData) => instance.patch(`/workflows/${id}/tasks/${taskId}`, taskData),
    sendReminder: (id, reminderData) => instance.post(`/workflows/${id}/reminders`, reminderData),
    escalateTask: (id, taskId, escalationData) => instance.post(`/workflows/${id}/tasks/${taskId}/escalate`, escalationData),
  },
  admissions: {
    getAll: (params = {}) => instance.get('/admissions', { params }),
    getById: (id) => instance.get(`/admissions/${id}`),
    updateLifecycleStatus: (id, status) => instance.patch(`/admissions/${id}/lifecycle`, { lifecycleStatus: status })
  },
  reports: {
    getLeads: (params = {}) => instance.get('/reports/leads', { params }),
    getBranches: (params = {}) => instance.get('/reports/branches', { params }),
    getTasks: (params = {}) => instance.get('/reports/tasks', { params }),
    getFees: (params = {}) => instance.get('/reports/fees', { params })
  }
};

export default API;
