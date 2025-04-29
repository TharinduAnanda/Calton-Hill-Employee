import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Divider,
  TextField,
  Button,
  Grid,
  Autocomplete,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createOrder } from '../../services/orderService';
import productService from '../../services/productService';
import { getAllCustomers } from '../../services/customerService';
import { formatCurrency } from '../../utils/helpers';

const initialOrderItem = {
  product: null,
  quantity: 1,
  price: 0,
  discount: 0,
  total: 0
};

const CreateOrderForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orderStatus] = useState('pending');
  
  const [orderItems, setOrderItems] = useState([{ ...initialOrderItem }]);
  const [customer, setCustomer] = useState(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0
  });

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [productsRes, customersRes] = await Promise.all([
        productService.getAllProducts(),
        getAllCustomers()
      ]);
      setProducts(productsRes.data);
      setCustomers(customersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load required data');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculateOrderSummary = useCallback(() => {
    const subtotal = orderItems.reduce((sum, item) => sum + (item.total || 0), 0);
    const taxRate = 0.07;
    const taxAmount = subtotal * taxRate;
    const shippingCost = subtotal > 0 ? 10 : 0;
    
    setOrderSummary({
      subtotal,
      tax: taxAmount,
      shipping: shippingCost,
      total: subtotal + taxAmount + shippingCost
    });
  }, [orderItems]);

  useEffect(() => {
    calculateOrderSummary();
  }, [calculateOrderSummary]);

  const handleCustomerChange = (event, newValue) => {
    setCustomer(newValue);
    if (newValue && newValue.address) {
      setShippingAddress(
        `${newValue.address.street}, ${newValue.address.city}, ${newValue.address.state}, ${newValue.address.zipCode}, ${newValue.address.country}`
      );
    } else {
      setShippingAddress('');
    }
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { ...initialOrderItem }]);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...orderItems];
    updatedItems.splice(index, 1);
    setOrderItems(updatedItems);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...orderItems];
    updatedItems[index][field] = value;
    
    if (field === 'product' && value) {
      updatedItems[index].price = value.price;
    }
    
    if (['product', 'quantity', 'price', 'discount'].includes(field)) {
      const item = updatedItems[index];
      if (item.product && item.quantity && item.price) {
        const discountAmount = (item.price * item.quantity) * (item.discount / 100);
        item.total = (item.price * item.quantity) - discountAmount;
      }
    }
    
    setOrderItems(updatedItems);
  };

  const validateOrder = () => {
    if (!customer) {
      toast.error('Please select a customer');
      return false;
    }
    
    if (!shippingAddress.trim()) {
      toast.error('Shipping address is required');
      return false;
    }
    
    if (orderItems.length === 0) {
      toast.error('Please add at least one item to the order');
      return false;
    }
    
    for (const item of orderItems) {
      if (!item.product) {
        toast.error('All order items must have a product selected');
        return false;
      }
      
      if (!item.quantity || item.quantity <= 0) {
        toast.error('All products must have a valid quantity');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateOrder()) return;
    
    const orderData = {
      customer: customer._id,
      items: orderItems.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        total: item.total
      })),
      shippingAddress,
      status: orderStatus,
      subtotal: orderSummary.subtotal,
      tax: orderSummary.tax,
      shipping: orderSummary.shipping,
      total: orderSummary.total,
      notes
    };
    
    setLoading(true);
    try {
      const response = await createOrder(orderData);
      toast.success('Order created successfully');
      navigate(`/orders/${response.data._id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={2}>
      <Box p={3}>
        <Typography variant="h5" gutterBottom>
          Create New Order
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Customer Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={customers}
                getOptionLabel={(option) => option.name}
                value={customer}
                onChange={handleCustomerChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Customer"
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Shipping Address"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" gutterBottom>
                  Order Items
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddItem}
                  variant="outlined"
                  size="small"
                >
                  Add Item
                </Button>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width="40%">Product</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Discount (%)</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Autocomplete
                            options={products}
                            getOptionLabel={(option) => option.name || ''}
                            isOptionEqualToValue={(option, value) => option._id === value._id}
                            value={item.product}
                            onChange={(e, newValue) => handleItemChange(index, 'product', newValue)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select Product"
                                required
                                size="small"
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                            size="small"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                            size="small"
                            fullWidth
                            InputProps={{ inputProps: { min: 1 } }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.discount}
                            onChange={(e) => handleItemChange(index, 'discount', Number(e.target.value))}
                            size="small"
                            fullWidth
                            InputProps={{ inputProps: { min: 0, max: 100 } }}
                          />
                        </TableCell>
                        <TableCell>
                          {formatCurrency(item.total)}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveItem(index)}
                            disabled={orderItems.length === 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            
            <Grid item xs={12} md={6} sx={{ ml: 'auto', mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body1">Subtotal:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" align="right">
                      {formatCurrency(orderSummary.subtotal)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body1">Tax (7%):</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" align="right">
                      {formatCurrency(orderSummary.tax)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body1">Shipping:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" align="right">
                      {formatCurrency(orderSummary.shipping)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="h6">Total:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6" align="right">
                      {formatCurrency(orderSummary.total)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <TextField
                label="Order Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder="Add any special instructions or notes about this order"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                select
                label="Order Status"
                value={orderStatus}
                fullWidth
                disabled
              >
                <MenuItem value="pending">Pending</MenuItem>
              </TextField>
              <Typography variant="caption" color="textSecondary">
                New orders are automatically set to Pending status
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/orders')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Order'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Paper>
  );
};

export default CreateOrderForm;