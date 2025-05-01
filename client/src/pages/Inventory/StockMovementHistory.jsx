// src/pages/Inventory/StockMovementHistory.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination, Typography, Chip,
  FormControl, InputLabel, Select, MenuItem, TextField,
  CircularProgress, Alert, Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import inventoryService from '../../services/inventoryService';

const StockMovementHistory = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filters
  const [movementType, setMovementType] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [itemName, setItemName] = useState('');

  useEffect(() => {
    const fetchMovementHistory = async () => {
      try {
        setLoading(true);
        const filters = {
          type: movementType !== 'all' ? movementType : undefined,
          startDate: startDate ? startDate.toISOString() : undefined,
          endDate: endDate ? endDate.toISOString() : undefined,
          itemName: itemName || undefined
        };
        const data = await inventoryService.getStockMovementHistory(filters);
        setMovements(data);
      } catch (err) {
        console.error('Error fetching stock movement history:', err);
        setError('Failed to load stock movement history');
      } finally {
        setLoading(false);
      }
    };

    fetchMovementHistory();
  }, [movementType, startDate, endDate, itemName]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getMovementTypeChip = (type) => {
    switch (type) {
      case 'in':
        return <Chip label="Stock In" color="success" size="small" />;
      case 'out':
        return <Chip label="Stock Out" color="error" size="small" />;
      case 'adjustment':
        return <Chip label="Adjustment" color="warning" size="small" />;
      case 'returned':
        return <Chip label="Returned" color="info" size="small" />;
      default:
        return <Chip label={type} size="small" />;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>Filters</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Movement Type</InputLabel>
              <Select
                value={movementType}
                label="Movement Type"
                onChange={(e) => setMovementType(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="in">Stock In</MenuItem>
                <MenuItem value="out">Stock Out</MenuItem>
                <MenuItem value="adjustment">Adjustment</MenuItem>
                <MenuItem value="returned">Returned</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Item Name"
              variant="outlined"
              size="small"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      ) : movements.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No movement history found with the current filters.
          </Typography>
        </Box>
      ) : (
        <Paper variant="outlined">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Item</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Performed By</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movements
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>
                        {new Date(movement.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>{movement.item.name}</TableCell>
                      <TableCell>{movement.item.sku}</TableCell>
                      <TableCell>{getMovementTypeChip(movement.type)}</TableCell>
                      <TableCell align="right">
                        {movement.type === 'in' || movement.type === 'returned' ? '+' : ''}
                        {movement.quantity}
                      </TableCell>
                      <TableCell>{movement.reference}</TableCell>
                      <TableCell>{movement.performedBy}</TableCell>
                      <TableCell>{movement.notes}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={movements.length}
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

export default StockMovementHistory;