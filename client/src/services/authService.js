import axios from '../utils/axiosConfig';
import { jwtDecode } from 'jwt-decode';

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

// Helper functions
const validateJWT = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token structure' };
    }

    const payload = jwtDecode(token);
    
    if (!payload.userId || !payload.exp) {
      return { valid: false, error: 'Missing required token claims' };
    }

    if (Date.now() >= payload.exp * 1000) {
      return { valid: false, error: 'Token has expired' };
    }
    
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error: 'Invalid token: ' + error.message };
  }
};

const storeAuthData = (token, userData) => {
  try {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  } catch (error) {
    console.error('Storage error:', error);
    throw new Error('Failed to save authentication data');
  }
};

const clearAuthData = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Storage cleanup error:', error);
  }
};

const setupInterceptors = () => {
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axios.interceptors.response.use(
    (response) => {
      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('application/json')) {
        console.warn('Non-JSON response:', response);
        return Promise.reject(new Error('Invalid response format'));
      }
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        clearAuthData();
      }
      return Promise.reject(error);
    }
  );
};

// Initialize interceptors
setupInterceptors();

const authService = {
  validateEmail,
  verifyStaff,
  loginStaff,
  loginOwner,
  requestPasswordReset,
  resetPassword,
  verifyToken: (token) => {
    // Use the validateJWT helper function
    const result = validateJWT(token);
    return result.valid;
  },
  clearAuthData,
  setupInterceptors,
  // Export these functions for other components to use
  validateJWT,
  storeAuthData
};

export default authService;