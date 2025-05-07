import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  TextField,
  InputAdornment,
  FormControlLabel,
  Switch,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalOffer as LocalOfferIcon,
  CardGiftcard as CardGiftcardIcon,
  Percent as PercentIcon,
  DateRange as DateRangeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import marketingService from '../../services/marketingService';

const PromotionsManager = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [promotions, setPromotions] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [promotionDialog, setPromotionDialog] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [promotionForm, setPromotionForm] = useState({
    name: '',
    description: '',
    discount_type: 'percentage', // 'percentage', 'fixed', 'bogo'
    discount_value: '',
    min_purchase: 0,
    start_date: new Date(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    product_category: '',
    applies_to: 'all', // 'all', 'category', 'product'
    specific_products: [],
    active: true
  });
  
  const [couponDialog, setCouponDialog] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_purchase: 0,
    max_uses: 100,
    uses_per_customer: 1,
    start_date: new Date(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    active: true
  });
  
  useEffect(() => {
    const fetchPromotionsData = async () => {
      try {
        setLoading(true);
        const [promotionsData, couponsData] = await Promise.all([
          marketingService.getPromotions(),
          marketingService.getCoupons()
        ]);
        
        setPromotions(promotionsData);
        setCoupons(couponsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching promotions data:', err);
        setError('Failed to load promotions data');
      } finally {
        setLoading(false);
      }
    };

    fetchPromotionsData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Promotion dialog handlers
  const handleOpenPromotionDialog = (promotion = null) => {
    if (promotion) {
      setSelectedPromotion(promotion);
      setPromotionForm({
        name: promotion.name,
        description: promotion.description || '',
        discount_type: promotion.discount_type,
        discount_value: promotion.discount_value,
        min_purchase: promotion.min_purchase || 0,
        start_date: new Date(promotion.start_date),
        end_date: new Date(promotion.end_date),
        product_category: promotion.product_category || '',
        applies_to: promotion.applies_to || 'all',
        specific_products: promotion.specific_products || [],
        active: promotion.active
      });
    } else {
      setSelectedPromotion(null);
      setPromotionForm({
        name: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        min_purchase: 0,
        start_date: new Date(),
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        product_category: '',
        applies_to: 'all',
        specific_products: [],
        active: true
      });
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
  
  const handleDateChange = (date, field) => {
    setPromotionForm(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleSubmitPromotion = async () => {
    try {
      setLoading(true);
      
      if (selectedPromotion) {
        await marketingService.updatePromotion(selectedPromotion.id, promotionForm);
        setPromotions(prev => 
          prev.map(p => p.id === selectedPromotion.id ? { ...p, ...promotionForm } : p)
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
      setError(null);
    } catch (err) {
      console.error('Error deleting promotion:', err);
      setError('Failed to delete promotion');
    } finally {
      setLoading(false);
    }
  };
  
  // Coupon dialog handlers
  const handleOpenCouponDialog = (coupon = null) => {
    if (coupon) {
      setSelectedCoupon(coupon);
      setCouponForm({
        code: coupon.code,
        description: coupon.description || '',
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_purchase: coupon.min_purchase || 0,
        max_uses: coupon.max_uses || 100,
        uses_per_customer: coupon.uses_per_customer || 1,
        start_date: new Date(coupon.start_date),
        end_date: new Date(coupon.end_date),
        active: coupon.active
      });
    } else {
      setSelectedCoupon(null);
      setCouponForm({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        min_purchase: 0,
        max_uses: 100,
        uses_per_customer: 1,
        start_date: new Date(),
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        active: true
      });
    }
    
    setCouponDialog(true);
  };

  const handleCloseCouponDialog = () => {
    setCouponDialog(false);
  };

  const handleCouponFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCouponForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleCouponDateChange = (date, field) => {
    setCouponForm(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleSubmitCoupon = async () => {
    try {
      setLoading(true);
      
      if (selectedCoupon) {
        await marketingService.updateCoupon(selectedCoupon.id, couponForm);
        setCoupons(prev => 
          prev.map(c => c.id === selectedCoupon.id ? { ...c, ...couponForm } : c)
        );
      } else {
        const newCoupon = await marketingService.createCoupon(couponForm);
        setCoupons(prev => [...prev, newCoupon]);
      }
      
      setCouponDialog(false);
      setError(null);
    } catch (err) {
      console.error('Error saving coupon:', err);
      setError('Failed to save coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      setLoading(true);
      await marketingService.deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting coupon:', err);
      setError('Failed to delete coupon');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
          >
            <Tab icon={<LocalOfferIcon />} label="STORE PROMOTIONS" />
            <Tab icon={<CardGiftcardIcon />} label="COUPON CODES" />
          </Tabs>
        </Paper>
        
        {loading && !(promotions.length || coupons.length) ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Promotions Tab */}
            {activeTab === 0 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6">Store Promotions</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenPromotionDialog()}
                  >
                    Add Promotion
                  </Button>
                </Box>
                
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Value</TableCell>
                        <TableCell>Date Range</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {promotions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Box py={3}>
                              <LocalOfferIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                              <Typography variant="body1" color="textSecondary" paragraph>
                                No promotions found. Create a promotion to attract customers.
                              </Typography>
                              <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenPromotionDialog()}
                              >
                                Add First Promotion
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : (
                        promotions.map(promotion => {
                          const isActive = new Date() >= new Date(promotion.start_date) && 
                                          new Date() <= new Date(promotion.end_date) && 
                                          promotion.active;
                                          
                          return (
                            <TableRow key={promotion.id}>
                              <TableCell>
                                <Box>
                                  <Typography variant="body1">{promotion.name}</Typography>
                                  {promotion.description && (
                                    <Typography variant="body2" color="textSecondary">
                                      {promotion.description}
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                {promotion.discount_type === 'percentage' && 'Percentage Off'}
                                {promotion.discount_type === 'fixed' && 'Fixed Amount Off'}
                                {promotion.discount_type === 'bogo' && 'Buy One Get One'}
                                <Typography variant="body2" color="textSecondary">
                                  {promotion.applies_to === 'all' && 'All Products'}
                                  {promotion.applies_to === 'category' && `Category: ${promotion.product_category}`}
                                  {promotion.applies_to === 'product' && 'Specific Products'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {promotion.discount_type === 'percentage' && `${promotion.discount_value}%`}
                                {promotion.discount_type === 'fixed' && `$${parseFloat(promotion.discount_value).toFixed(2)}`}
                                {promotion.discount_type === 'bogo' && 'Free Item'}
                                {promotion.min_purchase > 0 && (
                                  <Typography variant="body2" color="textSecondary">
                                    Min. purchase: ${promotion.min_purchase}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center">
                                  <DateRangeIcon fontSize="small" sx={{ mr: 1 }} />
                                  <Box>
                                    <Typography variant="body2">
                                      {new Date(promotion.start_date).toLocaleDateString()} -
                                    </Typography>
                                    <Typography variant="body2">
                                      {new Date(promotion.end_date).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  icon={isActive ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                                  label={isActive ? "Active" : "Inactive"}
                                  color={isActive ? "success" : "default"}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="right">
                                <IconButton size="small" onClick={() => handleOpenPromotionDialog(promotion)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => handleDeletePromotion(promotion.id)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
            
            {/* Coupons Tab */}
            {activeTab === 1 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6">Coupon Codes</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenCouponDialog()}
                  >
                    Add Coupon
                  </Button>
                </Box>
                
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Code</TableCell>
                        <TableCell>Discount</TableCell>
                        <TableCell>Usage</TableCell>
                        <TableCell>Validity</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {coupons.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Box py={3}>
                              <CardGiftcardIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                              <Typography variant="body1" color="textSecondary" paragraph>
                                No coupon codes found. Create a coupon to boost sales.
                              </Typography>
                              <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenCouponDialog()}
                              >
                                Add First Coupon
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : (
                        coupons.map(coupon => {
                          const isActive = new Date() >= new Date(coupon.start_date) && 
                                          new Date() <= new Date(coupon.end_date) && 
                                          coupon.active;
                          const usagePercent = (coupon.used_count / coupon.max_uses) * 100;
                          
                          return (
                            <TableRow key={coupon.id}>
                              <TableCell>
                                <Box>
                                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                                    {coupon.code}
                                  </Typography>
                                  {coupon.description && (
                                    <Typography variant="body2" color="textSecondary">
                                      {coupon.description}
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                {coupon.discount_type === 'percentage' && `${coupon.discount_value}%`}
                                {coupon.discount_type === 'fixed' && `$${parseFloat(coupon.discount_value).toFixed(2)}`}
                                {coupon.min_purchase > 0 && (
                                  <Typography variant="body2" color="textSecondary">
                                    Min. purchase: ${coupon.min_purchase}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {coupon.used_count || 0} of {coupon.max_uses} uses
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Max {coupon.uses_per_customer} per customer
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center">
                                  <DateRangeIcon fontSize="small" sx={{ mr: 1 }} />
                                  <Box>
                                    <Typography variant="body2">
                                      {new Date(coupon.start_date).toLocaleDateString()} -
                                    </Typography>
                                    <Typography variant="body2">
                                      {new Date(coupon.end_date).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  icon={isActive ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                                  label={isActive ? "Active" : "Inactive"}
                                  color={isActive ? "success" : "default"}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="right">
                                <IconButton size="small" onClick={() => handleOpenCouponDialog(coupon)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => handleDeleteCoupon(coupon.id)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
            
            {/* Promotion Dialog */}
            <Dialog open={promotionDialog} onClose={handleClosePromotionDialog} maxWidth="md" fullWidth>
              <DialogTitle>
                {selectedPromotion ? 'Edit Promotion' : 'Create New Promotion'}
              </DialogTitle>
              <DialogContent dividers>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Promotion Name"
                      name="name"
                      value={promotionForm.name}
                      onChange={handlePromotionFormChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Discount Type</InputLabel>
                      <Select
                        name="discount_type"
                        value={promotionForm.discount_type}
                        onChange={handlePromotionFormChange}
                        label="Discount Type"
                      >
                        <MenuItem value="percentage">Percentage Discount</MenuItem>
                        <MenuItem value="fixed">Fixed Amount Discount</MenuItem>
                        <MenuItem value="bogo">Buy One Get One Free</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {promotionForm.discount_type !== 'bogo' && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        label={promotionForm.discount_type === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
                        name="discount_value"
                        value={promotionForm.discount_value}
                        onChange={handlePromotionFormChange}
                        type="number"
                        fullWidth
                        required
                        InputProps={{
                          startAdornment: promotionForm.discount_type === 'fixed' ? (
                            <InputAdornment position="start">$</InputAdornment>
                          ) : null,
                          endAdornment: promotionForm.discount_type === 'percentage' ? (
                            <InputAdornment position="end">%</InputAdornment>
                          ) : null,
                        }}
                      />
                    </Grid>
                  )}
                  
                  <Grid item xs={12} md={promotionForm.discount_type === 'bogo' ? 6 : 6}>
                    <TextField
                      label="Minimum Purchase Amount"
                      name="min_purchase"
                      value={promotionForm.min_purchase}
                      onChange={handlePromotionFormChange}
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      helperText="0 = No minimum purchase required"
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
                    <FormControl fullWidth>
                      <InputLabel>Applies To</InputLabel>
                      <Select
                        name="applies_to"
                        value={promotionForm.applies_to}
                        onChange={handlePromotionFormChange}
                        label="Applies To"
                      >
                        <MenuItem value="all">All Products</MenuItem>
                        <MenuItem value="category">Product Category</MenuItem>
                        <MenuItem value="product">Specific Products</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {promotionForm.applies_to === 'category' && (
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Product Category</InputLabel>
                        <Select
                          name="product_category"
                          value={promotionForm.product_category}
                          onChange={handlePromotionFormChange}
                          label="Product Category"
                        >
                          <MenuItem value="tools">Tools</MenuItem>
                          <MenuItem value="plumbing">Plumbing</MenuItem>
                          <MenuItem value="electrical">Electrical</MenuItem>
                          <MenuItem value="paint">Paint</MenuItem>
                          <MenuItem value="garden">Garden</MenuItem>
                          <MenuItem value="hardware">Hardware</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>Promotion Period</Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Start Date"
                      value={promotionForm.start_date}
                      onChange={(date) => handleDateChange(date, 'start_date')}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="End Date"
                      value={promotionForm.end_date}
                      onChange={(date) => handleDateChange(date, 'end_date')}
                      minDate={promotionForm.start_date}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={promotionForm.active}
                          onChange={handlePromotionFormChange}
                          name="active"
                        />
                      }
                      label="Active"
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
                  {loading ? <CircularProgress size={24} /> : 'Save'}
                </Button>
              </DialogActions>
            </Dialog>
            
            {/* Coupon Dialog */}
            <Dialog open={couponDialog} onClose={handleCloseCouponDialog} maxWidth="md" fullWidth>
              <DialogTitle>
                {selectedCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </DialogTitle>
              <DialogContent dividers>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Coupon Code"
                      name="code"
                      value={couponForm.code}
                      onChange={handleCouponFormChange}
                      fullWidth
                      required
                      inputProps={{ style: { textTransform: 'uppercase' } }}
                      helperText="Use clear, easy to remember codes"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Discount Type</InputLabel>
                      <Select
                        name="discount_type"
                        value={couponForm.discount_type}
                        onChange={handleCouponFormChange}
                        label="Discount Type"
                      >
                        <MenuItem value="percentage">Percentage Discount</MenuItem>
                        <MenuItem value="fixed">Fixed Amount Discount</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label={couponForm.discount_type === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
                      name="discount_value"
                      value={couponForm.discount_value}
                      onChange={handleCouponFormChange}
                      type="number"
                      fullWidth
                      required
                      InputProps={{
                        startAdornment: couponForm.discount_type === 'fixed' ? (
                          <InputAdornment position="start">$</InputAdornment>
                        ) : null,
                        endAdornment: couponForm.discount_type === 'percentage' ? (
                          <InputAdornment position="end">%</InputAdornment>
                        ) : null,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Minimum Purchase Amount"
                      name="min_purchase"
                      value={couponForm.min_purchase}
                      onChange={handleCouponFormChange}
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      helperText="0 = No minimum purchase required"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Description"
                      name="description"
                      value={couponForm.description}
                      onChange={handleCouponFormChange}
                      fullWidth
                      multiline
                      rows={2}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Maximum Uses"
                      name="max_uses"
                      value={couponForm.max_uses}
                      onChange={handleCouponFormChange}
                      type="number"
                      fullWidth
                      helperText="Total number of times this coupon can be used"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Uses Per Customer"
                      name="uses_per_customer"
                      value={couponForm.uses_per_customer}
                      onChange={handleCouponFormChange}
                      type="number"
                      fullWidth
                      helperText="How many times each customer can use this coupon"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>Validity Period</Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Start Date"
                      value={couponForm.start_date}
                      onChange={(date) => handleCouponDateChange(date, 'start_date')}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="End Date"
                      value={couponForm.end_date}
                      onChange={(date) => handleCouponDateChange(date, 'end_date')}
                      minDate={couponForm.start_date}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={couponForm.active}
                          onChange={handleCouponFormChange}
                          name="active"
                        />
                      }
                      label="Active"
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseCouponDialog}>Cancel</Button>
                <Button 
                  variant="contained" 
                  onClick={handleSubmitCoupon} 
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save'}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default PromotionsManager;