import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container } from '@mui/material';
import { styled } from '@mui/material/styles';

const SelectionButton = styled(Button)(({ theme }) => ({
  height: '80px',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  borderRadius: '12px',
  boxShadow: theme.shadows[3],
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: theme.shadows[6]
  }
}));

const UserTypeSelection = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Box sx={{ 
        width: '100%',
        textAlign: 'center',
        p: 4,
        borderRadius: 4,
        boxShadow: 3,
        backgroundColor: 'background.paper'
      }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Store Management System
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 5 }}>
          Select your login type
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <SelectionButton
            variant="contained"
            color="primary"
            onClick={() => navigate('/owner-login')}
          >
            Owner Portal
          </SelectionButton>
          <SelectionButton
            variant="contained"
            color="secondary"
            onClick={() => navigate('/staff-login')}
          >
            Staff Portal
          </SelectionButton>
        </Box>
      </Box>
    </Container>
  );
};

export default UserTypeSelection;