// src/pages/Inventory/LowStockItems.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination, Typography, Chip,
  IconButton, Button, CircularProgress, Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useNavigate } from 'react-router-dom';
import inventoryService from '../../services/inventoryService';

const LowStockItems = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);  // Initialize as an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchLowStockItems = async () => {
      try {
        setLoading(true);
        const response = await inventoryService.getLowStockItems();
        
        // Ensure we're using the data correctly
        const data = response?.data?.data || [];
        
        // Make sure we're setting an array
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching low stock items:', err);
        setError('Failed to load low stock items');
        // Always set items as an array even on error
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLowStockItems();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const editItem = (id) => {
    navigate(`/inventory/edit/${id}`);
  };

  const reorderItem = (id) => {
    navigate(`/orders/create`, { state: { reorderItemId: id } });
  };

  const getStockLevelColor = (quantity, threshold) => {
    if (quantity === 0) return 'error';
    if (quantity <= threshold) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          No low stock items found.
        </Typography>
      </Box>
    );
  }

  // Check if items is an array before trying to slice it
  const displayedItems = Array.isArray(items) 
    ? items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : [];

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddShoppingCartIcon />}
          onClick={() => navigate('/orders/create')}
        >
          Create Purchase Order
        </Button>
      </Box>

      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item Name</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Current Stock</TableCell>
                <TableCell align="right">Threshold</TableCell>
                <TableCell align="right">Last Reorder Date</TableCell>
                <TableCell align="right">Default Supplier</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedItems.map((item) => (
                <TableRow key={item.Product_ID || item.id}>
                  <TableCell>{item.Name || item.name}</TableCell>
                  <TableCell>{item.SKU || item.sku}</TableCell>
                  <TableCell>{item.Category || item.category}</TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={item.Stock_Level || item.quantity} 
                      color={getStockLevelColor(
                        item.Stock_Level || item.quantity, 
                        item.Reorder_Level || item.reorderThreshold
                      )}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">{item.Reorder_Level || item.reorderThreshold}</TableCell>
                  <TableCell align="right">
                    {item.lastReorderDate ? new Date(item.lastReorderDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell align="right">{item.supplier?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton 
                      size="small"
                      onClick={() => editItem(item.Product_ID || item.id)}
                      title="Edit Item"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={() => reorderItem(item.Product_ID || item.id)}
                      title="Reorder Item"
                      color="primary"
                    >
                      <AddShoppingCartIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={Array.isArray(items) ? items.length : 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default LowStockItems;