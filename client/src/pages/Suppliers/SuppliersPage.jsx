// src/pages/Suppliers/SuppliersPage.jsx
import React, { useState } from 'react';
import { Container, Typography, Box, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SupplierList from '../../components/suppliers/SupplierList';

const SuppliersPage = () => {
  const navigate = useNavigate();
  const [refreshList, setRefreshList] = useState(false);

  const handleAddSupplier = () => {
    navigate('/suppliers/add');
  };

  const triggerRefresh = () => {
    setRefreshList(prev => !prev);
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Grid container justifyContent="space-between" alignItems="center" mb={3}>
          <Grid item>
            <Typography variant="h4" component="h1" gutterBottom>
              Supplier Management
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Manage your suppliers and their information
            </Typography>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleAddSupplier}
            >
              Add New Supplier
            </Button>
          </Grid>
        </Grid>
        
        <SupplierList refresh={refreshList} onRefresh={triggerRefresh} />
      </Box>
    </Container>
  );
};

export default SuppliersPage;