import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper 
} from '@mui/material';
import ShopIcon from '@mui/icons-material/Store';
import PeopleIcon from '@mui/icons-material/People';
import './UserTypeSelection.css';

const UserTypeSelection = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" className="user-selection-container">
      <Paper elevation={3} className="user-selection-paper">
        <Box className="app-logo">
          <ShopIcon fontSize="large" />
        </Box>
        
        <Typography variant="h4" className="selection-title">
          Store Management System
        </Typography>
        
        <Typography variant="body1" className="selection-subtitle">
          Select your login type to continue
        </Typography>
        
        <Box className="selection-buttons">
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => navigate('/owner-login')}
            className="owner-button"
            startIcon={<ShopIcon />}
          >
            Owner Portal
          </Button>
          
          <Typography variant="body2" className="option-divider">
            or
          </Typography>
          
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={() => navigate('/staff-login')}
            className="staff-button"
            startIcon={<PeopleIcon />}
          >
            Staff Portal
          </Button>
        </Box>
        
        <Box className="help-section">
          <Typography variant="body2" className="help-text">
            Need help? <span className="help-link" onClick={() => navigate('/help')}>Contact support</span>
          </Typography>
        </Box>
      </Paper>
      
      <Typography variant="caption" className="copyright-text">
        © {new Date().getFullYear()} Store Management System. All rights reserved.
      </Typography>
    </Container>
  );
};

export default UserTypeSelection;