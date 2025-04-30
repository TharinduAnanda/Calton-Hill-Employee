import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000', // Remove any trailing /api here
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authorization token to requests
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request setup error:', error);
    return Promise.reject(error);
  }
);

// Add more flexible content-type validation
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Improved error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Server Error:', error.response.status, error.response.data);
      
      // Only check content type for successful responses
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
    return Promise.reject(error);
  }
);

// Server route setup example
// Removed undefined 'app' usage as it is not relevant in this file
// app.use('/api/auth', require('./routes/authRoutes'));

export default instance;