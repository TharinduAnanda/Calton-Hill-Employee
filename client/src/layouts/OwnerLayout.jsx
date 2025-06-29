import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Alert } from '@mui/material';
import Navbar from '../components/Navbar/Navbar';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  ShoppingCart as OrderIcon,
  Settings as SettingsIcon,
  Home as HomeIcon,
  SwapHoriz as SwapHorizIcon,
  ShoppingCart as ShoppingCartIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Campaign as MegaphoneIcon,
  Store as StoreIcon,
  AccountCircle as AccountCircleIcon,
  Category as ProductsIcon,
  Person as PersonIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';

const OwnerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Map routes to tab names
  const routeToTabMap = {
    '/owner/dashboard': 'overview',
    '/owner/staff': 'staff',
    '/owner/inventory': 'inventory',
    '/owner/inventory/purchase-orders': 'inventory',
    '/owner/products': 'products',
    // '/owner/orders': 'orders',
    // '/owner/returns': 'returns',
    '/owner/customers': 'customers',
    // '/owner/analytics': 'analytics',
    '/owner/marketing': 'marketing',
    '/owner/settings': 'settings',
    '/owner/account': 'account',
    '/owner/reports': 'reports',
    '/owner/reports/financial': 'reports',
    '/owner/reports/turnover': 'reports'
  };

  // Set active tab based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Find the matching route in our map
    const matchingRoute = Object.keys(routeToTabMap).find(route => 
      currentPath === route || currentPath.startsWith(route + '/')
    );
    
    if (matchingRoute) {
      setActiveTab(routeToTabMap[matchingRoute]);
    }
  }, [location.pathname]);

  // Handle tab click
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Use direct location change to ensure complete navigation
    let targetUrl;
    
    switch(tab) {
      case 'overview':
        targetUrl = '/owner/dashboard';
        break;
      case 'staff':
        targetUrl = '/owner/staff';
        break;
      case 'inventory':
        targetUrl = '/owner/inventory';
        break;
      case 'products':
        targetUrl = '/owner/products';
        break;
      // case 'orders':
      //   targetUrl = '/owner/orders';
      //   break;
      // case 'returns':
      //   targetUrl = '/owner/returns';
      //   break;
      case 'customers':
        targetUrl = '/owner/customers';
        break;
      // case 'analytics':
      //   targetUrl = '/owner/analytics';
      //   break;
      case 'marketing':
        targetUrl = '/owner/marketing/dashboard';
        break;
      case 'settings':
        targetUrl = '/owner/settings';
        break;
      case 'account':
        targetUrl = '/owner/account';
        break;
      case 'reports':
        targetUrl = '/owner/reports';
        break;
      default:
        targetUrl = '/owner/dashboard';
    }
    
    // Use navigate for history management, but with force reload
    window.location.href = targetUrl;
  };

  return (
    <>
      {/* Navbar component */}
      <Navbar 
        unreadNotificationCount={0} 
        onControlCenterToggle={() => {}}
      />
      
      <div className="dashboard-content">
        <div className="dashboard-container">
          {/* Fixed Tab Buttons */}
          <div className="tabs-container">
            <div className="tab-buttons">
              <button 
                className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => handleTabChange('overview')}
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
                className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => handleTabChange('products')}
              >
                <ProductsIcon fontSize="small" />
                <span>Products</span>
              </button>
              
              {/* <button 
                className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => handleTabChange('orders')}
              >
                <OrderIcon fontSize="small" />
                <span>Orders</span>
              </button> */}

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
                className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => handleTabChange('reports')}
              >
                <AssignmentIcon fontSize="small" />
                <span>Reports</span>
              </button>
              
              <button 
                className={`tab-button ${activeTab === 'marketing' ? 'active' : ''}`}
                onClick={() => handleTabChange('marketing')}
              >
                <MegaphoneIcon fontSize="small" />
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
          
          {/* Tab Content Area */}
          <div className="tab-content-container">
            <Outlet key={location.pathname} />
          </div>
        </div>
      </div>
    </>
  );
};

export default OwnerLayout; 