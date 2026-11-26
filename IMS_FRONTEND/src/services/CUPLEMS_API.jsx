import axios from 'axios';

/**
 * Axios instance for calling CUPLEMS (ASP.NET) backend.
 * withCredentials: true sends the IMS `token` HTTP-only cookie automatically,
 * which CUPLEMS validates using the same JWT_SECRET as IMS.
 */
const CUPLEMS_API = axios.create({
  baseURL: import.meta.env.VITE_CUPLEMS_URL || 'https://ems.prodevsphere.in',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

CUPLEMS_API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

CUPLEMS_API.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = null;

    if (error.response?.data?.errors && typeof error.response.data.errors === 'object') {
      const errs = error.response.data.errors;
      const formattedList = [];
      for (const [field, messages] of Object.entries(errs)) {
        const msgStr = Array.isArray(messages) ? messages.join(', ') : String(messages);
        formattedList.push(`${field}: ${msgStr}`);
      }
      if (formattedList.length > 0) {
        message = formattedList.join(' | ');
      }
    }

    if (!message) {
      message =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        error.response?.data?.title ||
        error.message ||
        'An error occurred with the employee service.';
    }

    return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)));
  }
);

export default CUPLEMS_API;
