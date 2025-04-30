import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to ensure proper URL formatting and add auth token
instance.interceptors.request.use(config => {
  // Ensure the URL is absolute by prepending baseURL if not already present
  if (!config.url.startsWith('http') && !config.url.startsWith(instance.defaults.baseURL)) {
    config.url = instance.defaults.baseURL + config.url;
  }
  
  // Add authorization token if available
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  console.log('Making request to:', config.url);
  return config}, error => {
  console.error('Request setup error:', error);
  return Promise.reject(error);
});

// Response interceptor for error handling
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('Server Error:', error.response.status, error.response.data);
      
      const contentType = error.response.headers['content-type'] || '';
      if (error.response.status === 200 && !contentType.includes('application/json')) {
        console.warn('Non-JSON response:', error.response);
        return Promise.reject(new Error('Server returned invalid content type'));
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default instance;