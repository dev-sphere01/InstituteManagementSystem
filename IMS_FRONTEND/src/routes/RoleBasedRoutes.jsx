import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InnerLayout from '../layouts/InnerLayout';
import StudentLayout from '../layouts/StudentLayout';

const RoleBasedRoutes = () => {
  const { isAuthenticated, user, loading } = useAuth();

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

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check user role and render appropriate layout
  const userRole = user?.role?.RoleName?.toLowerCase();

  if (userRole === 'student') {
    return (
      <StudentLayout>
        <Outlet />
      </StudentLayout>
    );
  }

  // Default to admin layout for all other roles
  return (
    <InnerLayout>
      <Outlet />
    </InnerLayout>
  );
};

export default RoleBasedRoutes;
