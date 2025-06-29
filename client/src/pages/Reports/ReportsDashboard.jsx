import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, 
  CardActions, Button, Paper, Divider,
  List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import PieChartIcon from '@mui/icons-material/PieChart';
import { useNavigate, useLocation } from 'react-router-dom';
// Additional imports for owner dashboard tabs
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import StoreIcon from '@mui/icons-material/Store';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CampaignIcon from '@mui/icons-material/Campaign';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import InfoIcon from '@mui/icons-material/Info';
import CategoryIcon from '@mui/icons-material/Category';
import '../Owner/OwnerDashboardPage.css'; // Import dashboard styles

const ReportsDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('reports');

  // Define the available reports
  const reports = [
    {
      id: 'turnover',
      title: 'Inventory Turnover Report',
      description: 'Analyze inventory turnover rates and identify slow-moving items',
      icon: <TrendingUpIcon color="primary" />,
      path: '/owner/reports/turnover',
      color: '#1976d2'
    },
    {
      id: 'sales',
      title: 'Sales Performance',
      description: 'Review sales trends, top-selling products and revenue metrics',
      icon: <BarChartIcon color="success" />,
      path: '/owner/reports/sales',
      color: '#2e7d32'
    },
    {
      id: 'customer',
      title: 'Customer Analysis',
      description: 'Understand customer buying patterns and demographics',
      icon: <PersonIcon color="info" />,
      path: '/owner/reports/customers',
      color: '#0288d1'
    },
    {
      id: 'inventory',
      title: 'Inventory Valuation',
      description: 'View current inventory value by category and location',
      icon: <InventoryIcon color="secondary" />,
      path: '/owner/reports/inventory-value',
      color: '#9c27b0'
    },
    {
      id: 'financial',
      title: 'Financial Reports',
      description: 'Access profit & loss, balance sheets and cash flow reports',
      icon: <CurrencyExchangeIcon style={{ color: '#f57c00' }} />,
      path: '/owner/reports/financial',
      color: '#f57c00'
    },
    {
      id: 'category',
      title: 'Category Performance',
      description: 'Analyze sales and profitability by product category',
      icon: <PieChartIcon style={{ color: '#d32f2f' }} />,
      path: '/owner/reports/categories',
      color: '#d32f2f'
    }
  ];

  // Handle main navigation tab changes
  const handleTabChange = (tab) => {
    console.log("ReportsDashboard: Tab changed to", tab);
    
    // Set the active tab state
    setActiveTab(tab);
    
    // Add navigation for specific tabs
    if (tab === 'marketing') {
      navigate('/owner/marketing/dashboard');
      return;
    }
    
    // Add navigation for reports tab
    if (tab === 'reports') {
      navigate('/owner/reports');
      return;
    }
    
    // For overview/dashboard tab
    if (tab === 'dashboard' || tab === 'overview') {
      navigate('/owner/dashboard');
      return;
    }
    
    // Don't add any additional navigation code for other tabs
    // This prevents accidental redirections that could cause page refreshes
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-container">
        {/* Main Navigation Tabs - copied from OwnerDashboardPage */}
        <div className="tabs-container">
          <div className="tab-buttons">
            <button 
              className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleTabChange('dashboard')}
            >
              <HomeIcon fontSize="small" />
              <span>Overview</span>
            </button>
            
            <button 
              className={`tab-button ${activeTab === 'staff' ? 'active' : ''}`}
              onClick={() => handleTabChange('staff')}
            >
              <PeopleIcon fontSize="small" />
              <span>Staff</span>
            </button>
            
            <button 
              className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => handleTabChange('inventory')}
            >
              <InventoryIcon fontSize="small" />
              <span>Inventory</span>
            </button>
            
            <button 
              className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => handleTabChange('reports')}
            >
              <AssessmentIcon fontSize="small" />
              <span>Reports</span>
            </button>
            
            <button 
              className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => handleTabChange('products')}
            >
              <CategoryIcon fontSize="small" />
              <span>Products</span>
            </button>
            
            <button 
              className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => handleTabChange('orders')}
            >
              <ShoppingCartIcon fontSize="small" />
              <span>Orders</span>
            </button>

            <button 
              className={`tab-button ${activeTab === 'returns' ? 'active' : ''}`}
              onClick={() => handleTabChange('returns')}
            >
              <SwapHorizIcon fontSize="small" />
              <span>Returns</span>
            </button>
            
            <button 
              className={`tab-button ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => handleTabChange('customers')}
            >
              <PersonIcon fontSize="small" />
              <span>Customers</span>
            </button>
            
            <button 
              className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => handleTabChange('analytics')}
            >
              <BarChartIcon fontSize="small" />
              <span>Analytics</span>
            </button>
            
            <button 
              className={`tab-button ${activeTab === 'marketing' ? 'active' : ''}`}
              onClick={() => handleTabChange('marketing')}
            >
              <CampaignIcon fontSize="small" />
              <span>Marketing</span>
            </button>
            
            <button 
              className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => handleTabChange('settings')}
            >
              <StoreIcon fontSize="small" />
              <span>Settings</span>
            </button>
            
            <button 
              className={`tab-button ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => handleTabChange('account')}
            >
              <AccountCircleIcon fontSize="small" />
              <span>Account</span>
            </button>
          </div>
        </div>

        <div className="tab-content">
          <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4">Reports & Analytics</Typography>
              <AssessmentIcon fontSize="large" color="primary" />
            </Box>

            <Paper sx={{ p: 2, mb: 4 }}>
              <Typography variant="body1">
                Review your business performance through comprehensive reports and analytics. 
                Select a report type below to view detailed insights.
              </Typography>
            </Paper>

            <Grid container spacing={3}>
              {reports.map((report) => (
                <Grid item xs={12} sm={6} md={4} key={report.id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3,
                        borderColor: report.color
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" alignItems="center" mb={2}>
                        {report.icon}
                        <Typography variant="h6" ml={1}>
                          {report.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {report.description}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        onClick={() => navigate(report.path)}
                        sx={{ color: report.color }}
                      >
                        View Report
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard; 