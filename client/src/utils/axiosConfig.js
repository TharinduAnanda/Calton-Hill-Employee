import axios from 'axios';

// Create a new axios instance
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 30000, // Increase timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json'
  },
  // Add retry configuration
  retry: 3,
  retryDelay: 1000
});

// Token storage keys
const TOKEN_KEY = 'authToken';

// Fix for cancelToken issues in newer Axios versions
const fixCancelToken = config => {
  // Ensure the config object exists
  if (!config) {
    return { headers: {} };
  }
  
  // Make sure cancelToken is properly initialized
  if (config.cancelToken === undefined) {
    config.cancelToken = null;
  }
  
  return config;
};

// Get token with validation
const getValidToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  
  try {
    // Simple validation - check if token is properly formatted
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid token format detected, clearing token');
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    
    return token;
  } catch (err) {
    console.error('Error processing token:', err);
    return null;
  }
};

// Add request interceptor to add auth token
instance.interceptors.request.use(
  config => {
    // Apply cancelToken fix
    config = fixCancelToken(config);
    
    // Set retry count if not set
    config.retryCount = config.retryCount || 0;
    
    // Get the token with validation
    const token = getValidToken();
    
    // If token exists, add it to the request headers
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Special handling for PDF requests
    if (config.responseType === 'blob') {
      // Ensure proper headers for binary responses
      config.headers['Accept'] = 'application/pdf,*/*';
    }
    
    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Keep your existing response interceptor with enhanced error handling
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const config = error.config || {};
    
    // Don't retry if this is already a retry
    if (config.__isRetry) {
      return Promise.reject(error);
    }
    
    // Implement retry logic for network errors or 5xx server errors
    if (
      (error.code === 'ERR_NETWORK' || 
       (error.response && error.response.status >= 500)) && 
      config.retryCount < (instance.defaults.retry || 3)
    ) {
      // Increase the retry count
      config.retryCount = (config.retryCount || 0) + 1;
      config.__isRetry = true;
      
      console.log(`Retrying request (${config.retryCount}/${instance.defaults.retry || 3})...`);
      
      // Exponential backoff for retries
      const delay = Math.min(
        1000 * Math.pow(2, config.retryCount),
        30000 // Maximum 30 seconds delay
      );
      
      // Create a new promise to retry after delay
      return new Promise(resolve => {
        setTimeout(() => {
          // For possible CORS issues, try changing the withCredentials setting
          if (error.code === 'ERR_NETWORK' && config.retryCount > 1) {
            console.log('Network error persists, modifying request config for CORS compatibility');
            config.withCredentials = false;
          }
          resolve(instance(config));
        }, delay);
      });
    }
    
    // Enhanced error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Server Error:', error.response.status, error.response.data);
      
      // Handle authentication errors
      if (error.response.status === 401) {
        console.warn('Authentication error detected, clearing token');
        localStorage.removeItem(TOKEN_KEY);
        
        // Don't redirect here - let the component handle redirection
        // This prevents unexpected redirects during background requests
      }
      
      // Handle 400 Bad Request specifically
      if (error.response.status === 400) {
        error.message = error.response.data?.message || 'Invalid request parameters';
      }
      
      const contentType = error.response.headers['content-type'] || '';
      if (error.response.status === 200 && !contentType.includes('application/json')) {
        console.warn('Non-JSON response:', error.response);
        return Promise.reject(new Error('Server returned invalid content type'));
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request error:', error.message);
    }
    
    // Ensure the error has a proper message
    if (!error.message) {
      error.message = 'An unexpected error occurred';
    }
    
    return Promise.reject(error);
  }
);

// Enhanced token validation and restoration on startup
(function initializeAuth() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    try {
      // Check if token has basic valid structure
      const parts = token.split('.');
      if (parts.length === 3) {
        console.log('Restoring authentication token on startup');
        instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn('Removing invalid token from storage');
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error processing stored token:', error);
      localStorage.removeItem(TOKEN_KEY);
    }
  }
})();

export default instance;