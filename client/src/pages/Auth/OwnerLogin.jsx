import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../../components/common/Loading';
import ErrorDisplay from '../../components/common/ErrorDisplay';

const OwnerLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const { ownerLogin, currentUser, isOwner } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated - Fixed with additional checks
  useEffect(() => {
    if (currentUser && isOwner()) {
      const redirectPath = location.state?.from?.pathname || '/owner/dashboard';
      
      // Only redirect if we're not already on the target path
      if (location.pathname !== redirectPath) {
        console.log("Redirecting authenticated owner to:", redirectPath);
        navigate(redirectPath, { 
          replace: true,
          state: { ...location.state, preventLoop: true } // Add loop prevention flag
        });
      }
    }
  }, [currentUser, navigate, isOwner, location]);

  const validateForm = () => {
    const errors = {};
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError('');
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      await ownerLogin(formData);
      
      // Get the intended path or default dashboard
      const redirectPath = location.state?.from?.pathname || '/owner/dashboard';
      
      // Use setTimeout to ensure state updates before navigation
      setTimeout(() => {
        console.log('Login successful, redirecting to:', redirectPath);
        navigate(redirectPath, { 
          replace: true,
          state: { ...location.state, preventLoop: true }
        });
      }, 50);
    } catch (err) {
      console.error("Login error:", err);
      
      let errorMessage = 'Login failed. Please try again.';
      if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (err.message.includes('token')) {
        errorMessage = 'Authentication error. Please try again.';
      } else if (err.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (typeof err.message === 'string' && err.message.includes('<html')) {
        errorMessage = 'Server error occurred. Please try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Owner Portal</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage your business
          </p>
        </div>
        
        {error && (
          <ErrorDisplay type="error" message={error} onClose={() => setError('')} />
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  formErrors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  formErrors.password ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
            >
              {loading ? (
                <Loading className="h-5 w-5 text-white" />
              ) : (
                'Sign in'
              )}
            </button>
          </div>
          
          <div className="text-center text-sm">
            <Link
              to="/"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              ← Back to login selection
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OwnerLogin;