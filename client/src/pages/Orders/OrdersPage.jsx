// src/pages/Orders/OrdersPage.jsx
import React, { useState } from 'react';
import { Container, Typography, Box, Button, Grid, Tabs, Tab } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import OrderList from '../../components/orders/OrderList';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [refreshList, setRefreshList] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const handleAddOrder = () => {
    navigate('/orders/create');
  };

  const triggerRefresh = () => {
    setRefreshList(prev => !prev);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusFilter = () => {
    switch (tabValue) {
      case 0: return null; // All orders
      case 1: return 'pending';
      case 2: return 'processing';
      case 3: return 'shipped';
      case 4: return 'delivered';
      case 5: return 'cancelled';
      default: return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Grid container justifyContent="space-between" alignItems="center" mb={3}>
          <Grid item>
            <Typography variant="h4" component="h1" gutterBottom>
              Order Management
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Track and manage customer orders
            </Typography>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleAddOrder}
            >
              Create New Order
            </Button>
          </Grid>
        </Grid>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Orders" />
            <Tab label="Pending" />
            <Tab label="Processing" />
            <Tab label="Shipped" />
            <Tab label="Delivered" />
            <Tab label="Cancelled" />
          </Tabs>
        </Box>
        
        <OrderList 
          refresh={refreshList} 
          onRefresh={triggerRefresh} 
          statusFilter={getStatusFilter()}
        />
      </Box>
    </Container>
  );
};

export default OrdersPage;