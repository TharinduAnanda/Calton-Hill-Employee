import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import inventoryService from '../../services/inventoryService';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  Inventory2 as InventoryIcon,
  LocalShipping as ShippingIcon,
  AttachMoney as MoneyIcon,
  InfoOutlined as InfoIcon,
  Business as BusinessIcon,
  RoomPreferences as LocationIcon,
  Timeline as TimelineIcon,
  CalendarMonth as CalendarIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

// TabPanel component for tab content
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const InventoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [stockHistory, setStockHistory] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  
  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch inventory item details
        const response = await inventoryService.getInventoryItemById(id);
        
        if (response?.data) {
          setItem(response.data);
          
          // Fetch stock movement history for this item
          try {
            const historyResponse = await inventoryService.getStockMovementHistory({
              itemId: id,
              limit: 10
            });
            setStockHistory(historyResponse || []);
          } catch (historyError) {
            console.error('Error fetching stock history:', historyError);
            setStockHistory([]);
          }
          
          // In a real app, you'd fetch price history here
          // For now, we'll use mock data
          setPriceHistory([
            { date: new Date('2025-01-15'), price: response.data.cost_price * 0.9 },
            { date: new Date('2025-02-01'), price: response.data.cost_price * 0.95 },
            { date: new Date('2025-03-10'), price: response.data.cost_price },
            { date: new Date('2025-04-15'), price: response.data.cost_price * 1.05 },
          ]);
        }
      } catch (err) {
        console.error('Error fetching inventory details:', err);
        setError(err.message || 'Failed to load inventory details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchItemDetails();
  }, [id]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const getStockLevelChip = (quantity, threshold) => {
    if (quantity <= 0) {
      return <Chip label="Out of Stock" color="error" size="small" />;
    } else if (quantity <= threshold) {
      return <Chip label="Low Stock" color="warning" size="small" />;
    } else {
      return <Chip label="In Stock" color="success" size="small" />;
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch (e) {
      return 'Invalid Date';
    }
  };
  
  const renderDetailItem = (label, value, icon = null) => (
    <Grid item xs={12} sm={6} md={4}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
        <Typography variant="subtitle2" color="text.secondary">
          {label}:
        </Typography>
      </Box>
      <Typography variant="body1">{value || 'N/A'}</Typography>
    </Grid>
  );
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 3 }}>
        {error}
        <Button 
          sx={{ ml: 2 }} 
          variant="outlined" 
          size="small" 
          onClick={() => navigate('/inventory')}
        >
          Back to Inventory
        </Button>
      </Alert>
    );
  }
  
  if (!item) {
    return (
      <Alert severity="info" sx={{ my: 3 }}>
        Inventory item not found.
        <Button 
          sx={{ ml: 2 }} 
          variant="outlined" 
          size="small" 
          onClick={() => navigate('/inventory')}
        >
          Back to Inventory
        </Button>
      </Alert>
    );
  }
  
  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/inventory')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">
            Inventory Details
          </Typography>
        </Box>
        <Box>
          <Button 
            component={Link} 
            to={`/inventory/edit/${id}`}
            variant="outlined"
            startIcon={<EditIcon />}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this item?')) {
                inventoryService.deleteInventoryItem(id)
                  .then(() => navigate('/inventory'))
                  .catch(err => alert('Error deleting item: ' + err.message));
              }
            }}
          >
            Delete
          </Button>
        </Box>
      </Box>
      
      {/* Item Summary Card */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <InventoryIcon />
            </Avatar>
          }
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6">{item.name}</Typography>
              <Box sx={{ ml: 2 }}>
                {getStockLevelChip(item.stock_level, item.reorder_level)}
              </Box>
              {item.is_featured && (
                <Chip 
                  label="Featured" 
                  color="primary" 
                  size="small" 
                  sx={{ ml: 1 }} 
                />
              )}
              {item.on_promotion && (
                <Chip 
                  label="On Promotion" 
                  color="secondary" 
                  size="small" 
                  sx={{ ml: 1 }} 
                />
              )}
            </Box>
          }
          subheader={
            <Box>
              <Typography variant="subtitle2">
                SKU: {item.sku} | ID: {item.id || item.product_id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.category} {item.subcategory ? `> ${item.subcategory}` : ''}
              </Typography>
            </Box>
          }
          action={
            <Box sx={{ textAlign: 'right', mr: 2, mt: 1 }}>
              <Typography variant="h6" color="primary">
                ${Number(item.price).toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cost: ${Number(item.cost_price).toFixed(2)}
              </Typography>
            </Box>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Box sx={{ p: 1, border: '1px solid #eee', borderRadius: 1, textAlign: 'center', mb: 2 }}>
                <Typography variant="h4" color={item.stock_level <= item.reorder_level ? 'error.main' : 'primary.main'}>
                  {item.stock_level}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Stock ({item.unit_of_measure || 'units'})
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ p: 1, border: '1px solid #eee', borderRadius: 1, textAlign: 'center', mb: 2 }}>
                <Typography variant="h4" color="warning.main">
                  {item.reorder_level}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Reorder Level
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ p: 1, border: '1px solid #eee', borderRadius: 1, textAlign: 'center', mb: 2 }}>
                <Typography variant="h4" color="success.main">
                  {item.optimal_level}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Optimal Level
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ p: 1, border: '1px solid #eee', borderRadius: 1, textAlign: 'center', mb: 2 }}>
                <Typography variant="h4">
                  {item.reorder_quantity}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Reorder Quantity
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Description
              </Typography>
              <Typography variant="body2">
                {item.description || 'No description available.'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Tabs for Detailed Information */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="inventory details tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Basic Info" icon={<InfoIcon />} iconPosition="start" />
            <Tab label="Inventory Details" icon={<InventoryIcon />} iconPosition="start" />
            <Tab label="Location & Storage" icon={<LocationIcon />} iconPosition="start" />
            <Tab label="Pricing" icon={<MoneyIcon />} iconPosition="start" />
            <Tab label="Supplier" icon={<BusinessIcon />} iconPosition="start" />
            <Tab label="Product Specs" icon={<DescriptionIcon />} iconPosition="start" />
            <Tab label="History" icon={<TimelineIcon />} iconPosition="start" />
          </Tabs>
        </Box>
        
        {/* Basic Info Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {renderDetailItem('SKU', item.sku)}
            {renderDetailItem('Product Name', item.name)}
            {renderDetailItem('Category', item.category)}
            {renderDetailItem('Subcategory', item.subcategory)}
            {renderDetailItem('Brand', item.brand)}
            {renderDetailItem('Manufacturer', item.manufacturer)}
            {renderDetailItem('Model Number', item.model_number)}
            {renderDetailItem('Status', 
              <Chip 
                label={item.status} 
                color={item.status === 'active' ? 'success' : 'default'} 
                size="small" 
              />
            )}
            {renderDetailItem('Featured Item', 
              item.is_featured ? 
                <Chip label="Yes" color="primary" size="small" /> : 
                <Chip label="No" size="small" />
            )}
            {renderDetailItem('Seasonal Item', 
              item.is_seasonal ? 
                <Chip label="Yes" color="secondary" size="small" /> : 
                <Chip label="No" size="small" />
            )}
            {renderDetailItem('On Promotion', 
              item.on_promotion ? 
                <Chip label="Yes" color="secondary" size="small" /> : 
                <Chip label="No" size="small" />
            )}
          </Grid>
        </TabPanel>
        
        {/* Inventory Details Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardHeader title="Stock Levels" />
                <Divider />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        {item.stock_level <= item.reorder_level ? 
                          <WarningIcon color="error" /> : 
                          <CheckCircleIcon color="success" />
                        }
                      </ListItemIcon>
                      <ListItemText 
                        primary="Current Stock Level" 
                        secondary={`${item.stock_level} ${item.unit_of_measure || 'units'}`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <RemoveIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Reorder Level" 
                        secondary={`${item.reorder_level} ${item.unit_of_measure || 'units'}`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <AddIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Optimal Level" 
                        secondary={`${item.optimal_level} ${item.unit_of_measure || 'units'}`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ShippingIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Reorder Quantity" 
                        secondary={`${item.reorder_quantity} ${item.unit_of_measure || 'units'}`} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardHeader title="Inventory Management" />
                <Divider />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CategoryIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Unit of Measure" 
                        secondary={item.unit_of_measure || 'each'} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Last Updated" 
                        secondary={formatDate(item.last_updated)} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <MoneyIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Valuation Method" 
                        secondary={item.inventory_value_method || 'FIFO'} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TimelineIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Average Daily Usage" 
                        secondary={`${item.average_daily_usage || '0'} ${item.unit_of_measure || 'units'}`} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Location Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {renderDetailItem('Warehouse Zone', item.warehouse_zone)}
            {renderDetailItem('Bin Location', item.bin_location)}
            {renderDetailItem('Aisle Number', item.aisle_number)}
            {renderDetailItem('Storage Location', item.storage_location)}
            {renderDetailItem('Display Location', item.display_location)}
          </Grid>
        </TabPanel>
        
        {/* Pricing Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader title="Current Pricing" />
                <Divider />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <MoneyIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Sell Price" 
                        secondary={`$${Number(item.price).toFixed(2)}`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <MoneyIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Cost Price" 
                        secondary={`$${Number(item.cost_price).toFixed(2)}`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <MoneyIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Markup Percentage" 
                        secondary={`${Number(item.markup_percentage).toFixed(2)}%`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <MoneyIcon color="secondary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Discount Percentage" 
                        secondary={`${Number(item.discount_percentage).toFixed(2)}%`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <MoneyIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Tax Percentage" 
                        secondary={`${Number(item.tax_percentage).toFixed(2)}%`} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader title="Price History" />
                <Divider />
                <CardContent>
                  {priceHistory.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="right">Change</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {priceHistory.map((historyItem, index) => (
                            <TableRow key={index}>
                              <TableCell>{formatDate(historyItem.date)}</TableCell>
                              <TableCell align="right">${Number(historyItem.price).toFixed(2)}</TableCell>
                              <TableCell align="right">
                                {index > 0 ? (
                                  <Typography
                                    variant="body2"
                                    color={historyItem.price > priceHistory[index - 1].price ? 'success.main' : 'error.main'}
                                  >
                                    {historyItem.price > priceHistory[index - 1].price ? '+' : ''}
                                    {((historyItem.price - priceHistory[index - 1].price) / priceHistory[index - 1].price * 100).toFixed(2)}%
                                  </Typography>
                                ) : 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                      No price history available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Supplier Tab */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            {renderDetailItem('Primary Supplier ID', item.supplier_id)}
            {renderDetailItem('Alternate Suppliers', item.alternate_suppliers)}
            {renderDetailItem('Lead Time', item.lead_time ? `${item.lead_time} days` : 'N/A')}
            {renderDetailItem('Minimum Order Quantity', item.minimum_order_quantity)}
            {renderDetailItem('Supplier Part Number', item.supplier_part_number)}
          </Grid>
        </TabPanel>
        
        {/* Product Specifications Tab */}
        <TabPanel value={tabValue} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader title="Physical Specifications" />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    {renderDetailItem('Weight', item.weight ? `${item.weight} kg` : 'N/A')}
                    {renderDetailItem('Dimensions', 
                      item.length && item.width && item.height 
                        ? `${item.length} × ${item.width} × ${item.height} cm` 
                        : 'N/A'
                    )}
                    {renderDetailItem('Material', item.material_type)}
                    {renderDetailItem('Color Options', item.color_options)}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader title="Additional Specifications" />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    {renderDetailItem('Specifications', item.specifications)}
                    {renderDetailItem('Compatibility', item.compatibility)}
                    {renderDetailItem('Certification Info', item.certification_info)}
                    {renderDetailItem('Warranty Period', 
                      item.warranty_period 
                        ? `${item.warranty_period} ${item.warranty_period === 1 ? 'month' : 'months'}` 
                        : 'N/A'
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* History Tab */}
        <TabPanel value={tabValue} index={6}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader title="Stock Movement History" />
                <Divider />
                <CardContent>
                  {stockHistory.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell align="right">Change</TableCell>
                            <TableCell align="right">New Stock</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {stockHistory.map((movement, index) => (
                            <TableRow key={index}>
                              <TableCell>{formatDate(movement.date)}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={movement.type} 
                                  color={
                                    movement.quantityChange > 0 ? 'success' :
                                    movement.quantityChange < 0 ? 'error' : 'default'
                                  } 
                                  size="small" 
                                />
                              </TableCell>
                              <TableCell align="right" 
                                sx={{ 
                                  color: movement.quantityChange > 0 ? 'success.main' : 
                                         movement.quantityChange < 0 ? 'error.main' : 'inherit'
                                }}
                              >
                                {movement.quantityChange > 0 ? '+' : ''}{movement.quantityChange}
                              </TableCell>
                              <TableCell align="right">{movement.newQuantity}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                      No stock movement history available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader title="Important Dates" />
                <Divider />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Date Added to Inventory" 
                        secondary={formatDate(item.date_added)} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Last Stock Count" 
                        secondary={formatDate(item.last_stock_count)} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Last Order Date" 
                        secondary={formatDate(item.last_order_date)} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Expiry Date" 
                        secondary={formatDate(item.expiry_date)} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Last Updated" 
                        secondary={formatDate(item.last_updated)} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default InventoryDetails; 