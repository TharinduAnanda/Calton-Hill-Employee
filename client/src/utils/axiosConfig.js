import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000, // Increase timeout to 10 seconds (from 5 seconds)
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Keep your existing response interceptor with enhanced 400 error handling
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Enhanced error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Server Error:', error.response.status, error.response.data);
      
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

export default instance;