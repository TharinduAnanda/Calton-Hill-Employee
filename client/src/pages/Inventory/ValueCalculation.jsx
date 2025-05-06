import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, CircularProgress,
  Alert, Card, CardContent, Grid, FormControl,
  InputLabel, Select, MenuItem, Divider
} from '@mui/material';
import inventoryService from '../../services/inventoryService';

const ValueCalculation = () => {
  const [valuationData, setValuationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [method, setMethod] = useState('fifo');

  useEffect(() => {
    fetchValuationData(method);
  }, [method]);

  const fetchValuationData = async (valuationMethod) => {
    try {
      setLoading(true);
      const response = await inventoryService.calculateInventoryValue({ method: valuationMethod });
      setValuationData(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching valuation data:', err);
      setError('Failed to load inventory valuation data');
    } finally {
      setLoading(false);
    }
  };

  const handleMethodChange = (event) => {
    setMethod(event.target.value);
  };

  // Calculate summary
  const totalItems = valuationData.reduce((sum, item) => sum + Number(item.Stock_Level || 0), 0);
  const totalValue = valuationData.reduce((sum, item) => sum + Number(item.inventory_value || 0), 0);

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>Inventory Valuation</Typography>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Valuation Method</InputLabel>
              <Select
                value={method}
                label="Valuation Method"
                onChange={handleMethodChange}
              >
                <MenuItem value="fifo">FIFO (First In, First Out)</MenuItem>
                <MenuItem value="lifo">LIFO (Last In, First Out)</MenuItem>
                <MenuItem value="average">Average Cost</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Valuation Summary</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body1">Method:</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {method === 'fifo' ? 'FIFO' : method === 'lifo' ? 'LIFO' : 'Average Cost'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body1">Total Items:</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {totalItems.toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body1">Total Value:</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Value</TableCell>
                <TableCell align="right">Average Value Per Unit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {valuationData.map(item => (
                <TableRow key={item.Product_ID}>
                  <TableCell>{item.Name}</TableCell>
                  <TableCell>{item.SKU}</TableCell>
                  <TableCell align="right">{item.Stock_Level}</TableCell>
                  <TableCell align="right">
                    ${Number(item.inventory_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell align="right">
                    ${item.Stock_Level > 0 ? (item.inventory_value / item.Stock_Level).toFixed(2) : '0.00'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ValueCalculation;