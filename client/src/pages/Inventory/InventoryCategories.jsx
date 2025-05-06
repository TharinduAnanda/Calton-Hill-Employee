import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, CircularProgress,
  Alert, Card, CardContent, Grid, Divider
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import inventoryService from '../../services/inventoryService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const InventoryCategories = ({ data: initialData }) => {
  const [categoryData, setCategoryData] = useState(initialData || []);
  const [loading, setLoading] = useState(!initialData?.length);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!initialData?.length) {
      fetchCategoryData();
    }
  }, [initialData]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getInventoryCategories();
      setCategoryData(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching category data:', err);
      setError('Failed to load inventory category data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total for summary
  const totalItems = categoryData.reduce((sum, category) => sum + Number(category.total_items || 0), 0);
  const totalValue = categoryData.reduce((sum, category) => sum + Number(category.total_value || 0), 0);

  // Prepare data for pie chart
  const chartData = categoryData.map(category => ({
    name: category.Category || 'Uncategorized',
    value: Number(category.total_value || 0)
  }));

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Inventory by Category</Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Summary</Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body1">Total Categories:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {categoryData.length}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body1">Total Items:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {totalItems.toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body1">Total Value:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent sx={{ height: 300 }}>
                  <Typography variant="h6" gutterBottom>Value Distribution</Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Value']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Item Count</TableCell>
                  <TableCell align="right">Total Stock</TableCell>
                  <TableCell align="right">Total Value</TableCell>
                  <TableCell align="right">% of Inventory Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categoryData.map((category) => (
                  <TableRow key={category.Category || 'uncategorized'}>
                    <TableCell>{category.Category || 'Uncategorized'}</TableCell>
                    <TableCell align="right">{Number(category.item_count).toLocaleString()}</TableCell>
                    <TableCell align="right">{Number(category.total_items).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      ${Number(category.total_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell align="right">
                      {totalValue ? ((category.total_value / totalValue) * 100).toFixed(2) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default InventoryCategories;