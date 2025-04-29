// Unauthorized.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <div className="unauthorized-page" style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>403 - Unauthorized</h1>
    <p>You don't have permission to access this page.</p>
    <Link to="/" className="return-link">
      Return to Home
    </Link>
  </div>
);

export default Unauthorized;