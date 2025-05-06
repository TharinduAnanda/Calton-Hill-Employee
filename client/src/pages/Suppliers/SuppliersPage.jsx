// src/pages/Suppliers/SuppliersPage.jsx
import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  ToggleButtonGroup, 
  ToggleButton,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ViewList, Category } from '@mui/icons-material';
import SupplierList from './SupplierList';
import SuppliersByProduct from './SuppliersByProduct'; // We'll create this component

const SuppliersPage = () => {
  const navigate = useNavigate();
  const [refreshList, setRefreshList] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'byProduct'

  const handleAddSupplier = () => {
    navigate('/suppliers/add');
  };

  const triggerRefresh = () => {
    setRefreshList(prev => !prev);
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Grid container justifyContent="space-between" alignItems="center" mb={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" gutterBottom>
              Supplier Management
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Manage your suppliers and their information
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end', mt: { xs: 2, md: 0 } }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleAddSupplier}
            >
              Add New Supplier
            </Button>
          </Grid>
        </Grid>

        <Paper 
          elevation={1} 
          sx={{ 
            p: 2, 
            mb: 3, 
            display: 'flex', 
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            View Options
          </Typography>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewChange}
            aria-label="View Mode"
          >
            <ToggleButton value="list" aria-label="list view">
              <ViewList sx={{ mr: 1 }} />
              List View
            </ToggleButton>
            <ToggleButton value="byProduct" aria-label="product categorization">
              <Category sx={{ mr: 1 }} />
              By Product
            </ToggleButton>
          </ToggleButtonGroup>
        </Paper>
        
        {viewMode === 'list' ? (
          <SupplierList refresh={refreshList} onRefresh={triggerRefresh} />
        ) : (
          <SuppliersByProduct refresh={refreshList} onRefresh={triggerRefresh} />
        )}
      </Box>
    </Container>
  );
};

export default SuppliersPage;