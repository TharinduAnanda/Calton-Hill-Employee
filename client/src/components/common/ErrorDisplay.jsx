// src/components/common/ErrorDisplay.jsx
import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const ErrorDisplay = ({ 
  error, 
  title = 'An error occurred', 
  onRetry = null,
  showDetails = false
}) => {
  // Extract message from error object or use error as string
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  
  return (
    <Paper 
      elevation={0} 
      variant="outlined"
      sx={{ 
        p: 3, 
        borderColor: 'error.light',
        borderWidth: 1,
        bgcolor: 'error.lighter',
        maxWidth: '100%',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <ErrorOutlineIcon color="error" sx={{ mr: 1 }} />
        <Typography variant="h6" color="error">
          {title}
        </Typography>
      </Box>
      
      <Typography variant="body1" gutterBottom>
        {errorMessage}
      </Typography>
      
      {showDetails && error?.stack && (
        <Box 
          sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: 'grey.100', 
            borderRadius: 1,
            maxHeight: '150px',
            overflow: 'auto',
            fontSize: '0.8rem',
            fontFamily: 'monospace'
          }}
        >
          <pre>{error.stack}</pre>
        </Box>
      )}
      
      {onRetry && (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onRetry}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      )}
    </Paper>
  );
};

export default ErrorDisplay;