// Unauthorized.jsx
import React, { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';

const Unauthorized = () => {
  // Check if we're in a logout flow (no auth token)
  // If we are, immediately redirect to home page
  if (!localStorage.getItem('authToken')) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="unauthorized-page" style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>403 - Unauthorized</h1>
      <p>You don't have permission to access this page.</p>
      <Link to="/" className="return-link">
        Return to Home
      </Link>
    </div>
  );
};

export default Unauthorized;