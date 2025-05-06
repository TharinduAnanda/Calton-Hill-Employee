import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Adjust the import path as needed

const DashboardRedirect = () => {
  const { user } = useAuth();
  
  // Redirect based on user role
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (user.role === 'owner') {
    return <Navigate to="/owner/dashboard" />;
  }
  
  if (user.role === 'manager' || user.role === 'staff') {
    return <Navigate to="/staff/dashboard" />;
  }
  
  // Fallback
  return <Navigate to="/unauthorized" />;
};

export default DashboardRedirect;