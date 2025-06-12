import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavigationGuard = () => {
  const { isAuthenticated, user, getRoleBasedRedirect } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // List of routes that authenticated users should not access
    const authRoutes = ['/login', '/register', '/forgot-password', '/'];
    const resetPasswordRoute = '/reset-password';

    const checkAndRedirect = () => {
      // Check if current path is an auth route or reset password route
      const isAuthRoute = authRoutes.includes(location.pathname);
      const isResetPasswordRoute = location.pathname.startsWith(resetPasswordRoute);

      // If user is authenticated and trying to access auth routes
      if (isAuthenticated && user && (isAuthRoute || isResetPasswordRoute)) {
        console.log('NavigationGuard: Preventing access to auth route for authenticated user');

        // Get the appropriate redirect path based on user role
        const redirectPath = getRoleBasedRedirect(user.role);

        // Navigate to dashboard and replace history to prevent back button issues
        navigate(redirectPath, { replace: true });
      }
    };

    // Check on location change
    checkAndRedirect();

    // Handle browser back/forward navigation
    const handlePopState = (event) => {
      console.log('NavigationGuard: Browser navigation detected');
      // Small delay to ensure location has updated
      setTimeout(checkAndRedirect, 10);
    };

    // Add event listener for browser navigation
    window.addEventListener('popstate', handlePopState);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated, user, location.pathname, navigate, getRoleBasedRedirect]);

  // Also handle initial load and auth state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      const authRoutes = ['/login', '/register', '/forgot-password', '/'];
      const resetPasswordRoute = '/reset-password';

      const isAuthRoute = authRoutes.includes(location.pathname);
      const isResetPasswordRoute = location.pathname.startsWith(resetPasswordRoute);

      if (isAuthRoute || isResetPasswordRoute) {
        console.log('NavigationGuard: Auth state changed, redirecting from auth route');
        const redirectPath = getRoleBasedRedirect(user.role);
        navigate(redirectPath, { replace: true });
      }
    }
  }, [isAuthenticated, user]);

  // This component doesn't render anything
  return null;
};

export default NavigationGuard;
