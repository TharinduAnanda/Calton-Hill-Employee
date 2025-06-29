import axios from '../utils/axiosConfig';
import { jwtDecode } from 'jwt-decode';

// Constants for storage
const TOKEN_KEY = 'authToken';
const USER_KEY = 'user';

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether the email is valid
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Verify if a staff member with the given email exists
 * @param {string} email - Staff email to verify
 * @returns {Promise<boolean>} - Whether the staff exists
 */
async function verifyStaff(email) {
  try {
    const response = await axios.post('/api/auth/verify-staff', { email });
    return response.data.exists;
  } catch (error) {
    // Only log errors that aren't 404 (since we know this endpoint might not exist yet)
    if (error.response?.status !== 404) {
      console.error('Staff verification error:', error);
    } else {
      console.log('Staff verification endpoint not implemented, skipping check');
    }
    // Continue with login process
    return true;
  }
}

/**
 * Login a staff member
 * @param {string} email - Staff email
 * @param {string} password - Staff password 
 * @returns {Promise} - Promise that resolves with the login response
 */
function loginStaff(email, password) {
  return axios.post('/api/auth/login', { email, password })
    .then(response => {
      // Store auth data on successful login
      if (response.data?.token) {
        storeAuthData(response.data.token, response.data.user || response.data.staff);
      }
      return response;
    });
}

/**
 * Login an owner
 * @param {string} email - Owner email
 * @param {string} password - Owner password
 * @returns {Promise} - Promise that resolves with the login response
 */
function loginOwner(email, password) {
  return axios.post('/api/auth/owner/login', { email, password })
    .then(response => {
      // Store auth data on successful login
      if (response.data?.token) {
        storeAuthData(response.data.token, response.data.user || response.data.owner);
      }
      return response;
    });
}

/**
 * Send password reset request
 * @param {string} email - User email
 * @returns {Promise} - Promise that resolves with the request response
 */
function requestPasswordReset(email) {
  return axios.post('/api/auth/password-reset-request', { email });
}

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} password - New password
 * @returns {Promise} - Promise that resolves with the reset response
 */
function resetPassword(token, password) {
  return axios.post('/api/auth/reset-password', { token, password });
}

// Enhanced JWT validation
const validateJWT = (token) => {
  if (!token) {
    return { valid: false, error: 'No token provided' };
  }

  try {
    // Check token format
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token structure' };
    }

    // Decode and validate
    const payload = jwtDecode(token);
    
    // Check for required claims
    if (!payload.exp) {
      return { valid: false, error: 'Missing expiration claim' };
    }

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime > payload.exp) {
      return { valid: false, error: 'Token has expired' };
    }
    
    return { valid: true, payload };
  } catch (error) {
    console.error('Token validation error:', error);
    return { valid: false, error: error.message };
  }
};

// Store authentication data securely
const storeAuthData = (token, userData) => {
  if (!token || !userData) {
    console.error('Invalid auth data provided');
    return false;
  }

  try {
    console.log('Storing auth data:', { token: token.slice(0, 15) + '...', userData });
    
    // Store token
    localStorage.setItem(TOKEN_KEY, token);
    
    // Log before storing to ensure consistent formatting
    const userString = typeof userData === 'string' ? userData : JSON.stringify(userData);
    console.log('About to store user data:', userString);
    
    // Ensure userData is properly serialized before storing
    localStorage.setItem(USER_KEY, userString);
    
    // Verify it was stored correctly
    console.log('localStorage after storing:', {
      [TOKEN_KEY]: localStorage.getItem(TOKEN_KEY) ? '(exists)' : '(missing)',
      [USER_KEY]: localStorage.getItem(USER_KEY)
    });
    
    // Also update axios headers
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return true;
  } catch (error) {
    console.error('Storage error:', error);
    return false;
  }
};

// Clear all auth data
const clearAuthData = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete axios.defaults.headers.common['Authorization'];
    return true;
  } catch (error) {
    console.error('Storage cleanup error:', error);
    return false;
  }
};

// Set up global axios interceptors
const setupInterceptors = () => {
  // Request interceptor - add token to all requests
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle auth errors
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.warn('Received 401 unauthorized response, clearing auth data');
        clearAuthData();
      }
      return Promise.reject(error);
    }
  );
};

// Initialize interceptors
setupInterceptors();

// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return !!token && validateJWT(token).valid;
};

// Get the current authenticated user
const getCurrentUser = () => {
  // Check if we're authenticated first
  if (!isAuthenticated()) {
    return null;
  }
  
  // Try to get user from localStorage
  try {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error retrieving current user:', error);
    return null;
  }
};

// Export the service
const authService = {
  // Public methods
  validateEmail,
  verifyStaff,
  loginStaff,
  loginOwner,
  requestPasswordReset,
  resetPassword,
  isAuthenticated,
  getCurrentUser,
  
  // Token management
  getToken: () => localStorage.getItem(TOKEN_KEY),
  storeToken: (token) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return true;
    }
    return false;
  },
  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    delete axios.defaults.headers.common['Authorization'];
    return true;
  },
  
  // User data management
  storeUser: (userData) => {
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      return true;
    }
    return false;
  },
  
  // Auth data management
  storeAuthData,
  clearAuthData,
  validateJWT,
  
  // Session management
  refreshSession: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    
    try {
      const response = await axios.get('/api/auth/refresh');
      
      if (response.data?.token) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Session refresh failed:', error);
      return false;
    }
  },

  // Debugging
  debugStorage: () => {
    try {
      console.log('Storage debug info:', {
        token: localStorage.getItem(TOKEN_KEY) ? 'exists' : 'missing',
        userData: localStorage.getItem(USER_KEY),
        parsedUser: localStorage.getItem(USER_KEY) ? JSON.parse(localStorage.getItem(USER_KEY)) : null,
        storageAvailable: typeof localStorage !== 'undefined'
      });
      return true;
    } catch (error) {
      console.error('Storage debug error:', error);
      return false;
    }
  }
};

export default authService;