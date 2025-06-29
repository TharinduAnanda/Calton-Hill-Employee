import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';

const ProtectedRoute = ({ children, allowedRoles = [], fallbackPath = '/login' }) => {
  const { isAuthenticated, currentUser, loading } = useAuth();
  const location = useLocation();

  // Debug localStorage contents when ProtectedRoute is loaded
  useEffect(() => {
    console.log('[ProtectedRoute] LocalStorage debug:', {
      authToken: localStorage.getItem('authToken'),
      user: localStorage.getItem('user'),
      parsedUser: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
    });
  }, []);

  // Check if there's a token in localStorage even if currentUser is not set
  const hasStoredToken = !!localStorage.getItem('authToken');
  
  // Try to get stored user data directly from localStorage as a backup
  const getStoredUserData = () => {
    try {
      const storedUserData = localStorage.getItem('user');
      return storedUserData ? JSON.parse(storedUserData) : null;
    } catch (error) {
      console.error('Error retrieving stored user data:', error);
      return null;
    }
  };
  
  const storedUserData = getStoredUserData();
  
  // IMPORTANT CHANGE: Check if token is valid using the validateJWT function
  const tokenIsValid = hasStoredToken && authService.validateJWT(localStorage.getItem('authToken')).valid;
  
  // If we have a valid token and stored user data, consider the user authenticated
  // even if the API /auth/me endpoint fails with 404
  const hasValidAuth = isAuthenticated || (tokenIsValid && storedUserData);

  // More detailed logging for troubleshooting
  useEffect(() => {
    console.log('[ProtectedRoute] Auth check for:', location.pathname);
    console.log('Auth state:', { 
      isAuthenticated, 
      hasUser: !!currentUser, 
      hasToken: hasStoredToken,
      tokenIsValid,
      hasStoredUser: !!storedUserData,
      storedUserData,
      userRole: currentUser?.role || storedUserData?.role,
      loading 
    });
  }, [isAuthenticated, currentUser, hasStoredToken, storedUserData, location.pathname, loading, tokenIsValid]);

  // Loading state - show a loading indicator while auth is being determined
  if (loading) {
    console.log('[ProtectedRoute] Still loading auth state...');
    return <div className="auth-loading">Loading authentication...</div>;
  }

  // If we have a valid token but no user yet, use the stored user data instead of reloading
  if (tokenIsValid && !currentUser && !loading && storedUserData) {
    console.log('[ProtectedRoute] Has valid token and stored user data, continuing');
    // We'll use the stored user data to avoid creating an infinite loop
    return children;
  }

  // Not authenticated
  if (!hasValidAuth) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to login');
    // Save the current location for redirect after login
    return (
      <Navigate 
        to={fallbackPath}
        state={{ from: location }}
        replace
      />
    );
  }

  // Check role authorization if roles are specified
  if (allowedRoles.length > 0) {
    const userRole = currentUser?.role || storedUserData?.role;
    if (!allowedRoles.includes(userRole)) {
      console.log('[ProtectedRoute] User does not have required role, redirecting');
      return <Navigate to="/unauthorized" replace />;
    }
  }

  console.log('[ProtectedRoute] Access granted to:', location.pathname);
  return children;
};

export default ProtectedRoute;