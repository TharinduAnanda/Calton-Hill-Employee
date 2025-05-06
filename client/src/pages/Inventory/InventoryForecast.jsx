import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, CircularProgress,
  Alert, Chip, Card, CardContent, Grid, FormControl,
  InputLabel, Select, MenuItem
} from '@mui/material';
import inventoryService from '../../services/inventoryService';

const InventoryForecast = ({ data: initialData, loading: initialLoading }) => {
  const [forecastData, setForecastData] = useState(initialData || []);
  const [loading, setLoading] = useState(initialLoading || !initialData?.length);
  const [error, setError] = useState(null);
  const [daysToForecast, setDaysToForecast] = useState(30);

  useEffect(() => {
    if (!initialData?.length) {
      fetchForecastData(daysToForecast);
    }
  }, [initialData]);

  const fetchForecastData = async (days) => {
    try {
      setLoading(true);
      const response = await inventoryService.getInventoryForecast({ days });
      setForecastData(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching forecast data:', err);
      setError('Failed to load inventory forecast data');
    } finally {
      setLoading(false);
    }
  };

  const handleDaysChange = (event) => {
    const newDays = event.target.value;
    setDaysToForecast(newDays);
    fetchForecastData(newDays);
  };

  const getStatusChip = (daysUntilReorder, projectedStock) => {
    if (daysUntilReorder === null) {
      return <Chip label="Stable" color="success" size="small" />;
    }
    
    if (daysUntilReorder < 0) {
      return <Chip label="Reorder Now" color="error" size="small" />;
    }
    
    if (daysUntilReorder < 7) {
      return <Chip label={`Reorder in ${daysUntilReorder} days`} color="warning" size="small" />;
    }
    
    return <Chip label="OK" color="success" size="small" />;
  };

  // Calculate summary statistics
  const criticalItems = forecastData.filter(item => item.days_until_reorder !== null && item.days_until_reorder <= 0).length;
  const warningItems = forecastData.filter(item => item.days_until_reorder !== null && item.days_until_reorder > 0 && item.days_until_reorder <= 7).length;
  const stableItems = forecastData.filter(item => item.days_until_reorder === null || item.days_until_reorder > 7).length;

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>Inventory Forecast</Typography>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Forecast Period</InputLabel>
              <Select
                value={daysToForecast}
                label="Forecast Period"
                onChange={handleDaysChange}
              >
                <MenuItem value={7}>7 Days</MenuItem>
                <MenuItem value={14}>14 Days</MenuItem>
                <MenuItem value={30}>30 Days</MenuItem>
                <MenuItem value={60}>60 Days</MenuItem>
                <MenuItem value={90}>90 Days</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="error" gutterBottom>
                  Critical Items
                </Typography>
                <Typography variant="h4">{criticalItems}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Need immediate reordering
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="warning.main" gutterBottom>
                  Warning Items
                </Typography>
                <Typography variant="h4">{warningItems}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Will need reordering within 7 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="success.main" gutterBottom>
                  Stable Items
                </Typography>
                <Typography variant="h4">{stableItems}</Typography>
                <Typography variant="body2" color="textSecondary">
                  No action needed
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
                <TableCell align="right">Reorder Level</TableCell>
                <TableCell align="right">Daily Consumption</TableCell>
                <TableCell align="right">Projected Stock ({daysToForecast} days)</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {forecastData.map(item => (
                <TableRow key={item.Product_ID}>
                  <TableCell>{item.Name}</TableCell>
                  <TableCell>{item.SKU}</TableCell>
                  <TableCell align="right">{item.Stock_Level}</TableCell>
                  <TableCell align="right">{item.Reorder_Level}</TableCell>
                  <TableCell align="right">
                    {item.avg_daily_consumption.toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {item.projected_stock}
                  </TableCell>
                  <TableCell>
                    {getStatusChip(item.days_until_reorder, item.projected_stock)}
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

export default InventoryForecast;