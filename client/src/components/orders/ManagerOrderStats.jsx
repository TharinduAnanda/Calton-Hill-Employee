import React, { useState, useEffect } from 'react';
import {
  Grid, Paper, Typography, Box, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Divider
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { getManagerOrderStats } from '../../services/orderService';
import { formatCurrency } from '../../utils/helpers';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ManagerOrderStats = () => {
  const [stats, setStats] = useState({
    paymentStatusCounts: [],
    paymentMethodCounts: [],
    sourceCounts: [],
    dailySales: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch statistics on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch manager order statistics
  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getManagerOrderStats();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching manager stats:', err);
      setError('Failed to load order statistics');
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for summary cards
  const getSummaryData = () => {
    // Calculate total revenue
    const totalRevenue = stats.paymentStatusCounts
      .filter(item => item.status === 'paid')
      .reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    
    // Calculate pending revenue
    const pendingRevenue = stats.paymentStatusCounts
      .filter(item => item.status === 'pending')
      .reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    
    // Calculate total orders
    const totalOrders = stats.paymentStatusCounts
      .reduce((sum, item) => sum + parseInt(item.count || 0), 0);
    
    // Calculate average order value
    const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;
    
    return {
      totalOrders,
      totalRevenue,
      pendingRevenue,
      avgOrderValue
    };
  };

  // Prepare data for daily sales chart
  const getDailySalesChartData = () => {
    const dates = stats.dailySales.map(item => new Date(item.date).toLocaleDateString());
    const sales = stats.dailySales.map(item => parseFloat(item.total || 0));
    const orderCounts = stats.dailySales.map(item => parseInt(item.orderCount || 0));
    
    return {
      labels: dates,
      datasets: [
        {
          label: 'Revenue',
          data: sales,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          yAxisID: 'y',
        },
        {
          label: 'Orders',
          data: orderCounts,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          yAxisID: 'y1',
        },
      ],
    };
  };

  // Options for daily sales chart
  const dailySalesChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: 'Daily Sales and Order Count',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Revenue',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Orders',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // Prepare data for payment status pie chart
  const getPaymentStatusChartData = () => {
    const labels = stats.paymentStatusCounts.map(item => item.status);
    const data = stats.paymentStatusCounts.map(item => parseInt(item.count || 0));
    
    return {
      labels,
      datasets: [
        {
          label: 'Orders',
          data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for payment method bar chart
  const getPaymentMethodChartData = () => {
    const labels = stats.paymentMethodCounts.map(item => item.method);
    const data = stats.paymentMethodCounts.map(item => parseFloat(item.total || 0));
    
    return {
      labels,
      datasets: [
        {
          label: 'Revenue by Payment Method',
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    };
  };

  // Prepare data for source bar chart
  const getSourceChartData = () => {
    const labels = stats.sourceCounts.map(item => item.source);
    const data = stats.sourceCounts.map(item => parseInt(item.count || 0));
    
    return {
      labels,
      datasets: [
        {
          label: 'Orders by Source',
          data,
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
        },
      ],
    };
  };

  // Calculate summary data
  const summaryData = getSummaryData();

  // Render loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <div>
      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Total Orders</Typography>
              <Typography variant="h4">{summaryData.totalOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Total Revenue</Typography>
              <Typography variant="h4">{formatCurrency(summaryData.totalRevenue)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Pending Revenue</Typography>
              <Typography variant="h4">{formatCurrency(summaryData.pendingRevenue)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Avg. Order Value</Typography>
              <Typography variant="h4">{formatCurrency(summaryData.avgOrderValue)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Daily Sales Chart */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Daily Sales Trend</Typography>
            {stats.dailySales.length > 0 ? (
              <Box height={300}>
                <Line options={dailySalesChartOptions} data={getDailySalesChartData()} />
              </Box>
            ) : (
              <Typography color="textSecondary">No daily sales data available</Typography>
            )}
          </Paper>
        </Grid>

        {/* Payment Status Chart */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Payment Status Distribution</Typography>
            {stats.paymentStatusCounts.length > 0 ? (
              <Box height={250}>
                <Pie data={getPaymentStatusChartData()} options={{ maintainAspectRatio: false }} />
              </Box>
            ) : (
              <Typography color="textSecondary">No payment status data available</Typography>
            )}
          </Paper>
        </Grid>

        {/* Payment Method Chart */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Revenue by Payment Method</Typography>
            {stats.paymentMethodCounts.length > 0 ? (
              <Box height={250}>
                <Bar 
                  data={getPaymentMethodChartData()} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Revenue'
                        }
                      }
                    }
                  }} 
                />
              </Box>
            ) : (
              <Typography color="textSecondary">No payment method data available</Typography>
            )}
          </Paper>
        </Grid>

        {/* Source Chart */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Orders by Source</Typography>
            {stats.sourceCounts.length > 0 ? (
              <Box height={250}>
                <Bar 
                  data={getSourceChartData()} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Orders'
                        }
                      }
                    }
                  }} 
                />
              </Box>
            ) : (
              <Typography color="textSecondary">No source data available</Typography>
            )}
          </Paper>
        </Grid>

        {/* Detailed Tables */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Payment Status Details</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.paymentStatusCounts.map((item) => (
                    <TableRow key={item.status}>
                      <TableCell component="th" scope="row">
                        {item.status}
                      </TableCell>
                      <TableCell align="right">{item.count}</TableCell>
                      <TableCell align="right">{formatCurrency(item.total || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Order Sources</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Source</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.sourceCounts.map((item) => (
                    <TableRow key={item.source}>
                      <TableCell component="th" scope="row">
                        {item.source}
                      </TableCell>
                      <TableCell align="right">{item.count}</TableCell>
                      <TableCell align="right">{formatCurrency(item.total || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default ManagerOrderStats; 