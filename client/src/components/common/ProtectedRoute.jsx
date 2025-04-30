import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [], fallbackPath = '/login' }) => {
  const { isAuthenticated, currentUser, loading } = useAuth();
  const location = useLocation();

  // Add debug logging
  console.log('[ProtectedRoute] Authentication Check');
  console.log('Current Path:', location.pathname);
  console.log('Auth State:', { isAuthenticated, currentUser, allowedRoles, loading });

  // Wait for authentication to complete
  if (loading) {
    return <div>Loading...</div>;
  }

  // Not authenticated
  if (!isAuthenticated || !currentUser) {
    return (
      <Navigate 
        to={currentUser?.role === 'owner' ? '/owner-login' : '/login'}
        state={{ from: location }}
        replace
      />
    );
  }

  // Check role authorization
  const hasRequiredRole = allowedRoles.includes(currentUser.role);
  if (!hasRequiredRole) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default ProtectedRoute;