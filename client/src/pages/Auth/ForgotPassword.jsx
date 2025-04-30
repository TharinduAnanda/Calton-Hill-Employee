import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Alert, CircularProgress, Link as MuiLink } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await authService.requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Password reset failed. Please try again.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="sm" className="forgot-password-container">
      <Paper elevation={3} className="forgot-password-paper">
        <Typography variant="h4" component="h1" className="forgot-password-title">
          Reset Password
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success ? (
          <Box className="success-message">
            <Alert severity="success" sx={{ mb: 3 }}>
              If an account exists with that email, we've sent password reset instructions.
            </Alert>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Please check your email for further instructions to reset your password.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                component={Link} 
                to="/owner-login"
                className="back-to-login-button"
              >
                Return to Login
              </Button>
              <Button 
                variant="outlined" 
                onClick={handleBackToHome}
                className="back-to-home-button"
              >
                Back to Home
              </Button>
            </Box>
          </Box>
        ) : (
          <>
            <Typography variant="body1" className="forgot-password-subtitle">
              Enter your email address and we'll send you instructions to reset your password.
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit} className="forgot-password-form">
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                className="form-input"
              />
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                className="submit-button"
              >
                {loading ? <CircularProgress size={24} /> : 'Send Reset Instructions'}
              </Button>
            </Box>
            
            <Box className="back-link">
              <MuiLink 
                component={Link} 
                to="/owner-login" 
                className="back-to-login-link"
              >
                &larr; Back to login
              </MuiLink>
              <Box sx={{ mt: 1 }}>
                <MuiLink 
                  onClick={handleBackToHome} 
                  className="back-to-home-link"
                  sx={{ cursor: 'pointer' }}
                >
                  Return to Home Page
                </MuiLink>
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default ForgotPassword;