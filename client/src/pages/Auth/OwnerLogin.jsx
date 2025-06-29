import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Validates login form inputs
 * @param {Object} values - Form values object with email and password
 * @returns {Object} - Object containing errors and valid status
 */
function validateLoginForm(values) {
  const errors = {};
  
  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = 'Email is invalid';
  }
  
  if (!values.password) {
    errors.password = 'Password is required';
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
}

/**
 * Handles owner login submission
 * @param {Object} values - Form values
 * @param {Function} setIsSubmitting - Function to set submission state
 * @param {Function} setError - Function to set error message
 * @param {Object} auth - Auth context object with ownerLogin method
 * @param {Function} navigate - Navigate function for redirection
 * @returns {Promise<void>}
 */
function handleOwnerLogin(values, setIsSubmitting, setError, auth, navigate) {
  setIsSubmitting(true);
  setError('');
  
  console.log('[OwnerLogin] Starting login process...');
  
  return auth.ownerLogin(values.email, values.password)
    .then((result) => {
      console.log('[OwnerLogin] Login successful, checking localStorage:', result);
      
      // Debug localStorage state after login
      console.log('[OwnerLogin] localStorage after login:', {
        authToken: localStorage.getItem('authToken') ? 'exists' : 'missing',
        userData: localStorage.getItem('user'),
        parsedUser: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
      });
      
      // Force save user data if it's missing
      if (!localStorage.getItem('user') && result) {
        console.log('[OwnerLogin] User data missing, saving manually:', result);
        const userData = {
          owner_id: result.owner_id || result.id || result._id,
          name: result.name || `${result.first_name || ''} ${result.last_name || ''}`.trim(),
          email: values.email,
          role: 'owner',
          type: 'owner'
        };
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      navigate('/owner/dashboard'); // Explicitly navigate to owner dashboard
    })
    .catch(err => {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
    })
    .finally(() => {
      setIsSubmitting(false);
    });
}

/**
 * Owner Login Component
 */
function OwnerLogin() {
  const [values, setValues] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const auth = useAuth();
  
  /**
   * Handles input change
   * @param {Event} e - Change event
   */
  function handleChange(e) {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value
    });
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  }
  
  /**
   * Handles form submission
   * @param {Event} e - Form submission event
   */
  function handleSubmit(e) {
    e.preventDefault();
    
    const validation = validateLoginForm(values);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    // Make sure auth.ownerLogin is available
    if (typeof auth.ownerLogin !== 'function') {
      setError('Login functionality is not available. Please try again later.');
      console.error('ownerLogin is not a function in auth context:', auth);
      return;
    }
    
    handleOwnerLogin(values, setIsSubmitting, setError, auth, navigate);
  }
  
  return (
    <Box 
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}
    >
      <Paper 
        elevation={3} 
        sx={{
          padding: 4,
          width: '100%',
          maxWidth: '400px'
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Owner Login
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            margin="normal"
            error={Boolean(errors.email)}
            helperText={errors.email}
            disabled={isSubmitting}
          />
          
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            margin="normal"
            error={Boolean(errors.password)}
            helperText={errors.password}
            disabled={isSubmitting}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Login'}
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              <Link to="/auth/forgot-password">Forgot Password?</Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default OwnerLogin;