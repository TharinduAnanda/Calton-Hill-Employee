import React, { useState } from 'react';
import { Box, Typography, Paper, Breadcrumbs, Link } from '@mui/material';
import InventoryTurnoverReport from '../Inventory/InventoryTurnoverReport';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import BarChartIcon from '@mui/icons-material/BarChart';
// Additional imports for owner dashboard tabs
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import StoreIcon from '@mui/icons-material/Store';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CampaignIcon from '@mui/icons-material/Campaign';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CategoryIcon from '@mui/icons-material/Category';
import '../Owner/OwnerDashboardPage.css'; // Import dashboard styles

const TurnoverReportPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('reports');

  // Handle main navigation tab changes
  const handleTabChange = (tab) => {
    console.log("TurnoverReportPage: Tab changed to", tab);
    
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

            <button 
              className={`tab-button ${activeTab === 'financial' ? 'active' : ''}`}
              onClick={() => handleTabChange('financial')}
            >
              <AccountBalanceIcon fontSize="small" />
              <span>Financial</span>
            </button>
          </div>
        </div>

        <div className="tab-content">
          <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography variant="h4" gutterBottom>Inventory Turnover Report</Typography>
                <Breadcrumbs aria-label="breadcrumb">
                  <Link component={RouterLink} to="/owner/dashboard" color="inherit">
                    Dashboard
                  </Link>
                  <Link component={RouterLink} to="/owner/reports" color="inherit">
                    Reports
                  </Link>
                  <Typography color="text.primary">Turnover Analysis</Typography>
                </Breadcrumbs>
              </Box>
              <BarChartIcon fontSize="large" color="primary" />
            </Box>
            
            <Paper sx={{ p: 0, mb: 3 }}>
              <Box p={2} bgcolor="background.default">
                <Typography variant="body1">
                  This report analyzes your inventory turnover performance, helping you identify fast and slow-moving products.
                  Higher turnover ratios indicate products selling quickly, while lower ratios may require attention.
                </Typography>
              </Box>
            </Paper>
            
            {/* Embed the existing turnover report component */}
            <InventoryTurnoverReport />
          </Box>
        </div>
      </div>
    </div>
  );
};

export default TurnoverReportPage; 