// src/pages/Inventory/InventoryManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, 
  Button, TextField, InputAdornment, Tabs, Tab, 
  Alert, CircularProgress, Divider, Chip, Stack, 
  IconButton, Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HistoryIcon from '@mui/icons-material/History';
import CategoryIcon from '@mui/icons-material/Category';
import CalculateIcon from '@mui/icons-material/Calculate';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InventoryList from './InventoryList';
import LowStockItems from './LowStockItems';
import StockMovementHistory from './StockMovementHistory';
import { useNavigate } from 'react-router-dom';
import inventoryService from '../../services/inventoryService';
import axios from '../../utils/axiosConfig'; // Import axios instance

// Import new components (you'll need to create these)
import InventoryForecast from './InventoryForecast';
import InventoryCategories from './InventoryCategories';
import InventoryTurnoverReport from './InventoryTurnoverReport';
import ValueCalculation from './ValueCalculation';

const InventoryManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch summary data and forecast data in parallel for efficiency
        const [summaryResponse, categoriesResponse, forecastResponse] = await Promise.all([
          inventoryService.getInventorySummary(),
          inventoryService.getInventoryCategories(),
          inventoryService.getInventoryForecast({ days: 30 })
        ]);
        
        // Process summary data
        const formattedSummaryData = {
          totalItems: summaryResponse.data?.totalItems || 0,
          lowStockItems: summaryResponse.data?.lowStockItems || 0,
          totalValue: summaryResponse.data?.totalValue || 0,
          // Get from recent additions or default to 0
          newItemsThisMonth: summaryResponse.data?.newItemsThisMonth || 0
        };
        
        setSummaryData(formattedSummaryData);
        setCategoryData(categoriesResponse.data?.data || []);
        setForecastData(forecastResponse.data?.data || []);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching inventory dashboard data:', err);
        setError(err.message || 'Failed to load inventory dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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

  const navigateToPurchaseOrders = () => {
    navigate('/inventory/purchase-orders');
  };

  const navigateToStockCount = () => {
    navigate('/inventory/stock-count');
  };

  // Calculate items requiring attention for quick insights
  const getItemsNeedingAttention = () => {
    if (!forecastData.length) return 0;
    return forecastData.filter(item => 
      item.days_until_reorder !== null && 
      item.days_until_reorder <= 7
    ).length;
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 0:
        return <InventoryList searchQuery={searchQuery} />;
      case 1:
        return <LowStockItems />;
      case 2:
        return <StockMovementHistory />;
      case 3:
        return <InventoryForecast data={forecastData} loading={forecastLoading} />;
      case 4:
        return <InventoryCategories data={categoryData} />;
      case 5:
        return <InventoryTurnoverReport />;
      case 6:
        return <ValueCalculation />;
      default:
        return <InventoryList searchQuery={searchQuery} />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Inventory Management</Typography>
        
        <Box>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />} 
            onClick={navigateToAddInventory}
            sx={{ mr: 1 }}
          >
            Add Item
          </Button>
          
          <Button 
            variant="outlined"
            startIcon={<ShoppingCartIcon />}
            onClick={navigateToPurchaseOrders}
          >
            Purchase Orders
          </Button>
        </Box>
      </Box>
      
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
                  {summaryData?.totalItems.toLocaleString() || 0}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ 
              display: 'flex', 
              flexDirection: 'column' 
            }}>
              <Typography color="textSecondary" gutterBottom>
                Low Stock Items
              </Typography>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  <Typography variant="h4" color="error">
                    {summaryData?.lowStockItems || 0}
                  </Typography>
                  {summaryData?.lowStockItems > 0 && (
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => setActiveTab(1)}
                      sx={{ alignSelf: 'flex-start', mt: 1 }}
                    >
                      View Details
                    </Button>
                  )}
                </>
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
                  ${Number(summaryData?.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              )}
              <Typography variant="caption" color="textSecondary">
                Based on retail prices
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Items Needing Attention
              </Typography>
              {loading || forecastLoading ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  <Typography variant="h4" color={getItemsNeedingAttention() > 0 ? "warning" : "textPrimary"}>
                    {getItemsNeedingAttention()}
                  </Typography>
                  {getItemsNeedingAttention() > 0 && (
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => setActiveTab(3)}
                      sx={{ alignSelf: 'flex-start', mt: 1 }}
                    >
                      View Forecast
                    </Button>
                  )}
                </>
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

      {/* Quick Actions */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>Quick Actions</Typography>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            startIcon={<CalculateIcon />}
            onClick={navigateToStockCount}
          >
            Record Stock Count
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<AssessmentIcon />}
            onClick={() => navigate('/inventory/audit-log')}
          >
            View Audit Log
          </Button>
          <Button 
            variant="outlined"
            startIcon={<TrendingUpIcon />}
            onClick={() => setActiveTab(5)}
          >
            Turnover Analysis
          </Button>
        </Stack>
      </Box>

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
        
        <Box>
          {activeTab === 0 && (
            <IconButton 
              title="Refresh inventory" 
              onClick={() => window.location.reload()}
            >
              <HistoryIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Items" />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Low Stock
                {summaryData?.lowStockItems > 0 && (
                  <Chip 
                    label={summaryData.lowStockItems} 
                    color="error" 
                    size="small" 
                    sx={{ ml: 1 }} 
                  />
                )}
              </Box>
            } 
          />
          <Tab label="Movement History" />
          <Tab label="Forecast" />
          <Tab label="Categories" />
          <Tab label="Turnover Analysis" />
          <Tab label="Valuation" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {renderTabContent()}
    </Box>
  );
};

// Update the createInventoryItem function to use the configured axios instance
const createInventoryItem = async (itemData) => {
  try {
    console.log('Creating inventory item with data:', itemData);
    // Use the imported axios instance which has the correct baseURL
    const response = await axios.post('/api/inventory', itemData);
    return response;
  } catch (error) {
    console.error('Error creating inventory item:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

export default InventoryManagement;