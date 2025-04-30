import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import './StaffLogin.css';

/**
 * Staff Login Page Component
 */
function StaffLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loginStaff } = useAuth(); // Changed from { login } to { loginStaff }

  /**
   * Handle input change events
   * @param {Object} e - Event object
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  /**
   * Validate form data format
   * @returns {boolean} - Form validity
   */
  const validateForm = () => {
    setError('');

    // Use authService to validate the email format
    if (!authService.validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!formData.password) {
      setError('Please enter your password');
      return false;
    }

    return true;
  };

  /**
   * Handle form submission
   * @param {Object} e - Event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // First, check if the staff credentials are valid using authService
      const isStaffValid = await authService.verifyStaff(formData.email);
      
      if (!isStaffValid) {
        setError('No staff account found with this email');
        setLoading(false);
        return;
      }
      
      // Now try to login using loginStaff instead of login
      await loginStaff(formData.email, formData.password);
      navigate('/staff/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="login-container">
      <Paper elevation={3} className="login-form">
        <Typography variant="h4" component="h1" className="form-title">
          Staff Login
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className="submit-button"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </form>
        
        <Box className="form-footer">
          <Button 
            color="primary" 
            onClick={() => navigate('/forgot-password')}
          >
            Forgot password?
          </Button>
          <Button 
            color="primary" 
            onClick={() => navigate('/')}
          >
            Back to user selection
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default StaffLogin;