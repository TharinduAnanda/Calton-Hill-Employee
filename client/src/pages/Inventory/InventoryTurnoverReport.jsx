import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, CircularProgress,
  Alert, Card, CardContent, Grid, FormControl,
  InputLabel, Select, MenuItem, Chip, Tabs, Tab,
  Divider, Button, Tooltip, TextField, IconButton,
  List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon,
  Print as PrintIcon,
  FilterList as FilterIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  SwapHoriz as SwapHorizIcon,
  Inventory as InventoryIcon,
  AttachMoney as AttachMoneyIcon,
  Warning as WarningIcon,
  Assessment as AssessmentIcon,
  Store as StoreIcon,
  Category as CategoryIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, 
  Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
  ReferenceLine, Label
} from 'recharts';
import inventoryService from '../../services/inventoryService';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';

// Create a proper number formatter for currency
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

// Create a formatter for numbers
const numberFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

const InventoryTurnoverReport = () => {
  const [turnoverData, setTurnoverData] = useState({
    summary: {
      total_inventory_value: 0,
      total_cogs: 0,
      overall_turnover_ratio: 0,
      overall_dsi: 0,
      product_count: 0,
      category_count: 0
    },
    products: [],
    categories: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState(90);
  const [tabValue, setTabValue] = useState(0);
  const [sortColumn, setSortColumn] = useState('turnover_ratio');
  const [sortDirection, setSortDirection] = useState('desc');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchTurnoverData(period, categoryFilter);
    fetchCategories();
  }, [period, categoryFilter]);

  const fetchCategories = async () => {
    try {
      const response = await inventoryService.getAllCategories();
      if (response.data && response.data.data) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchTurnoverData = async (days, category) => {
    try {
      setLoading(true);
      console.log(`Requesting turnover data for period: ${days} days, category: ${category || 'all'}`);
      const response = await inventoryService.getInventoryTurnoverReport({ 
        period: days,
        category: category 
      });
      
      console.log('Turnover data response:', response);
      console.log('Response data structure:', {
        success: response.data?.success,
        summary: response.data?.summary,
        productCount: response.data?.products?.length || 0,
        categoryCount: response.data?.categories?.length || 0,
        firstProduct: response.data?.products && response.data.products.length > 0 ? 
          `${response.data.products[0].Name} (ratio: ${response.data.products[0].turnover_ratio})` : 'None'
      });
      
      if (response.data && response.data.products) {
        setTurnoverData({
          summary: response.data.summary || { 
            total_inventory_value: 0,
            total_cogs: 0,
            overall_turnover_ratio: 0,
            overall_dsi: 0,
            product_count: 0,
            category_count: 0
          },
          products: response.data.products || [],
          categories: response.data.categories || []
        });
      } else {
        console.warn('No turnover data returned from API');
        setTurnoverData({
          summary: {
            total_inventory_value: 0,
            total_cogs: 0,
            overall_turnover_ratio: 0,
            overall_dsi: 0,
            product_count: 0,
            category_count: 0
          },
          products: [],
          categories: []
        });
      }
      
      setError(null);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching turnover data:', error);
      setError(error.message || 'Failed to fetch turnover data');
      setLoading(false);
    }
  };

  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
  };

  const refreshData = () => {
    fetchTurnoverData(period, categoryFilter);
  };

  const downloadReport = async () => {
    try {
      setLoading(true);
      
      // Build the URL for direct download
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const downloadUrl = `${baseUrl}/api/inventory/turnover-report/pdf?period=${period}&category=${categoryFilter || ''}`;
      
      console.log('Opening download URL:', downloadUrl);
      
      // Use direct browser download to avoid CORS
      window.open(downloadUrl, '_blank');
      
      setLoading(false);
      toast.success('Download initiated successfully');
    } catch (error) {
      console.error('Error initiating download:', error);
      setLoading(false);
      toast.error('Failed to initiate download. Please try again.');
    }
  };

  // Calculate summary statistics
  const {
    summary,
    products = [],
    categories: categoryData = []
  } = turnoverData;

  // Sort products based on current sort settings
  const sortedProducts = [...products].sort((a, b) => {
    const valueA = a[sortColumn] !== undefined ? Number(a[sortColumn]) : 0;
    const valueB = b[sortColumn] !== undefined ? Number(b[sortColumn]) : 0;
    
    if (sortDirection === 'asc') {
      return valueA - valueB;
    } else {
      return valueB - valueA;
    }
  });

  // Sort categories by turnover ratio
  const sortedCategories = [...categoryData].sort((a, b) => {
    return Number(b.category_turnover_ratio) - Number(a.category_turnover_ratio);
  });

  // Calculate health distribution for pie chart
  const healthCounts = products.reduce((acc, item) => {
    acc[item.inventory_health] = (acc[item.inventory_health] || 0) + 1;
    return acc;
  }, {});

  const healthPieData = Object.keys(healthCounts).map((key) => ({
    name: key,
    value: healthCounts[key]
  }));

  // Colors for pie chart
  const HEALTH_COLORS = {
    'Stagnant': '#f44336',
    'Slow-moving': '#ff9800',
    'Healthy': '#2196f3',
    'Fast-moving': '#4caf50',
    'Unknown': '#9e9e9e'
  };

  // Create data for category bar chart
  const categoryChartData = sortedCategories.map(cat => ({
    name: cat.Category,
    turnover: Number(cat.category_turnover_ratio),
    dsi: Number(cat.dsi) || 0
  }));

  // Create data for turnover trend (simulation as we don't have historical data)
  const trendData = [
    { month: 'Jan', turnover: 1.2 },
    { month: 'Feb', turnover: 1.4 },
    { month: 'Mar', turnover: 1.5 },
    { month: 'Apr', turnover: 1.7 },
    { month: 'May', turnover: 1.8 },
    { month: 'Jun', turnover: 2.0 },
    { month: 'Jul', turnover: 1.9 },
    { month: 'Aug', turnover: 2.1 },
    { month: 'Sep', turnover: 2.3 },
    { month: 'Oct', turnover: 2.2 },
    { month: 'Nov', turnover: 2.4 },
    { month: 'Dec', turnover: 2.5 }
  ];
  
  const getHealthChip = (health) => {
    switch(health) {
      case 'Stagnant': return <Chip label="Stagnant" color="error" size="small" />;
      case 'Slow-moving': return <Chip label="Slow-moving" color="warning" size="small" />;
      case 'Fast-moving': return <Chip label="Fast-moving" color="success" size="small" />;
      case 'Healthy': return <Chip label="Healthy" color="info" size="small" />;
      default: return <Chip label={health} size="small" />;
    }
  };

  const getTrendIcon = (value) => {
    const num = Number(value);
    if (num > 2) return <TrendingUpIcon color="success" fontSize="small" />;
    if (num < 0.5) return <TrendingDownIcon color="error" fontSize="small" />;
    return null;
  };

  // Check if we have meaningful data
  const hasData = turnoverData.products && turnoverData.products.length > 0;
  
  // Create alert message based on data state
  const getAlertMessage = () => {
    if (!hasData) {
  return (
        <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            No turnover data available
          </Typography>
          <Typography variant="body2">
            This could be due to one or more of the following:
          </Typography>
          <ul>
            <li>No orders with status "paid" in the selected time period</li>
            <li>Products missing cost price information</li>
            <li>No inventory records for your products</li>
          </ul>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Recommended actions:
          </Typography>
          <ul>
            <li>Update product records to include cost price</li>
            <li>Update order status to "paid" for completed orders</li>
            <li>Ensure inventory records exist for products</li>
          </ul>
        </Alert>
      );
    }
    
    return null;
  };

  // Key Metrics Cards
  const renderMetricsCards = () => {
    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid container item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ 
            width: '100%', 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)',
            transition: 'transform 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
            }
          }}>
              <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                  Inventory Turnover Ratio
                </Typography>
                <TrendingUpIcon color="primary" />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                <Typography variant="h4" fontWeight="bold">
                  {parseFloat(summary.overall_turnover_ratio).toFixed(2)}
                </Typography>
                {getTrendIcon(summary.overall_turnover_ratio)}
              </Box>
              <Box sx={{ pt: 2, borderTop: '1px solid #e0e0e0', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  COGS ÷ Average Inventory Value
                </Typography>
                <Tooltip title="Higher ratio indicates inventory selling quickly, lower values suggest possible overstocking" arrow placement="bottom">
                  <IconButton size="small" sx={{ ml: 1, p: 0 }}>
                    <InfoIcon fontSize="small" color="action" />
                  </IconButton>
                </Tooltip>
              </Box>
              </CardContent>
            </Card>
          </Grid>
        
        <Grid container item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ 
            width: '100%', 
            background: 'linear-gradient(135deg, #fff9f0 0%, #feead7 100%)',
            transition: 'transform 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
            }
          }}>
              <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="warning.dark">
                  Days Sales of Inventory
                </Typography>
                <SwapHorizIcon color="warning" />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                <Typography variant="h4" fontWeight="bold">
                  {Math.round(summary.overall_dsi || 0)}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" ml={1}>
                  days
                </Typography>
              </Box>
              <Box sx={{ pt: 2, borderTop: '1px solid #e0e0e0', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Days to sell entire inventory
                </Typography>
                <Tooltip title="Lower is better - indicates how quickly you're moving inventory" arrow placement="bottom">
                  <IconButton size="small" sx={{ ml: 1, p: 0 }}>
                    <InfoIcon fontSize="small" color="action" />
                  </IconButton>
                </Tooltip>
              </Box>
              </CardContent>
            </Card>
          </Grid>
        
        <Grid container item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ 
            width: '100%', 
            background: 'linear-gradient(135deg, #f0f7ff 0%, #d7e6fe 100%)',
            transition: 'transform 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
            }
          }}>
              <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="info.dark">
                  Total Inventory Value
                </Typography>
                <InventoryIcon color="info" />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                <Typography variant="h4" fontWeight="bold">
                  {currencyFormatter.format(summary.total_inventory_value || 0)}
                </Typography>
              </Box>
              <Box sx={{ pt: 2, borderTop: '1px solid #e0e0e0', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Based on current cost prices
                </Typography>
                <Tooltip title="Total value of all inventory at cost" arrow placement="bottom">
                  <IconButton size="small" sx={{ ml: 1, p: 0 }}>
                    <InfoIcon fontSize="small" color="action" />
                  </IconButton>
                </Tooltip>
              </Box>
              </CardContent>
            </Card>
          </Grid>
        
        <Grid container item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ 
            width: '100%', 
            background: 'linear-gradient(135deg, #f0fff4 0%, #d7fed8 100%)',
            transition: 'transform 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
            }
          }}>
              <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="success.dark">
                  Total COGS (Period)
                </Typography>
                <AttachMoneyIcon color="success" />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                <Typography variant="h4" fontWeight="bold">
                  {currencyFormatter.format(summary.total_cogs || 0)}
                </Typography>
              </Box>
              <Box sx={{ pt: 2, borderTop: '1px solid #e0e0e0', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  From paid orders only
                </Typography>
                <Tooltip title="Cost of Goods Sold during the selected period" arrow placement="bottom">
                  <IconButton size="small" sx={{ ml: 1, p: 0 }}>
                    <InfoIcon fontSize="small" color="action" />
                  </IconButton>
                </Tooltip>
              </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
    );
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }} elevation={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUpIcon sx={{ mr: 2, fontSize: 32 }} color="primary" />
            <Typography variant="h5" fontWeight="medium">Inventory Turnover Analysis</Typography>
          </Box>
          <Box>
            <Button
              startIcon={<RefreshIcon />}
              variant="outlined"
              size="small"
              onClick={refreshData}
              sx={{ mr: 1 }}
            >
              Refresh
            </Button>
            <Button
              startIcon={<PrintIcon />}
              variant="contained"
              size="small"
              color="primary"
              onClick={downloadReport}
            >
              Download Report
            </Button>
          </Box>
      </Box>

        <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
          <Grid container item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Analysis Period</InputLabel>
              <Select
                value={period}
                label="Analysis Period"
                onChange={handlePeriodChange}
              >
                <MenuItem value={30}>Last 30 Days</MenuItem>
                <MenuItem value={60}>Last 60 Days</MenuItem>
                <MenuItem value={90}>Last 90 Days (Quarter)</MenuItem>
                <MenuItem value={180}>Last 6 Months</MenuItem>
                <MenuItem value={365}>Last 12 Months (Year)</MenuItem>
              </Select>
            </FormControl>
        </Grid>

          <Grid container item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Filter by Category"
                onChange={handleCategoryFilterChange}
                displayEmpty
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid container item xs={12} sm={4}>
            <Box sx={{ 
              bgcolor: 'info.light', 
              p: 1, 
              borderRadius: 1, 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography variant="subtitle2" color="info.dark" fontWeight="medium">
                {`${format(addDays(new Date(), -period), 'MMM dd, yyyy')} - ${format(new Date(), 'MMM dd, yyyy')}`}
                </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Render the metrics cards */}
        {renderMetricsCards()}
        
        {/* Analysis Period Note */}
        {summary && summary.start_date && summary.end_date && (
          <Alert severity="info" sx={{ mb: 2 }} variant="outlined">
            <Typography variant="body2">
              This analysis is based on data from <strong>{summary.start_date}</strong> to <strong>{summary.end_date}</strong> ({summary.days_in_period} days).
              <span style={{ display: 'block', marginTop: '8px' }}>
                COGS is calculated from paid orders only. Turnover Ratio = COGS ÷ Avg. Inventory Value. 
                DSI = (Avg. Inventory Value ÷ COGS) × Days in Period.
              </span>
            </Typography>
          </Alert>
        )}
        
        {/* Display data availability message */}
        {getAlertMessage()}
      </Paper>

      {/* Only show tabs and content if we have data */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" variant="filled" sx={{ mb: 3 }}>{error}</Alert>
      ) : !hasData ? (
        <Paper sx={{ p: 4, mt: 2 }} elevation={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <WarningIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>No Turnover Data Available</Typography>
            <Typography variant="body1" paragraph>
              To see meaningful inventory turnover data, you'll need to:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', maxWidth: 500, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ borderRadius: '50%', width: 24, height: 24, bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', mr: 2 }}>1</Box>
                <Typography>Ensure products have cost_price values set</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ borderRadius: '50%', width: 24, height: 24, bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', mr: 2 }}>2</Box>
                <Typography>Update order payment status to "paid" for completed orders</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ borderRadius: '50%', width: 24, height: 24, bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', mr: 2 }}>3</Box>
                <Typography>Make sure inventory records exist for your products</Typography>
              </Box>
            </Box>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<RefreshIcon />} 
              onClick={refreshData}
              size="large"
            >
              Refresh Data
            </Button>
          </Box>
        </Paper>
      ) : (
        <>
          {/* Tabs for different views */}
          <Paper sx={{ mb: 3 }} elevation={2}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
              sx={{
                '& .MuiTab-root': {
                  py: 2,
                  minHeight: 64,
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                  },
                }
              }}
            >
              <Tab 
                label="Overview" 
                icon={<AssessmentIcon />} 
                iconPosition="start"
              />
              <Tab 
                label="Product Analysis" 
                icon={<StoreIcon />} 
                iconPosition="start"
              />
              <Tab 
                label="Category Analysis" 
                icon={<CategoryIcon />} 
                iconPosition="start"
              />
              <Tab 
                label="Action Recommendations" 
                icon={<InfoIcon />} 
                iconPosition="start"
              />
            </Tabs>
          </Paper>
          
          {/* Tab 0: Overview */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid container item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }} elevation={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PieChartIcon sx={{ mr: 1 }} color="primary" />
                    <Typography variant="h6" fontWeight="medium">Inventory Health Distribution</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 350, mt: 3 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={healthPieData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={130}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          paddingAngle={2}
                        >
                          {healthPieData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={HEALTH_COLORS[entry.name] || '#9e9e9e'} 
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <ChartTooltip formatter={(value) => [`${value} products`, 'Count']} />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
              <Grid container item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }} elevation={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUpIcon sx={{ mr: 1 }} color="primary" />
                    <Typography variant="h6" fontWeight="medium">Turnover Rate Trend</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 350, mt: 3 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: 8, 
                            border: 'none', 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            padding: 10
                          }} 
                        />
                        <Legend wrapperStyle={{ paddingTop: 10 }} />
                        <Line 
                          type="monotone" 
                          dataKey="turnover" 
                          stroke="#2196f3" 
                          strokeWidth={3}
                          dot={{ r: 6 }}
                          name="Turnover Ratio"
                          activeDot={{ r: 8, stroke: '#2196f3', strokeWidth: 2, fill: 'white' }}
                        />
                        <ReferenceLine y={summary.overall_turnover_ratio} stroke="red" strokeDasharray="3 3">
                          <Label 
                            value="Current" 
                            position="insideBottomRight" 
                            fill="#d32f2f"
                            fontSize={12}
                          />
                        </ReferenceLine>
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
              <Grid container item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2 }} elevation={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BarChartIcon sx={{ mr: 1 }} color="primary" />
                    <Typography variant="h6" fontWeight="medium">Category Performance</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 450, mt: 3 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={categoryChartData.slice(0, 10)} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          height={80}
                          tickMargin={10}
                          tick={{ fill: '#666', fontSize: 12 }}
                        />
                        <YAxis 
                          yAxisId="left"
                          orientation="left"
                          stroke="#3f51b5"
                          label={{ 
                            value: 'Turnover Ratio', 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { textAnchor: 'middle' },
                            fill: '#3f51b5',
                            fontSize: 12
                          }}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          stroke="#f50057"
                          label={{ 
                            value: 'Days (DSI)', 
                            angle: -90, 
                            position: 'insideRight',
                            style: { textAnchor: 'middle' },
                            fill: '#f50057',
                            fontSize: 12
                          }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: 8, 
                            border: 'none', 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            padding: 10
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: 20 }}
                          iconType="circle"
                          iconSize={10}
                        />
                        <Bar 
                          dataKey="turnover" 
                          name="Turnover Ratio" 
                          fill="#3f51b5"
                          yAxisId="left"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          dataKey="dsi" 
                          name="Days Sales of Inventory" 
                          fill="#f50057"
                          yAxisId="right"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Tab 1: Product Analysis */}
          {tabValue === 1 && (
            <Box>
              <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }} elevation={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <StoreIcon sx={{ mr: 1 }} color="primary" />
                  <Typography variant="h6" fontWeight="medium">Product Turnover Analysis</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                  <InfoIcon color="info" fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Click any column header to sort. Higher turnover ratio indicates products are selling quickly,
                    while lower DSI (Days Sales of Inventory) is better.
                  </Typography>
                </Box>
              
                <TableContainer sx={{ 
                  borderRadius: 2, 
                  boxShadow: '0 0 10px rgba(0,0,0,0.05)',
                  maxHeight: 600,
                  overflowY: 'auto'
                }}>
                  <Table stickyHeader>
            <TableHead>
              <TableRow>
                        <TableCell 
                          sx={{ 
                            bgcolor: 'primary.light', 
                            color: 'primary.dark',
                            fontWeight: 'bold'
                          }}
                        >
                          Product
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            bgcolor: 'primary.light', 
                            color: 'primary.dark',
                            fontWeight: 'bold'
                          }}
                        >
                          SKU
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            bgcolor: 'primary.light', 
                            color: 'primary.dark',
                            fontWeight: 'bold'
                          }}
                        >
                          Category
                        </TableCell>
                        <TableCell 
                          align="right" 
                          onClick={() => handleSort('current_stock')} 
                          sx={{ 
                            cursor: 'pointer',
                            bgcolor: 'primary.light', 
                            color: 'primary.dark',
                            fontWeight: 'bold'
                          }}
                        >
                          <Tooltip title="Click to sort">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              Current Stock
                              {sortColumn === 'current_stock' && (
                                sortDirection === 'asc' ? 
                                <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> : 
                                <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                              )}
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell 
                          align="right" 
                          onClick={() => handleSort('units_sold')} 
                          sx={{ 
                            cursor: 'pointer',
                            bgcolor: 'primary.light', 
                            color: 'primary.dark',
                            fontWeight: 'bold'
                          }}
                        >
                          <Tooltip title="Click to sort">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              Units Sold
                              {sortColumn === 'units_sold' && (
                                sortDirection === 'asc' ? 
                                <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> : 
                                <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                              )}
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell 
                          align="right" 
                          onClick={() => handleSort('cogs')} 
                          sx={{ 
                            cursor: 'pointer',
                            bgcolor: 'primary.light', 
                            color: 'primary.dark',
                            fontWeight: 'bold'
                          }}
                        >
                          <Tooltip title="Click to sort">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              COGS
                              {sortColumn === 'cogs' && (
                                sortDirection === 'asc' ? 
                                <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> : 
                                <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                              )}
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell 
                          align="right" 
                          onClick={() => handleSort('avg_inventory_value')} 
                          sx={{ 
                            cursor: 'pointer',
                            bgcolor: 'primary.light', 
                            color: 'primary.dark',
                            fontWeight: 'bold'
                          }}
                        >
                          <Tooltip title="Click to sort">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              Avg. Inventory Value
                              {sortColumn === 'avg_inventory_value' && (
                                sortDirection === 'asc' ? 
                                <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> : 
                                <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                              )}
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell 
                          align="right" 
                          onClick={() => handleSort('turnover_ratio')} 
                          sx={{ 
                            cursor: 'pointer',
                            bgcolor: 'primary.light', 
                            color: 'primary.dark',
                            fontWeight: 'bold'
                          }}
                        >
                          <Tooltip title="Click to sort">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              Turnover Ratio
                              {sortColumn === 'turnover_ratio' && (
                                sortDirection === 'asc' ? 
                                <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> : 
                                <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                              )}
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell 
                          align="right" 
                          onClick={() => handleSort('dsi')} 
                          sx={{ 
                            cursor: 'pointer',
                            bgcolor: 'primary.light', 
                            color: 'primary.dark',
                            fontWeight: 'bold'
                          }}
                        >
                          <Tooltip title="Click to sort">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              DSI
                              {sortColumn === 'dsi' && (
                                sortDirection === 'asc' ? 
                                <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> : 
                                <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                              )}
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            bgcolor: 'primary.light', 
                            color: 'primary.dark',
                            fontWeight: 'bold'
                          }}
                        >
                          Health
                        </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                      {sortedProducts.map((item, index) => (
                        <TableRow 
                          key={item.Product_ID}
                          sx={{ 
                            '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                            '&:hover': { bgcolor: 'action.selected' }
                          }}
                        >
                          <TableCell sx={{ fontWeight: 'medium' }}>{item.Name}</TableCell>
                  <TableCell>{item.SKU}</TableCell>
                          <TableCell>{item.Category}</TableCell>
                  <TableCell align="right">{item.current_stock}</TableCell>
                  <TableCell align="right">{item.units_sold}</TableCell>
                          <TableCell align="right">${currencyFormatter.format(item.cogs || 0)}</TableCell>
                          <TableCell align="right">${currencyFormatter.format(item.avg_inventory_value || 0)}</TableCell>
                          <TableCell 
                            align="right"
                            sx={{
                              fontWeight: 'bold',
                              color: item.turnover_ratio > 2 ? 'success.main' : 
                                    item.turnover_ratio < 0.5 ? 'error.main' : 'inherit'
                            }}
                          >
                            {parseFloat(item.turnover_ratio).toFixed(2)}
                            {getTrendIcon(item.turnover_ratio)}
                  </TableCell>
                          <TableCell 
                            align="right"
                            sx={{
                              fontWeight: 'bold',
                              color: item.dsi < 30 ? 'success.main' : 
                                    item.dsi > 90 ? 'error.main' : 'warning.main'
                            }}
                          >
                            {item.dsi ? Math.round(item.dsi) : 'N/A'}
                  </TableCell>
                          <TableCell>{getHealthChip(item.inventory_health)}</TableCell>
                        </TableRow>
                      ))}
                      {sortedProducts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={10} align="center">
                            <Box sx={{ py: 3 }}>
                              <Typography variant="subtitle1" color="text.secondary">
                                No product data available
                              </Typography>
                            </Box>
                  </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Showing {sortedProducts.length} products
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}

          {/* Tab 2: Category Analysis */}
          {tabValue === 2 && (
            <Box>
              <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }} elevation={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CategoryIcon sx={{ mr: 1 }} color="primary" />
                  <Typography variant="h6" fontWeight="medium">Category Turnover Analysis</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                  <InfoIcon color="info" fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    This table shows inventory turnover performance by product category. Categories with higher turnover ratios
                    are selling through inventory more efficiently.
                  </Typography>
                </Box>
                
                <TableContainer sx={{ 
                  borderRadius: 2, 
                  boxShadow: '0 0 10px rgba(0,0,0,0.05)',
                  maxHeight: 600,
                  overflowY: 'auto'
                }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell 
                          sx={{ 
                            bgcolor: 'primary.light', 
                            color: 'primary.dark',
                            fontWeight: 'bold'
                          }}
                        >
                          Category
                        </TableCell>
                        <TableCell 
                          align="right"
                          sx={{ 
                            bgcolor: 'primary.light', 
                            color: 'primary.dark',
                            fontWeight: 'bold'
                          }}
                        >
                          Product Count
                        </TableCell>
                        <TableCell 
                          align="right"
                          sx={{ 
                            bgcolor: 'primary.light', 
                            color: 'primary.dark',
                            fontWeight: 'bold'
                          }}
                        >
                          Total Stock
                        </TableCell>
                        <TableCell 
                          align="right"
                          sx={{ 
                            bgcolor: 'primary.light', 
                            color: 'primary.dark',
                            fontWeight: 'bold'
                          }}
                        >
                          Total Inventory Value
                        </TableCell>
                        <TableCell 
                          align="right"
                          sx={{ 
                            bgcolor: 'primary.light', 
                            color: 'primary.dark',
                            fontWeight: 'bold'
                          }}
                        >
                          Units Sold
                        </TableCell>
                        <TableCell 
                          align="right"
                          sx={{ 
                            bgcolor: 'primary.light', 
                            color: 'primary.dark',
                            fontWeight: 'bold'
                          }}
                        >
                          COGS
                        </TableCell>
                        <TableCell 
                          align="right"
                          sx={{ 
                            bgcolor: 'primary.light', 
                            color: 'primary.dark',
                            fontWeight: 'bold'
                          }}
                        >
                          Turnover Ratio
                        </TableCell>
                        <TableCell 
                          align="right"
                          sx={{ 
                            bgcolor: 'primary.light', 
                            color: 'primary.dark',
                            fontWeight: 'bold'
                          }}
                        >
                          DSI (Days)
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            bgcolor: 'primary.light', 
                            color: 'primary.dark',
                            fontWeight: 'bold'
                          }}
                        >
                          Health
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedCategories.map((cat) => (
                        <TableRow 
                          key={cat.Category}
                          sx={{ 
                            '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                            '&:hover': { bgcolor: 'action.selected' }
                          }}
                        >
                          <TableCell sx={{ fontWeight: 'medium' }}>{cat.Category}</TableCell>
                          <TableCell align="right">{cat.product_count}</TableCell>
                          <TableCell align="right">{cat.total_stock}</TableCell>
                          <TableCell align="right">${currencyFormatter.format(cat.total_inventory_value || 0)}</TableCell>
                          <TableCell align="right">{cat.total_units_sold}</TableCell>
                          <TableCell align="right">${currencyFormatter.format(cat.total_cogs || 0)}</TableCell>
                          <TableCell 
                            align="right"
                            sx={{
                              fontWeight: 'bold',
                              color: cat.category_turnover_ratio > 2 ? 'success.main' : 
                                    cat.category_turnover_ratio < 0.5 ? 'error.main' : 'inherit'
                            }}
                          >
                            {parseFloat(cat.category_turnover_ratio).toFixed(2)}
                            {getTrendIcon(cat.category_turnover_ratio)}
                          </TableCell>
                          <TableCell 
                            align="right"
                            sx={{
                              fontWeight: 'bold',
                              color: cat.dsi < 30 ? 'success.main' : 
                                    cat.dsi > 90 ? 'error.main' : 'warning.main'
                            }}
                          >
                            {cat.dsi ? Math.round(cat.dsi) : 'N/A'}
                          </TableCell>
                          <TableCell>{getHealthChip(cat.category_health)}</TableCell>
                        </TableRow>
                      ))}
                      {sortedCategories.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={9} align="center">
                            <Box sx={{ py: 3 }}>
                              <Typography variant="subtitle1" color="text.secondary">
                                No category data available
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Showing {sortedCategories.length} categories
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}

          {/* Tab 3: Recommendations */}
          {tabValue === 3 && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid container item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }} elevation={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="medium">Fast-Moving Items</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle2" gutterBottom color="success.main" sx={{ fontWeight: 'medium', mb: 2 }}>
                    Consider increasing stock levels for these popular items
                  </Typography>
                  <List>
                    {sortedProducts
                      .filter(p => p.inventory_health === 'Fast-moving')
                      .slice(0, 5)
                      .map(product => (
                        <ListItem 
                          key={product.Product_ID}
                          sx={{ 
                            borderRadius: 1, 
                            mb: 1, 
                            bgcolor: 'success.light',
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'translateX(5px)',
                              bgcolor: 'success.lighter',
                            }
                          }}
                        >
                          <ListItemIcon>
                            <TrendingUpIcon color="success" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={
                              <Typography fontWeight="bold">{product.Name}</Typography>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2">
                                  Turnover: <span style={{ fontWeight: 'bold' }}>{product.turnover_ratio}</span>
                                </Typography>
                                <Typography variant="body2">
                                  Current Stock: <span style={{ fontWeight: 'bold' }}>{product.current_stock}</span>
                                </Typography>
                                <Typography variant="body2" fontStyle="italic" sx={{ mt: 1 }}>
                                  Recommended action: Increase stock by 25-50%
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    {sortedProducts.filter(p => p.inventory_health === 'Fast-moving').length === 0 && (
                      <Box sx={{ py: 2, px: 3, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography align="center" color="text.secondary">
                          No fast-moving items found
                        </Typography>
                      </Box>
                    )}
                  </List>
                </Paper>
              </Grid>
              
              <Grid container item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }} elevation={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="medium">Slow-Moving Items</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle2" gutterBottom color="error.main" sx={{ fontWeight: 'medium', mb: 2 }}>
                    Consider reducing stock or running promotions for these items
                  </Typography>
                  <List>
                    {sortedProducts
                      .filter(p => p.inventory_health === 'Slow-moving' || p.inventory_health === 'Stagnant')
                      .slice(0, 5)
                      .map(product => (
                        <ListItem 
                          key={product.Product_ID}
                          sx={{ 
                            borderRadius: 1, 
                            mb: 1, 
                            bgcolor: 'error.light',
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'translateX(5px)',
                              bgcolor: 'error.lighter',
                            }
                          }}
                        >
                          <ListItemIcon>
                            <TrendingDownIcon color="error" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={
                              <Typography fontWeight="bold">{product.Name}</Typography>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2">
                                  Turnover: <span style={{ fontWeight: 'bold' }}>{product.turnover_ratio}</span>
                                </Typography>
                                <Typography variant="body2">
                                  Current Stock: <span style={{ fontWeight: 'bold' }}>{product.current_stock}</span>
                                </Typography>
                                <Typography variant="body2" fontStyle="italic" sx={{ mt: 1 }}>
                                  Recommended action: {
                                    product.inventory_health === 'Stagnant' 
                                      ? 'Consider clearance pricing or bundling with fast-moving items' 
                                      : 'Run promotions or reduce order quantities'
                                  }
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    {sortedProducts.filter(p => p.inventory_health === 'Slow-moving' || p.inventory_health === 'Stagnant').length === 0 && (
                      <Box sx={{ py: 2, px: 3, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography align="center" color="text.secondary">
                          No slow-moving items found
                        </Typography>
                      </Box>
                    )}
                  </List>
                </Paper>
              </Grid>
              
              <Grid container item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2 }} elevation={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <InfoIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="medium">Action Plan</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                    <InfoIcon color="info" fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Below are specific recommendations to optimize your inventory management based on
                      turnover analysis. Implementing these actions can help improve cash flow and reduce holding costs.
                    </Typography>
                  </Box>
                  <TableContainer sx={{ 
                    borderRadius: 2, 
                    boxShadow: '0 0 10px rgba(0,0,0,0.05)',
                    maxHeight: 400, 
                    overflowY: 'auto'
                  }}>
                    <Table size="medium" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell 
                            sx={{ 
                              bgcolor: 'primary.light', 
                              color: 'primary.dark',
                              fontWeight: 'bold'
                            }}
                          >
                            Product
                          </TableCell>
                          <TableCell 
                            align="center"
                            sx={{ 
                              bgcolor: 'primary.light', 
                              color: 'primary.dark',
                              fontWeight: 'bold'
                            }}
                          >
                            Current Stock
                          </TableCell>
                          <TableCell 
                            align="center"
                            sx={{ 
                              bgcolor: 'primary.light', 
                              color: 'primary.dark',
                              fontWeight: 'bold'
                            }}
                          >
                            Turnover
                          </TableCell>
                          <TableCell 
                            align="center"
                            sx={{ 
                              bgcolor: 'primary.light', 
                              color: 'primary.dark',
                              fontWeight: 'bold'
                            }}
                          >
                            Health
                  </TableCell>
                          <TableCell 
                            sx={{ 
                              bgcolor: 'primary.light', 
                              color: 'primary.dark',
                              fontWeight: 'bold'
                            }}
                          >
                            Recommendation
                  </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sortedProducts.slice(0, 10).map((product) => (
                          <TableRow 
                            key={product.Product_ID}
                            sx={{ 
                              '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                              '&:hover': { bgcolor: 'action.selected' }
                            }}
                          >
                            <TableCell sx={{ fontWeight: 'medium' }}>{product.Name}</TableCell>
                            <TableCell align="center">{product.current_stock}</TableCell>
                            <TableCell 
                              align="center"
                              sx={{
                                fontWeight: 'bold',
                                color: product.turnover_ratio > 2 ? 'success.main' : 
                                      product.turnover_ratio < 0.5 ? 'error.main' : 'inherit'
                              }}
                            >
                              {parseFloat(product.turnover_ratio).toFixed(2)}
                  </TableCell>
                            <TableCell align="center">{getHealthChip(product.inventory_health)}</TableCell>
                  <TableCell>
                              <Typography variant="body2">
                                {product.action_recommendation || 
                                  (product.inventory_health === 'Fast-moving' 
                                    ? 'Increase stock levels by 25-50%' 
                                    : product.inventory_health === 'Stagnant'
                                      ? 'Consider clearance pricing or bundling with fast-moving items'
                                      : product.inventory_health === 'Slow-moving'
                                        ? 'Run promotions or reduce order quantities'
                                        : 'Maintain current inventory levels'
                                  )
                                }
                              </Typography>
                  </TableCell>
                </TableRow>
              ))}
                        {sortedProducts.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              <Box sx={{ py: 3 }}>
                                <Typography variant="subtitle1" color="text.secondary">
                                  No product data available
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
            </TableBody>
          </Table>
        </TableContainer>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<PrintIcon />}
                      sx={{ mr: 2 }}
                      onClick={downloadReport}
                    >
                      Download Action Plan
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                    >
                      Download CSV
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};

export default InventoryTurnoverReport;