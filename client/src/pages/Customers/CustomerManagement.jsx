import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Paper, Button, TextField, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination, Chip,
  IconButton, InputAdornment, Dialog, CircularProgress, Alert
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import customerService from '../../services/customerService';
import CustomerDetails from '../Customers/CustomerDetails';
// import AddCustomerForm from '../Customers/AddCustomerForm';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list, details, add
  
  // Fetch customers on initial load
  useEffect(() => {
    const fetchCustomers = async () => {
  try {
    setLoading(true);
    const response = await customerService.getAllCustomers({
      page: page + 1, // API uses 1-based pagination
      limit: rowsPerPage,
      search: searchTerm
    });
    
    if (response.success) {
      setCustomers(response.customers);
      setTotalCustomers(response.pagination.total);
      setError(null);
    } else {
      console.error('Error fetching customers:', response.error);
      setError(response.error.message || 'Failed to load customers');
    }
  } catch (err) {
    console.error('Error fetching customers:', err);
    setError('Failed to load customers. Please try again.');
  } finally {
    setLoading(false);
  }
};

    fetchCustomers();
  }, [page, rowsPerPage, searchTerm]);
  
  // Add this function outside the useEffect
  const refreshCustomerList = async () => {
  try {
    setLoading(true);
    const response = await customerService.getAllCustomers({
      page: page + 1,
      limit: rowsPerPage,
      search: searchTerm
    });
    
    if (response.success) {
      setCustomers(response.customers);
      setTotalCustomers(response.pagination.total);
      setError(null);
    } else {
      console.error('Error refreshing customers:', response.error);
      setError(response.error.message || 'Failed to refresh customers');
    }
  } catch (err) {
    console.error('Error refreshing customers:', err);
    setError('Failed to refresh customers. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  const handleViewDetails = (customerId) => {
    setSelectedCustomer(customerId);
    setViewMode('details');
  };
  
  // const handleAddCustomer = () => {
  //   setViewMode('add');
  // };
  
  // Then update the handleBackToList function
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCustomer(null);
    // Refresh customer list
    refreshCustomerList();
  };
  
  // Render customer details view
  if (viewMode === 'details' && selectedCustomer) {
    return (
      <Box>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToList}
          sx={{ mb: 2 }}
        >
          Back to Customer List
        </Button>
        <CustomerDetails id={selectedCustomer} isEmbedded={true} />
      </Box>
    );
  }
  
  // Render add customer form
  if (viewMode === 'add') {
    return (
      <Box>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToList}
          sx={{ mb: 2 }}
        >
          Back to Customer List
        </Button>
        {/* <AddCustomerForm onSuccess={handleBackToList} /> */}
      </Box>
    );
  }
  
  // Render customer list view (default)
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Customer Management</Typography>
        
      </Box>
      
      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search customers by name, email or phone..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Segment</TableCell>
                  <TableCell>Loyalty Points</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.ID}>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone || 'N/A'}</TableCell>
                      <TableCell>
                        {customer.segment_name ? (
                          <Chip label={customer.segment_name} size="small" color="primary" />
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>{customer.loyalty_points || 0}</TableCell>
                      <TableCell align="center">
                        <IconButton 
                          onClick={() => handleViewDetails(customer.ID)}
                          color="primary"
                          size="small"
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalCustomers}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
    </Box>
  );
};

export default CustomerManagement;