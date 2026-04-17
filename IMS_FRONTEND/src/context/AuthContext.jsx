import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../services/API';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Helper function to get cookie value
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;

  // Try multiple cookie name variations
  const cookieNames = [name, `${name}`, name.toLowerCase()];

  for (const cookieName of cookieNames) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${cookieName}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop().split(';').shift();
      if (cookieValue && cookieValue !== 'undefined' && cookieValue !== 'null') {
        console.log(`Found cookie ${cookieName}:`, cookieValue.substring(0, 20) + '...');
        return cookieValue;
      }
    }
  }

  console.log(`Cookie ${name} not found`);
  return null;
};

// Helper function to delete cookie
const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// Provider component that wraps the app and makes auth object available to any child component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);

  // Check if user is logged in on initial load
  useEffect(() => {
    // Debug: Log all cookies
    console.log('All cookies:', document.cookie);
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check for token in cookies and user in localStorage
      const token = getCookie('token');
      const savedUser = localStorage.getItem('user');

      console.log('Auth check - Token:', token ? 'exists' : 'missing');
      console.log('Auth check - Saved user:', savedUser ? 'exists' : 'missing');

      // If we have user data in localStorage, authenticate immediately
      // The token might be in an HTTP-only cookie that we can't read
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          console.log('Auth check - User data:', userData);

          // Set user data immediately to prevent redirect
          setIsAuthenticated(true);
          setUser(userData);
          setPermissions(userData.role?.permissions || userData.permissions || []);

          console.log('Auth check - User authenticated successfully');

          // Try to verify token with backend in background
          try {
            const response = await API.auth.getCurrentUser();
            if (response.success && response.user) {
              // Update with fresh user data
              setUser(response.user);
              setPermissions(response.user.role?.permissions || response.user.permissions || []);
              localStorage.setItem('user', JSON.stringify(response.user));
              console.log('Auth check - Token verified and user data updated');
            }
          } catch (error) {
            console.error('Token verification failed (continuing with cached data):', error);
            // If it's a 401, the axios interceptor will handle clearing auth
            // For other errors, continue with cached data
            if (error.response?.status !== 401) {
              console.log('Non-401 error, continuing with cached user data');
            }
          }
        } catch (parseError) {
          console.error('Failed to parse user data:', parseError);
          clearAuthState();
        }
      } else if (token) {
        // We have a token but no user data - try to get user info
        console.log('Auth check - Token exists but no user data, fetching user info');
        try {
          const response = await API.auth.getCurrentUser();
          if (response.success && response.user) {
            setIsAuthenticated(true);
            setUser(response.user);
            setPermissions(response.user.role?.permissions || response.user.permissions || []);
            localStorage.setItem('user', JSON.stringify(response.user));
            console.log('Auth check - User data fetched and authenticated');
          } else {
            clearAuthState();
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          clearAuthState();
        }
      } else {
        console.log('Auth check - No token or user data, clearing auth state');
        clearAuthState();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuthState();
    } finally {
      setLoading(false);
    }
  };

  const clearAuthState = () => {
    setIsAuthenticated(false);
    setUser(null);
    setPermissions([]);
    localStorage.removeItem('user');
    deleteCookie('token');
  };

  // Login function with role-based navigation
  const login = async (userData, token) => {
    try {
      setIsAuthenticated(true);
      setUser(userData);
      setPermissions(userData.role?.permissions || userData.permissions || []);

      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(userData));

      // Token is set via HTTP-only cookie by backend
      return {
        success: true,
        user: userData,
        redirectPath: getRoleBasedRedirect(userData.role)
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Get redirect path based on user role
  const getRoleBasedRedirect = (role) => {
    if (!role || !role.RoleName) return '/dashboard';

    const roleName = role.RoleName.toLowerCase();

    switch (roleName) {
      case 'student':
        return '/dashboard/student';
      case 'admin':
        return '/dashboard';
      default:
        return '/dashboard';
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call backend logout endpoint
      await API.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthState();

      // Clear browser history and redirect to login
      window.history.replaceState(null, '', '/login');
      window.location.href = '/login';
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!user) return false;
    const userPermissions = user.role?.permissions || user.permissions || permissions || [];
    if (userPermissions.includes('*')) return true;
    return userPermissions.includes(permission);
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissionList) => {
    if (!user || !Array.isArray(permissionList)) return false;
    const userPermissions = user.role?.permissions || user.permissions || permissions || [];
    if (userPermissions.includes('*')) return true;
    return permissionList.some(permission => userPermissions.includes(permission));
  };

  // Check if user has all specified permissions
  const hasAllPermissions = (permissionList) => {
    if (!user || !Array.isArray(permissionList)) return false;
    const userPermissions = user.role?.permissions || user.permissions || permissions || [];
    if (userPermissions.includes('*')) return true;
    return permissionList.every(permission => userPermissions.includes(permission));
  };

  // Check if user has specific role
  const hasRole = (roleName) => {
    if (!user || !user.role) return false;
    return user.role.RoleName.toLowerCase() === roleName.toLowerCase();
  };

  // Auth context value
  const value = {
    isAuthenticated,
    user,
    loading,
    permissions,
    login,
    logout,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    checkAuthStatus,
    getRoleBasedRedirect
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
