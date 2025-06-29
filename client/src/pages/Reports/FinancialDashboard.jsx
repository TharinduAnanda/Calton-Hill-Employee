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
  CircularProgress,
  Tabs,
  Tab
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
import instance from '../../utils/axiosConfig';
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
  
  // State for dashboard tabs and additional reports
  const [activeTab, setActiveTab] = useState(0);
  const [balanceSheetData, setBalanceSheetData] = useState(null);
  const [cashFlowData, setCashFlowData] = useState(null);
  const [departmentData, setDepartmentData] = useState(null);
  const [metricsData, setMetricsData] = useState(null);
  const [loadingBalanceSheet, setLoadingBalanceSheet] = useState(false);
  const [loadingCashFlow, setLoadingCashFlow] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [metricsPeriod, setMetricsPeriod] = useState('month');

  useEffect(() => {
    fetchFinancialData();
    fetchFinancialMetrics();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      console.log(`Fetching financial data from ${formattedStartDate} to ${formattedEndDate}`);
      const response = await instance.get('http://localhost:5000/api/financial/summary', {
        params: {
          startDate: formattedStartDate,
          endDate: formattedEndDate
        }
      });
      
      if (response.data && response.data.data) {
        setFinancialData(response.data.data);
        setLoading(false);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching financial data:', err);
      let errorMessage = 'Failed to fetch financial data';
      if (err.response) {
        errorMessage += `: ${err.response.status} ${err.response.statusText}`;
      } else if (err.message) {
        errorMessage += `: ${err.message}`;
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleDateChange = () => {
    fetchFinancialData();
  };

  const generateReport = async () => {
    try {
      setLoadingReport(true);
      setError(null);
      
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      console.log(`Generating ${reportType} report from ${formattedStartDate} to ${formattedEndDate}`);
      const response = await instance.get('http://localhost:5000/api/financial/report', {
        params: {
          reportType,
          startDate: formattedStartDate,
          endDate: formattedEndDate
        }
      });
      
      if (response.data && response.data.data) {
        setReportData(response.data.data);
        setLoadingReport(false);
      } else {
        throw new Error('Invalid report data format');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      let errorMessage = 'Failed to generate report';
      if (err.response) {
        errorMessage += `: ${err.response.status} ${err.response.statusText}`;
      } else if (err.message) {
        errorMessage += `: ${err.message}`;
      }
      setError(errorMessage);
      setLoadingReport(false);
    }
  };

  // Chart data preparation
  const prepareSalesTrendChart = () => {
    if (!financialData.sales_trend || financialData.sales_trend.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'Sales Trend',
          data: [],
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.3
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
          label: 'Top Products by Revenue',
          data: [],
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 1 && !balanceSheetData) {
      fetchBalanceSheet();
    } else if (newValue === 2 && !cashFlowData) {
      fetchCashFlow();
    } else if (newValue === 3 && !departmentData) {
      fetchDepartmentProfitability();
    }
  };

  const fetchBalanceSheet = async () => {
    try {
      setLoadingBalanceSheet(true);
      setError(null);
      
      console.log('Fetching balance sheet data');
      const response = await instance.get('http://localhost:5000/api/financial/balance-sheet');
      
      if (response.data && response.data.data) {
        setBalanceSheetData(response.data.data);
        setLoadingBalanceSheet(false);
      } else {
        throw new Error('Invalid balance sheet data format');
      }
    } catch (err) {
      console.error('Error fetching balance sheet:', err);
      let errorMessage = 'Failed to fetch balance sheet';
      if (err.response) {
        errorMessage += `: ${err.response.status} ${err.response.statusText}`;
      } else if (err.message) {
        errorMessage += `: ${err.message}`;
      }
      setError(errorMessage);
      setLoadingBalanceSheet(false);
    }
  };

  const fetchCashFlow = async () => {
    try {
      setLoadingCashFlow(true);
      setError(null);
      
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      console.log(`Fetching cash flow data from ${formattedStartDate} to ${formattedEndDate}`);
      const response = await instance.get('http://localhost:5000/api/financial/cash-flow', {
        params: {
          startDate: formattedStartDate,
          endDate: formattedEndDate
        }
      });
      
      if (response.data && response.data.data) {
        setCashFlowData(response.data.data);
        setLoadingCashFlow(false);
      } else {
        throw new Error('Invalid cash flow data format');
      }
    } catch (err) {
      console.error('Error fetching cash flow statement:', err);
      let errorMessage = 'Failed to fetch cash flow statement';
      if (err.response) {
        errorMessage += `: ${err.response.status} ${err.response.statusText}`;
      } else if (err.message) {
        errorMessage += `: ${err.message}`;
      }
      setError(errorMessage);
      setLoadingCashFlow(false);
    }
  };

  const fetchDepartmentProfitability = async () => {
    try {
      setLoadingDepartments(true);
      setError(null);
      
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      console.log(`Fetching department profitability from ${formattedStartDate} to ${formattedEndDate}`);
      const response = await instance.get('http://localhost:5000/api/financial/department-profitability', {
        params: {
          startDate: formattedStartDate,
          endDate: formattedEndDate
        }
      });
      
      if (response.data && response.data.data) {
        setDepartmentData(response.data.data);
        setLoadingDepartments(false);
      } else {
        throw new Error('Invalid department data format');
      }
    } catch (err) {
      console.error('Error fetching department profitability:', err);
      let errorMessage = 'Failed to fetch department profitability';
      if (err.response) {
        errorMessage += `: ${err.response.status} ${err.response.statusText}`;
      } else if (err.message) {
        errorMessage += `: ${err.message}`;
      }
      setError(errorMessage);
      setLoadingDepartments(false);
    }
  };

  const fetchFinancialMetrics = async (period = 'month') => {
    try {
      setLoadingMetrics(true);
      setError(null);
      
      console.log(`Fetching financial metrics for period: ${period}`);
      const response = await instance.get('http://localhost:5000/api/financial/metrics', {
        params: { period }
      });
      
      if (response.data && response.data.data) {
        setMetricsData(response.data.data);
        setLoadingMetrics(false);
      } else {
        throw new Error('Invalid metrics data format');
      }
    } catch (err) {
      console.error('Error fetching financial metrics:', err);
      let errorMessage = 'Failed to fetch financial metrics';
      if (err.response) {
        errorMessage += `: ${err.response.status} ${err.response.statusText}`;
      } else if (err.message) {
        errorMessage += `: ${err.message}`;
      }
      setError(errorMessage);
      setLoadingMetrics(false);
    }
  };

  const renderFinancialOverview = () => (
      <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
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
        
      <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
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
        
      <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
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
        
      <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
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

      <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
          <Card>
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

      <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
          <Card>
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
  );

  const renderBalanceSheet = () => {
    if (loadingBalanceSheet) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <CircularProgress />
        </Box>
      );
    }

    if (!balanceSheetData) {
      return (
        <Box textAlign="center" p={3}>
          <Typography color="textSecondary">No balance sheet data available</Typography>
          <Button variant="outlined" onClick={fetchBalanceSheet} sx={{ mt: 2 }}>
            Refresh Data
          </Button>
        </Box>
      );
    }

    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Balance Sheet</Typography>
        <Typography color="textSecondary" gutterBottom>
          As of {balanceSheetData.report_date}
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>Assets</Typography>
            
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Typography>Cash and Cash Equivalents</Typography>
              <Typography>{formatCurrency(balanceSheetData.assets.cash_and_equivalents)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mt={1}>
              <Typography>Accounts Receivable</Typography>
              <Typography>{formatCurrency(balanceSheetData.assets.accounts_receivable)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mt={1}>
              <Typography>Inventory</Typography>
              <Typography>{formatCurrency(balanceSheetData.assets.inventory)}</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between">
              <Typography fontWeight="bold">Total Assets</Typography>
              <Typography fontWeight="bold">{formatCurrency(balanceSheetData.assets.total_assets)}</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>Liabilities & Equity</Typography>
            
            <Box mt={2}>
              <Typography variant="subtitle2">Liabilities</Typography>
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography>Accounts Payable</Typography>
                <Typography>{formatCurrency(balanceSheetData.liabilities.accounts_payable)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography>Credit Accounts</Typography>
                <Typography>{formatCurrency(balanceSheetData.liabilities.credit_accounts)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography fontWeight="bold">Total Liabilities</Typography>
                <Typography fontWeight="bold">{formatCurrency(balanceSheetData.liabilities.total_liabilities)}</Typography>
              </Box>
            </Box>
            
            <Box mt={3}>
              <Typography variant="subtitle2">Equity</Typography>
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography>Owner's Equity</Typography>
                <Typography>{formatCurrency(balanceSheetData.equity.owners_equity)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography fontWeight="bold">Total Equity</Typography>
                <Typography fontWeight="bold">{formatCurrency(balanceSheetData.equity.total_equity)}</Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between">
              <Typography fontWeight="bold">Total Liabilities & Equity</Typography>
              <Typography fontWeight="bold">{formatCurrency(balanceSheetData.total_liabilities_and_equity)}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  const renderCashFlow = () => {
    if (loadingCashFlow) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <CircularProgress />
        </Box>
      );
    }

    if (!cashFlowData) {
      return (
        <Box textAlign="center" p={3}>
          <Typography color="textSecondary">No cash flow data available</Typography>
          <Button variant="outlined" onClick={fetchCashFlow} sx={{ mt: 2 }}>
            Refresh Data
          </Button>
        </Box>
      );
    }

    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Cash Flow Statement</Typography>
        <Typography color="textSecondary" gutterBottom>
          Period: {cashFlowData.period}
        </Typography>
        
        <Box mt={3}>
          <Typography variant="subtitle1">Beginning Cash Balance</Typography>
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography>Cash Balance at Start of Period</Typography>
            <Typography>{formatCurrency(cashFlowData.starting_cash_balance)}</Typography>
          </Box>
        </Box>
        
        <Box mt={3}>
          <Typography variant="subtitle1">Operating Activities</Typography>
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography>Cash Received from Sales</Typography>
            <Typography>{formatCurrency(cashFlowData.operating_activities.cash_from_sales)}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography>Cash Paid for Expenses</Typography>
            <Typography color="error.main">
              ({formatCurrency(cashFlowData.operating_activities.cash_for_expenses)})
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography fontWeight="bold">Net Cash from Operating Activities</Typography>
            <Typography 
              fontWeight="bold"
              color={cashFlowData.operating_activities.net_operating_cash_flow >= 0 ? 'success.main' : 'error.main'}
            >
              {formatCurrency(cashFlowData.operating_activities.net_operating_cash_flow)}
            </Typography>
          </Box>
        </Box>
        
        <Box mt={3}>
          <Typography variant="subtitle1">Investing Activities</Typography>
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography>Inventory Purchases</Typography>
            <Typography color="error.main">
              ({formatCurrency(cashFlowData.investing_activities.inventory_purchases)})
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography fontWeight="bold">Net Cash from Investing Activities</Typography>
            <Typography 
              fontWeight="bold"
              color={cashFlowData.investing_activities.net_investing_cash_flow >= 0 ? 'success.main' : 'error.main'}
            >
              {formatCurrency(cashFlowData.investing_activities.net_investing_cash_flow)}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6">Net Cash Flow</Typography>
          <Typography 
            variant="h6" 
            color={cashFlowData.net_cash_flow >= 0 ? 'success.main' : 'error.main'}
          >
            {formatCurrency(cashFlowData.net_cash_flow)}
          </Typography>
        </Box>
        
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Typography variant="h6">Ending Cash Balance</Typography>
          <Typography variant="h6">
            {formatCurrency(cashFlowData.ending_cash_balance)}
          </Typography>
        </Box>
      </Paper>
    );
  };

  const renderDepartmentProfitability = () => {
    if (loadingDepartments) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <CircularProgress />
        </Box>
      );
    }

    if (!departmentData) {
      return (
        <Box textAlign="center" p={3}>
          <Typography color="textSecondary">No department data available</Typography>
          <Button variant="outlined" onClick={fetchDepartmentProfitability} sx={{ mt: 2 }}>
            Refresh Data
          </Button>
        </Box>
      );
    }

    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Department Profitability</Typography>
        <Typography color="textSecondary" gutterBottom>
          Period: {departmentData.period}
        </Typography>
        
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ minWidth: 750, mt: 3 }}>
            <Box display="flex" fontWeight="bold" p={1} bgcolor="grey.100">
              <Box width="30%">Department</Box>
              <Box width="14%" textAlign="right">Sales</Box>
              <Box width="14%" textAlign="right">COGS</Box>
              <Box width="14%" textAlign="right">Gross Profit</Box>
              <Box width="14%" textAlign="right">Margin</Box>
              <Box width="14%" textAlign="right">Units Sold</Box>
            </Box>
            
            <Divider />
            
            {departmentData.departments.map((dept, index) => (
              <React.Fragment key={index}>
                <Box display="flex" p={1} sx={{ '&:nth-of-type(even)': { bgcolor: 'grey.50' } }}>
                  <Box width="30%">{dept.category_name}</Box>
                  <Box width="14%" textAlign="right">{formatCurrency(dept.total_sales)}</Box>
                  <Box width="14%" textAlign="right">{formatCurrency(dept.total_cost)}</Box>
                  <Box width="14%" textAlign="right">{formatCurrency(dept.gross_profit)}</Box>
                  <Box 
                    width="14%" 
                    textAlign="right"
                    color={dept.gross_margin_percent >= 0 ? 'success.main' : 'error.main'}
                  >
                    {dept.gross_margin_percent.toFixed(2)}%
                  </Box>
                  <Box width="14%" textAlign="right">{dept.units_sold}</Box>
                </Box>
                <Divider />
              </React.Fragment>
            ))}
            
            <Box display="flex" p={1} fontWeight="bold" bgcolor="grey.200">
              <Box width="30%">Total</Box>
              <Box width="14%" textAlign="right">{formatCurrency(departmentData.totals.total_sales)}</Box>
              <Box width="14%" textAlign="right">{formatCurrency(departmentData.totals.total_cost)}</Box>
              <Box width="14%" textAlign="right">{formatCurrency(departmentData.totals.total_gross_profit)}</Box>
              <Box 
                width="14%" 
                textAlign="right"
                color={departmentData.totals.overall_gross_margin >= 0 ? 'success.main' : 'error.main'}
              >
                {departmentData.totals.overall_gross_margin.toFixed(2)}%
              </Box>
              <Box width="14%" textAlign="right"></Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    );
  };

  const renderFinancialMetrics = () => {
    if (!metricsData || loadingMetrics) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" my={3} height="100px">
          <CircularProgress />
        </Box>
      );
    }
    
    return (
      <Box mt={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Key Financial Metrics</Typography>
          <FormControl size="small" sx={{ width: 150 }}>
            <InputLabel>Time Period</InputLabel>
            <Select
              value={metricsPeriod}
              label="Time Period"
              onChange={(e) => {
                setMetricsPeriod(e.target.value);
                fetchFinancialMetrics(e.target.value);
              }}
            >
              <MenuItem value="week">7 Days</MenuItem>
              <MenuItem value="month">30 Days</MenuItem>
              <MenuItem value="quarter">90 Days</MenuItem>
              <MenuItem value="year">1 Year</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" color="primary" gutterBottom>Profitability</Typography>
                <Box mt={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Gross Profit Margin</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {metricsData.profitability.gross_margin_percent.toFixed(2)}%
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mt={1}>
                    <Typography variant="body2">Net Profit Margin</Typography>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      color={metricsData.profitability.net_margin_percent >= 0 ? 'success.main' : 'error.main'}
                    >
                      {metricsData.profitability.net_margin_percent.toFixed(2)}%
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mt={1}>
                    <Typography variant="body2">Net Profit</Typography>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      color={metricsData.profitability.net_profit >= 0 ? 'success.main' : 'error.main'}
                    >
                      {formatCurrency(metricsData.profitability.net_profit)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" color="primary" gutterBottom>Efficiency</Typography>
                <Box mt={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Avg. Order Value</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(metricsData.efficiency.average_order_value)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mt={1}>
                    <Typography variant="body2">Inventory Value</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(metricsData.efficiency.inventory_value)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mt={1}>
                    <Typography variant="body2">Inventory Items</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {metricsData.efficiency.inventory_count} items
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" color="primary" gutterBottom>Growth</Typography>
                <Box mt={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Sales Growth</Typography>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      color={metricsData.growth.sales_growth_percent >= 0 ? 'success.main' : 'error.main'}
                    >
                      {metricsData.growth.sales_growth_percent.toFixed(2)}%
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mt={1}>
                    <Typography variant="body2">Current Sales</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(metricsData.profitability.total_sales)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mt={1}>
                    <Typography variant="body2">Previous Period</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(metricsData.growth.prev_period_sales)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
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
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Financial Overview</Typography>
          <Box display="flex" gap={2}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{ textField: { size: "small", sx: { width: 150 } } }}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{ textField: { size: "small", sx: { width: 150 } } }}
              />
            </LocalizationProvider>
            <Button variant="outlined" onClick={handleDateChange}>Apply</Button>
          </Box>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      </Paper>
      
      {renderFinancialMetrics()}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="financial report tabs">
          <Tab label="Overview" />
          <Tab label="Balance Sheet" />
          <Tab label="Cash Flow" />
          <Tab label="Department Profitability" />
        </Tabs>
      </Box>
      
      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && renderFinancialOverview()}
        {activeTab === 1 && renderBalanceSheet()}
        {activeTab === 2 && renderCashFlow()}
        {activeTab === 3 && renderDepartmentProfitability()}
      </Box>

      {/* Reports Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
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