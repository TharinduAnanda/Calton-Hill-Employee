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
  People as PeopleIcon
} from '@mui/icons-material';

const StaffLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Check if the current user is a manager
  const isManager = currentUser && (currentUser.role === 'manager' || currentUser.role === 'admin');

  // Map routes to tab names
  const routeToTabMap = {
    '/staff/dashboard': 'overview',
    '/sales': 'sales',
    '/inventory': 'inventory',
    '/staff/tasks': 'tasks',
    '/staff/management': 'staff_management',
    '/owner/inventory/purchase-orders': 'purchase_orders',
    '/owner/returns': 'returns',
    '/marketing/dashboard': 'marketing',
    '/marketing': 'marketing',
    '/staff/settings': 'settings'
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
    
    // Navigate to the corresponding route
    switch(tab) {
      case 'overview':
        targetUrl = '/staff/dashboard';
        break;
      case 'sales':
        targetUrl = '/sales';
        break;
      case 'inventory':
        targetUrl = '/inventory';
        break;
      case 'tasks':
        targetUrl = '/staff/tasks';
        break;
      case 'staff_management':
        targetUrl = '/staff/management';
        break;
      case 'purchase_orders':
        targetUrl = '/owner/inventory/purchase-orders';
        break;
      case 'returns':
        targetUrl = '/owner/returns';
        break;
      case 'marketing':
        targetUrl = '/marketing/dashboard';
        break;
      case 'settings':
        targetUrl = '/staff/settings';
        break;
      default:
        targetUrl = '/staff/dashboard';
    }
    
    // Use navigate for history management, but with force reload
    window.location.href = targetUrl;
  };

  return (
    <>
      {/* Navbar component */}
      <Navbar 
        unreadNotificationCount={0} // Update with real data when available
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
                className={`tab-button ${activeTab === 'sales' ? 'active' : ''}`}
                onClick={() => handleTabChange('sales')}
              >
                <OrderIcon fontSize="small" />
                <span>Sales</span>
              </button>
              
              <button 
                className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
                onClick={() => handleTabChange('inventory')}
              >
                <InventoryIcon fontSize="small" />
                <span>Inventory</span>
              </button>
              
              <button 
                className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
                onClick={() => handleTabChange('tasks')}
              >
                <AssignmentIcon fontSize="small" />
                <span>Tasks</span>
              </button>
              
              {/* Manager-specific tabs */}
              {isManager && (
                <>
                  <button 
                    className={`tab-button ${activeTab === 'staff_management' ? 'active' : ''}`}
                    onClick={() => handleTabChange('staff_management')}
                  >
                    <PeopleIcon fontSize="small" />
                    <span>Staff</span>
                  </button>
                  
                  <button 
                    className={`tab-button ${activeTab === 'purchase_orders' ? 'active' : ''}`}
                    onClick={() => handleTabChange('purchase_orders')}
                  >
                    <ShoppingCartIcon fontSize="small" />
                    <span>PO</span>
                  </button>
                  
                  <button 
                    className={`tab-button ${activeTab === 'returns' ? 'active' : ''}`}
                    onClick={() => handleTabChange('returns')}
                  >
                    <SwapHorizIcon fontSize="small" />
                    <span>Returns</span>
                  </button>
                  
                  <button 
                    className={`tab-button ${activeTab === 'marketing' ? 'active' : ''}`}
                    onClick={() => handleTabChange('marketing')}
                  >
                    <TrendingUpIcon fontSize="small" />
                    <span>Marketing</span>
                  </button>
                </>
              )}
              
              {isManager && (
                <button 
                  className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => handleTabChange('settings')}
                >
                  <SettingsIcon fontSize="small" />
                  <span>Settings</span>
                </button>
              )}
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

export default StaffLayout; 