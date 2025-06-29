import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  IconButton,
  Tabs,
  Tab,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
// import axios from '../../utils/axiosConfig';
import mockReturnsService from '../../services/mockReturnsService';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const ReturnsList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [returns, setReturns] = useState([]);
  const [filteredReturns, setFilteredReturns] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    startDate: null,
    endDate: null
  });
  const [tabValue, setTabValue] = useState(0);
  const [statistics, setStatistics] = useState({
    total_returns: 0,
    total_refund_amount: 0,
    status_distribution: []
  });

  // Define tabs
  const tabs = [
    { label: 'All Returns', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Completed', value: 'COMPLETED' }
  ];

  useEffect(() => {
    fetchReturns();
    fetchReturnStatistics();
  }, []);

  useEffect(() => {
    // Set status filter based on selected tab
    setFilters({
      ...filters,
      status: tabs[tabValue].value
    });
    setPage(0); // Reset to first page when changing tabs
  }, [tabValue]);

  useEffect(() => {
    // Apply filters when they change
    fetchReturns();
  }, [filters, page, rowsPerPage]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let queryParams = {
        page: page + 1,
        limit: rowsPerPage
      };
      
      if (filters.status) {
        queryParams.status = filters.status;
      }
      
      if (filters.startDate && filters.endDate) {
        queryParams.startDate = format(filters.startDate, 'yyyy-MM-dd');
        queryParams.endDate = format(filters.endDate, 'yyyy-MM-dd');
      }
      
      // Use mock service instead of real API call
      const response = await mockReturnsService.getReturns(queryParams);
      
      // Make sure response has the expected data structure
      if (response.data && response.data.data) {
        setReturns(response.data.data);
        setTotalCount(response.data.pagination?.total || 0);
      } else {
        setReturns([]);
        setTotalCount(0);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching returns:', err);
      setError('Failed to fetch returns. Please try again.');
      setReturns([]);
      setLoading(false);
    }
  };

  const fetchReturnStatistics = async () => {
    try {
      // Use mock service instead of real API call
      const response = await mockReturnsService.getReturnStatistics();
      
      // Make sure response has the expected data structure
      if (response.data && response.data.data) {
        setStatistics(response.data.data);
      } else {
        // Set default values if data is missing
        setStatistics({
          total_returns: 0,
          total_refund_amount: 0,
          status_distribution: []
        });
      }
    } catch (err) {
      console.error('Error fetching return statistics:', err);
      // Set default values if request fails
      setStatistics({
        total_returns: 0,
        total_refund_amount: 0,
        status_distribution: []
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
    setPage(0); // Reset to first page when changing filters
  };

  const handleDateChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value
    });
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'info';
      case 'REJECTED':
        return 'error';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Returns Management</Typography>
        <Box>
          <Tooltip title="Return Statistics">
            <IconButton 
              color="primary" 
              component={RouterLink} 
              to="/returns/statistics"
              sx={{ mr: 1 }}
            >
              <BarChartIcon />
            </IconButton>
          </Tooltip>
        
        </Box>
      </Box>
      
      {/* Statistics Cards */}
      {statistics && (
        <Box mb={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Returns
                </Typography>
                <Typography variant="h4">{statistics.total_returns}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Value: {formatCurrency(statistics.total_refund_amount)}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={9}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status Distribution
                </Typography>
                <Box display="flex" gap={2}>
                  {statistics.status_distribution && statistics.status_distribution.map ? (
                    statistics.status_distribution.map((item) => (
                      <Chip
                        key={item.status}
                        label={`${item.status}: ${item.count}`}
                        color={getStatusColor(item.status)}
                        variant="outlined"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No status data available</Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabs.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>
        </Box>
        
        {/* Filters */}
        <Box p={2} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Start Date"
                      value={filters.startDate}
                      onChange={(date) => handleDateChange('startDate', date)}
                      renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="End Date"
                      value={filters.endDate}
                      onChange={(date) => handleDateChange('endDate', date)}
                      renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button 
                fullWidth 
                variant="outlined" 
                onClick={() => {
                  setFilters({
                    status: tabs[tabValue].value,
                    startDate: null,
                    endDate: null
                  });
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Box>
        
        {/* Returns Table */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box p={3}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : returns.length === 0 ? (
          <Box p={3}>
            <Alert severity="info">No returns found with the selected filters.</Alert>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Return ID</TableCell>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Refund Amount</TableCell>
                  <TableCell align="right">Items</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(returns) ? returns.map((returnItem) => (
                  <TableRow key={returnItem.return_id}>
                    <TableCell>#{returnItem.return_id}</TableCell>
                    <TableCell>#{returnItem.order_id}</TableCell>
                    <TableCell>{returnItem.customer_name}</TableCell>
                    <TableCell>
                      {format(new Date(returnItem.request_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={returnItem.status}
                        color={getStatusColor(returnItem.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(returnItem.total_refund_amount)}
                    </TableCell>
                    <TableCell align="right">{returnItem.total_items}</TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        component={RouterLink} 
                        to={`/returns/${returnItem.return_id}`}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      {returnItem.status === 'APPROVED' && (
                        <Tooltip title="Process Refund">
                          <IconButton 
                            size="small" 
                            color="primary"
                            component={RouterLink}
                            to={`/returns/${returnItem.return_id}/complete`}
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {returnItem.status === 'PENDING' && (
                        <Tooltip title="Requires Attention">
                          <IconButton size="small" color="warning">
                            <WarningIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Alert severity="warning">Invalid data format received from server</Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default ReturnsList;