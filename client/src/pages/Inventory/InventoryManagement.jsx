// src/pages/Inventory/InventoryManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, 
  Button, TextField, InputAdornment, Tabs, Tab, 
  Alert, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import InventoryList from './InventoryList';
import LowStockItems from './LowStockItems';
import StockMovementHistory from './StockMovementHistory';
import { useNavigate } from 'react-router-dom';
import inventoryService from '../../services/inventoryService';

const InventoryManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummaryData = async () => {
  try {
    setLoading(true);
    const summaryData = await inventoryService.getInventorySummary();
    
    // Ensure we have the expected data structure
    const formattedData = {
      totalItems: summaryData.totalItems || 0,
      lowStockItems: summaryData.lowStockItems || 0,
      totalValue: summaryData.totalValue || 0,
      newItemsThisMonth: summaryData.newItemsThisMonth || 0
    };
    
    setSummaryData(formattedData);
    setError(null);
  } catch (err) {
    console.error('Error fetching inventory summary:', err);
    setError(err.message || 'Failed to load inventory summary');
  } finally {
    setLoading(false);
  }
};

    fetchSummaryData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const navigateToAddInventory = () => {
    navigate('/inventory/add');
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 0:
        return <InventoryList searchQuery={searchQuery} />;
      case 1:
        return <LowStockItems />;
      case 2:
        return <StockMovementHistory />;
      default:
        return <InventoryList searchQuery={searchQuery} />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Inventory Management</Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Items
              </Typography>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant="h4">
                  {summaryData?.totalItems || 0}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Low Stock Items
              </Typography>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant="h4" color="error">
                  {summaryData?.lowStockItems || 0}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Stock Value
              </Typography>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant="h4">
                  ${summaryData?.totalValue.toFixed(2) || '0.00'}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Items Added This Month
              </Typography>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant="h4">
                  {summaryData?.newItemsThisMonth || 0}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Action Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          placeholder="Search inventory..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearch}
          sx={{ width: '300px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={navigateToAddInventory}
        >
          Add New Item
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="All Items" />
          <Tab label="Low Stock" />
          <Tab label="Movement History" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {renderTabContent()}
    </Box>
  );
};

export default InventoryManagement;