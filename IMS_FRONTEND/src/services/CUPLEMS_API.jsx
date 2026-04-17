import axios from 'axios';

/**
 * Axios instance for calling CUPLEMS (ASP.NET) backend.
 * withCredentials: true sends the IMS `token` HTTP-only cookie automatically,
 * which CUPLEMS validates using the same JWT_SECRET as IMS.
 */
const CUPLEMS_API = axios.create({
  baseURL: import.meta.env.VITE_CUPLEMS_URL ?? 'http://localhost:5001',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor: surface CUPLEMS error messages
CUPLEMS_API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.title ||
      error.response?.data?.message ||
      error.response?.data ||
      error.message ||
      'An error occurred with the employee service.';
    return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)));
  }
);

export default CUPLEMS_API;
