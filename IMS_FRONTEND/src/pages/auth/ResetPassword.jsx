import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useThemeStore } from '../../store';
import API from '../../services/API';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  
  const navigate = useNavigate();
  const { token } = useParams();
  const { login } = useAuth();
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    // Validate token on component mount
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await API.auth.resetPassword(
        token, 
        formData.password, 
        formData.confirmPassword
      );

      if (response.success && response.user) {
        setIsSuccess(true);
        
        // Auto-login the user after successful password reset
        const loginResult = await login(response.user, response.token);
        
        if (loginResult.success) {
          // Redirect after a short delay
          setTimeout(() => {
            navigate(loginResult.redirectPath);
          }, 2000);
        } else {
          // If auto-login fails, redirect to login page
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      let errorMessage = 'An error occurred while resetting your password';
      
      if (err.response?.status === 400) {
        errorMessage = err.response.data.message || 'Invalid or expired reset token';
        setTokenValid(false);
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="relative z-20 w-full max-w-md mx-auto">
        <div className={`${isDarkMode ? 'bg-red-900/50 border-red-800 text-red-200' : 'bg-red-100 border-red-400 text-red-700'} border px-4 py-3 rounded-md mb-4`}>
          <div className="flex items-center mb-3">
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Invalid Reset Link</span>
          </div>
          <p>This password reset link is invalid or has expired.</p>
          <div className="mt-4">
            <Link 
              to="/forgot-password" 
              className={`font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
            >
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="relative z-20 w-full max-w-md mx-auto">
        <div className={`${isDarkMode ? 'bg-green-900/50 border-green-800 text-green-200' : 'bg-green-100 border-green-400 text-green-700'} border px-4 py-3 rounded-md mb-4`}>
          <div className="flex items-center mb-3">
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Password Reset Successful</span>
          </div>
          <p>Your password has been successfully reset. You are being logged in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-20 w-full max-w-md mx-auto">
      <h1 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Set New Password
        </span>
      </h1>

      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6 text-center`}>
        Enter your new password below.
      </p>

      {error && (
        <div className={`${isDarkMode ? 'bg-red-900/50 border-red-800 text-red-200' : 'bg-red-100 border-red-400 text-red-700'} border px-4 py-3 rounded-md mb-4`}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div className="group">
          <label htmlFor="password" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2 sm:py-3 border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400 focus:border-blue-400' : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'} rounded-md focus:outline-none transition-colors duration-200`}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div className="group">
          <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Confirm New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2 sm:py-3 border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400 focus:border-blue-400' : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'} rounded-md focus:outline-none transition-colors duration-200`}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-2 sm:py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting Password...
              </>
            ) : 'Reset Password'}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Remember your password?{' '}
          <Link to="/login" className={`font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
