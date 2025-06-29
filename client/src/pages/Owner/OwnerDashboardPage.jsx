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
  AccountBalance as FinanceIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  SwapHoriz as SwapHorizIcon,
  Info as InfoIcon,
  Category as ProductsIcon, // Added ProductsIcon
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import LineChartComponent from '../../components/common/LineChartComponent';
import ControlCenter from './ControlCenter';
import './OwnerDashboardPage.css';
import StaffManagement from '../Staff/StaffManagement';
import FinancialDashboard from '../Financial/FinancialDashboard';
import CustomerManagement from '../Customers/CustomerManagement';
import InventoryManagement from '../Inventory/InventoryManagement';
import ReturnsList from '../Returns/ReturnsList';
import ProductsPage from '../Products/ProductsPage';
import MarketingDashboard from '../Marketing/MarketingDashboard'; // Import the existing ProductsPage component
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import EmailCampaigns from '../Marketing/EmailCampaigns';
import CampaignManagement from '../Marketing/CampaignManagement';
import LoyaltyProgram from '../Marketing/LoyaltyProgram';
import PromotionsManager from '../Marketing/PromotionsManager';
import MarketingAnalytics from '../Marketing/MarketingAnalytics';
import ReportsDashboard from '../Reports/ReportsDashboard';
import TurnoverReportPage from '../Reports/TurnoverReportPage';

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

        <div className="stats-card">
          <div className="stats-card-header">
            <FinanceIcon fontSize="small" />
            <span>Financial Health</span>
          </div>
          <div className="stats-card-value">${stats.financialHealth?.toLocaleString() || "0.00"}</div>
          <div className="stats-card-change positive">
            <ArrowUpIcon fontSize="small" />
            <span>View Financial Dashboard</span>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <PackageIcon fontSize="small" />
            <span>Inventory Value</span>
          </div>
          <div className="stats-card-value">${stats.inventoryValue?.toLocaleString() || "0"}</div>
          <div className="stats-card-change warning">
            <WarningIcon fontSize="small" />
            <span>{stats.lowStockItems || 0} low stock items</span>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <SwapHorizIcon fontSize="small" />
            <span>Returns Management</span>
          </div>
          <div className="stats-card-value">
            {stats.pendingReturns || 0} <span className="text-sm">Pending</span>
          </div>
          <div className="stats-card-change warning">
            <InfoIcon fontSize="small" />
            <span>${stats.refundAmount?.toLocaleString() || "0"} refund value</span>
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

        <div className="metric-card bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-gray-500 text-sm font-medium mb-1">Total Customers</h4>
              <p className="text-2xl font-bold text-gray-800">
                {stats.customerCount || 0}
              </p>
              <div className="flex items-center mt-2">
                <ArrowUpIcon fontSize="small" className="text-green-500 mr-1" />
                <span className="text-green-500 text-sm">+{stats.newCustomers || 0} new this month</span>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <PersonIcon className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="metric-card bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-gray-500 text-sm font-medium mb-1">Inventory Status</h4>
              <p className="text-2xl font-bold text-gray-800">{stats.inventoryItems || 0} Items</p>
              <div className="flex items-center mt-2">
                <AddIcon fontSize="small" className="text-green-500 mr-1" />
                <span className="text-green-500 text-sm">+{stats.newInventoryItems || 0} new items this month</span>
              </div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <PackageIcon className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="metric-card bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-gray-500 text-sm font-medium mb-1">Returns & Refunds</h4>
              <p className="text-2xl font-bold text-gray-800">{stats.totalReturns || 0} Returns</p>
              <div className="flex items-center mt-2">
                <SwapHorizIcon fontSize="small" className="text-orange-500 mr-1" />
                <span className="text-orange-500 text-sm">
                  {stats.pendingReturns || 0} awaiting approval
                </span>
              </div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <SwapHorizIcon className="text-orange-600" />
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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setTimeout(() => {
      setStats({
        staffCount: 12,
        activeProducts: 128,
        pendingOrders: 7,
        revenue: 15640,
        monthlyVisitors: 4580,
        conversionRate: 3.2,
        inventoryItems: 150,
        lowStockItems: 12,
        inventoryValue: 24680,
        newInventoryItems: 5,
        pendingReturns: 3,
        totalReturns: 15,
        refundAmount: 1250
      });
      
      setNotifications([
        {
          id: 1,
          text: "New return request (#1234) requires your approval",
          time: "Just now",
          type: "warning",
          read: false
        },
        {
          id: 2,
          text: "Inventory low for 'Wireless Headphones' - only 3 units left",
          time: "Just now",
          type: "warning",
          read: false
        },
        {
          id: 3,
          text: "New staff request - Sarah Johnson wants to join your team",
          time: "25 minutes ago",
          type: "info",
          read: false
        },
        {
          id: 4,
          text: "April sales report is ready for review",
          time: "2 hours ago",
          type: "info",
          read: true
        },
        {
          id: 5,
          text: "System maintenance scheduled for tonight at 2:00 AM",
          time: "Yesterday",
          type: "info",
          read: true
        },
        {
          id: 6,
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
    console.log("OwnerDashboard: Tab changed to", tab);
    
    // Save the current tab to state
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
    
    // Don't add any additional navigation code for other tabs
    // This prevents accidental redirections that could cause page refreshes
  };

  const toggleControlCenter = () => {
    setControlCenterOpen(!controlCenterOpen);
  };

  const unreadNotificationCount = notifications.filter(notif => !notif.read).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(notif => ({...notif, read: true})));
  };

  const renderTabContent = () => {
    // Get the current path to check if we're on a marketing path
    const currentPath = location.pathname;
    
    // Check if we're on an owner marketing path, and if so, render the correct component
    if (currentPath.startsWith('/owner/marketing')) {
      // Extract the specific marketing page from the URL (dashboard, loyalty, etc.)
      const marketingPage = currentPath.split('/')[3] || 'dashboard';
      
      switch(marketingPage) {
        case 'dashboard':
          return <MarketingDashboard />;
        case 'email':
          return <EmailCampaigns />;
        case 'campaigns':
          return <CampaignManagement />;
        case 'loyalty':
          return <LoyaltyProgram />;
        case 'promotions':
          return <PromotionsManager />;
        case 'analytics':
          return <MarketingAnalytics />;
        default:
          return <MarketingDashboard />;
      }
    }
    
    // Check if we're on a reports path
    if (currentPath.startsWith('/owner/reports')) {
      // Extract the specific report from the URL
      const reportPage = currentPath.split('/')[3] || 'dashboard';
      
      switch(reportPage) {
        case 'turnover':
          return <TurnoverReportPage />;
        default:
          return <ReportsDashboard />;
      }
    }
    
    // Normal tab rendering for non-marketing pages
    switch(activeTab) {
      case 'overview':
        return <DashboardOverview stats={stats} />;
      case 'staff':
        return <StaffManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'products':  // Add products case
        return <ProductsPage />;
      case 'orders':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Orders Management</h2><p>Orders management component would be displayed here</p></div>;
      case 'customers':
        return <CustomerManagement />;
      case 'returns':
        return <ReturnsList />;
      case 'analytics':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Analytics & Reports</h2><p>Analytics and reports component would be displayed here</p></div>;
      case 'marketing':
        return <MarketingDashboard />;
      case 'reports':
        return <ReportsDashboard />;
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
        {/* Remove the dashboard-header div that contains welcome message and control center button */}
        
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
              className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => handleTabChange('reports')}
            >
              <AssessmentIcon fontSize="small" />
              <span>Reports</span>
            </button>
            
            {/* Add Products Management button */}
            <button 
              className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => handleTabChange('products')}
            >
              <ProductsIcon fontSize="small" />
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

            {/* <button 
              className={`tab-button ${activeTab === 'financial' ? 'active' : ''}`}
              onClick={() => handleTabChange('financial')}
            >
              <FinanceIcon fontSize="small" />
              <span>Financial</span>
            </button> */}
          </div>
        </div>

        <div className="tab-content">
          {renderTabContent()}
        </div>

        <div className="dashboard-footer">
          © {new Date().getFullYear()} Calton Hill - Owner Portal v2.5.0
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