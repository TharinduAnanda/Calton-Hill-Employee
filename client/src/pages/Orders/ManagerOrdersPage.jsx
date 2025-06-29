import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, Grid, Paper, 
  TextField, Button, FormControl, InputLabel, 
  Select, MenuItem, Card, CardContent, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination, 
  Chip, IconButton, Tooltip, Divider,
  Alert, Dialog, DialogTitle, DialogContent, 
  DialogActions, InputAdornment
} from '@mui/material';
import { 
  FilterAlt, Refresh, Visibility, 
  Person, Payment, LocalShipping, 
  Edit, SearchOutlined
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  getFilteredOrders, 
  getManagerOrderStats, 
  updateOrderPayment,
  updateOrderStatus,
  assignStaffToOrder
} from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/helpers';

// Payment status options
const paymentStatusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' }
];

// Delivery status options
const deliveryStatusOptions = [
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
];

// Payment method options
const paymentMethodOptions = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' }
];

// Source options
const sourceOptions = [
  { value: 'website', label: 'Website' },
  { value: 'phone', label: 'Phone' },
  { value: 'store', label: 'In-store' },
  { value: 'marketplace', label: 'Marketplace' }
];

// Status chip color mapper
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'warning';
    case 'processing': return 'info';
    case 'shipped': return 'primary';
    case 'delivered': return 'success';
    case 'cancelled': return 'error';
    case 'paid': return 'success';
    case 'failed': return 'error';
    case 'refunded': return 'default';
    default: return 'default';
  }
};

// Manager Orders Page Component
const ManagerOrdersPage = () => {
  const navigate = useNavigate();
  
  // States for filters
  const [filters, setFilters] = useState({
    paymentStatus: '',
    deliveryStatus: '',
    startDate: null,
    endDate: null,
    customerId: '',
    staffId: '',
    source: '',
    sort: 'Order_Date',
    order: 'DESC',
    search: ''
  });
  
  // States for orders and pagination
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  
  // States for statistics
  const [stats, setStats] = useState({
    paymentStatusCounts: [],
    paymentMethodCounts: [],
    sourceCounts: [],
    dailySales: []
  });
  const [loadingStats, setLoadingStats] = useState(true);
  
  // States for dialogs
  const [paymentDialog, setPaymentDialog] = useState({
    open: false,
    orderId: null,
    paymentStatus: '',
    paymentReference: '',
    paymentMethod: ''
  });
  const [statusDialog, setStatusDialog] = useState({
    open: false,
    orderId: null,
    deliveryStatus: ''
  });
  const [staffDialog, setStaffDialog] = useState({
    open: false,
    orderId: null,
    staffId: ''
  });
  
  // Staff list (would typically be fetched from API)
  const [staffList, setStaffList] = useState([
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Mike Johnson' }
  ]);
  
  // Fetch orders when filters or pagination change
  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, filters.sort, filters.order]);
  
  // Fetch statistics on component mount
  useEffect(() => {
    fetchStats();
  }, []);
  
  // Function to fetch filtered orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const filterParams = {
        ...filters,
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        startDate: filters.startDate ? formatDate(filters.startDate, 'yyyy-MM-dd') : undefined,
        endDate: filters.endDate ? formatDate(filters.endDate, 'yyyy-MM-dd') : undefined
      };
      
      // Remove empty filters
      Object.keys(filterParams).forEach(key => {
        if (filterParams[key] === '' || filterParams[key] === null || filterParams[key] === undefined) {
          delete filterParams[key];
        }
      });
      
      const response = await getFilteredOrders(filterParams);
      setOrders(response.orders);
      setTotalOrders(response.total);
    } catch (error) {
      toast.error('Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fetch manager order statistics
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const statsData = await getManagerOrderStats();
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to fetch order statistics');
      console.error('Error fetching order stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };
  
  // Handle filter change
  const handleFilterChange = (field) => (event) => {
    setFilters({
      ...filters,
      [field]: event.target.value
    });
  };
  
  // Handle date filter change
  const handleDateChange = (field) => (date) => {
    setFilters({
      ...filters,
      [field]: date
    });
  };
  
  // Apply filters
  const applyFilters = () => {
    setPage(0); // Reset to first page when applying new filters
    fetchOrders();
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      paymentStatus: '',
      deliveryStatus: '',
      startDate: null,
      endDate: null,
      customerId: '',
      staffId: '',
      source: '',
      sort: 'Order_Date',
      order: 'DESC',
      search: ''
    });
    setPage(0);
  };
  
  // Handle page change in pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // View order details
  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };
  
  // Open payment dialog
  const handleOpenPaymentDialog = (order) => {
    setPaymentDialog({
      open: true,
      orderId: order.Order_ID,
      paymentStatus: order.Payment_Status || '',
      paymentReference: order.payment_reference || '',
      paymentMethod: order.payment_method || ''
    });
  };
  
  // Open status dialog
  const handleOpenStatusDialog = (order) => {
    setStatusDialog({
      open: true,
      orderId: order.Order_ID,
      deliveryStatus: order.Delivery_Status || ''
    });
  };
  
  // Open assign staff dialog
  const handleOpenStaffDialog = (order) => {
    setStaffDialog({
      open: true,
      orderId: order.Order_ID,
      staffId: order.Staff_ID || ''
    });
  };
  
  // Close payment dialog
  const handleClosePaymentDialog = () => {
    setPaymentDialog({
      open: false,
      orderId: null,
      paymentStatus: '',
      paymentReference: '',
      paymentMethod: ''
    });
  };
  
  // Close status dialog
  const handleCloseStatusDialog = () => {
    setStatusDialog({
      open: false,
      orderId: null,
      deliveryStatus: ''
    });
  };
  
  // Close staff dialog
  const handleCloseStaffDialog = () => {
    setStaffDialog({
      open: false,
      orderId: null,
      staffId: ''
    });
  };
  
  // Update payment details
  const handleUpdatePayment = async () => {
    try {
      await updateOrderPayment(paymentDialog.orderId, {
        paymentStatus: paymentDialog.paymentStatus,
        paymentReference: paymentDialog.paymentReference,
        paymentMethod: paymentDialog.paymentMethod
      });
      
      toast.success('Payment details updated successfully');
      handleClosePaymentDialog();
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update payment details');
      console.error('Error updating payment details:', error);
    }
  };
  
  // Update order status
  const handleUpdateStatus = async () => {
    try {
      await updateOrderStatus(statusDialog.orderId, {
        deliveryStatus: statusDialog.deliveryStatus
      });
      
      toast.success('Order status updated successfully');
      handleCloseStatusDialog();
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Error updating order status:', error);
    }
  };
  
  // Assign staff to order
  const handleAssignStaff = async () => {
    try {
      await assignStaffToOrder(staffDialog.orderId, staffDialog.staffId);
      
      toast.success('Staff assigned successfully');
      handleCloseStaffDialog();
      fetchOrders();
    } catch (error) {
      toast.error('Failed to assign staff');
      console.error('Error assigning staff:', error);
    }
  };
  
  // Render statistics cards
  const renderStatCards = () => {
    // Calculate total revenue
    const totalRevenue = stats.paymentStatusCounts
      .filter(item => item.status === 'paid')
      .reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    
    // Calculate pending revenue
    const pendingRevenue = stats.paymentStatusCounts
      .filter(item => item.status === 'pending')
      .reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    
    // Calculate total orders
    const totalOrderCount = stats.paymentStatusCounts
      .reduce((sum, item) => sum + parseInt(item.count || 0), 0);
    
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Total Orders</Typography>
              <Typography variant="h4">{totalOrderCount || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Total Revenue</Typography>
              <Typography variant="h4">{formatCurrency(totalRevenue || 0)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Pending Revenue</Typography>
              <Typography variant="h4">{formatCurrency(pendingRevenue || 0)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Average Order Value</Typography>
              <Typography variant="h4">
                {totalOrderCount > 0 
                  ? formatCurrency((totalRevenue + pendingRevenue) / totalOrderCount) 
                  : formatCurrency(0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };
  
  return (
    <Container maxWidth="xl">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Order Management
        </Typography>
        
        {/* Statistics Section */}
        <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Order Statistics
          </Typography>
          {loadingStats ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <div>Loading statistics...</div>
            </Box>
          ) : (
            renderStatCards()
          )}
        </Paper>
        
        {/* Filters Section */}
        <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel id="payment-status-label">Payment Status</InputLabel>
                <Select
                  labelId="payment-status-label"
                  value={filters.paymentStatus}
                  onChange={handleFilterChange('paymentStatus')}
                  label="Payment Status"
                >
                  <MenuItem value="">All</MenuItem>
                  {paymentStatusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel id="delivery-status-label">Delivery Status</InputLabel>
                <Select
                  labelId="delivery-status-label"
                  value={filters.deliveryStatus}
                  onChange={handleFilterChange('deliveryStatus')}
                  label="Delivery Status"
                >
                  <MenuItem value="">All</MenuItem>
                  {deliveryStatusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel id="source-label">Source</InputLabel>
                <Select
                  labelId="source-label"
                  value={filters.source}
                  onChange={handleFilterChange('source')}
                  label="Source"
                >
                  <MenuItem value="">All</MenuItem>
                  {sourceOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Customer ID"
                value={filters.customerId}
                onChange={handleFilterChange('customerId')}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Staff ID"
                value={filters.staffId}
                onChange={handleFilterChange('staffId')}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={filters.startDate}
                  onChange={handleDateChange('startDate')}
                  renderInput={(params) => <TextField size="small" fullWidth {...params} />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={filters.endDate}
                  onChange={handleDateChange('endDate')}
                  renderInput={(params) => <TextField size="small" fullWidth {...params} />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Search"
                value={filters.search}
                onChange={handleFilterChange('search')}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={resetFilters}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={<FilterAlt />}
              onClick={applyFilters}
              color="primary"
            >
              Apply Filters
            </Button>
          </Box>
        </Paper>
        
        {/* Orders Table Section */}
        <Paper elevation={2}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Orders
            </Typography>
            <Button 
              startIcon={<Refresh />}
              onClick={fetchOrders}
              color="primary"
            >
              Refresh
            </Button>
          </Box>
          
          <Divider />
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <div>Loading orders...</div>
            </Box>
          ) : orders.length === 0 ? (
            <Alert severity="info" sx={{ m: 2 }}>No orders found matching the filters</Alert>
          ) : (
            <Box>
              <TableContainer>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Total Amount</TableCell>
                      <TableCell>Payment Status</TableCell>
                      <TableCell>Delivery Status</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Staff</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.Order_ID} hover>
                        <TableCell>{order.Order_ID}</TableCell>
                        <TableCell>{formatDate(order.Order_Date)}</TableCell>
                        <TableCell>{order.CustomerName || 'N/A'}</TableCell>
                        <TableCell>{formatCurrency(order.Total_Amount || 0)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={order.Payment_Status || 'N/A'} 
                            color={getStatusColor(order.Payment_Status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={order.Delivery_Status || 'N/A'} 
                            color={getStatusColor(order.Delivery_Status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{order.source || 'N/A'}</TableCell>
                        <TableCell>{order.StaffName || 'Unassigned'}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small"
                                onClick={() => handleViewOrder(order.Order_ID)}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Update Payment">
                              <IconButton 
                                size="small"
                                onClick={() => handleOpenPaymentDialog(order)}
                              >
                                <Payment fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Update Status">
                              <IconButton 
                                size="small"
                                onClick={() => handleOpenStatusDialog(order)}
                              >
                                <LocalShipping fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Assign Staff">
                              <IconButton 
                                size="small"
                                onClick={() => handleOpenStaffDialog(order)}
                              >
                                <Person fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                component="div"
                count={totalOrders}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </Box>
          )}
        </Paper>
      </Box>
      
      {/* Payment Dialog */}
      <Dialog open={paymentDialog.open} onClose={handleClosePaymentDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Update Payment Details</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Payment Status</InputLabel>
            <Select
              value={paymentDialog.paymentStatus}
              onChange={(e) => setPaymentDialog({...paymentDialog, paymentStatus: e.target.value})}
              label="Payment Status"
            >
              {paymentStatusOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentDialog.paymentMethod}
              onChange={(e) => setPaymentDialog({...paymentDialog, paymentMethod: e.target.value})}
              label="Payment Method"
            >
              {paymentMethodOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            margin="normal"
            label="Payment Reference"
            value={paymentDialog.paymentReference}
            onChange={(e) => setPaymentDialog({...paymentDialog, paymentReference: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentDialog}>Cancel</Button>
          <Button onClick={handleUpdatePayment} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Status Dialog */}
      <Dialog open={statusDialog.open} onClose={handleCloseStatusDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Delivery Status</InputLabel>
            <Select
              value={statusDialog.deliveryStatus}
              onChange={(e) => setStatusDialog({...statusDialog, deliveryStatus: e.target.value})}
              label="Delivery Status"
            >
              {deliveryStatusOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Cancel</Button>
          <Button onClick={handleUpdateStatus} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Staff Assignment Dialog */}
      <Dialog open={staffDialog.open} onClose={handleCloseStaffDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Assign Staff</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Staff Member</InputLabel>
            <Select
              value={staffDialog.staffId}
              onChange={(e) => setStaffDialog({...staffDialog, staffId: e.target.value})}
              label="Staff Member"
            >
              <MenuItem value="">Unassigned</MenuItem>
              {staffList.map(staff => (
                <MenuItem key={staff.id} value={staff.id}>
                  {staff.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStaffDialog}>Cancel</Button>
          <Button onClick={handleAssignStaff} variant="contained" color="primary">
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManagerOrdersPage; 