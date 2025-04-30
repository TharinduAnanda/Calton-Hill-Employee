import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  Divider, 
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { 
  AttachMoney, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Receipt
} from '@mui/icons-material';
import { format, subDays } from 'date-fns';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const FinancialDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not owner
    if (!currentUser || currentUser.role !== 'owner') {
      navigate('/unauthorized');
    }
  }, [currentUser, navigate]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  const [financialData, setFinancialData] = useState({
    summary: {
      total_sales: 0,
      total_refunds: 0,
      net_revenue: 0,
      total_expenses: 0,
      profit: 0,
      sale_count: 0,
      refund_count: 0,
      tax_collected: 0
    },
    top_products: [],
    sales_trend: []
  });
  const [reportType, setReportType] = useState('income_statement');
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const response = await axios.get(`/api/financial/summary`, {
        params: {
          startDate: formattedStartDate,
          endDate: formattedEndDate
        }
      });
      
      setFinancialData(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch financial data. Please try again.');
      setLoading(false);
      console.error('Error fetching financial data:', err);
    }
  };

  const handleDateChange = () => {
    fetchFinancialData();
  };

  const generateReport = async () => {
    try {
      setLoadingReport(true);
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const response = await axios.get(`/api/financial/report`, {
        params: {
          reportType,
          startDate: formattedStartDate,
          endDate: formattedEndDate
        }
      });
      
      setReportData(response.data.data);
      setLoadingReport(false);
    } catch (err) {
      setError('Failed to generate report. Please try again.');
      setLoadingReport(false);
      console.error('Error generating report:', err);
    }
  };

  // Chart data preparation
  const prepareSalesTrendChart = () => {
    if (!financialData.sales_trend || financialData.sales_trend.length === 0) {
      return {
        labels: [],
        datasets: [{
          data: []
        }]
      };
    }

    const labels = financialData.sales_trend.map(item => item.month);
    const data = financialData.sales_trend.map(item => item.total_sales);

    return {
      labels,
      datasets: [
        {
          label: 'Sales Trend',
          data,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.3
        }
      ]
    };
  };

  const prepareTopProductsChart = () => {
    if (!financialData.top_products || financialData.top_products.length === 0) {
      return {
        labels: [],
        datasets: [{
          data: []
        }]
      };
    }

    const labels = financialData.top_products.map(product => product.name);
    const data = financialData.top_products.map(product => product.total_sales);

    return {
      labels,
      datasets: [
        {
          label: 'Top Products by Revenue',
          data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="500px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Financial Dashboard
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Financial Overview</Typography>
          <Box display="flex" gap={2}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} size="small" sx={{ width: 150 }} />}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} size="small" sx={{ width: 150 }} />}
              />
            </LocalizationProvider>
            <Button variant="outlined" onClick={handleDateChange}>Apply</Button>
          </Box>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="textSecondary" variant="subtitle2">Total Revenue</Typography>
                    <Typography variant="h5">{formatCurrency(financialData.summary.total_sales)}</Typography>
                  </Box>
                  <AttachMoney sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {financialData.summary.sale_count} orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="textSecondary" variant="subtitle2">Net Revenue</Typography>
                    <Typography variant="h5">{formatCurrency(financialData.summary.net_revenue)}</Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  After {formatCurrency(financialData.summary.total_refunds)} refunds
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="textSecondary" variant="subtitle2">Expenses</Typography>
                    <Typography variant="h5">{formatCurrency(financialData.summary.total_expenses)}</Typography>
                  </Box>
                  <TrendingDown sx={{ fontSize: 40, color: 'error.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="textSecondary" variant="subtitle2">Profit</Typography>
                    <Typography variant="h5" color={financialData.summary.profit >= 0 ? 'success.main' : 'error.main'}>
                      {formatCurrency(financialData.summary.profit)}
                    </Typography>
                  </Box>
                  <PieChart sx={{ fontSize: 40, color: 'info.main' }} />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {formatCurrency(financialData.summary.tax_collected)} tax collected
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Sales Trend</Typography>
                <Box height={300}>
                  <Line 
                    data={prepareSalesTrendChart()} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'top' },
                      }
                    }} 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Top Products by Revenue</Typography>
                <Box height={300}>
                  <Bar 
                    data={prepareTopProductsChart()} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                      }
                    }} 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Reports Section */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Financial Reports</Typography>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <FormControl size="small" sx={{ width: 200 }}>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              label="Report Type"
              onChange={(e) => setReportType(e.target.value)}
            >
              <MenuItem value="income_statement">Income Statement</MenuItem>
              <MenuItem value="sales_tax">Sales Tax Report</MenuItem>
            </Select>
          </FormControl>
          <Button 
            variant="contained" 
            onClick={generateReport} 
            disabled={loadingReport}
            startIcon={loadingReport ? <CircularProgress size={20} /> : <Receipt />}
          >
            Generate Report
          </Button>
        </Box>

        {reportData && (
          <Box mt={2}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6">{reportData.report_type}</Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Period: {reportData.period}
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              {reportType === 'income_statement' && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>Revenue</Typography>
                    <Box display="flex" justifyContent="space-between">
                      <Typography>Total Revenue</Typography>
                      <Typography>{formatCurrency(reportData.revenue.total_revenue)}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography>Less: Refunds</Typography>
                      <Typography color="error.main">({formatCurrency(reportData.revenue.total_refunds)})</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" justifyContent="space-between">
                      <Typography><strong>Net Revenue</strong></Typography>
                      <Typography><strong>{formatCurrency(reportData.revenue.net_revenue)}</strong></Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>Expenses</Typography>
                    {reportData.expenses.by_category.map((category, index) => (
                      <Box key={index} display="flex" justifyContent="space-between">
                        <Typography>{category.Category_Name}</Typography>
                        <Typography>{formatCurrency(category.total_amount)}</Typography>
                      </Box>
                    ))}
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" justifyContent="space-between">
                      <Typography><strong>Total Expenses</strong></Typography>
                      <Typography color="error.main"><strong>{formatCurrency(reportData.expenses.total_expenses)}</strong></Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="h6">Net Profit</Typography>
                      <Typography 
                        variant="h6" 
                        color={reportData.net_profit >= 0 ? 'success.main' : 'error.main'}
                      >
                        {formatCurrency(reportData.net_profit)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              )}
              
              {reportType === 'sales_tax' && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>Tax Collected by Month</Typography>
                    {reportData.tax_by_month.map((item, index) => (
                      <Box key={index} display="flex" justifyContent="space-between">
                        <Typography>{item.month}</Typography>
                        <Typography>{formatCurrency(item.tax_amount)}</Typography>
                      </Box>
                    ))}
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" justifyContent="space-between">
                      <Typography><strong>Total Tax Collected</strong></Typography>
                      <Typography><strong>{formatCurrency(reportData.total_tax_collected)}</strong></Typography>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </Paper>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default FinancialDashboard;