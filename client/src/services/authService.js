import axios from '../utils/axiosConfig';
import { jwtDecode } from 'jwt-decode';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api';

// Helper functions
const validateJWT = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token structure' };
    }

    const payload = jwtDecode(token); // Changed from jwt_decode to jwtDecode
    
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

const handleAuthResponse = (data, role) => {
  const tokenValidation = validateJWT(data.token);
  if (!tokenValidation.valid) {
    throw new Error(tokenValidation.error);
  }

  const userData = {
    ...data.user,
    role: role || data.user.role,
    id: tokenValidation.payload.userId
  };

  if (!userData.email || !userData.id) {
    throw new Error('Incomplete user data in response');
  }

  storeAuthData(data.token, userData);

  return {
    token: data.token,
    user: userData,
    path: role
  };
};

// Main service functions
const ownerLogin = async (credentials) => {
  try {
    console.debug('Owner login initiated for:', credentials.email);
    
    if (!credentials?.email || !credentials?.password) {
      throw new Error('Email and password are required');
    }

    const response = await axios.post(`${API_URL}/auth/owner/login`, credentials, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.headers['content-type']?.includes('application/json')) {
      throw new Error('Server returned invalid content type');
    }

    if (!response.data?.token || !response.data?.user) {
      throw new Error(response.data?.message || 'Invalid server response structure');
    }

    return handleAuthResponse(response.data, 'owner');
  } catch (error) {
    console.error('Owner login failed:', {
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    let message = 'Authentication failed. Please try again.';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message.includes('Server returned')) {
      message = 'Server error - please contact support';
    }
    
    clearAuthData();
    throw new Error(message);
  }
};

// Setup interceptors
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

// Export all service functions
const authService = {
  ownerLogin,
  verifyToken: (token) => {
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      return decoded.exp > currentTime;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  },
  clearAuthData,
  setupInterceptors
};

export default authService;