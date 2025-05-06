import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, CircularProgress,
  Alert, Card, CardContent, Grid, FormControl,
  InputLabel, Select, MenuItem, Chip
} from '@mui/material';
import inventoryService from '../../services/inventoryService';

const InventoryTurnoverReport = () => {
  const [turnoverData, setTurnoverData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState(90);

  useEffect(() => {
    fetchTurnoverData(period);
  }, [period]);

  const fetchTurnoverData = async (days) => {
    try {
      setLoading(true);
      const response = await inventoryService.getInventoryTurnoverReport({ period: days });
      setTurnoverData(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching turnover data:', err);
      setError('Failed to load inventory turnover data');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
  };

  // Calculate summary statistics
  const stagnantItems = turnoverData.filter(item => item.inventory_health === 'Stagnant').length;
  const slowMovingItems = turnoverData.filter(item => item.inventory_health === 'Slow-moving').length;
  const healthyItems = turnoverData.filter(item => item.inventory_health === 'Healthy').length;
  const fastMovingItems = turnoverData.filter(item => item.inventory_health === 'Fast-moving').length;
  
  const getHealthChip = (health) => {
    switch(health) {
      case 'Stagnant': return <Chip label="Stagnant" color="error" size="small" />;
      case 'Slow-moving': return <Chip label="Slow-moving" color="warning" size="small" />;
      case 'Fast-moving': return <Chip label="Fast-moving" color="success" size="small" />;
      case 'Healthy': return <Chip label="Healthy" color="info" size="small" />;
      default: return <Chip label={health} size="small" />;
    }
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>Inventory Turnover Analysis</Typography>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Analysis Period</InputLabel>
              <Select
                value={period}
                label="Analysis Period"
                onChange={handlePeriodChange}
              >
                <MenuItem value={30}>Last 30 Days</MenuItem>
                <MenuItem value={60}>Last 60 Days</MenuItem>
                <MenuItem value={90}>Last 90 Days</MenuItem>
                <MenuItem value={180}>Last 6 Months</MenuItem>
                <MenuItem value={365}>Last 12 Months</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="error" gutterBottom>
                  Stagnant
                </Typography>
                <Typography variant="h5">{stagnantItems}</Typography>
                <Typography variant="body2" color="textSecondary">
                  No sales in period
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="warning.main" gutterBottom>
                  Slow Moving
                </Typography>
                <Typography variant="h5">{slowMovingItems}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Turnover &lt; 0.5
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="info.main" gutterBottom>
                  Healthy
                </Typography>
                <Typography variant="h5">{healthyItems}</Typography>
                <Typography variant="body2" color="textSecondary">
                  0.5 &lt; Turnover &lt; 3
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="success.main" gutterBottom>
                  Fast Moving
                </Typography>
                <Typography variant="h5">{fastMovingItems}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Turnover &gt; 3
                </Typography>
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
                <TableCell align="right">Current Stock</TableCell>
                <TableCell align="right">Units Sold</TableCell>
                <TableCell align="right">Avg. Inventory</TableCell>
                <TableCell align="right">Turnover Rate</TableCell>
                <TableCell align="right">Avg. Days to Sell</TableCell>
                <TableCell>Health</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {turnoverData.map(item => (
                <TableRow key={item.Product_ID}>
                  <TableCell>{item.Name}</TableCell>
                  <TableCell>{item.SKU}</TableCell>
                  <TableCell align="right">{item.current_stock}</TableCell>
                  <TableCell align="right">{item.units_sold}</TableCell>
                  <TableCell align="right">
                    {Number(item.avg_inventory_level).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {Number(item.turnover_rate).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {item.avg_days_to_sell || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {getHealthChip(item.inventory_health)}
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

export default InventoryTurnoverReport;