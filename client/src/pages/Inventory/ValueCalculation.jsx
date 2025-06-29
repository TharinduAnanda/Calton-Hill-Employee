import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Card,
  CardContent,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tooltip,
  IconButton,
  Switch,
  Stack,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Calculate as CalculateIcon,
  BarChart as ChartIcon,
  CloudDownload as DownloadIcon,
  Info as InfoIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  LocationOn as LocationIcon,
  ExpandMore as ExpandMoreIcon,
  AttachMoney as MoneyIcon,
  Assignment as AssignmentIcon,
  DonutLarge as DonutLargeIcon
} from '@mui/icons-material';
import inventoryService from '../../services/inventoryService';
import { format } from 'date-fns';

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ValueCalculation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [valuationData, setValuationData] = useState(null);
  const [valuationType, setValuationType] = useState('cost');
  const [valuationMethod, setValuationMethod] = useState('FIFO');
  const [includeZeroStock, setIncludeZeroStock] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryChartData, setCategoryChartData] = useState([]);
  const [locationChartData, setLocationChartData] = useState([]);
  const [valueDistributionData, setValueDistributionData] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  useEffect(() => {
    // Load categories for filtering
    const fetchCategories = async () => {
      try {
        // Add direct debugging to see exactly what's happening
        console.log('Attempting to fetch inventory categories...');
        
        const response = await inventoryService.getInventoryCategories();
        console.log('Categories API raw response:', response);
        
        // Better debugging of the response structure
        console.log('Response structure details:', {
          hasData: !!response?.data,
          dataType: response?.data ? typeof response.data : 'undefined',
          isDataArray: Array.isArray(response?.data),
          hasDataData: !!response?.data?.data,
          dataDataType: response?.data?.data ? typeof response.data.data : 'undefined',
          isDataDataArray: Array.isArray(response?.data?.data)
        });
        
        // Ensure we have a valid response and extract categories
        let categoriesData = [];
        
        // Handle different possible response structures
        if (response?.data?.data && Array.isArray(response.data.data)) {
          console.log('Found categories in response.data.data');
          categoriesData = response.data.data;
        } else if (response?.data && Array.isArray(response.data)) {
          console.log('Found categories in response.data');
          categoriesData = response.data;
        } else if (response?.data?.categories && Array.isArray(response.data.categories)) {
          console.log('Found categories in response.data.categories');
          categoriesData = response.data.categories;
        } else if (response?.data) {
          // If we have data but not in expected format, try to extract categories
          console.log('Attempting to extract categories from response.data:', response.data);
          
          // Try to find any arrays in the response data
          const possibleArrays = Object.entries(response.data)
            .filter(([key, val]) => Array.isArray(val))
            .map(([key, val]) => ({ key, val }));
            
          console.log('Potential category arrays found:', possibleArrays.length);
          
          if (possibleArrays.length > 0) {
            console.log('Using array data from:', possibleArrays[0].key);
            categoriesData = possibleArrays[0].val;
          } else {
            // Last attempt - check if data is an object with category names as keys
            console.log('Looking for category data in object keys');
            
            if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
              // Try to get categories from object keys (e.g., categoryBreakdown)
              categoriesData = Object.keys(response.data)
                .filter(key => key !== 'success' && key !== 'message' && key !== 'error')
                .map(category => ({ Category: category }));
                
              console.log('Created categories from object keys:', categoriesData);
            }
          }
        }
        
        console.log('Extracted categories data:', categoriesData);
        
        // Extract unique categories, ensuring we have an array to map over
        let uniqueCategories = ['Uncategorized']; // Default
        
        if (categoriesData && Array.isArray(categoriesData) && categoriesData.length > 0) {
          // Check what properties the category objects have
          const sampleCategory = categoriesData[0];
          console.log('Sample category object:', sampleCategory);
          
          // Create a set of unique category names, checking all possible property names
          const categoryNames = categoriesData
            .map(item => 
              item.Category || 
              item.category || 
              item.name || 
              item.Name || 
              (typeof item === 'string' ? item : 'Uncategorized')
            )
            .filter(Boolean);
            
          console.log('Extracted category names:', categoryNames);
          
          if (categoryNames.length > 0) {
            uniqueCategories = [...new Set(categoryNames)];
            console.log('Final unique categories:', uniqueCategories);
          }
        }
        
        setCategories(uniqueCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Set default category to prevent UI issues
        setCategories(['Uncategorized']);
      }
    };
    
    fetchCategories();
  }, []);
  
  const calculateValue = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await inventoryService.calculateInventoryValue({
        valuationType: valuationType,
        valuationMethod: valuationMethod,
        includeZeroStock: includeZeroStock,
        category: selectedCategory
      });
      
      const data = response?.data || {};
      
      setValuationData(data);
      
      // Generate chart data
      if (data.categoryBreakdown) {
        const categoryData = Object.entries(data.categoryBreakdown).map(([category, value]) => ({
          name: category,
          value: parseFloat(value)
        }));
        setCategoryChartData(categoryData);
      }
      
      if (data.locationBreakdown) {
        const locationData = Object.entries(data.locationBreakdown).map(([location, value]) => ({
          name: location,
          value: parseFloat(value)
        }));
        setLocationChartData(locationData);
      }
      
      if (data.valueDistribution) {
        const distributionData = Object.entries(data.valueDistribution).map(([range, value]) => ({
          name: formatValueRangeName(range),
          value: parseFloat(value)
        }));
        setValueDistributionData(distributionData);
      }
    } catch (err) {
      console.error('Error calculating inventory value:', err);
      setError(err.message || 'Failed to calculate inventory value');
    } finally {
      setLoading(false);
    }
  };
  
  const formatValueRangeName = (key) => {
    switch(key) {
      case 'high_value': return 'High Value (>$5000)';
      case 'medium_value': return 'Medium Value ($1000-$5000)';
      case 'standard_value': return 'Standard Value ($100-$1000)';
      case 'low_value': return 'Low Value (<$100)';
      default: return key;
    }
  };
  
  const exportToCSV = () => {
    if (!valuationData || !valuationData.items || !Array.isArray(valuationData.items)) {
      return;
    }
    
    const headers = ['SKU', 'Name', 'Category', 'Stock Level', 'Unit Value', 'Total Value', 'Location', 'Preferred Method'];
    const rows = [headers.join(',')];
    
    valuationData.items.forEach(item => {
      const row = [
        `"${item.sku || ''}"`,
        `"${item.name || ''}"`,
        `"${item.category || ''}"`,
        item.stock_level,
        item.unit_value.toFixed(2),
        item.total_value.toFixed(2),
        `"${item.location || ''}"`,
        `"${item.preferred_valuation_method || ''}"`,
      ];
      rows.push(row.join(','));
    });
    
    // Add summary row
    rows.push(',,,,,' + valuationData.totalValue.toFixed(2));
    
    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory-valuation-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const resetFilters = () => {
    setValuationType('cost');
    setValuationMethod('FIFO');
    setIncludeZeroStock(false);
    setSelectedCategory('');
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Hardware Store Inventory Value Calculation System
        </Typography>
        
        {/* Explanation */}
        <Accordion sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="bold">
              <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              About Inventory Valuation
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography gutterBottom>
              This system implements multiple inventory valuation methods to accurately calculate the value of your hardware store inventory:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><AssignmentIcon /></ListItemIcon>
                <ListItemText 
                  primary="FIFO (First-In, First-Out)" 
                  secondary="Assumes oldest inventory sells first. Ideal for items with price fluctuations like lumber and metals."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><DonutLargeIcon /></ListItemIcon>
                <ListItemText 
                  primary="Weighted Average" 
                  secondary="Calculates average cost across all units. Good for high-volume, low-cost hardware items."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><MoneyIcon /></ListItemIcon>
                <ListItemText 
                  primary="Specific Identification" 
                  secondary="Tracks actual cost of each specific item. Essential for high-value power tools and specialty equipment."
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6} lg={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="valuation-type-label">Value Basis</InputLabel>
              <Select
                labelId="valuation-type-label"
                value={valuationType}
                onChange={(e) => setValuationType(e.target.value)}
                label="Value Basis"
              >
                <MenuItem value="cost">Cost Price Valuation</MenuItem>
                <MenuItem value="retail">Retail Price Valuation</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="valuation-method-label">Valuation Method</InputLabel>
              <Select
                labelId="valuation-method-label"
                value={valuationMethod}
                onChange={(e) => setValuationMethod(e.target.value)}
                label="Valuation Method"
              >
                <MenuItem value="FIFO">FIFO (First-In, First-Out)</MenuItem>
                <MenuItem value="WEIGHTED_AVERAGE">Weighted Average</MenuItem>
                <MenuItem value="SPECIFIC_IDENTIFICATION">Specific Identification</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="category-label">Category Filter</InputLabel>
              <Select
                labelId="category-label"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category Filter"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
        </Grid>
        
          <Grid item xs={12} md={6} lg={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <FormControlLabel
            control={
              <Switch
                checked={includeZeroStock}
                onChange={(e) => setIncludeZeroStock(e.target.checked)}
              />
            }
            label="Include Zero Stock Items"
          />
            </Box>
          </Grid>
        </Grid>
          
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button 
            variant="outlined" 
            color="inherit" 
            startIcon={<ClearIcon />} 
            onClick={resetFilters}
            sx={{ mr: 1 }}
          >
            Reset Filters
          </Button>
          
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<CalculateIcon />} 
            onClick={calculateValue}
            disabled={loading}
          >
            {loading ? 'Calculating...' : 'Calculate Value'}
          </Button>
        </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
        )}
        
        {valuationData && !loading && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Total Inventory Value
                  </Typography>
                    <Typography variant="h4" component="div">
                    {formatCurrency(valuationData.totalValue)}
                  </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Using {valuationMethod} method
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Total Items
                    </Typography>
                    <Typography variant="h4" component="div">
                      {valuationData.itemCount || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {includeZeroStock ? 'Including' : 'Excluding'} zero stock items
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
              <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      High Value Items
                  </Typography>
                    <Typography variant="h4" component="div">
                      {valuationData.valueDistribution?.high_value ? 
                        formatCurrency(valuationData.valueDistribution.high_value) : '$0.00'}
                  </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Items worth over $5,000
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
              <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Value Basis
                  </Typography>
                    <Typography variant="h4" component="div">
                      {valuationType === 'cost' ? 'Cost' : 'Retail'}
                  </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Based on {valuationType === 'cost' ? 'purchase cost' : 'selling price'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
            {/* Tabs for different views */}
            <Box sx={{ mb: 3 }}>
              <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
                <Tab label="Data Table" icon={<InventoryIcon />} iconPosition="start" />
                <Tab label="Category Analysis" icon={<CategoryIcon />} iconPosition="start" />
                <Tab label="Location Analysis" icon={<LocationIcon />} iconPosition="start" />
                <Tab label="Value Distribution" icon={<MoneyIcon />} iconPosition="start" />
              </Tabs>
            </Box>
            
            {/* Tab content */}
            {activeTab === 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<DownloadIcon />} 
                    onClick={exportToCSV}
                  >
                    Export to CSV
                  </Button>
                </Box>
                
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>SKU</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Stock</TableCell>
                        <TableCell align="right">Unit Value</TableCell>
                        <TableCell align="right">Total Value</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Method</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {valuationData.items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                        <TableRow key={item.product_id}>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell align="right">{item.stock_level}</TableCell>
                          <TableCell align="right">{formatCurrency(item.unit_value)}</TableCell>
                          <TableCell align="right">{formatCurrency(item.total_value)}</TableCell>
                          <TableCell>{item.location || '-'}</TableCell>
                          <TableCell>{item.preferred_valuation_method || 'FIFO'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <TablePagination
                  component="div"
                  count={valuationData.items.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50, 100]}
                />
              </Box>
            )}
            
            {activeTab === 1 && categoryChartData.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>Category Value Breakdown</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 2, height: 400 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {categoryChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip formatter={(value) => formatCurrency(value)} />
                        </PieChart>
                    </ResponsiveContainer>
              </Paper>
            </Grid>
                  <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 2, height: 400, overflow: 'auto' }}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Category</TableCell>
                              <TableCell align="right">Value</TableCell>
                              <TableCell align="right">Percentage</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {categoryChartData.map((item) => (
                              <TableRow key={item.name}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell align="right">{formatCurrency(item.value)}</TableCell>
                                <TableCell align="right">
                                  {((item.value / valuationData.totalValue) * 100).toFixed(2)}%
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                </Paper>
              </Grid>
                </Grid>
              </Box>
            )}
            
            {activeTab === 2 && locationChartData.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>Location Value Distribution</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: 400 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={locationChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                          <ChartTooltip formatter={(value) => formatCurrency(value)} />
                          <Bar dataKey="value" fill="#8884d8">
                            {locationChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: 400, overflow: 'auto' }}>
                      <TableContainer>
                        <Table size="small">
                <TableHead>
                  <TableRow>
                              <TableCell>Location</TableCell>
                              <TableCell align="right">Value</TableCell>
                              <TableCell align="right">Percentage</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                            {locationChartData.map((item) => (
                              <TableRow key={item.name}>
                        <TableCell>{item.name}</TableCell>
                                <TableCell align="right">{formatCurrency(item.value)}</TableCell>
                        <TableCell align="right">
                                  {((item.value / valuationData.totalValue) * 100).toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {activeTab === 3 && valueDistributionData.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>Value Concentration Analysis</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 2, height: 400 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={valueDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {valueDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip formatter={(value) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 2, height: 400 }}>
                      <Typography variant="subtitle1" gutterBottom>Value Range Distribution</Typography>
                      <Typography variant="body2" paragraph>
                        This chart shows how your inventory value is distributed across different value ranges:
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon><MoneyIcon style={{ color: COLORS[0] }} /></ListItemIcon>
                          <ListItemText 
                            primary="High Value Items (>$5000)" 
                            secondary={`${formatCurrency(valuationData.valueDistribution?.high_value || 0)} (${
                              ((valuationData.valueDistribution?.high_value || 0) / valuationData.totalValue * 100).toFixed(1)
                            }%)`} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><MoneyIcon style={{ color: COLORS[1] }} /></ListItemIcon>
                          <ListItemText 
                            primary="Medium Value Items ($1000-$5000)" 
                            secondary={`${formatCurrency(valuationData.valueDistribution?.medium_value || 0)} (${
                              ((valuationData.valueDistribution?.medium_value || 0) / valuationData.totalValue * 100).toFixed(1)
                            }%)`} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><MoneyIcon style={{ color: COLORS[2] }} /></ListItemIcon>
                          <ListItemText 
                            primary="Standard Value Items ($100-$1000)" 
                            secondary={`${formatCurrency(valuationData.valueDistribution?.standard_value || 0)} (${
                              ((valuationData.valueDistribution?.standard_value || 0) / valuationData.totalValue * 100).toFixed(1)
                            }%)`} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><MoneyIcon style={{ color: COLORS[3] }} /></ListItemIcon>
                          <ListItemText 
                            primary="Low Value Items (<$100)" 
                            secondary={`${formatCurrency(valuationData.valueDistribution?.low_value || 0)} (${
                              ((valuationData.valueDistribution?.low_value || 0) / valuationData.totalValue * 100).toFixed(1)
                            }%)`} 
                          />
                        </ListItem>
                      </List>
          </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
        </>
        )}
      </Paper>
    </Box>
  );
};

export default ValueCalculation;