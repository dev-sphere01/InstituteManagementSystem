import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import OuterLayout from '../layouts/OuterLayout';
import { useAuth } from '../context/AuthContext';

// This component prevents authenticated users from accessing auth routes
// If authenticated, it redirects to dashboard
// If not authenticated, it renders the OuterLayout with auth routes
const AuthProtectedRoutes = () => {
  // Get authentication state from context
  const { isAuthenticated, user, getRoleBasedRedirect, loading } = useAuth();
  const location = useLocation();

  // Prevent back button navigation to auth pages when logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      // Replace current history entry to prevent back navigation
      const redirectPath = getRoleBasedRedirect(user.role);
      window.history.replaceState(null, '', redirectPath);
    }
  }, [isAuthenticated, user, getRoleBasedRedirect]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, redirect to role-based dashboard and prevent back navigation
  if (isAuthenticated && user) {
    const redirectPath = getRoleBasedRedirect(user.role);

    // Use replace to prevent back button issues
    return <Navigate to={redirectPath} replace />;
  }

  // If not authenticated, render the OuterLayout with child routes
  return <OuterLayout />;
};

export default AuthProtectedRoutes;
