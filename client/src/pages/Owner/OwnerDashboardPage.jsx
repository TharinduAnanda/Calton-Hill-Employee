import React, { useState, useEffect } from 'react';
import {
  People as PeopleIcon,
  Store as StoreIcon,
  AccountCircle as AccountCircleIcon,
  Dashboard as DashboardIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Inventory as PackageIcon,
  AttachMoney as DollarSignIcon,
  Home as HomeIcon,
  ShoppingCart as ShoppingCartIcon,
  BarChart as BarChartIcon,
  Person as PersonIcon,
  Campaign as MegaphoneIcon,
} from '@mui/icons-material';
import LineChartComponent from '../../components/common/LineChartComponent';
import ControlCenter from './ControlCenter';
import './OwnerDashboardPage.css';
import StaffManagement from './StaffManagement';

const DashboardOverview = ({ stats }) => {
  return (
    <div className="dashboard-overview">
      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-card-header">
            <PeopleIcon fontSize="small" />
            <span>Staff Members</span>
          </div>
          <div className="stats-card-value">{stats.staffCount}</div>
          <div className="stats-card-change positive">
            <ArrowUpIcon fontSize="small" />
            <span>+2 this month</span>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-card-header">
            <PackageIcon fontSize="small" />
            <span>Active Products</span>
          </div>
          <div className="stats-card-value">{stats.activeProducts}</div>
          <div className="stats-card-change positive">
            <ArrowUpIcon fontSize="small" />
            <span>+15 this month</span>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-card-header">
            <ShoppingCartIcon fontSize="small" />
            <span>Pending Orders</span>
          </div>
          <div className="stats-card-value">{stats.pendingOrders}</div>
          <div className="stats-card-change negative">
            <ArrowDownIcon fontSize="small" />
            <span>-3 since yesterday</span>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-card-header">
            <DollarSignIcon fontSize="small" />
            <span>Monthly Revenue</span>
          </div>
          <div className="stats-card-value">${stats.revenue.toLocaleString()}</div>
          <div className="stats-card-change positive">
            <ArrowUpIcon fontSize="small" />
            <span>+12% vs last month</span>
          </div>
        </div>
      </div>
      
      <div className="trends-section mt-8 p-6 bg-white rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Performance Trends</h3>
          <div className="flex gap-2">
            <span className="flex items-center text-sm text-blue-600">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              Revenue
            </span>
            <span className="flex items-center text-sm text-green-600">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Visitors
            </span>
          </div>
        </div>
        <div className="h-80">
          <LineChartComponent data={{
            ...stats,
            monthlyRevenueData: [5000, 8000, 6500, 9000, 12000, 15000, stats.revenue],
            monthlyVisitorsData: [3000, 3500, 4000, 4200, 4500, 4600, stats.monthlyVisitors]
          }} />
        </div>
      </div>

      <div className="additional-metrics grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="metric-card bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-gray-500 text-sm font-medium mb-1">Conversion Rate</h4>
              <p className="text-2xl font-bold text-gray-800">{stats.conversionRate}%</p>
              <div className="flex items-center mt-2">
                <ArrowUpIcon fontSize="small" className="text-green-500 mr-1" />
                <span className="text-green-500 text-sm">+0.5% vs last month</span>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <BarChartIcon className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="metric-card bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-gray-500 text-sm font-medium mb-1">Avg. Order Value</h4>
              <p className="text-2xl font-bold text-gray-800">
                ${(stats.revenue / (stats.pendingOrders + 120) || 0).toFixed(2)}
              </p>
              <div className="flex items-center mt-2">
                <ArrowUpIcon fontSize="small" className="text-green-500 mr-1" />
                <span className="text-green-500 text-sm">+8% vs last month</span>
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <ShoppingCartIcon className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OwnerDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [controlCenterOpen, setControlCenterOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    staffCount: 0,
    activeProducts: 0,
    pendingOrders: 0,
    revenue: 0,
    monthlyVisitors: 0,
    conversionRate: 0
  });
  
  const currentUser = { displayName: 'John Smith' };

  useEffect(() => {
    setTimeout(() => {
      setStats({
        staffCount: 12,
        activeProducts: 128,
        pendingOrders: 7,
        revenue: 15640,
        monthlyVisitors: 4580,
        conversionRate: 3.2
      });
      
      setNotifications([
        {
          id: 1,
          text: "Inventory low for 'Wireless Headphones' - only 3 units left",
          time: "Just now",
          type: "warning",
          read: false
        },
        {
          id: 2,
          text: "New staff request - Sarah Johnson wants to join your team",
          time: "25 minutes ago",
          type: "info",
          read: false
        },
        {
          id: 3,
          text: "April sales report is ready for review",
          time: "2 hours ago",
          type: "info",
          read: true
        },
        {
          id: 4,
          text: "System maintenance scheduled for tonight at 2:00 AM",
          time: "Yesterday",
          type: "info",
          read: true
        },
        {
          id: 5,
          text: "Payment failed for Order #5723 - Customer has been notified",
          time: "Yesterday",
          type: "critical",
          read: false
        }
      ]);
    }, 500);
  }, []);

  const formattedDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const toggleControlCenter = () => {
    console.log("Toggling control center", !controlCenterOpen);
    setControlCenterOpen(!controlCenterOpen);
  };

  const unreadNotificationCount = notifications.filter(notif => !notif.read).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(notif => ({...notif, read: true})));
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
        return <DashboardOverview stats={stats} />;
      case 'staff':
        return <StaffManagement />;
      case 'inventory':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Inventory Management</h2><p>Inventory management component would be displayed here</p></div>;
      case 'orders':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Orders Management</h2><p>Orders management component would be displayed here</p></div>;
      case 'customers':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Customer Management</h2><p>Customer management component would be displayed here</p></div>;
      case 'analytics':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Analytics & Reports</h2><p>Analytics and reports component would be displayed here</p></div>;
      case 'marketing':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Marketing Tools</h2><p>Marketing tools component would be displayed here</p></div>;
      case 'settings':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Store Settings</h2><p>Store settings component would be displayed here</p></div>;
      case 'account':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Account Settings</h2><p>Account settings component would be displayed here</p></div>;
      default:
        return <DashboardOverview stats={stats} />;
    }
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Owner Dashboard</h1>
            <p className="dashboard-welcome">
              Welcome back, {currentUser?.displayName || 'Owner'}! Today is {formattedDate}
            </p>
          </div>
          <button 
            className="control-center-button"
            onClick={toggleControlCenter}
          >
            <div className="icon-wrapper">
              <DashboardIcon fontSize="small" />
              {unreadNotificationCount > 0 && (
                <span className="notification-badge">
                  {unreadNotificationCount}
                </span>
              )}
            </div>
            <span>Control Center</span>
          </button>
        </div>
        
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
              <PackageIcon fontSize="small" />
              <span>Inventory</span>
            </button>
            
            <button 
              className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => handleTabChange('orders')}
            >
              <ShoppingCartIcon fontSize="small" />
              <span>Orders</span>
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

        <div className="tab-content">
          {renderTabContent()}
        </div>

        <div className="dashboard-footer">
          © {new Date().getFullYear()} Inventory Pro - Owner Portal v2.5.0
        </div>
      </div>

      <ControlCenter 
        isOpen={controlCenterOpen}
        stats={stats}
        notifications={notifications}
        onClose={toggleControlCenter}
        onMarkAllRead={handleMarkAllRead}
        unreadNotificationCount={unreadNotificationCount}
      />
    </div>
  );
};

export default OwnerDashboardPage;