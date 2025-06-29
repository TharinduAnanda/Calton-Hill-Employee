// src/pages/Inventory/InventoryManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, 
  Button, TextField, InputAdornment, Tabs, Tab, 
  Alert, CircularProgress, Divider, Chip, Stack, 
  IconButton, Tooltip, Paper, CardHeader, CardActions,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HistoryIcon from '@mui/icons-material/History';
import CategoryIcon from '@mui/icons-material/Category';
import CalculateIcon from '@mui/icons-material/Calculate';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import InventoryIcon from '@mui/icons-material/Inventory';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BarChartIcon from '@mui/icons-material/BarChart';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import CountertopsIcon from '@mui/icons-material/Countertops';
import InventoryList from './InventoryList';
import LowStockItems from './LowStockItems';
import StockMovementHistory from './StockMovementHistory';
import { useNavigate } from 'react-router-dom';
import inventoryService from '../../services/inventoryService';
import axios from '../../utils/axiosConfig';

// Import components
import InventoryForecast from './InventoryForecast';
import ValueCalculation from './ValueCalculation';

// Import chart components if needed
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';

const InventoryManagement = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [movementHistory, setMovementHistory] = useState([]);
  const [categoryChartData, setCategoryChartData] = useState([]);

  // Colors for charts
  const CHART_COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main, 
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel for efficiency
        const [
          summaryResponse, 
          categoriesResponse, 
          forecastResponse,
          movementResponse
        ] = await Promise.all([
          inventoryService.getInventorySummary(),
          inventoryService.getInventoryCategories(),
          inventoryService.getInventoryForecast({ days: 30 }),
          inventoryService.getStockMovementHistory({ limit: 10 })
        ]);
        
        console.log('Summary response:', summaryResponse);
        
        // Process summary data - handle different response structures
        const summaryData = summaryResponse?.data || summaryResponse || {};
        
        const formattedSummaryData = {
          totalItems: summaryData.totalItems || 0,
          lowStockItems: summaryData.lowStockItems || 0,
          totalValue: summaryData.totalValue || 0,
          newItemsThisMonth: summaryData.newItemsThisMonth || 0,
          outOfStockItems: summaryData.outOfStockItems || 0,
          itemsNeedingAttention: summaryData.itemsNeedingAttention || 0
        };
        
        setSummaryData(formattedSummaryData);
        
        // Process recent movements data
        const recentMovements = summaryData.recentMovements || [];
        setMovementHistory(recentMovements);
        
        // Process category data
        const categoryData = summaryData.categoryDistribution || categoriesResponse?.data?.data || [];
        setCategoryData(categoryData);
        
        // Prepare category chart data
        const categoryChartData = prepareCategoryChartData(categoryData);
        setCategoryChartData(categoryChartData);
        
        // Process forecast data
        const forecastItems = forecastResponse?.data?.data || [];
        setForecastData(forecastItems);
        
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

  // Prepare data for category pie chart
  const prepareCategoryChartData = (categories) => {
    if (!categories || !Array.isArray(categories)) return [];
    
    // Group by category and count items
    const categoryCounts = {};
    categories.forEach(item => {
      const category = item.category || 'Uncategorized';
      if (!categoryCounts[category]) {
        categoryCounts[category] = 0;
      }
      categoryCounts[category]++;
    });
    
    // Convert to array format for chart
    return Object.keys(categoryCounts).map(category => ({
      name: category,
      value: categoryCounts[category]
    }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const navigateToAddInventory = () => {
    navigate('/inventory/add');
  };

  const navigateToPurchaseOrders = () => {    navigate('/owner/inventory/purchase-orders');  };

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

  // Render quick actions card
  const renderQuickActions = () => {
    return (
      <Paper sx={{ p: 2, height: '100%' }}>
        <Typography variant="h6" gutterBottom>Quick Actions</Typography>
        <Stack spacing={1.5}>
          <Button 
            variant="outlined" 
            fullWidth 
            startIcon={<AddIcon />}
            onClick={navigateToAddInventory}
          >
            Add New Item
          </Button>
          
          <Button 
            variant="outlined" 
            fullWidth
            startIcon={<ShoppingCartIcon />}
            onClick={navigateToPurchaseOrders}
          >
            Purchase Orders
          </Button>
          
          <Button 
            variant="outlined" 
            fullWidth
            startIcon={<CountertopsIcon />}
            onClick={navigateToStockCount}
          >
            Stock Count
          </Button>
          
          <Button 
            variant="outlined" 
            fullWidth
            startIcon={<AssessmentIcon />}
            onClick={() => setActiveTab(4)}
          >
            Inventory Reports
          </Button>
        </Stack>
      </Paper>
    );
  };

  // Render category distribution card with pie chart
  const renderCategoryDistribution = () => {
    return (
      <Paper sx={{ p: 2, height: '100%' }}>
        <Typography variant="h6" gutterBottom>Category Distribution</Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={30} />
          </Box>
        ) : categoryChartData.length > 0 ? (
          <Box sx={{ height: 200, width: '100%' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No category data available
            </Typography>
          </Box>
        )}
      </Paper>
    );
  };

  // Render recent movements card
  const renderRecentMovements = () => {
    return (
      <Paper sx={{ p: 2, height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Recent Stock Movements</Typography>
          <Button 
            size="small" 
            endIcon={<HistoryIcon />} 
            onClick={() => setActiveTab(2)}
          >
            View All
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={30} />
          </Box>
        ) : movementHistory.length > 0 ? (
          <Stack spacing={1} sx={{ maxHeight: 250, overflow: 'auto' }}>
            {movementHistory.slice(0, 5).map((movement, index) => (
              <Paper 
                key={index} 
                variant="outlined" 
                sx={{ 
                  p: 1, 
                  backgroundColor: movement.quantityChange > 0 ? 
                    'rgba(46, 125, 50, 0.08)' : 
                    movement.quantityChange < 0 ? 
                      'rgba(211, 47, 47, 0.08)' : 
                      'inherit'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight="bold">
                    {movement.itemName}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    color={movement.quantityChange > 0 ? 'success.main' : 
                           movement.quantityChange < 0 ? 'error.main' : 
                           'text.primary'}
                  >
                    {movement.quantityChange > 0 ? `+${movement.quantityChange}` : movement.quantityChange}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(movement.date).toLocaleDateString()} • {movement.reason || movement.type}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    New total: {movement.newQuantity}
                  </Typography>
                </Box>
              </Paper>
            ))}
            
            {movementHistory.length > 5 && (
              <Button 
                size="small" 
                variant="text" 
                onClick={() => setActiveTab(2)}
              >
                View {movementHistory.length - 5} more movements
              </Button>
            )}
          </Stack>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }}>
            <Typography variant="body2" color="text.secondary">
              No recent movements
            </Typography>
          </Box>
        )}
      </Paper>
    );
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 0:
        return <InventoryList searchQuery={searchQuery} categoryData={categoryData} />;
      case 1:
        return <LowStockItems />;
      case 2:
        return <StockMovementHistory />;
      case 3:
        return <InventoryForecast data={forecastData} loading={forecastLoading} />;
      case 4:
        return <ValueCalculation />;
      default:
        return <InventoryList searchQuery={searchQuery} categoryData={categoryData} />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
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
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                Total Inventory Items
              </Typography>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant="h4">
                  {summaryData?.totalItems.toLocaleString() || 0}
                </Typography>
              )}
              <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center' }}>
                <InventoryIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="textSecondary">
                  Total inventory items
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                Total Inventory Value
              </Typography>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant="h4">
                  ${Number(summaryData?.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              )}
              <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center' }}>
                <CalculateIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                <Typography variant="caption" color="textSecondary">
                  Based on current stock levels
                </Typography>
              </Box>
              <Button 
                size="small" 
                color="primary"
                onClick={() => setActiveTab(5)}
                sx={{ alignSelf: 'flex-start', mt: 1 }}
              >
                Calculate Value
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                Low Stock Items
              </Typography>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  <Typography variant="h4" color={summaryData?.lowStockItems > 0 ? "error.main" : "textPrimary"}>
                    {summaryData?.lowStockItems || 0}
                  </Typography>
                  <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center' }}>
                    <WarningIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="error">
                      Below reorder level
                    </Typography>
                  </Box>
                  {summaryData?.lowStockItems > 0 && (
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => setActiveTab(1)}
                      sx={{ alignSelf: 'flex-start', mt: 1 }}
                    >
                      View List
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                Items Needing Attention
              </Typography>
              {loading || forecastLoading ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  <Typography variant="h4" color={getItemsNeedingAttention() > 0 ? "warning.main" : "textPrimary"}>
                    {getItemsNeedingAttention()}
                  </Typography>
                  <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center' }}>
                    <InfoIcon fontSize="small" color="warning" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="textSecondary">
                      Need to reorder within 7 days
                    </Typography>
                  </Box>
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
      
      {/* Dashboard insights before the tabs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} md={8}>
          {/* Recent Stock Movements */}
          {renderRecentMovements()}
        </Grid>
        
        <Grid xs={12} md={4}>
          <Grid container spacing={3}>
            <Grid xs={12}>
              {/* Category Distribution */}
              {renderCategoryDistribution()}
            </Grid>
            
            <Grid xs={12}>
              {/* Quick Actions */}
              {renderQuickActions()}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      
      {/* Search and Tabs */}
      <Box sx={{ mb: 3 }}>
        <Paper elevation={0} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TextField
              placeholder="Search inventory..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearch}
              sx={{ width: 300, mr: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="All Inventory" icon={<InventoryIcon />} iconPosition="start" />
            <Tab label="Low Stock" icon={<WarningIcon />} iconPosition="start" />
            <Tab label="Movement History" icon={<HistoryIcon />} iconPosition="start" />
            <Tab label="Forecast" icon={<TrendingUpIcon />} iconPosition="start" />
            <Tab label="Value Calculation" icon={<CalculateIcon />} iconPosition="start" />
          </Tabs>
        </Paper>
      </Box>
      
      {/* Tab Content */}
      <Box sx={{ mt: 2 }}>
        {renderTabContent()}
      </Box>
    </Box>
  );
};

export default InventoryManagement;