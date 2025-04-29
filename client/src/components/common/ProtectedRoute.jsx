import React, { useEffect, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loading from './Loading';

/**
 * Enhanced ProtectedRoute component with:
 * - Role-based access control
 * - Loading states
 * - Custom fallback paths
 * - Detailed debugging
 * - Multiple authentication types (owner/staff)
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  fallbackPath = null,
  authType = null // 'owner' | 'staff' | null
}) => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group('[ProtectedRoute] Authentication Check');
      console.log('Current Path:', location.pathname);
      console.log('Auth State:', {
        isAuthenticated,
        currentUser: currentUser ? { 
          id: currentUser.id,
          role: currentUser.role,
          email: currentUser.email.substring(0, 3) + '...' // Truncate for security
        } : null,
        allowedRoles,
        authType,
        loading
      });
      console.groupEnd();
    }
  }, [location, currentUser, loading, allowedRoles, authType, isAuthenticated]);

  // Memoized role check
  const hasRequiredRole = useMemo(() => {
    if (!allowedRoles.length) return true;
    if (!currentUser?.role) return false;
    return allowedRoles.includes(currentUser.role);
  }, [currentUser, allowedRoles]);

  // Check if authType matches (owner/staff specific routes)
  const isCorrectAuthType = useMemo(() => {
    if (!authType) return true;
    return currentUser?.role === authType;
  }, [currentUser, authType]);

  // Show loading indicator while auth state is being determined
  if (loading || isAuthenticated === null) {
    return <Loading fullPage />;
  }

  // 1. Check if user needs to authenticate
  if (!isAuthenticated || !currentUser) {
    const loginPath = authType === 'owner' 
      ? '/owner-login' 
      : authType === 'staff' 
        ? '/staff-login' 
        : '/login';

    return (
      <Navigate 
        to={loginPath}
        state={{ 
          from: location,
          message: 'Please login to access this page',
          requiredRoles: allowedRoles
        }} 
        replace
      />
    );
  }

  // 2. Check if user has the correct auth type (owner/staff)
  if (!isCorrectAuthType) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `Auth type mismatch: Route requires ${authType} but user is ${currentUser.role}`
      );
    }
    return <Navigate to="/unauthorized" state={{ attemptedPath: location.pathname }} replace />;
  }

  // 3. Check role permissions
  if (!hasRequiredRole) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `Role restriction: Needs [${allowedRoles.join(', ')}] but has ${currentUser.role}`
      );
    }

    // Determine best fallback path
    const defaultFallback = currentUser.role === 'owner' 
      ? '/owner/dashboard' 
      : '/staff/dashboard';

    return (
      <Navigate 
        to={fallbackPath || defaultFallback} 
        state={{ 
          attemptedPath: location.pathname,
          requiredRoles: allowedRoles
        }}
        replace
      />
    );
  }

  // 4. All checks passed - render the protected content
  return children;
};

export default ProtectedRoute;