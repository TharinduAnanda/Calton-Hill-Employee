import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  validateStatus: function (status) {
    // Consider status codes less than 500 as success
    return status < 500;
  }
});

// Request interceptor
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    try {
      // Basic JWT structure validation
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        throw new Error('Malformed token structure');
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('login')) {
        window.location.href = '/owner-login?error=invalid_token';
      }
    }
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    // Check content-type if response exists
    const contentType = response.headers['content-type'];
    if (contentType && !contentType.includes('application/json')) {
      // Attempt to parse as JSON anyway (some servers misconfigured)
      try {
        if (typeof response.data === 'string') {
          response.data = JSON.parse(response.data);
        }
      } catch (e) {
        const error = new Error('Server returned invalid content type');
        error.response = {
          status: 406,
          data: {
            message: 'Server returned invalid content type',
            originalData: response.data.substring(0, 100) + '...'
          }
        };
        throw error;
      }
    }

    // Update token if present in response
    if (response.data?.token) {
      const tokenParts = response.data.token.split('.');
      if (tokenParts.length === 3) {
        localStorage.setItem('token', response.data.token);
      }
    }
    
    return response;
  },
  (error) => {
    // Enhanced error handling
    if (error.response) {
      // Handle HTML responses
      if (error.response.headers['content-type']?.includes('text/html')) {
        error.response.data = {
          message: 'Server error - please try again later',
          htmlResponse: true
        };
      }

      switch (error.response.status) {
        case 401:
          if (!error.config.url.includes('/auth/login')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/owner-login?error=session_expired';
          }
          break;
        case 403:
          window.location.href = '/unauthorized';
          break;
        case 406:
          console.error('Content type error:', error.response.data);
          break;
        default:
          console.error('API error:', {
            status: error.response.status,
            message: error.response.data?.message || 'Unknown error',
            url: error.config.url
          });
      }
    } else if (error.request) {
      console.error('Network error:', {
        message: 'No response received from server',
        url: error.config.url
      });
    } else {
      console.error('Request error:', error.message);
    }

    // Ensure we always return a consistent error structure
    const normalizedError = {
      message: error.response?.data?.message || 
               error.message || 
               'An unknown error occurred',
      status: error.response?.status,
      data: error.response?.data,
      isHtml: error.response?.headers['content-type']?.includes('text/html')
    };

    return Promise.reject(normalizedError);
  }
);

export default instance;