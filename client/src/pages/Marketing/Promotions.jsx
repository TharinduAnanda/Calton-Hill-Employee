import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Divider,
  Button,
  TextField,
  InputAdornment,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  IconButton,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip
} from '@mui/material';
import { 
  LocalOffer as OfferIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  BarChart as StatsIcon,
  Group as SegmentIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Percent as PercentIcon,
  MonetizationOn as MoneyIcon,
  CardGiftcard as GiftIcon,
  CheckCircle as ActiveIcon,
  PauseCircle as PausedIcon,
  Schedule as ScheduledIcon,
  Archive as ArchivedIcon,
  ContentCopy as DuplicateIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, isAfter, isBefore } from 'date-fns';
import marketingService from '../../services/marketingService';

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [segments, setSegments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  const [promotionDialog, setPromotionDialog] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [promotionForm, setPromotionForm] = useState({
    name: '',
    description: '',
    code: '',
    type: 'percentage',
    value: '',
    min_purchase: 0,
    max_discount: '',
    start_date: new Date(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
    usage_limit: '',
    usage_limit_per_user: 1,
    applies_to: 'entire_order',
    category_ids: [],
    product_ids: [],
    segment_id: '',
    image_url: '',
    is_active: true
  });

  useEffect(() => {
    const fetchPromotionData = async () => {
      try {
        setLoading(true);
        const [promotionsData, segmentsData, categoriesData] = await Promise.all([
          marketingService.getPromotions(),
          marketingService.getCustomerSegments(),
          // Mock categories for now
          Promise.resolve([
            { id: 1, name: 'Power Tools' },
            { id: 2, name: 'Hand Tools' },
            { id: 3, name: 'Plumbing' },
            { id: 4, name: 'Electrical' },
            { id: 5, name: 'Building Materials' },
            { id: 6, name: 'Paint & Supplies' },
            { id: 7, name: 'Hardware' },
            { id: 8, name: 'Lawn & Garden' }
          ])
        ]);
        
        setPromotions(promotionsData);
        setSegments(segmentsData);
        setCategories(categoriesData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching promotion data:', err);
        setError('Failed to load promotion data');
      } finally {
        setLoading(false);
      }
    };

    fetchPromotionData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Generate a random promo code
  const generatePromoCode = () => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    setPromotionForm(prev => ({
      ...prev,
      code: result
    }));
  };

  // Promotion dialog handlers
  const handleOpenPromotionDialog = (promotion = null) => {
    if (promotion) {
      setSelectedPromotion(promotion);
      setPromotionForm({
        name: promotion.name,
        description: promotion.description || '',
        code: promotion.code,
        type: promotion.type,
        value: promotion.value,
        min_purchase: promotion.min_purchase,
        max_discount: promotion.max_discount || '',
        start_date: new Date(promotion.start_date),
        end_date: new Date(promotion.end_date),
        usage_limit: promotion.usage_limit || '',
        usage_limit_per_user: promotion.usage_limit_per_user || 1,
        applies_to: promotion.applies_to,
        category_ids: promotion.category_ids || [],
        product_ids: promotion.product_ids || [],
        segment_id: promotion.segment_id || '',
        image_url: promotion.image_url || '',
        is_active: promotion.is_active
      });
    } else {
      setSelectedPromotion(null);
      setPromotionForm({
        name: '',
        description: '',
        code: '',
        type: 'percentage',
        value: '',
        min_purchase: 0,
        max_discount: '',
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usage_limit: '',
        usage_limit_per_user: 1,
        applies_to: 'entire_order',
        category_ids: [],
        product_ids: [],
        segment_id: '',
        image_url: '',
        is_active: true
      });
      
      // Generate a promo code for new promotions
      generatePromoCode();
    }
    
    setPromotionDialog(true);
  };

  const handleClosePromotionDialog = () => {
    setPromotionDialog(false);
  };

  const handlePromotionFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPromotionForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (name, date) => {
    setPromotionForm(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleSubmitPromotion = async () => {
    try {
      setLoading(true);
      
      if (selectedPromotion) {
        const updated = await marketingService.updatePromotion(selectedPromotion.id, promotionForm);
        setPromotions(prev => 
          prev.map(p => p.id === selectedPromotion.id ? updated : p)
        );
      } else {
        const newPromotion = await marketingService.createPromotion(promotionForm);
        setPromotions(prev => [...prev, newPromotion]);
      }
      
      setPromotionDialog(false);
      setError(null);
    } catch (err) {
      console.error('Error saving promotion:', err);
      setError('Failed to save promotion');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePromotion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promotion?')) return;
    
    try {
      setLoading(true);
      await marketingService.deletePromotion(id);
      setPromotions(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting promotion:', err);
      setError('Failed to delete promotion');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicatePromotion = async (promotion) => {
    try {
      setLoading(true);
      const duplicateData = {
        ...promotion,
        name: `Copy of ${promotion.name}`,
        code: `${promotion.code}_COPY`,
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };
      delete duplicateData.id;
      
      const newPromotion = await marketingService.createPromotion(duplicateData);
      setPromotions(prev => [...prev, newPromotion]);
      setError(null);
    } catch (err) {
      console.error('Error duplicating promotion:', err);
      setError('Failed to duplicate promotion');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActiveStatus = async (promotion) => {
    try {
      setLoading(true);
      const updated = await marketingService.updatePromotion(promotion.id, {
        ...promotion,
        is_active: !promotion.is_active
      });
      
      setPromotions(prev => 
        prev.map(p => p.id === promotion.id ? updated : p)
      );
    } catch (err) {
      console.error('Error updating promotion status:', err);
      setError('Failed to update promotion status');
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine promotion status
  const getPromotionStatus = (promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);
    
    if (!promotion.is_active) return 'paused';
    if (isBefore(now, startDate)) return 'scheduled';
    if (isAfter(now, endDate)) return 'expired';
    return 'active';
  };

  // Filter promotions based on active tab
  const filteredPromotions = promotions.filter(promotion => {
    const status = getPromotionStatus(promotion);
    
    if (activeTab === 0) return true; // All
    if (activeTab === 1) return status === 'active';
    if (activeTab === 2) return status === 'scheduled';
    if (activeTab === 3) return status === 'paused';
    if (activeTab === 4) return status === 'expired';
    return true;
  });

  const getStatusChip = (status) => {
    switch (status) {
      case 'active':
        return <Chip icon={<ActiveIcon />} label="Active" color="success" size="small" />;
      case 'paused':
        return <Chip icon={<PausedIcon />} label="Paused" color="default" size="small" />;
      case 'scheduled':
        return <Chip icon={<ScheduledIcon />} label="Scheduled" color="primary" size="small" />;
      case 'expired':
        return <Chip icon={<ArchivedIcon />} label="Expired" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  // Format discount display
  const formatDiscount = (promotion) => {
    if (promotion.type === 'percentage') {
      return `${promotion.value}% off`;
    } else if (promotion.type === 'fixed_amount') {
      return `$${parseFloat(promotion.value).toFixed(2)} off`;
    } else if (promotion.type === 'free_shipping') {
      return 'Free Shipping';
    } else if (promotion.type === 'buy_x_get_y') {
      return `Buy ${promotion.buy_quantity} Get ${promotion.get_quantity} Free`;
    }
    return promotion.value;
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Discounts & Promotions</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenPromotionDialog()}
        >
          Create Promotion
        </Button>
      </Box>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Promotions" />
          <Tab label="Active" />
          <Tab label="Scheduled" />
          <Tab label="Paused" />
          <Tab label="Expired" />
        </Tabs>
        
        <Box p={2}>
          <TextField 
            placeholder="Search promotions..."
            size="small"
            variant="outlined"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          {loading && !promotions.length ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : filteredPromotions.length === 0 ? (
            <Box textAlign="center" py={4}>
              <OfferIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>No Promotions Found</Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Create a promotion to offer discounts to your customers.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenPromotionDialog()}
              >
                Create First Promotion
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredPromotions.map(promotion => {
                const status = getPromotionStatus(promotion);
                const segment = segments.find(s => s.id === promotion.segment_id);
                
                return (
                  <Grid item key={promotion.id} xs={12} sm={6} md={4}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {promotion.image_url && (
                        <CardMedia
                          component="img"
                          height="140"
                          image={promotion.image_url}
                          alt={promotion.name}
                        />
                      )}
                      <CardHeader
                        title={promotion.name}
                        subheader={formatDiscount(promotion)}
                        action={
                          <Box>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenPromotionDialog(promotion)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeletePromotion(promotion.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        }
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        {promotion.description && (
                          <Typography variant="body2" color="textSecondary" paragraph>
                            {promotion.description}
                          </Typography>
                        )}
                        
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="textSecondary" display="block">
                              Code
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" sx={{ letterSpacing: 1 }}>
                              {promotion.code}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="textSecondary" display="block">
                              Status
                            </Typography>
                            {getStatusChip(status)}
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="textSecondary" display="block">
                              Start Date
                            </Typography>
                            <Typography variant="body2">
                              {format(new Date(promotion.start_date), 'MMM dd, yyyy')}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="textSecondary" display="block">
                              End Date
                            </Typography>
                            <Typography variant="body2">
                              {format(new Date(promotion.end_date), 'MMM dd, yyyy')}
                            </Typography>
                          </Grid>
                          {segment && (
                            <Grid item xs={12}>
                              <Chip
                                icon={<SegmentIcon fontSize="small" />}
                                label={segment.name}
                                size="small"
                                variant="outlined"
                              />
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                      <Divider />
                      <Box p={1} display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Tooltip title="View Analytics">
                            <IconButton size="small">
                              <StatsIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Duplicate">
                            <IconButton 
                              size="small"
                              onClick={() => handleDuplicatePromotion(promotion)}
                            >
                              <DuplicateIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={promotion.is_active}
                              onChange={() => handleToggleActiveStatus(promotion)}
                            />
                          }
                          label={promotion.is_active ? "Active" : "Paused"}
                          sx={{ mr: 0 }}
                        />
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </Paper>

      {/* Promotion Dialog */}
      <Dialog 
        open={promotionDialog} 
        onClose={handleClosePromotionDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {selectedPromotion ? 'Edit Promotion' : 'Create New Promotion'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TextField
                label="Promotion Name"
                name="name"
                value={promotionForm.name}
                onChange={handlePromotionFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={promotionForm.is_active}
                    onChange={handlePromotionFormChange}
                    name="is_active"
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={promotionForm.description}
                onChange={handlePromotionFormChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <TextField
                  label="Promo Code"
                  name="code"
                  value={promotionForm.code}
                  onChange={handlePromotionFormChange}
                  fullWidth
                  required
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={generatePromoCode}
                >
                  Generate
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Discount Type</InputLabel>
                <Select
                  name="type"
                  value={promotionForm.type}
                  onChange={handlePromotionFormChange}
                  label="Discount Type"
                >
                  <MenuItem value="percentage">Percentage Discount</MenuItem>
                  <MenuItem value="fixed_amount">Fixed Amount</MenuItem>
                  <MenuItem value="free_shipping">Free Shipping</MenuItem>
                  <MenuItem value="buy_x_get_y">Buy X Get Y Free</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {promotionForm.type !== 'free_shipping' && (
              <Grid item xs={12} md={6}>
                <TextField
                  label={
                    promotionForm.type === 'percentage' ? 'Discount Percentage' :
                    promotionForm.type === 'fixed_amount' ? 'Discount Amount' :
                    promotionForm.type === 'buy_x_get_y' ? 'Buy Quantity' : 'Value'
                  }
                  name="value"
                  value={promotionForm.value}
                  onChange={handlePromotionFormChange}
                  type="number"
                  fullWidth
                  required
                  InputProps={
                    promotionForm.type === 'percentage' ? {
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    } : promotionForm.type === 'fixed_amount' ? {
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    } : undefined
                  }
                />
              </Grid>
            )}
            
            {promotionForm.type === 'buy_x_get_y' && (
              <Grid item xs={12} md={6}>
                <TextField
                  label="Get Free Quantity"
                  name="get_quantity"
                  value={promotionForm.get_quantity || ''}
                  onChange={handlePromotionFormChange}
                  type="number"
                  fullWidth
                  required
                />
              </Grid>
            )}
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Minimum Purchase"
                name="min_purchase"
                value={promotionForm.min_purchase}
                onChange={handlePromotionFormChange}
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>
            
            {promotionForm.type === 'percentage' && (
              <Grid item xs={12} md={6}>
                <TextField
                  label="Maximum Discount"
                  name="max_discount"
                  value={promotionForm.max_discount}
                  onChange={handlePromotionFormChange}
                  type="number"
                  fullWidth
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                  helperText="Leave blank for no maximum"
                />
              </Grid>
            )}
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={promotionForm.start_date}
                  onChange={(date) => handleDateChange('start_date', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={promotionForm.end_date}
                  onChange={(date) => handleDateChange('end_date', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={promotionForm.start_date}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Usage Limit"
                name="usage_limit"
                value={promotionForm.usage_limit}
                onChange={handlePromotionFormChange}
                type="number"
                fullWidth
                helperText="Total number of times this promotion can be used (blank for unlimited)"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Usage Limit Per Customer"
                name="usage_limit_per_user"
                value={promotionForm.usage_limit_per_user}
                onChange={handlePromotionFormChange}
                type="number"
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Applies To</InputLabel>
                <Select
                  name="applies_to"
                  value={promotionForm.applies_to}
                  onChange={handlePromotionFormChange}
                  label="Applies To"
                >
                  <MenuItem value="entire_order">Entire Order</MenuItem>
                  <MenuItem value="categories">Specific Categories</MenuItem>
                  <MenuItem value="products">Specific Products</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {promotionForm.applies_to === 'categories' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Categories</InputLabel>
                  <Select
                    multiple
                    name="category_ids"
                    value={promotionForm.category_ids}
                    onChange={handlePromotionFormChange}
                    label="Categories"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const category = categories.find(c => c.id === value);
                          return (
                            <Chip key={value} label={category ? category.name : value} size="small" />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Customer Segment</InputLabel>
                <Select
                  name="segment_id"
                  value={promotionForm.segment_id}
                  onChange={handlePromotionFormChange}
                  label="Customer Segment"
                >
                  <MenuItem value="">All Customers</MenuItem>
                  {segments.map(segment => (
                    <MenuItem key={segment.id} value={segment.id}>
                      {segment.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Promotion Image URL"
                name="image_url"
                value={promotionForm.image_url}
                onChange={handlePromotionFormChange}
                fullWidth
                helperText="Optional banner image for this promotion"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePromotionDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitPromotion} 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Promotion'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Promotions;