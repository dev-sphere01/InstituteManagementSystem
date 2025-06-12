import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeStore } from '../store';

/**
 * PermissionGuard Component
 * 
 * Protects components/routes based on user permissions and roles
 * 
 * Props:
 * - permissions: Array of required permissions (user must have at least one)
 * - allPermissions: Array of required permissions (user must have all)
 * - roles: Array of required roles (user must have at least one)
 * - fallback: Component to render when access is denied
 * - showFallback: Whether to show fallback or hide component entirely
 * - children: Components to render when access is granted
 */
const PermissionGuard = ({
  permissions = [],
  allPermissions = [],
  roles = [],
  fallback = null,
  showFallback = true,
  children
}) => {
  const { user, hasPermission, hasAnyPermission, hasAllPermissions, hasRole } = useAuth();
  const { isDarkMode } = useThemeStore();

  // If no user is logged in, deny access
  if (!user) {
    return showFallback ? (fallback || <AccessDenied />) : null;
  }

  // Check role-based access
  if (roles.length > 0) {
    const hasRequiredRole = roles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return showFallback ? (fallback || <AccessDenied reason="insufficient_role" />) : null;
    }
  }

  // Check permission-based access (any permission)
  if (permissions.length > 0) {
    const hasRequiredPermission = hasAnyPermission(permissions);
    if (!hasRequiredPermission) {
      return showFallback ? (fallback || <AccessDenied reason="insufficient_permissions" />) : null;
    }
  }

  // Check permission-based access (all permissions)
  if (allPermissions.length > 0) {
    const hasAllRequiredPermissions = hasAllPermissions(allPermissions);
    if (!hasAllRequiredPermissions) {
      return showFallback ? (fallback || <AccessDenied reason="insufficient_permissions" />) : null;
    }
  }

  // Access granted
  return children;
};

/**
 * Default Access Denied Component
 */
const AccessDenied = ({ reason = 'access_denied' }) => {
  const { isDarkMode } = useThemeStore();

  const getReasonMessage = () => {
    switch (reason) {
      case 'insufficient_role':
        return {
          title: 'Insufficient Role',
          message: 'Your current role does not have access to this feature.',
          icon: '🔐'
        };
      case 'insufficient_permissions':
        return {
          title: 'Insufficient Permissions',
          message: 'You do not have the required permissions to access this feature.',
          icon: '🚫'
        };
      default:
        return {
          title: 'Access Denied',
          message: 'You do not have permission to access this feature.',
          icon: '⛔'
        };
    }
  };

  const { title, message, icon } = getReasonMessage();

  return (
    <div className={`flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed ${
      isDarkMode 
        ? 'border-gray-600 bg-gray-800/50 text-gray-300' 
        : 'border-gray-300 bg-gray-50 text-gray-600'
    }`}>
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className={`text-lg font-semibold mb-2 ${
        isDarkMode ? 'text-gray-200' : 'text-gray-800'
      }`}>
        {title}
      </h3>
      <p className="text-center text-sm max-w-md">
        {message}
      </p>
      <div className="mt-4">
        <button
          onClick={() => window.history.back()}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isDarkMode
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

/**
 * Higher-order component for permission-based access
 */
export const withPermissions = (permissions = [], options = {}) => {
  return (WrappedComponent) => {
    const PermissionWrappedComponent = (props) => {
      return (
        <PermissionGuard permissions={permissions} {...options}>
          <WrappedComponent {...props} />
        </PermissionGuard>
      );
    };

    PermissionWrappedComponent.displayName = `withPermissions(${WrappedComponent.displayName || WrappedComponent.name})`;
    
    return PermissionWrappedComponent;
  };
};

/**
 * Hook for checking permissions in components
 */
export const usePermissions = () => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, user } = useAuth();

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    user,
    canAccess: (permissions = [], roles = []) => {
      if (roles.length > 0 && !roles.some(role => hasRole(role))) {
        return false;
      }
      if (permissions.length > 0 && !hasAnyPermission(permissions)) {
        return false;
      }
      return true;
    }
  };
};

/**
 * Component for conditional rendering based on permissions
 */
export const PermissionCheck = ({ 
  permissions = [], 
  roles = [], 
  fallback = null, 
  children 
}) => {
  const { canAccess } = usePermissions();
  
  if (canAccess(permissions, roles)) {
    return children;
  }
  
  return fallback;
};

/**
 * Button component with permission checking
 */
export const PermissionButton = ({ 
  permissions = [], 
  roles = [], 
  disabled = false,
  children, 
  ...props 
}) => {
  const { canAccess } = usePermissions();
  const { isDarkMode } = useThemeStore();
  
  const hasAccess = canAccess(permissions, roles);
  const isDisabled = disabled || !hasAccess;
  
  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`${props.className || ''} ${
        isDisabled 
          ? `opacity-50 cursor-not-allowed ${
              isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
            }` 
          : ''
      }`}
      title={!hasAccess ? 'You do not have permission to perform this action' : props.title}
    >
      {children}
    </button>
  );
};

export default PermissionGuard;
