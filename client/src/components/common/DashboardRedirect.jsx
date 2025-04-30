import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Component to redirect users to the appropriate dashboard based on role
 */
function DashboardRedirect() {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  switch (currentUser.role) {
    case 'owner':
      return <Navigate to="/owner/dashboard" replace />;
    case 'manager':
      return <Navigate to="/staff/dashboard" replace />;
    case 'staff':
      return <Navigate to="/staff/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export default DashboardRedirect;