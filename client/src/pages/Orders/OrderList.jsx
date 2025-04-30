import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  CircularProgress,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip
} from '@mui/material';
import { 
  Visibility, 
  Search,
  Receipt
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllOrders } from '../../services/orderService';
import { formatDate, formatCurrency } from '../../utils/helpers';

/**
 * Fetches orders with optional status filter
 * @param {Function} setOrders - State setter for orders
 * @param {Function} setLoading - State setter for loading state
 * @param {string} statusFilter - Optional status filter
 */
function fetchOrderData(setOrders, setLoading, statusFilter) {
  setLoading(true);
  
  // Prepare params object for getAllOrders
  const params = statusFilter ? { status: statusFilter } : {};
  
  getAllOrders(params)
    .then(response => {
      // Check for expected response structure
      if (response && response.data) {
        setOrders(response.data);
      } else {
        // Handle unexpected response format
        console.error('Unexpected orders response format:', response);
        setOrders([]);
        toast.error('Unexpected data format received');
      }
    })
    .catch(error => {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setOrders([]);
    })
    .finally(() => {
      setLoading(false);
    });
}

/**
 * Returns appropriate color for status chip
 * @param {string} status - Order status
 * @returns {string} Material-UI color name
 */
function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'pending': return 'warning';
    case 'processing': return 'info';
    case 'shipped': return 'primary';
    case 'delivered': return 'success';
    case 'cancelled': return 'error';
    default: return 'default';
  }
}

/**
 * Filters orders based on search term
 * @param {Array} orders - All orders
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered orders
 */
function filterOrders(orders, searchTerm) {
  if (!searchTerm) return orders;
  
  const term = searchTerm.toLowerCase();
  return orders.filter(order => 
    order.orderNumber?.toString().includes(term) ||
    order.customer?.name?.toLowerCase().includes(term) ||
    order.status?.toLowerCase().includes(term)
  );
}

/**
 * Order List component
 * @param {Object} props - Component props
 * @param {boolean} props.refresh - Refresh trigger
 * @param {Function} props.onRefresh - Refresh callback
 * @param {string} props.statusFilter - Optional status filter
 */
function OrderList({ refresh, onRefresh, statusFilter }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  // Effect for fetching orders
  useEffect(() => {
    fetchOrderData(setOrders, setLoading, statusFilter);
  }, [statusFilter, refresh]);

  /**
   * Handles page change in pagination
   * @param {Event} event - Change event
   * @param {number} newPage - New page number
   */
  function handleChangePage(event, newPage) {
    setPage(newPage);
  }

  /**
   * Handles rows per page change
   * @param {Event} event - Change event
   */
  function handleChangeRowsPerPage(event) {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }

  /**
   * Navigates to order details
   * @param {string} id - Order ID
   */
  function handleView(id) {
    navigate(`/orders/${id}`);
  }

  /**
   * Navigates to order invoice
   * @param {string} id - Order ID
   * @param {Event} e - Click event
   */
  function handleViewInvoice(id, e) {
    e.stopPropagation();
    navigate(`/orders/${id}/invoice`);
  }

  /**
   * Handles search input change
   * @param {Event} e - Change event
   */
  function handleSearchChange(e) {
    setSearch(e.target.value);
    setPage(0); // Reset to first page when searching
  }

  // Filter orders based on search
  const filteredOrders = filterOrders(orders, search);

  // Render component
  return (
    <>
      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by order #, customer name or status..."
          value={search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Paper elevation={2}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="200px">
            <CircularProgress />
          </Box>
        ) : filteredOrders.length === 0 ? (
          <Box p={3} textAlign="center">
            <Typography variant="h6" color="textSecondary">
              No orders found
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Order #</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((order) => (
                      <TableRow 
                        key={order._id} 
                        hover 
                        onClick={() => handleView(order._id)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{order.orderNumber}</TableCell>
                        <TableCell>{formatDate(order.orderDate)}</TableCell>
                        <TableCell>{order.customer?.name || 'N/A'}</TableCell>
                        <TableCell align="right">{formatCurrency(order.total)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={order.status} 
                            color={getStatusColor(order.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={(e) => {
                              e.stopPropagation();
                              handleView(order._id);
                            }}>
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Invoice">
                            <IconButton size="small" onClick={(e) => handleViewInvoice(order._id, e)}>
                              <Receipt />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredOrders.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
    </>
  );
}

export default OrderList;