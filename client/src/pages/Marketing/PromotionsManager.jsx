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
  Tooltip,
  Avatar,
  FormHelperText
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
  ContentCopy as DuplicateIcon,
  Mail as MessageIcon,
  CardGiftcard as CouponIcon,
  Visibility as VisibleIcon,
  VisibilityOff as HiddenIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, isAfter, isBefore } from 'date-fns';
import marketingService from '../../services/marketingService';
import './PromotionsManager.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Generate a random coupon code
const generateCode = () => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoiding confusing characters
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

// Enhance the formatDataForAPI function to be more robust
const formatDataForAPI = (formData) => {
  return {
    ...formData,
    
    // Ensure dates are ISO strings
    start_date: formData.start_date instanceof Date ? formData.start_date.toISOString() : formData.start_date,
    end_date: formData.end_date instanceof Date ? formData.end_date.toISOString() : formData.end_date,
    
    // Convert string numbers to actual numbers
    value: formData.value !== '' ? parseFloat(formData.value) : formData.value,
    min_purchase: formData.min_purchase !== '' ? parseFloat(formData.min_purchase) : 0,
    max_discount: formData.max_discount !== '' ? parseFloat(formData.max_discount) : null,
    
    // Ensure boolean values are properly handled
    is_active: formData.is_active ? 1 : 0,
    
    // Make sure arrays are properly handled
    category_ids: Array.isArray(formData.category_ids) ? formData.category_ids : [],
    product_ids: Array.isArray(formData.product_ids) ? formData.product_ids : []
  };
};

// Helper function to ensure values are properly handled as arrays
const ensureArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    // If it's a JSON string, try to parse it
    if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
      return JSON.parse(value);
    }
  } catch (e) {
    console.error('Error parsing array value:', e);
  }
  // If all else fails, wrap it in an array
  return [value];
};

const PromotionsManager = () => {
  // State for promotions and coupons
  const [promotions, setPromotions] = useState([]);
  const [coupons, setCoupons] = useState([]);
  
  // State for filtering and UI
  const [segments, setSegments] = useState([]); // Initialize as empty array
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mainTab, setMainTab] = useState(0);  // 0 for promotions, 1 for coupons
  const [promotionsTab, setPromotionsTab] = useState(0); // Sub-tabs for promotions: All, Active, etc.
  const [couponsTab, setCouponsTab] = useState(0); // 0 for All, 1 for Active, etc.
  
  // Dialogs and forms
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
    buy_quantity: '',
    get_quantity: '',
    start_date: new Date(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
    usage_limit: '',
    usage_limit_per_user: 1,
    applies_to: 'entire_order',
    category_ids: [],
    product_ids: [],
    segment_id: '',
    image_url: '',
    is_active: true,
    trigger_type: 'cart_value',
    customer_description: ''
  });
  
  const [couponDialog, setCouponDialog] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_purchase: 0,
    max_discount: '',
    start_date: new Date(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    usage_limit: 100,
    usage_limit_per_user: 1,
    applies_to: 'entire_order',
    category_ids: [],
    product_ids: [],
    is_active: true,
    distribution_channel: 'email',
    one_time_use: false,
    segment_id: ''
  });

  const [validateDialog, setValidateDialog] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Update the fetchData function to clearly separate promotions and coupons

const fetchData = async () => {
  try {
    setLoading(true);
    
    // Initialize with empty arrays
    let promotionsData = [];
    let couponsData = [];
    let segmentsData = [];
    let categoriesData = [];
    
    try {
      console.log('👥 Fetching customer segments...');
      const segmentsResponse = await marketingService.getCustomerSegments();
      
      // Ensure we have an array even if API returns null or undefined
      segmentsData = Array.isArray(segmentsResponse) ? segmentsResponse : [];
      console.log('✅ Segments fetch complete:', segmentsData);
    } catch (error) {
      console.error('❌ Failed to fetch customer segments:', error);
      segmentsData = []; // Always ensure this is an array
    }
    
    try {
      console.log('📦 Fetching automatic promotions...');
      // Use the specific method for automatic promotions
      const promoResponse = await marketingService.getAutomaticPromotions();
      promotionsData = promoResponse || [];
      console.log('✅ Promotions fetch complete:', promotionsData);
    } catch (error) {
      console.error('❌ Failed to fetch promotions:', error);
      setError('Failed to load promotions from database');
    }
    
    try {
      console.log('🎫 Fetching coupons...');
      // Make sure we're using the specific method for coupons
      couponsData = await marketingService.getCoupons();
      console.log('✅ Coupons fetch complete:', couponsData);
    } catch (error) {
      console.error('❌ Failed to fetch coupons:', error);
      setError('Failed to load coupons from database');
    }
    
    try {
      console.log('🏷️ Fetching categories...');
      categoriesData = await marketingService.getCategories();
    } catch (error) {
      console.error('❌ Failed to fetch categories:', error);
    }
    
    // Ensure we're setting array values and keeping promotions and coupons separate
    setPromotions(Array.isArray(promotionsData) ? promotionsData : []);
    setCoupons(Array.isArray(couponsData) ? couponsData : []);
    setSegments(Array.isArray(segmentsData) ? segmentsData : []);
    setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    
    // Only clear error if no errors occurred
    if (!error) {
      setError(null);
    }
    
    console.log('✅ Component state updated successfully');
  } catch (err) {
    console.error('❌ Error fetching data:', err);
    setError(`Failed to load data: ${err.message}`);
  } finally {
    setLoading(false);
    console.log('🏁 Data fetching process complete');
  }
};

  const handleMainTabChange = (event, newValue) => {
    setMainTab(newValue);
  };
  
  const handlePromotionsTabChange = (event, newValue) => {
    setPromotionsTab(newValue);
  };

  const handleCouponsTabChange = (event, newValue) => {
    setCouponsTab(newValue);
  };
  
  // Promotion dialog handlers
  const handleOpenPromotionDialog = (promotion = null) => {
    if (promotion) {
      setSelectedPromotion(promotion);
      setPromotionForm({
        name: promotion.name,
        description: promotion.description || '',
        code: promotion.code || '',
        type: promotion.type,
        value: promotion.value,
        min_purchase: promotion.min_purchase || 0,
        max_discount: promotion.max_discount || '',
        buy_quantity: promotion.buy_quantity || '',
        get_quantity: promotion.get_quantity || '',
        start_date: new Date(promotion.start_date),
        end_date: new Date(promotion.end_date),
        usage_limit: promotion.usage_limit || '',
        usage_limit_per_user: promotion.usage_limit_per_user || 1,
        applies_to: promotion.applies_to || 'entire_order',
        category_ids: Array.isArray(promotion.category_ids) 
          ? promotion.category_ids 
          : promotion.category_ids 
            ? [promotion.category_ids] 
            : [],
        product_ids: promotion.product_ids || [],
        segment_id: promotion.segment_id || '',
        image_url: promotion.image_url || '',
        is_active: promotion.is_active,
        trigger_type: promotion.trigger_type || 'cart_value',
        customer_description: promotion.customer_description || ''
      });
    } else {
      setSelectedPromotion(null);
      setPromotionForm({
        name: '',
        description: '',
        code: generateCode(),
        type: 'percentage',
        value: '',
        min_purchase: 0,
        max_discount: '',
        buy_quantity: '',
        get_quantity: '',
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usage_limit: '',
        usage_limit_per_user: 1,
        applies_to: 'entire_order',
        category_ids: [],
        product_ids: [],
        segment_id: '',
        image_url: '',
        is_active: true,
        trigger_type: 'cart_value',
        customer_description: ''
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

  const handleDateChange = (fieldName, date) => {
    setPromotionForm(prev => ({
      ...prev,
      [fieldName]: date
    }));
  };

  const handleCouponDateChange = (fieldName, date) => {
    setCouponForm(prev => ({
      ...prev,
      [fieldName]: date
    }));
  };

  const handleSubmitPromotion = async () => {
    try {
      setLoading(true);
      
      if (!promotionForm.name) {
        setError('Promotion name is required');
        setLoading(false);
        return;
      }
      
      if (promotionForm.type !== 'free_shipping' && !promotionForm.value) {
        setError('Discount value is required');
        setLoading(false);
        return;
      }
      
      // Create an object with the automatic promotion type explicitly set
      const requestData = {
        ...promotionForm,
        promotion_type: 'automatic',
        code: null // No code for automatic promotions
      };
      
      // Format data before sending to API
      const formattedData = formatDataForAPI(requestData);
      console.log('Automatic promotion data being sent to API:', formattedData);
      
      let result;
      if (selectedPromotion) {
        result = await marketingService.updatePromotion(selectedPromotion.id, formattedData);
      } else {
        result = await marketingService.createPromotion(formattedData);
      }
      
      if (result && result.id) {
        if (selectedPromotion) {
          setPromotions(prev => prev.map(p => p.id === selectedPromotion.id ? result : p));
          toast.success('Promotion updated successfully');
        } else {
          setPromotions(prev => [...prev, result]);
          toast.success('Promotion created successfully');
        }
        
        setPromotionDialog(false);
        setPromotionForm({
          name: '',
          description: '',
          code: generateCode(),
          type: 'percentage',
          value: '',
          min_purchase: 0,
          max_discount: '',
          buy_quantity: '',
          get_quantity: '',
          start_date: new Date(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          usage_limit: '',
          usage_limit_per_user: 1,
          applies_to: 'entire_order',
          category_ids: [],
          product_ids: [],
          segment_id: '',
          image_url: '',
          is_active: true,
          trigger_type: 'cart_value',
          customer_description: ''
        });
      }
    } catch (err) {
      console.error('Error saving promotion:', err);
      setError('Failed to save promotion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePromotion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promotion?')) return;
    
    try {
      setLoading(true);
      const result = await marketingService.deletePromotion(id);
      
      if (result && result.success) {
        setPromotions(prev => prev.filter(p => p.id !== id));
        setSuccess('Promotion deleted successfully');
      } else {
        throw new Error('Failed to delete promotion');
      }
    } catch (err) {
      console.error('Error deleting promotion:', err);
      setError('Failed to delete promotion. Please try again.');
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
      
      // Remove id to ensure it's created as new
      delete duplicateData.id;
      
      const newPromotion = await marketingService.createPromotion(duplicateData);
      setPromotions(prev => [...prev, newPromotion]);
      setSuccess('Promotion duplicated successfully');
    } catch (err) {
      console.error('Error duplicating promotion:', err);
      setError('Failed to duplicate promotion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActiveStatus = async (promotion) => {
    try {
      setLoading(true);
      
      const newStatus = !promotion.is_active;
      console.log(`${newStatus ? 'Activating' : 'Deactivating'} promotion: ${promotion.name} (ID: ${promotion.id})`);
      
      // Just update the is_active field via the standard update endpoint
      const result = await marketingService.togglePromotionStatus(promotion.id, newStatus);
      
      if (result && (result.success || result.data)) {
        // Update promotions in state
        setPromotions(prev => 
          prev.map(p => p.id === promotion.id ? {
            ...p,
            is_active: newStatus
          } : p)
        );
        
        // Display success message
        setSuccess(`Promotion ${newStatus ? 'activated' : 'deactivated'} successfully`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(result?.message || 'Failed to update promotion status');
      }
    } catch (error) {
      console.error('Error toggling promotion status:', error);
      setError(`Failed to ${promotion.is_active ? 'deactivate' : 'activate'} promotion: ${error.message}`);
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
        max_discount: coupon.max_discount || '',
        start_date: new Date(coupon.start_date),
        end_date: new Date(coupon.end_date),
        usage_limit: coupon.usage_limit || 100,
        usage_limit_per_user: coupon.usage_limit_per_user || 1,
        applies_to: coupon.applies_to || 'entire_order',
        category_ids: Array.isArray(coupon.category_ids) 
          ? coupon.category_ids 
          : coupon.category_ids 
            ? [coupon.category_ids] 
            : [],
        product_ids: coupon.product_ids || [],
        is_active: coupon.is_active,
        distribution_channel: coupon.distribution_channel || 'email',
        one_time_use: coupon.one_time_use || false,
        segment_id: coupon.segment_id || ''
      });
    } else {
      setSelectedCoupon(null);
      setCouponForm({
        code: generateCode(),
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        min_purchase: 0,
        max_discount: '',
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usage_limit: 100,
        usage_limit_per_user: 1,
        applies_to: 'entire_order',
        category_ids: [],
        product_ids: [],
        is_active: true,
        distribution_channel: 'email',
        one_time_use: false,
        segment_id: ''
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

  const handleSubmitCoupon = async () => {
    try {
      setLoading(true);
      
      // Validation
      if (!couponForm.code || !couponForm.discount_value) {
        setError('Coupon code and discount value are required');
        setLoading(false);
        return;
      }

      if (parseFloat(couponForm.discount_value) <= 0) {
        setError('Discount value must be greater than zero');
        setLoading(false);
        return;
      }

      if (couponForm.discount_type === 'percentage' && parseFloat(couponForm.discount_value) > 100) {
        setError('Percentage discount cannot exceed 100%');
        setLoading(false);
        return;
      }

      // Create an object with the coupon type explicitly set
      const requestData = {
        ...couponForm,
        promotion_type: 'coupon',
        // Ensure code exists
        code: couponForm.code || generateCode()
      };
      
      // Format data before sending to API
      const formattedData = formatDataForAPI(requestData);
      console.log('Coupon data being sent to API:', formattedData);
      
      let result;
      if (selectedCoupon) {
        result = await marketingService.updateCoupon(selectedCoupon.id, formattedData);
        console.log('Coupon update response:', result);
        const updatedCoupon = result.data || result;
        setCoupons(prev => prev.map(c => c.id === selectedCoupon.id ? updatedCoupon : c));
        setSuccess('Coupon updated successfully');
      } else {
        result = await marketingService.createCoupon(formattedData);
        console.log('Coupon creation response:', result);
        const newCoupon = result.data || result;
        setCoupons(prev => [...prev, newCoupon]);
        setSuccess('Coupon created successfully');
      }
      
      setCouponDialog(false);
      setError(null);
    } catch (err) {
      console.error('Error saving coupon:', err);
      setError('Failed to save coupon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      setLoading(true);
      const result = await marketingService.deleteCoupon(id);
      console.log('Coupon delete response:', result);
      
      if (result && result.success) {
        setCoupons(prev => prev.filter(c => c.id !== id));
        setSuccess('Coupon deleted successfully');
      } else {
        throw new Error('Failed to delete coupon');
      }
    } catch (err) {
      console.error('Error deleting coupon:', err);
      setError('Failed to delete coupon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Coupon validation handlers
  const handleOpenValidateDialog = () => {
    setCouponCode('');
    setValidationResult(null);
    setValidateDialog(true);
  };

  const handleCloseValidateDialog = () => {
    setValidateDialog(false);
  };

  const handleValidateCoupon = async () => {
    if (!couponCode) return;
    
    try {
      setLoading(true);
      const result = await marketingService.validateCoupon(couponCode);
      setValidationResult(result);
      setError(null);
    } catch (err) {
      console.error('Error validating coupon:', err);
      setValidationResult({
        valid: false,
        message: err.response?.data?.message || 'Invalid coupon code'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    setSuccess(`Code ${code} copied to clipboard`);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Helper functions
  const getPromotionStatus = (promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);
    
    if (!promotion.is_active) return 'paused';
    if (isBefore(now, startDate)) return 'scheduled';
    if (isAfter(now, endDate)) return 'expired';
    return 'active';
  };

  const getCouponStatus = (coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.start_date);
    const endDate = new Date(coupon.end_date);
    
    if (!coupon.is_active) return 'inactive';
    if (isBefore(now, startDate)) return 'scheduled';
    if (isAfter(now, endDate)) return 'expired';
    return 'active';
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'active':
        return <Chip icon={<ActiveIcon />} label="Active" color="success" size="small" />;
      case 'paused':
      case 'inactive':
        return <Chip icon={<PausedIcon />} label="Inactive" color="default" size="small" />;
      case 'scheduled':
        return <Chip icon={<ScheduledIcon />} label="Scheduled" color="info" size="small" />;
      case 'expired':
        return <Chip icon={<ArchivedIcon />} label="Expired" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const formatDiscount = (item) => {
    if (item.type === 'percentage' || item.discount_type === 'percentage') {
      return `${item.value || item.discount_value}% off`;
    } else if (item.type === 'fixed_amount' || item.discount_type === 'fixed') {
      return `$${parseFloat(item.value || item.discount_value).toFixed(2)} off`;
    } else if (item.type === 'free_shipping') {
      return 'Free Shipping';
    } else if (item.type === 'buy_x_get_y') {
      return `Buy ${item.buy_quantity} Get ${item.get_quantity} Free`;
    }
    return '';
  };

  // Filter data based on search term and active tab
  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = (
      (promotion.name && promotion.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (promotion.code && promotion.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (promotion.description && promotion.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    if (!matchesSearch) return false;
    
    const status = getPromotionStatus(promotion);
    
    if (promotionsTab === 0) return true; // Show all
    if (promotionsTab === 1) return status === 'active';
    if (promotionsTab === 2) return status === 'scheduled';
    if (promotionsTab === 3) return status === 'paused';
    if (promotionsTab === 4) return status === 'expired';
    
    return true;
  });

  const filteredCoupons = coupons.filter(coupon => {
    // First filter by search term
    const matchesSearch = (
      (coupon.code && coupon.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (coupon.description && coupon.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    if (!matchesSearch) return false;
    
    // Then filter by selected tab
    const status = getCouponStatus(coupon);
    
    if (couponsTab === 0) return true; // Show all
    if (couponsTab === 1) return status === 'active';
    if (couponsTab === 2) return status === 'scheduled';
    if (couponsTab === 3) return status === 'inactive';
    if (couponsTab === 4) return status === 'expired';
    
    return true;
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="promotions-manager">
        <div className="header">
          <Typography variant="h5" component="h1" className="title">
            {mainTab === 0 ? 'Promotions' : 'Coupons'} Manager
          </Typography>
          <div className="actions">
            {mainTab === 1 && (
              <Button 
                variant="outlined" 
                startIcon={<CouponIcon />} 
                onClick={handleOpenValidateDialog}
                className="action-button"
                sx={{ mr: 2 }}
              >
                Validate Coupon
              </Button>
            )}
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => mainTab === 0 ? handleOpenPromotionDialog() : handleOpenCouponDialog()}
              className="action-button"
            >
              {mainTab === 0 ? 'New Promotion' : 'New Coupon'}
            </Button>
          </div>
        </div>
        
        {/* Notifications */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}
        
        {/* Search Bar */}
        <TextField 
          placeholder={`Search ${mainTab === 0 ? 'promotions' : 'coupons'}...`}
          size="small"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          className="search-field"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        {/* Main Tabs */}
        <Paper elevation={6} className="tabs-container">
          <Tabs
            value={mainTab}
            onChange={handleMainTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
            className="main-tabs"
          >
            <Tab label="Promotions" icon={<OfferIcon />} />
            <Tab label="Coupons" icon={<CouponIcon />} />
          </Tabs>
        </Paper>

        {/* Loading State */}
        {loading && !(promotions.length || coupons.length) ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Promotions Tab */}
            {mainTab === 0 && (
              <div className="tab-content">
                <Box mb={3}>
                  <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                    <Typography variant="subtitle1" fontWeight="bold">About Promotions</Typography>
                    <Typography variant="body2">
                      Promotions are automatic discounts applied to qualifying orders without requiring a code. 
                      They can target specific products, categories, or customer behaviors.
                      Examples include "Buy one, get one free," "Free shipping over $50," or "10% off your first order."
                    </Typography>
                  </Paper>
                </Box>
                {/* Promotions Sub-Tabs */}
                <Paper className="sub-tabs-container">
                  <Tabs
                    value={promotionsTab}
                    onChange={handlePromotionsTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    <Tab label="All Promotions" />
                    <Tab label="Active" />
                    <Tab label="Scheduled" />
                    <Tab label="Discontinued" />
                    <Tab label="Expired" />
                  </Tabs>
                </Paper>
                
                {/* Add Create Promotion Button */}
                <Box display="flex" justifyContent="flex-end" mb={2} mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenPromotionDialog()}
                  >
                    Create Promotion
                  </Button>
                </Box>
                
                {filteredPromotions.length === 0 ? (
                  <div className="empty-state">
                    <OfferIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      No Promotions Found
                    </Typography>
                    <Typography color="textSecondary" paragraph>
                      {searchTerm ? "Try a different search term" : "Create your first promotion to offer discounts to your customers."}
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenPromotionDialog()}
                    >
                      Create First Promotion
                    </Button>
                  </div>
                ) : (
                  <Grid container spacing={3} className="promotions-grid">
                    {filteredPromotions.map(promotion => {
                      const status = getPromotionStatus(promotion);
                      const segment = Array.isArray(segments) ? 
                        segments.find(s => s.id === promotion.segment_id) : 
                        null;
                      
                      return (
                        // Update the promotion card layout in the filteredPromotions.map section (around line 939)

                      <Grid item key={promotion.id} xs={12} sm={6} md={4}>
                        <Card className="promotion-card">
                          <CardHeader
                            title={promotion.name}
                            subheader={formatDiscount(promotion)}
                            action={
                              getStatusChip(status) // Keep just the status chip here
                            }
                          />
                          <CardMedia
                            component="img"
                            height="140"
                            image={promotion.image_url || '/placeholder-image.jpg'}
                            alt={promotion.name}
                          />
                          <CardContent>
                            <Typography variant="body2" color="textSecondary">
                              {promotion.description}
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body2" color="textSecondary">
                              Valid from {format(new Date(promotion.start_date), 'MMM dd, yyyy')} to {format(new Date(promotion.end_date), 'MMM dd, yyyy')}
                            </Typography>
                            {segment && (
                              <Grid item xs={12}>
                                <Chip
                                  icon={<SegmentIcon fontSize="small" />}
                                  label={segment.name}
                                  size="small"
                                  variant="outlined"
                                  className="segment-chip"
                                />
                              </Grid>
                            )}
                          </CardContent>
                          <Divider />
                          {/* First action row with edit/delete buttons */}
                          <Box display="flex" justifyContent="space-between" p={2}>
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => handleOpenPromotionDialog(promotion)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDeletePromotion(promotion.id)}
                            >
                              Delete
                            </Button>
                          </Box>
                          {/* New bottom section with toggle switch */}
                          <Divider />
                          <Box display="flex" justifyContent="space-between" alignItems="center" p={1.5} bgcolor={promotion.is_active ? "success.50" : "action.hover"}>
                            <Typography variant="body2" color={promotion.is_active ? "success.main" : "text.secondary"}>
                              {promotion.is_active ? "Active" : "Inactive"}
                            </Typography>
                            <Switch
                              size="small"
                              checked={Boolean(promotion.is_active)}
                              onChange={() => handleToggleActiveStatus(promotion)}
                              color="primary"
                            />
                          </Box>
                        </Card>
                      </Grid>
                      );
                    })}
                  </Grid>
                )}
              </div>
            )}

            {/* Coupons Tab */}
            {mainTab === 1 && (
              <div className="tab-content">
                <Box mb={3}>
                  <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                    <Typography variant="subtitle1" fontWeight="bold">About Coupons</Typography>
                    <Typography variant="body2">
                      Coupons are discounts that require a specific code to be entered at checkout. 
                      They can be distributed through email, social media, or other marketing channels.
                      Examples include "Save 20% with code SPRING20" or "Free shipping with code FREESHIP."
                    </Typography>
                  </Paper>
                </Box>

                {/* Coupons Sub-Tabs */}
                <Paper className="sub-tabs-container">
                  <Tabs
                    value={couponsTab}
                    onChange={handleCouponsTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    <Tab label="All Coupons" />
                    <Tab label="Active" />
                    <Tab label="Scheduled" />
                    <Tab label="Discontinued" />
                    <Tab label="Expired" />
                  </Tabs>
                </Paper>

                {/* Add Create Coupon Button */}
                <Box display="flex" justifyContent="flex-end" mb={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenCouponDialog()}
                  >
                    Create Coupon
                  </Button>
                </Box>

                <TableContainer component={Paper} className="coupon-table">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Code</TableCell>
                        <TableCell>Discount</TableCell>
                        <TableCell>Validity Period</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredCoupons.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5}>
                            <div className="empty-state">
                              <CouponIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                              <Typography variant="h6" gutterBottom>
                                No Coupons Found
                              </Typography>
                              <Typography color="textSecondary" paragraph>
                                {searchTerm 
                                  ? "Try a different search term" 
                                  : couponsTab === 0
                                    ? "Create coupon codes to offer discounts to your customers."
                                    : couponsTab === 1
                                      ? "No active coupons found. Create new coupons or activate existing ones."
                                      : couponsTab === 2
                                        ? "No scheduled coupons found. Try setting a future start date for a coupon."
                                        : couponsTab === 3
                                          ? "No discontinued coupons found. Deactivate coupons to move them here."
                                          : "No expired coupons found. Coupons will appear here after their end date."
                                }
                              </Typography>
                              <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenCouponDialog()}
                                className="action-button"
                              >
                                Create First Coupon
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCoupons.map(coupon => {
                          const status = getCouponStatus(coupon);
                          
                          return (
                            <TableRow key={coupon.id}>
                              <TableCell>
                                <Box display="flex" alignItems="center">
                                  <Typography variant="body1" fontFamily="monospace" fontWeight="bold" className="coupon-code">
                                    {coupon.code}
                                  </Typography>
                                  <IconButton size="small" onClick={() => handleCopyCouponCode(coupon.code)} className="copy-button">
                                    <DuplicateIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                                {coupon.description && (
                                  <Typography variant="body2" color="textSecondary">
                                    {coupon.description}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Typography variant="body1">{formatDiscount(coupon)}</Typography>
                                {coupon.min_purchase && coupon.min_purchase > 0 && (
                                  <Typography variant="body2" color="textSecondary">
                                    Min. purchase: ${Number(coupon.min_purchase).toFixed(2)}
                                  </Typography>
                                )}
                                {coupon.max_discount && (
                                  <Typography variant="body2" color="textSecondary">
                                    Max discount: ${parseFloat(coupon.max_discount).toFixed(2)}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center">
                                  <CalendarIcon fontSize="small" sx={{ mr: 1 }} />
                                  <Box>
                                    <Typography variant="body2">
                                      {format(new Date(coupon.start_date), 'MMM dd')} - 
                                      {format(new Date(coupon.end_date), 'MMM dd')}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      {format(new Date(coupon.end_date), 'yyyy')}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                {getStatusChip(status)}
                              </TableCell>
                              <TableCell align="right">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleOpenCouponDialog(coupon)}
                                  className="edit-button"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  color="error" 
                                  onClick={() => handleDeleteCoupon(coupon.id)}
                                  className="delete-button"
                                >
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
              </div>
            )}
          </>
        )}

        {/* Promotion Dialog */}
        <Dialog 
          open={promotionDialog} 
          onClose={handleClosePromotionDialog} 
          maxWidth="md" 
          fullWidth
          className="dialog"
        >
          <DialogTitle>
            {selectedPromotion ? 'Edit Promotion' : 'Create New Promotion'}
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Promotions are automatically applied when customers meet the specified criteria.
            </Typography>

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
                    onClick={() => setPromotionForm(prev => ({...prev, code: generateCode()}))}
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
                    value={promotionForm.get_quantity}
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
                <DatePicker
                  label="Start Date"
                  value={promotionForm.start_date}
                  onChange={(date) => handleDateChange('start_date', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
                <DatePicker
                  label="End Date"
                  value={promotionForm.end_date}
                  onChange={(date) => handleDateChange('end_date', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={promotionForm.start_date}
                />
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
                          {ensureArray(selected).map((value) => {
                            const category = categories.find(c => c.id === value);
                            return (
                              <Chip key={value} label={category ? category.name : value} size="small" />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No categories available</MenuItem>
                      )}
                    </Select>
                    {categories.length === 0 && (
                      <FormHelperText error>
                        No categories found in database. Please add categories first.
                      </FormHelperText>
                    )}
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
                    {Array.isArray(segments) ? segments.map(segment => (
                      <MenuItem key={segment.id} value={segment.id}>
                        {segment.name}
                      </MenuItem>
                    )) : null}
                  </Select>
                  {!Array.isArray(segments) || segments.length === 0 ? (
                    <FormHelperText>
                      No customer segments found in database
                    </FormHelperText>
                  ) : null}
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

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Promotion Trigger</InputLabel>
                  <Select
                    name="trigger_type"
                    value={promotionForm.trigger_type || 'cart_value'}
                    onChange={handlePromotionFormChange}
                    label="Promotion Trigger"
                  >
                    <MenuItem value="cart_value">Cart Value (Minimum Purchase)</MenuItem>
                    <MenuItem value="product_quantity">Product Quantity</MenuItem>
                    <MenuItem value="first_purchase">First Purchase</MenuItem>
                    <MenuItem value="category_purchase">Category Purchase</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Customer-Facing Description"
                  name="customer_description"
                  value={promotionForm.customer_description || ''}
                  onChange={handlePromotionFormChange}
                  helperText="This will be displayed to customers (e.g., 'Buy one, get one free on all hardware tools')"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions className="dialog-actions">
            <Button onClick={handleClosePromotionDialog}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSubmitPromotion} 
              disabled={loading}
              className="submit-button"
            >
              {loading ? <CircularProgress size={24} /> : 'Save Promotion'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Coupon Dialog */}
        <Dialog 
          open={couponDialog} 
          onClose={handleCloseCouponDialog}
          maxWidth="md"
          fullWidth
          className="dialog"
        >
          <DialogTitle>
            {selectedCoupon ? 'Edit Coupon' : 'Create New Coupon'}
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Coupons require customers to enter a code at checkout to receive the discount.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Coupon Code"
                  name="code"
                  value={couponForm.code}
                  onChange={handleCouponFormChange}
                  fullWidth
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button 
                          size="small" 
                          onClick={() => setCouponForm(prev => ({...prev, code: generateCode()}))}
                        >
                          Generate
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Discount Type</InputLabel>
                  <Select
                    name="discount_type"
                    value={couponForm.discount_type}
                    label="Discount Type"
                    onChange={handleCouponFormChange}
                  >
                    <MenuItem value="percentage">Percentage Discount</MenuItem>
                    <MenuItem value="fixed">Fixed Amount</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={couponForm.discount_type === 'percentage' ? 'Discount (%)' : 'Discount Amount ($)'}
                  name="discount_value"
                  type="number"
                  value={couponForm.discount_value}
                  onChange={handleCouponFormChange}
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
                  label="Minimum Purchase ($)"
                  name="min_purchase"
                  type="number"
                  value={couponForm.min_purchase}
                  onChange={handleCouponFormChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              {couponForm.discount_type === 'percentage' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Maximum Discount ($)"
                    name="max_discount"
                    type="number"
                    value={couponForm.max_discount}
                    onChange={handleCouponFormChange}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions className="dialog-actions">
            <Button onClick={handleCloseCouponDialog}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSubmitCoupon} 
              disabled={loading}
              className="submit-button"
            >
              {loading ? <CircularProgress size={24} /> : 'Save Coupon'}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </LocalizationProvider>
  );
};

export default PromotionsManager;