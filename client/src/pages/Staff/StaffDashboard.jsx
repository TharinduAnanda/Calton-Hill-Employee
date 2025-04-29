// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Card, CardContent, Typography, 
  Button, Divider, Paper, CircularProgress,
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Alert
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDashboardData } from '../../services/dashboardService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '80vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const { 
    summary, 
    recentOrders, 
    lowStockItems, 
    salesData,
    inventoryValue 
  } = dashboardData || {};

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Products
                  </Typography>
                  <Typography variant="h4">{summary?.totalProducts || 0}</Typography>
                  {summary?.productChange > 0 ? (
                    <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                      <ArrowUpwardIcon fontSize="small" /> {summary?.productChange}% from last month
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="error.main" sx={{ display: 'flex', alignItems: 'center' }}>
                      <ArrowDownwardIcon fontSize="small" /> {Math.abs(summary?.productChange || 0)}% from last month
                    </Typography>
                  )}
                </Box>
                <Box sx={{ bgcolor: 'primary.main', p: 1, borderRadius: 1 }}>
                  <CategoryIcon sx={{ color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Inventory Items
                  </Typography>
                  <Typography variant="h4">{summary?.totalInventoryItems || 0}</Typography>
                  {summary?.inventoryChange > 0 ? (
                    <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                      <ArrowUpwardIcon fontSize="small" /> {summary?.inventoryChange}% from last month
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="error.main" sx={{ display: 'flex', alignItems: 'center' }}>
                      <ArrowDownwardIcon fontSize="small" /> {Math.abs(summary?.inventoryChange || 0)}% from last month
                    </Typography>
                  )}
                </Box>
                <Box sx={{ bgcolor: 'success.main', p: 1, borderRadius: 1 }}>
                  <InventoryIcon sx={{ color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Orders
                  </Typography>
                  <Typography variant="h4">{summary?.activeOrders || 0}</Typography>
                  {summary?.orderChange > 0 ? (
                    <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                      <ArrowUpwardIcon fontSize="small" /> {summary?.orderChange}% from last month
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="error.main" sx={{ display: 'flex', alignItems: 'center' }}>
                      <ArrowDownwardIcon fontSize="small" /> {Math.abs(summary?.orderChange || 0)}% from last month
                    </Typography>
                  )}
                </Box>
                <Box sx={{ bgcolor: 'info.main', p: 1, borderRadius: 1 }}>
                  <LocalShippingIcon sx={{ color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Inventory Value
                  </Typography>
                  <Typography variant="h4">${summary?.totalValue?.toFixed(2) || '0.00'}</Typography>
                  {summary?.valueChange > 0 ? (
                    <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                      <ArrowUpwardIcon fontSize="small" /> {summary?.valueChange}% from last month
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="error.main" sx={{ display: 'flex', alignItems: 'center' }}>
                      <ArrowDownwardIcon fontSize="small" /> {Math.abs(summary?.valueChange || 0)}% from last month
                    </Typography>
                  )}
                </Box>
                <Box sx={{ bgcolor: 'warning.main', p: 1, borderRadius: 1 }}>
                  <AttachMoneyIcon sx={{ color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Monthly Sales Overview</Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={salesData || []}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                    name="Sales ($)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#82ca9d" 
                    name="Orders"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Inventory Value by Category</Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={inventoryValue || []}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#ff7300" 
                    name="Value ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Recent Orders and Low Stock Items */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined">
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Recent Orders</Typography>
              <Button 
                variant="text" 
                color="primary"
                onClick={() => navigate('/orders')}
              >
                View All
              </Button>
            </Box>
            <Divider />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order #</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(recentOrders || []).map((order) => (
                    <TableRow 
                      key={order.id}
                      hover
                      onClick={() => navigate(`/orders/${order.id}`)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{order.orderNumber}</TableCell>
                      <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell align="right">${order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            bgcolor: 
                              order.status === 'Delivered' ? 'success.main' :
                              order.status === 'Shipped' ? 'info.main' :
                              order.status === 'Processing' ? 'warning.main' :
                              order.status === 'Cancelled' ? 'error.main' : 'default',
                            color: 'white',
                            p: 0.5,
                            borderRadius: 1,
                            display: 'inline-block',
                            fontSize: '0.75rem',
                            textAlign: 'center',
                            minWidth: 80
                          }}
                        >
                          {order.status}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!recentOrders || recentOrders.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="textSecondary">
                          No recent orders found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper variant="outlined">
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Low Stock Items</Typography>
              <Button 
                variant="text" 
                color="primary"
                onClick={() => navigate('/inventory?tab=low-stock')}
              >
                View All
              </Button>
            </Box>
            <Divider />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell align="right">Current Stock</TableCell>
                    <TableCell align="right">Threshold</TableCell>
                    <TableCell>Supplier</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(lowStockItems || []).map((item) => (
                    <TableRow 
                      key={item.id}
                      hover
                      onClick={() => navigate(`/inventory/${item.id}`)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell align="right" sx={{ color: item.quantity === 0 ? 'error.main' : 'warning.main', fontWeight: 'bold' }}>
                        {item.quantity}
                      </TableCell>
                      <TableCell align="right">{item.reorderThreshold}</TableCell>
                      <TableCell>{item.supplier}</TableCell>
                    </TableRow>
                  ))}
                  {(!lowStockItems || lowStockItems.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="textSecondary">
                          No low stock items found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;