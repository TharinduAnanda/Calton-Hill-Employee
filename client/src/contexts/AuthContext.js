import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    currentUser: null,
    loading: true,
    error: null
  });

  const initializeAuth = async () => {
    console.log('🚀 Initializing authentication...');
    try {
      const token = localStorage.getItem('token');
      console.log('📝 Token from localStorage:', token ? 'Found' : 'Not found');

      if (!token) {
        console.log('⚠️ No token found, setting unauthenticated state');
        setAuthState(prev => ({ ...prev, loading: false }));
        return;
      }

      // Use authService to verify token
      console.log('🔍 Verifying token...');
      const isValid = authService.verifyToken(token);
      console.log('✔️ Token validation result:', isValid ? 'Valid' : 'Invalid');

      if (!isValid) {
        console.log('❌ Token invalid, clearing auth data');
        authService.clearAuthData();
        setAuthState({
          isAuthenticated: false,
          currentUser: null,
          loading: false,
          error: 'Session expired. Please login again.'
        });
        return;
      }

      // Token is valid, get user data
      console.log('📊 Retrieving user data...');
      const userData = JSON.parse(localStorage.getItem('user'));
      console.log('👤 User data retrieved:', userData ? 'Success' : 'Failed');

      setAuthState({
        isAuthenticated: true,
        currentUser: userData,
        loading: false,
        error: null
      });
      console.log('✅ Authentication initialized successfully');

    } catch (error) {
      console.error('🔥 Auth initialization error:', error);
      authService.clearAuthData();
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Authentication initialization failed'
      }));
    }
  };

  useEffect(() => {
    console.log('🔄 Setting up auth interceptors and initializing...');
    authService.setupInterceptors();
    initializeAuth();
  }, []);

  const logout = () => {
    console.log('🚪 Logging out user...');
    authService.clearAuthData();
    setAuthState({
      isAuthenticated: false,
      currentUser: null,
      loading: false,
      error: null
    });
    console.log('👋 Logout complete');
  };

  console.log('🔐 Current auth state:', {
    isAuthenticated: authState.isAuthenticated,
    hasUser: !!authState.currentUser,
    loading: authState.loading,
    hasError: !!authState.error
  });

  return (
    <AuthContext.Provider value={{ ...authState, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('❌ useAuth called outside of AuthProvider!');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};