import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { hasPermission } from "@/pages/Masters/Positions/components/hasPermissionService";

const ProtectedRoutes = ({ children }) => {
  const { isAuthenticated, needsPasswordChange } = useAuthStore();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user needs to change password and is not on welcome page, redirect to welcome
  if (needsPasswordChange() && location.pathname !== '/welcome') {
    return <Navigate to="/welcome" replace />;
  }

  // If user doesn't need to change password but is on welcome page, redirect to dashboard
  if (!needsPasswordChange() && location.pathname === '/welcome') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Permission-based route wrapper
export const PermissionRoute = ({ children, required, fallback = null }) => {
  const { isAuthenticated, needsPasswordChange } = useAuthStore();
  const location = useLocation();

  // First check authentication (same as ProtectedRoutes)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check password change requirement
  if (needsPasswordChange() && location.pathname !== '/welcome') {
    return <Navigate to="/welcome" replace />;
  }

  if (!needsPasswordChange() && location.pathname === '/welcome') {
    return <Navigate to="/dashboard" replace />;
  }

  // Check permission
  if (required && !hasPermission(required)) {
    // If fallback is provided, render it; otherwise redirect to unauthorized page
    if (fallback) {
      return fallback;
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500">Required permission: {required}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoutes;
