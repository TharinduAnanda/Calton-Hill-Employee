// src/pages/StaffDashboard/StaffDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { 
  Box, 
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Menu,
  MenuItem,
  IconButton,
  Badge,
  Avatar,
  Divider,
  TextField,
  Card,
  CardContent,
  CardActions,
  Chip,
  Tooltip,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Rating,
  ButtonGroup,
  Pagination
} from '@mui/material';

// Material Icons
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Assignment as TaskIcon,
  ShoppingCart as OrderIcon,
  Warning as AlertIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Build as BuildIcon,
  Store as StoreIcon,
  CalendarToday as CalendarIcon,
  Help as HelpIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreIcon,
  SupervisorAccount as SupervisorIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  SwapHoriz as SwapHorizIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  AccountBalance as FinanceIcon,
  AttachMoney as DollarSignIcon,
  Info as InfoIcon,
  LocalShipping as LocalShippingIcon,
  School as SchoolIcon,
  Campaign as CampaignIcon,
  Storefront as StorefrontIcon,
  LocalOffer as LocalOfferIcon,
  Email as EmailIcon,
  Share as ShareIcon
} from '@mui/icons-material';

// Charts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import LineChartComponent from '../../components/common/LineChartComponent';

// Import Owner Dashboard CSS for consistent styling
import '../Owner/OwnerDashboardPage.css';

// Services
import dashboardService from '../../services/dashboardService';

// Import our custom theme
import customTheme from '../../utils/theme';
import { getColor } from '../../utils/theme';

// Import CSS
import './StaffDashboard.css';

// Import Marketing Dashboard component
import MarketingDashboard from '../Marketing/MarketingDashboard';

// Helper function to safely get theme values
const getThemeValue = (theme, path) => {
  try {
    // Support paths like 'colors.primary.main' or 'palette.primary.main'
    const parts = path.split('.');
    
    // First try with colors
    if (parts[0] === 'colors' && theme.colors) {
      let result = theme.colors;
      for (let i = 1; i < parts.length; i++) {
        if (result[parts[i]] === undefined) return null;
        result = result[parts[i]];
      }
      return result;
    }
    
    // Then try with palette (for MUI theme compatibility)
    if (parts[0] === 'palette' && theme.palette) {
      let result = theme.palette;
      for (let i = 1; i < parts.length; i++) {
        if (result[parts[i]] === undefined) return null;
        result = result[parts[i]];
      }
      return result;
    }
    
    // Direct property on theme
    if (theme[parts[0]]) {
      let result = theme[parts[0]];
      for (let i = 1; i < parts.length; i++) {
        if (result[parts[i]] === undefined) return null;
        result = result[parts[i]];
      }
      return result;
    }
    
    return null;
  } catch (err) {
    console.warn(`Error accessing theme path: ${path}`, err);
    return null;
  }
};

// Mock data when API fails
const mockDashboardData = {
  summary: {
    pendingTasks: 4,
    lowStockItems: 7,
    activeOrders: 12,
    totalProducts: 156,
    dailySales: 2350.75,
    mostSoldCategory: 'Power Tools',
    staffCount: 8,
    monthlyVisitors: 3200,
    conversionRate: 2.8,
    inventoryValue: 15420,
    newInventoryItems: 3,
    pendingReturns: 2,
    totalReturns: 8,
    refundAmount: 950
  },
  recentTasks: [
    { 
      id: 1, 
      name: 'Restock Inventory', 
      status: 'pending', 
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      description: 'Restock power tools section'
    },
    { 
      id: 2, 
      name: 'Update Product Prices', 
      status: 'completed', 
      dueDate: new Date().toISOString(),
      description: 'Update prices for new product line'
    },
    { 
      id: 3, 
      name: 'Customer Follow-up', 
      status: 'in progress', 
      dueDate: new Date(Date.now() + 172800000).toISOString(),
      description: 'Follow up with recent customers about satisfaction'
    }
  ],
  lowStockItems: [
    { id: 1, name: 'Power Drill', quantity: 3, reorderThreshold: 10, sku: 'PD-001', supplier: 'Tools Inc.' },
    { id: 2, name: 'Pipe Fittings', quantity: 5, reorderThreshold: 20, sku: 'PF-120', supplier: 'Plumbing Supplies Ltd.' },
    { id: 3, name: 'Electrical Tape', quantity: 2, reorderThreshold: 15, sku: 'ET-033', supplier: 'Electrical Goods Co.' }
  ],
  salesData: [
    { month: 'Jan', sales: 4000 },
    { month: 'Feb', sales: 3000 },
    { month: 'Mar', sales: 2780 },
    { month: 'Apr', sales: 4890 },
    { month: 'May', sales: 3390 },
    { month: 'Jun', sales: 5100 }
  ],
  categoryBreakdown: [
    { name: 'Power Tools', value: 35 },
    { name: 'Hand Tools', value: 25 },
    { name: 'Plumbing', value: 15 },
    { name: 'Electrical', value: 15 },
    { name: 'Materials', value: 10 }
  ],
  staffPerformance: [
    { name: 'John Smith', sales: 32000, tasks: 24, efficiency: 94 },
    { name: 'Alice Jones', sales: 28500, tasks: 18, efficiency: 88 },
    { name: 'Robert Lee', sales: 25000, tasks: 21, efficiency: 82 }
  ]
};

// Status indicator component using CSS classes
const StatusIndicator = ({ status }) => {
  const getStatusClass = () => {
    switch (status.toLowerCase()) {
      case 'urgent': return 'status-indicator status-urgent';
      case 'pending': return 'status-indicator status-pending';
      case 'in progress': return 'status-indicator status-progress';
      case 'completed': return 'status-indicator status-completed';
      default: return 'status-indicator';
    }
  };

  return <span className={getStatusClass()}></span>;
};

// Component for dashboard card
const DashboardCard = ({ title, icon, children, action, color, theme }) => {
  return (
    <Paper className="dashboard-card">
      <div 
        className="card-header" 
        style={{ 
          backgroundColor: color || theme?.colors?.primary?.light || '#60a5fa'
        }}
      >
        <div className="card-title">
          <div className="card-icon-wrapper">
            {icon}
          </div>
          <Typography variant="h6">{title}</Typography>
        </div>
        {action}
      </div>
      <div className="card-content">
        {children}
      </div>
    </Paper>
  );
};

// Product card
const ProductCard = ({ product, onRestock }) => {
  const theme = useMuiTheme();
  const { name, quantity, reorderThreshold, sku, supplier } = product || {};
  const criticalStock = quantity <= reorderThreshold / 2;
  
  // Use fallback values for safety
  const errorColor = theme?.colors?.error?.main || theme?.palette?.error?.main || '#ef4444'; 
  const warningColor = theme?.colors?.warning?.main || theme?.palette?.warning?.main || '#f59e0b';
  
  return (
    <Card className={`item-card product-card ${criticalStock ? 'critical' : ''}`}>
      <div 
        className="product-icon-container" 
        style={{ 
          backgroundColor: criticalStock ? 
            errorColor : 
            warningColor
        }}
      >
        <BuildIcon sx={{ fontSize: 40 }} />
      </div>
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <CardContent sx={{ flex: '1 0 auto', pb: 1 }}>
          <Typography component="div" variant="h6" sx={{ fontWeight: 'bold' }}>
            {name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Chip 
              label={`Stock: ${quantity}`} 
              size="small" 
              color={criticalStock ? "error" : "warning"}
              sx={{ mr: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              Reorder at: {reorderThreshold}
            </Typography>
          </Box>
        </CardContent>
        <CardActions>
          <Button 
            size="small" 
            onClick={() => onRestock(product)}
            className={criticalStock ? "gradient-red" : "gradient-blue"}
          >
            Restock
          </Button>
          <Button size="small">View Details</Button>
        </CardActions>
      </Box>
      {criticalStock && (
        <Box sx={{ position: 'absolute', top: 10, right: 10 }} className="overdue-indicator">
          <Tooltip title="Critical Stock Level">
            <AlertIcon color="error" />
          </Tooltip>
        </Box>
      )}
    </Card>
  );
};

// Task card
const TaskCard = ({ task, onViewTask, onCompleteTask }) => {
  const theme = useMuiTheme();
  const { name, status, dueDate, description } = task || {};
  const isOverdue = new Date(dueDate) < new Date() && status !== 'completed';
  
  return (
    <Card className={`item-card task-card ${isOverdue ? 'overdue' : ''}`}>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <CardContent sx={{ flex: '1 0 auto', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography component="div" variant="h6">
              {name}
            </Typography>
            <Box>
              <StatusIndicator status={status} />
              <Chip 
                label={status} 
                size="small" 
                color={
                  status === 'completed' ? "success" : 
                  status === 'in progress' ? "primary" : 
                  isOverdue ? "error" : "warning"
                }
              />
            </Box>
          </Box>
          <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
            {description}
          </Typography>
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            Due: {new Date(dueDate).toLocaleDateString()}
          </Typography>
        </CardContent>
        <CardActions>
          <Button 
            size="small" 
            onClick={() => onViewTask(task)}
            className="gradient-blue"
          >
            View Details
          </Button>
          {status !== 'completed' && (
            <Button 
              size="small" 
              onClick={() => onCompleteTask(task)}
              className="gradient-green"
            >
              Mark Complete
            </Button>
          )}
        </CardActions>
      </Box>
      {isOverdue && (
        <Box sx={{ position: 'absolute', top: 10, right: 10 }} className="overdue-indicator">
          <Tooltip title="Overdue">
            <AlertIcon color="error" />
          </Tooltip>
        </Box>
      )}
    </Card>
  );
};

// Staff performance card
const StaffPerformanceCard = ({ staff }) => {
  const theme = useMuiTheme();
  const { name, sales, tasks, efficiency } = staff || {};
  
  const getEfficiencyColor = (eff) => {
    if (eff > 90) return "success";
    if (eff > 80) return "primary";
    return "warning";
  };
  
  return (
    <Card className="item-card staff-card">
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <Avatar sx={{ mr: 2 }}>{name?.charAt(0)}</Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{name}</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Chip 
              label={`Sales: ${sales?.toLocaleString()}`} 
              size="small" 
              color="primary"
              sx={{ mr: 1 }}
            />
            <Chip 
              label={`Tasks: ${tasks}`} 
              size="small" 
              color="secondary"
              sx={{ mr: 1 }}
            />
            <Chip 
              label={`Efficiency: ${efficiency}%`} 
              size="small" 
              color={getEfficiencyColor(efficiency)}
            />
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

// Stat card
const StatCard = ({ title, value, subtitle, borderColor }) => {
  const theme = useMuiTheme();
  
  const getCardClass = () => {
    switch (borderColor) {
      case 'primary': return 'stat-card-primary';
      case 'success': return 'stat-card-success';
      case 'warning': return 'stat-card-warning';
      case 'danger': return 'stat-card-danger';
      case 'info': return 'stat-card-info';
      default: return 'stat-card-primary';
    }
  };
  
  return (
    <Paper className={`stat-card ${getCardClass()}`}>
      <Box p={2}>
        <Typography variant="subtitle2" color="textSecondary">{title}</Typography>
        <Typography variant="h4" className="stat-value" gutterBottom>
          {typeof value === 'number' && !isNaN(value) 
            ? value < 1000
              ? value
              : `${(value / 1000).toFixed(1)}k`
            : value
          }
        </Typography>
        <Typography variant="body2" color="textSecondary">{subtitle}</Typography>
      </Box>
    </Paper>
  );
};

// Manager Dashboard Overview - styled like Owner Dashboard
const ManagerDashboardOverview = ({ dashboardData, navigate, handleTaskView, handleCompleteTask, handleRestockClick, theme }) => {
  const stats = {
    staffCount: 8,
    activeProducts: dashboardData?.summary?.totalProducts || 0,
    pendingOrders: dashboardData?.summary?.activeOrders || 0,
    revenue: dashboardData?.summary?.dailySales || 0,
    monthlyVisitors: 3200,
    conversionRate: 2.8,
    inventoryValue: 15420,
    lowStockItems: dashboardData?.lowStockItems?.length || 0,
    newInventoryItems: 3,
    pendingReturns: 2,
    totalReturns: 8,
    refundAmount: 950,
    pendingTasks: dashboardData?.recentTasks?.filter(t => t.status !== 'completed').length || 0,
    // Additional stats
    todaySales: 3240.75,
    yesterdaySales: 2980.50,
    lastWeekSameDaySales: 3050.25,
    weeklyRevenue: 18750.45,
    monthlyRevenue: 76500.20,
    previousMonthRevenue: 72340.80,
    avgTransactionValue: 68.50,
    onlineSalesPercent: 32,
    inStoreSalesPercent: 68,
    newCustomers: 14,
    repeatCustomerRate: 64,
    customerSatisfaction: 4.7,
    websiteTraffic: 485,
    cartAbandonmentRate: 23,
    footTraffic: 156,
    returnRate: 2.4,
    grossProfitMargin: 42.5,
    operatingExpenses: 12450.30,
  };

  // Sample sales data by category
  const salesByCategory = [
    { name: 'Power Tools', value: 35 },
    { name: 'Hand Tools', value: 25 },
    { name: 'Plumbing', value: 15 },
    { name: 'Electrical', value: 15 },
    { name: 'Materials', value: 10 }
  ];

  // Sample weekly sales data
  const weeklySalesData = [
    { name: 'Mon', sales: 2000, online: 650, inStore: 1350 },
    { name: 'Tue', sales: 1800, online: 500, inStore: 1300 },
    { name: 'Wed', sales: 2500, online: 800, inStore: 1700 },
    { name: 'Thu', sales: 2800, online: 950, inStore: 1850 },
    { name: 'Fri', sales: 3200, online: 1050, inStore: 2150 },
    { name: 'Sat', sales: 3800, online: 1200, inStore: 2600 },
    { name: 'Sun', sales: 1500, online: 600, inStore: 900 }
  ];

  // Sample top selling products
  const topProducts = [
    { id: 1, name: 'Cordless Power Drill', sales: 42, revenue: 2940 },
    { id: 2, name: 'Hammer Set (3-pack)', sales: 38, revenue: 950 },
    { id: 3, name: 'Screwdriver Set', sales: 35, revenue: 875 },
    { id: 4, name: 'LED Light Bulbs', sales: 32, revenue: 640 },
    { id: 5, name: 'PVC Pipe Fittings', sales: 28, revenue: 420 }
  ];

  // Sample low stock items
  const lowStockItems = dashboardData?.lowStockItems || [
    { id: 1, name: 'Power Drill', quantity: 3, reorderThreshold: 10, sku: 'PD-001', supplier: 'Tools Inc.' },
    { id: 2, name: 'Pipe Fittings', quantity: 5, reorderThreshold: 20, sku: 'PF-120', supplier: 'Plumbing Supplies Ltd.' },
    { id: 3, name: 'Electrical Tape', quantity: 2, reorderThreshold: 15, sku: 'ET-033', supplier: 'Electrical Goods Co.' }
  ];

  // Sample staff performance
  const staffPerformance = [
    { name: 'John Smith', sales: 12540, target: 10000, percent: 125 },
    { name: 'Emily Johnson', sales: 9850, target: 10000, percent: 98 },
    { name: 'Michael Brown', sales: 8720, target: 8500, percent: 103 },
    { name: 'Sarah Davis', sales: 7650, target: 8500, percent: 90 }
  ];

  // Sample customer feedback
  const customerFeedback = [
    { id: 1, customer: 'David Wilson', rating: 5, comment: 'Great service and product quality', date: '2023-06-15' },
    { id: 2, customer: 'Jennifer Lee', rating: 4, comment: 'Fast delivery but one item was missing', date: '2023-06-14' },
    { id: 3, customer: 'Robert Taylor', rating: 5, comment: 'Staff was very helpful and knowledgeable', date: '2023-06-14' }
  ];

  // Sample upcoming events
  const upcomingEvents = [
    { id: 1, title: 'Inventory delivery - Power Tools', date: '2023-06-18', type: 'delivery' },
    { id: 2, title: 'Staff Training - Customer Service', date: '2023-06-20', type: 'training' },
    { id: 3, title: 'Weekend Sale Promotion', date: '2023-06-24', type: 'promotion' },
    { id: 4, title: 'Quarterly Inventory Count', date: '2023-06-30', type: 'inventory' }
  ];

  // Colors for charts
  const COLORS = [
    '#2563eb', // Primary blue
    '#7c3aed', // Purple 
    '#10b981', // Green
    '#3b82f6', // Light blue
    '#f59e0b'  // Amber
  ];

  return (
    <div className="dashboard-overview">

            {/* Key Stats Summary - Enhanced with better visual indicators */}      <Box sx={{ mb: 8, display: 'flex', justifyContent: 'center' }}>        <Box sx={{ maxWidth: '1200px', width: '100%' }}>          <Typography variant="h5" sx={{ mb: 6, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>            <BarChartIcon sx={{ mr: 1 }} /> Key Metrics          </Typography>          <Grid container spacing={5} justifyContent="center">            {/* Today's Revenue */}            <Grid item xs={12} sm={6} md={3}>              <Paper                 elevation={0}                sx={{                   p: 2.5,                   borderRadius: '8px',                  aspectRatio: '1/1',                  display: 'flex',                  flexDirection: 'column',                  justifyContent: 'space-between',                  border: theme.components.card.border,                  backgroundColor: theme.colors.background.card,                  transition: `transform ${theme.components.card.transitionDuration}, box-shadow ${theme.components.card.transitionDuration}`,                  '&:hover': {                    transform: 'translateY(-4px)',                    boxShadow: theme.shadows[4]                  }                }}              >                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>                  <Box>                    <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>                      Today's Revenue                    </Typography>                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>                      ${stats.todaySales.toLocaleString()}                    </Typography>                  </Box>                  <Box                     sx={{                       bgcolor: `${theme.colors.success.light}20`,                       color: theme.colors.success.dark,                      width: 48,                      height: 48,                      display: 'flex',                      alignItems: 'center',                      justifyContent: 'center',                      borderRadius: '8px'                    }}                  >                    <DollarSignIcon />                  </Box>                </Box>                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>                  <ArrowUpIcon fontSize="small" sx={{ color: theme.colors.success.main, mr: 0.5 }} />                  <Typography variant="body2" sx={{ color: theme.colors.success.main, fontWeight: 'medium' }}>                    +{((stats.todaySales - stats.yesterdaySales) / stats.yesterdaySales * 100).toFixed(1)}%                  </Typography>                  <Typography variant="body2" sx={{ color: theme.colors.text.secondary, ml: 0.5 }}>                    vs yesterday                  </Typography>                </Box>              </Paper>            </Grid>            {/* Pending Orders */}            <Grid item xs={12} sm={6} md={3}>              <Paper                 elevation={0}                sx={{                   p: 2.5,                   borderRadius: '8px',                  aspectRatio: '1/1',                  display: 'flex',                  flexDirection: 'column',                  justifyContent: 'space-between',                  border: theme.components.card.border,                  backgroundColor: theme.colors.background.card,                  transition: `transform ${theme.components.card.transitionDuration}, box-shadow ${theme.components.card.transitionDuration}`,                  '&:hover': {                    transform: 'translateY(-4px)',                    boxShadow: theme.shadows[4]                  }                }}              >                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>                  <Box>                    <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>                      Pending Orders                    </Typography>                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>                      {stats.pendingOrders}                    </Typography>                  </Box>                  <Box                     sx={{                       bgcolor: `${theme.colors.warning.light}20`,                       color: theme.colors.warning.dark,                      width: 48,                      height: 48,                      display: 'flex',                      alignItems: 'center',                      justifyContent: 'center',                      borderRadius: '8px'                    }}                  >                    <ShoppingCartIcon />                  </Box>                </Box>                                <Button                   variant="outlined"                   color="warning"                   size="small"                   sx={{ mt: 1, borderRadius: theme.components.button.borderRadius }}                  startIcon={<InfoIcon fontSize="small" />}                  onClick={() => navigate('/orders/pending')}                >                  View Orders                </Button>              </Paper>            </Grid>            {/* Low Stock Items */}            <Grid item xs={12} sm={6} md={3}>              <Paper                 elevation={0}                sx={{                   p: 2.5,                   borderRadius: '8px',                  aspectRatio: '1/1',                  display: 'flex',                  flexDirection: 'column',                  justifyContent: 'space-between',                  border: theme.components.card.border,                  backgroundColor: theme.colors.background.card,                  transition: `transform ${theme.components.card.transitionDuration}, box-shadow ${theme.components.card.transitionDuration}`,                  '&:hover': {                    transform: 'translateY(-4px)',                    boxShadow: theme.shadows[4]                  }                }}              >                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>                  <Box>                    <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>                      Low Stock Items                    </Typography>                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>                      {stats.lowStockItems}                    </Typography>                  </Box>                  <Box                     sx={{                       bgcolor: `${theme.colors.error.light}20`,                       color: theme.colors.error.dark,                      width: 48,                      height: 48,                      display: 'flex',                      alignItems: 'center',                      justifyContent: 'center',                      borderRadius: '8px'                    }}                  >                    <InventoryIcon />                  </Box>                </Box>                                <Button                   variant="outlined"                   color="error"                   size="small"                   sx={{ mt: 1, borderRadius: theme.components.button.borderRadius }}                  startIcon={<WarningIcon fontSize="small" />}                  onClick={() => navigate('/inventory/low-stock')}                >                  Reorder Now                </Button>              </Paper>            </Grid>            {/* New Customers */}            <Grid item xs={12} sm={6} md={3}>              <Paper                 elevation={0}                sx={{                   p: 2.5,                   borderRadius: '8px',                  aspectRatio: '1/1',                  display: 'flex',                  flexDirection: 'column',                  justifyContent: 'space-between',                  border: theme.components.card.border,                  backgroundColor: theme.colors.background.card,                  transition: `transform ${theme.components.card.transitionDuration}, box-shadow ${theme.components.card.transitionDuration}`,                  '&:hover': {                    transform: 'translateY(-4px)',                    boxShadow: theme.shadows[4]                  }                }}              >                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>                  <Box>                    <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>                      New Customers                    </Typography>                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>                      {stats.newCustomers}                    </Typography>                  </Box>                  <Box                     sx={{                       bgcolor: `${theme.colors.info.light}20`,                       color: theme.colors.info.dark,                      width: 48,                      height: 48,                      display: 'flex',                      alignItems: 'center',                      justifyContent: 'center',                      borderRadius: '8px'                    }}                  >                    <PeopleIcon />                  </Box>                </Box>                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>                  <Typography variant="body2" sx={{ color: theme.colors.text.secondary }}>                    Repeat Rate:                   </Typography>                  <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 0.5 }}>                    {stats.repeatCustomerRate}%                  </Typography>                </Box>              </Paper>            </Grid>          </Grid>        </Box>      </Box>

      {/* Two-columns layout for main sections */}
      <Grid container spacing={3}>
        {/* Left column */}
        <Grid item xs={12} md={8}>
          {/* Sales Performance - Enhanced with better visualization */}
          <Paper 
            elevation={2}
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[1],
              position: 'relative',
              overflow: 'hidden',
              border: theme.components.card.border,
              backgroundColor: theme.colors.background.card
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: `${theme.colors.primary.light}20`, 
                    color: theme.colors.primary.dark,
                    mr: 2
                  }}
                >
                  <BarChartIcon />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: theme.typography.fontWeightBold }}>
                  Sales Performance
                </Typography>
              </Box>
              <Box>
                <ButtonGroup size="small" aria-label="time period selection">
                  <Button 
                    variant="contained" 
                    color="primary"
                    sx={{ borderRadius: theme.components.button.borderRadius }}
                    onClick={() => navigate('/sales/reports')}
                  >
                    Weekly
                  </Button>
                  <Button 
                    variant="outlined"
                    sx={{ borderRadius: theme.components.button.borderRadius }}
                    onClick={() => navigate('/sales/reports')}
                  >
                    Monthly
                  </Button>
                  <Button 
                    variant="outlined"
                    sx={{ borderRadius: theme.components.button.borderRadius }}
                    onClick={() => navigate('/sales/reports')}
                  >
                    Yearly
                  </Button>
                </ButtonGroup>
              </Box>
            </Box>
            
            <Box sx={{ height: 300, mb: 3 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weeklySalesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.divider} />
                  <XAxis 
                    dataKey="name" 
                    stroke={theme.colors.text.secondary}
                    tick={{ fill: theme.colors.text.secondary, fontSize: 12 }}
                  />
                  <YAxis 
                    stroke={theme.colors.text.secondary}
                    tick={{ fill: theme.colors.text.secondary, fontSize: 12 }}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: theme.colors.background.paper,
                      border: theme.components.card.border,
                      borderRadius: theme.shape.borderRadius,
                      boxShadow: theme.shadows[3]
                    }}
                    itemStyle={{ color: theme.colors.text.primary }}
                    formatter={(value) => [`$${value}`, undefined]}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    iconType="circle"
                    iconSize={10}
                    wrapperStyle={{ paddingBottom: 10 }}
                  />
                  <Line 
                    name="Total Sales"
                    type="monotone" 
                    dataKey="sales" 
                    stroke={theme.colors.primary.main} 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Line 
                    name="Online Sales"
                    type="monotone" 
                    dataKey="online" 
                    stroke={theme.colors.info.main} 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line 
                    name="In-Store Sales"
                    type="monotone" 
                    dataKey="inStore" 
                    stroke={theme.colors.success.main}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
            
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-around', 
                flexWrap: 'wrap',
                p: 2,
                borderRadius: theme.shape.borderRadiusSmall,
                bgcolor: theme.colors.background.subtle
              }}
            >
              <Box sx={{ textAlign: 'center', px: 2, py: 1, minWidth: 120 }}>
                <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>
                  Weekly Revenue
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: theme.typography.fontWeightBold, color: theme.colors.primary.main }}>
                  ${stats.weeklyRevenue.toLocaleString()}
                </Typography>
              </Box>
              
              <Divider orientation="vertical" flexItem />
              
              <Box sx={{ textAlign: 'center', px: 2, py: 1, minWidth: 120 }}>
                <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>
                  Monthly Revenue
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: theme.typography.fontWeightBold, color: theme.colors.primary.main }}>
                  ${stats.monthlyRevenue.toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowUpIcon sx={{ color: theme.colors.success.main, fontSize: 16 }} />
                  <Typography variant="caption" sx={{ color: theme.colors.success.main }}>
                    +{((stats.monthlyRevenue - stats.previousMonthRevenue) / stats.previousMonthRevenue * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
              
              <Divider orientation="vertical" flexItem />
              
              <Box sx={{ textAlign: 'center', px: 2, py: 1, minWidth: 120 }}>
                <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>
                  Avg Transaction
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: theme.typography.fontWeightBold, color: theme.colors.primary.main }}>
                  ${stats.avgTransactionValue}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Sales Channels & Categories - Enhanced with better visualization */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Paper 
                elevation={2}
                sx={{ 
                  p: 3,
                  height: '100%',
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: theme.shadows[1],
                  transition: 'transform 0.2s',
                  border: theme.components.card.border,
                  backgroundColor: theme.colors.background.card,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[3]
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: `${theme.colors.info.light}20`, 
                      color: theme.colors.info.dark,
                      mr: 2
                    }}
                  >
                    <StorefrontIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: theme.typography.fontWeightBold }}>
                    Sales Channels
                  </Typography>
                </Box>
                
                <Box sx={{ height: 220, display: 'flex', justifyContent: 'center', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'In-store', value: stats.inStoreSalesPercent },
                          { name: 'Online', value: stats.onlineSalesPercent }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill={theme.colors.success.main} />
                        <Cell fill={theme.colors.info.main} />
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, undefined]}
                        contentStyle={{ 
                          backgroundColor: theme.colors.background.paper,
                          border: theme.components.card.border,
                          borderRadius: theme.shape.borderRadius,
                          boxShadow: theme.shadows[2]
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: '50%', 
                      left: '50%', 
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: theme.typography.fontWeightBold, color: theme.colors.text.primary }}>
                      {stats.inStoreSalesPercent + stats.onlineSalesPercent}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.colors.text.secondary }}>
                      Total
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: theme.colors.success.main,
                        mr: 1
                      }} 
                    />
                    <Typography variant="body2">
                      In-store ({stats.inStoreSalesPercent}%)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: theme.colors.info.main,
                        mr: 1
                      }} 
                    />
                    <Typography variant="body2">
                      Online ({stats.onlineSalesPercent}%)
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Paper 
                elevation={2}
                sx={{ 
                  p: 3,
                  height: '100%',
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: theme.shadows[1],
                  border: theme.components.card.border,
                  backgroundColor: theme.colors.background.card,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[3]
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: `${theme.colors.secondary.light}20`, 
                      color: theme.colors.secondary.dark,
                      mr: 2
                    }}
                  >
                    <PieChartIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: theme.typography.fontWeightBold }}>
                    Sales by Category
                  </Typography>
                </Box>
                
                <Box sx={{ height: 220, display: 'flex', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {salesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, undefined]}
                        contentStyle={{ 
                          backgroundColor: theme.colors.background.paper,
                          border: theme.components.card.border,
                          borderRadius: theme.shape.borderRadius,
                          boxShadow: theme.shadows[2]
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mt: 1 }}>
                  {salesByCategory.map((category, index) => (
                    <Chip 
                      key={category.name}
                      label={`${category.name}: ${category.value}%`}
                      size="small"
                      sx={{ 
                        bgcolor: `${COLORS[index % COLORS.length]}15`,
                        color: COLORS[index % COLORS.length],
                        fontWeight: 'medium',
                        border: `1px solid ${COLORS[index % COLORS.length]}30`,
                        borderRadius: theme.shape.borderRadiusSmall
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Top Products - Enhanced with better visualization */}
          <Paper 
            elevation={2}
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[1],
              border: theme.components.card.border,
              backgroundColor: theme.colors.background.card
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar 
                sx={{ 
                  bgcolor: `${theme.colors.success.light}20`, 
                  color: theme.colors.success.dark,
                  mr: 2
                }}
              >
                <ShoppingCartIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: theme.typography.fontWeightBold, flexGrow: 1 }}>
                Top Selling Products
              </Typography>
              <Button 
                variant="outlined"
                color="primary"
                size="small"
                endIcon={<ArrowUpIcon />}
                onClick={() => navigate('/inventory/products')}
              >
                View All
              </Button>
            </Box>
            
            <TableContainer sx={{ mb: 1 }}>
              <Table size="small" sx={{ '& .MuiTableCell-root': { py: 1.5 } }}>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 'bold', bgcolor: theme.colors.background.default } }}>
                    <TableCell>Product Name</TableCell>
                    <TableCell align="right">Units Sold</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topProducts.map((product) => (
                    <TableRow 
                      key={product.id}
                      hover
                      sx={{ 
                        '&:hover': { bgcolor: `${theme.colors.primary.main}08` },
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onClick={() => navigate(`/inventory/products/${product.id}`)}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            variant="rounded" 
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              mr: 1.5,
                              bgcolor: `${theme.colors.primary.main}15`,
                              color: theme.colors.primary.main
                            }}
                          >
                            {product.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {product.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={product.sales}
                          size="small"
                          sx={{ 
                            fontWeight: 'bold', 
                            bgcolor: `${theme.colors.success.main}15`,
                            color: theme.colors.success.dark,
                            border: `1px solid ${theme.colors.success.main}30`
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.colors.primary.main }}>
                          ${product.revenue.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          size="small" 
                          color="primary"
                          sx={{ 
                            bgcolor: `${theme.colors.primary.main}10`,
                            '&:hover': { bgcolor: `${theme.colors.primary.main}20` }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/inventory/products/${product.id}`);
                          }}
                        >
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Pagination count={3} size="small" />
            </Box>
          </Paper>

          {/* Staff Performance - Enhanced with better visualization */}
          <Paper 
            elevation={2}
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[1],
              border: theme.components.card.border,
              backgroundColor: theme.colors.background.card
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar 
                sx={{ 
                  bgcolor: `${theme.colors.info.light}20`, 
                  color: theme.colors.info.dark,
                  mr: 2
                }}
              >
                <PeopleIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: theme.typography.fontWeightBold, flexGrow: 1 }}>
                Staff Performance
              </Typography>
              <Button 
                variant="outlined" 
                color="primary"
                size="small"
                endIcon={<ArrowUpIcon />}
                onClick={() => navigate('/staff/management')}
              >
                View All Staff
              </Button>
            </Box>
            
            <TableContainer>
              <Table size="small" sx={{ '& .MuiTableCell-root': { py: 1.5 } }}>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 'bold', bgcolor: theme.colors.background.default } }}>
                    <TableCell>Staff Member</TableCell>
                    <TableCell align="right">Sales ($)</TableCell>
                    <TableCell align="right">Target</TableCell>
                    <TableCell align="right">Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {staffPerformance.map((staff) => (
                    <TableRow 
                      key={staff.name}
                      hover
                      sx={{ 
                        '&:hover': { bgcolor: `${theme.colors.primary.main}08` },
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onClick={() => navigate(`/staff/profile/${staff.name.toLowerCase().replace(' ', '-')}`)}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 32, height: 32, mr: 1.5 }}>
                            {staff.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {staff.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.colors.primary.main }}>
                          ${staff.sales.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">
                          ${staff.target.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Box sx={{ width: 100, mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(staff.percent, 100)}
                              color={staff.percent >= 100 ? "success" : staff.percent >= 85 ? "primary" : "warning"}
                              sx={{ 
                                height: 8, 
                                borderRadius: 5,
                                bgcolor: theme.colors.background.default
                              }}
                            />
                          </Box>
                          <Chip
                            label={`${staff.percent}%`}
                            size="small"
                            color={staff.percent >= 100 ? "success" : staff.percent >= 85 ? "primary" : "warning"}
                            sx={{ fontWeight: 'bold' }}
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Right column */}
        <Grid item xs={12} md={4}>
          {/* Quick Actions */}
          <Paper 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[1]
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button 
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<ShoppingCartIcon />}
                  sx={{ py: 1 }}
                  onClick={() => navigate('/owner/inventory/purchase-orders/new')}
                >
                  Create PO
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button 
                  fullWidth
                  variant="contained"
                  color="info"
                  startIcon={<PeopleIcon />}
                  sx={{ py: 1 }}
                  onClick={() => navigate('/staff/scheduling')}
                >
                  Staff Schedule
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button 
                  fullWidth
                  variant="contained"
                  color="success"
                  startIcon={<BarChartIcon />}
                  sx={{ py: 1 }}
                  onClick={() => navigate('/reports')}
                >
                  View Reports
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button 
                  fullWidth
                  variant="contained"
                  color="warning"
                  startIcon={<InventoryIcon />}
                  sx={{ py: 1 }}
                  onClick={() => navigate('/inventory/low-stock')}
                >
                  Low Stock
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Upcoming Events */}
          <Paper 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[1]
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Calendar
            </Typography>
            <List dense>
              {upcomingEvents.map((event) => (
                <ListItem 
                  key={event.id}
                  disablePadding
                  secondaryAction={
                    <IconButton edge="end" size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  }
                  sx={{ mb: 1 }}
                >
                  <ListItemButton>
                    <ListItemIcon>
                      {event.type === 'delivery' ? <LocalShippingIcon color="primary" /> : 
                       event.type === 'training' ? <SchoolIcon color="info" /> : 
                       event.type === 'promotion' ? <CampaignIcon color="warning" /> : 
                       <InventoryIcon color="secondary" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary={event.title} 
                      secondary={new Date(event.date).toLocaleDateString()} 
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Button 
              fullWidth 
              variant="outlined" 
              size="small" 
              sx={{ mt: 1 }}
              onClick={() => navigate('/calendar')}
            >
              View Full Calendar
            </Button>
          </Paper>

          {/* Critical Inventory */}
          <Paper 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[1]
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Critical Inventory
            </Typography>
            <List dense>
              {lowStockItems.map((item) => (
                <ListItem 
                  key={item.id}
                  disablePadding
                  secondaryAction={
                    <Button 
                      size="small" 
                      variant="contained" 
                      color="primary"
                      onClick={() => handleRestockClick(item)}
                    >
                      Reorder
                    </Button>
                  }
                  sx={{ mb: 1 }}
                >
                  <ListItemButton>
                    <ListItemIcon>
                      <Badge badgeContent={item.quantity} color="error">
                        <InventoryIcon color="warning" />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.name} 
                      secondary={`SKU: ${item.sku}`} 
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Button 
              fullWidth 
              variant="outlined" 
              color="warning" 
              size="small" 
              sx={{ mt: 1 }}
              onClick={() => navigate('/inventory/low-stock')}
            >
              View All Low Stock
            </Button>
          </Paper>

          {/* Customer Feedback */}
          <Paper 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[1]
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Recent Feedback
            </Typography>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <Rating value={stats.customerSatisfaction} precision={0.1} readOnly />
              <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                {stats.customerSatisfaction}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                Overall
              </Typography>
            </Box>
            {customerFeedback.map((feedback) => (
              <Box 
                key={feedback.id} 
                sx={{ 
                  mb: 2, 
                  p: 1.5, 
                  borderRadius: 1, 
                  bgcolor: 'background.default',
                  '&:last-child': { mb: 0 }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="subtitle2">{feedback.customer}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(feedback.date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Rating value={feedback.rating} size="small" readOnly />
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {feedback.comment}
                </Typography>
              </Box>
            ))}
            <Button 
              fullWidth 
              variant="outlined" 
              size="small" 
              sx={{ mt: 1 }}
              onClick={() => navigate('/customer/feedback')}
            >
              View All Feedback
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

// Tab content components
const ManagerOverviewTab = ({ dashboardData, navigate, handleTaskView, handleCompleteTask, handleRestockClick, theme }) => {
  return (
    <Box className="tab-content">
      
      <ManagerDashboardOverview 
        dashboardData={dashboardData} 
        navigate={navigate}
        handleTaskView={handleTaskView}
        handleCompleteTask={handleCompleteTask}
        handleRestockClick={handleRestockClick}
        theme={theme}
      />
    </Box>
  );
};

// Regular staff overview tab
const StaffOverviewTab = ({ dashboardData, navigate, handleTaskView, handleCompleteTask, handleRestockClick, theme }) => {
  return (
    <Box className="tab-content">
      <Typography variant="h5" className="section-title">
        Staff Dashboard
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard 
            title="Active Orders"
            value={dashboardData?.summary?.activeOrders}
            subtitle="Orders to process"
            borderColor="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard 
            title="Daily Sales"
            value={dashboardData?.summary?.dailySales}
            subtitle="Today's revenue"
            borderColor="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard 
            title="Pending Tasks"
            value={dashboardData?.recentTasks?.filter(t => t.status !== 'completed').length}
            subtitle="Need attention"
            borderColor="danger"
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <DashboardCard 
              title="My Tasks" 
              icon={<TaskIcon />}
              color={theme.colors.success.main}
              theme={theme}
              action={
                <Button 
                  variant="contained" 
                  size="small" 
                  color="primary"
                  onClick={() => navigate('/staff/tasks')}
                >
                  View All
                </Button>
              }
            >
              <Box className="card-scrollable-content" sx={{ maxHeight: 400, overflow: 'auto' }}>
                {dashboardData?.recentTasks?.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onViewTask={handleTaskView}
                    onCompleteTask={handleCompleteTask}
                  />
                ))}
              </Box>
            </DashboardCard>
          </Grid>
              
          <Grid item xs={12} md={5}>
            <DashboardCard 
              title="Low Stock Items" 
              icon={<InventoryIcon />}
              color={theme.colors.warning.main}
              theme={theme}
            >
              <Box className="card-scrollable-content" sx={{ maxHeight: 400, overflow: 'auto' }}>
                {dashboardData?.lowStockItems?.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    onRestock={handleRestockClick}
                  />
                ))}
              </Box>
            </DashboardCard>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

// Sales tab
const SalesTab = ({ dashboardData, navigate, theme }) => {
  return (
    <Box className="tab-content">
      <Typography variant="h5" className="section-title">
        Sales Management
      </Typography>
      {/* Sales content */}
    </Box>
  );
};

// Inventory tab
const InventoryTab = ({ dashboardData, navigate, theme }) => {
  return (
    <Box className="tab-content">
      <Typography variant="h5" className="section-title">
        Inventory Management
      </Typography>
      {/* Inventory content */}
    </Box>
  );
};

// Tasks tab
const TasksTab = ({ dashboardData, navigate, handleTaskView, handleCompleteTask, theme }) => {
  return (
    <Box className="tab-content">
      <Typography variant="h5" className="section-title">
        Task Management
      </Typography>
      {/* Tasks content */}
    </Box>
  );
};

// Settings tab for managers only
const SettingsTab = ({ dashboardData, navigate, theme }) => {
  return (
    <Box className="tab-content">
      <Typography variant="h5" className="section-title">
        Manager Settings
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        This section provides access to manager-specific settings and controls.
      </Alert>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.colors.primary.main, mr: 2 }}>
                  <PeopleIcon />
                </Avatar>
                <Typography variant="h6">Staff Management</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Manage staff accounts, permissions, and schedules. Add new staff members or update existing ones.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                onClick={() => navigate('/staff/management')}
              >
                Manage Staff
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.colors.error.main, mr: 2 }}>
                  <InventoryIcon />
                </Avatar>
                <Typography variant="h6">Inventory Control</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Manage purchase orders, check low stock items, and control inventory movements.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                sx={{ mb: 1 }}
                onClick={() => navigate('/owner/inventory/purchase-orders')}
              >
                Purchase Orders
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                fullWidth
                onClick={() => navigate('/owner/inventory/low-stock')}
              >
                Low Stock Items
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.colors.warning.main, mr: 2 }}>
                  <SwapHorizIcon />
                </Avatar>
                <Typography variant="h6">Returns Management</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Process customer returns, manage refunds, and handle return inventory.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                onClick={() => navigate('/owner/returns')}
              >
                Manage Returns
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.colors.success.main, mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Typography variant="h6">Marketing Tools</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Access marketing campaigns, loyalty programs, and promotions management.
              </Typography>
              <Button 
                variant="contained"
                color="primary" 
                fullWidth
                sx={{ mb: 1 }}
                onClick={() => navigate('/marketing/dashboard')}
              >
                Marketing Dashboard
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                fullWidth
                onClick={() => navigate('/marketing/promotions')}
              >
                Promotions
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.colors.info.main, mr: 2 }}>
                  <StoreIcon />
                </Avatar>
                <Typography variant="h6">Supplier Management</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add new suppliers or edit existing supplier information.
              </Typography>
              <Button 
                variant="contained"
                color="primary" 
                fullWidth
                sx={{ mb: 1 }}
                onClick={() => navigate('/suppliers')}
              >
                View Suppliers
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                fullWidth
                onClick={() => navigate('/suppliers/add')}
              >
                Add Supplier
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Marketing tab
const MarketingTab = ({ dashboardData, navigate, theme }) => {
  // Add debugging logs to track component lifecycle
  console.log("MarketingTab: Component rendered");
  
  useEffect(() => {
    console.log("MarketingTab: Component mounted");
    return () => {
      console.log("MarketingTab: Component unmounted");
    };
  }, []);

  // Sample marketing data for demonstration
  const campaigns = [
    { id: 1, name: 'Summer Sale', status: 'active', startDate: '2023-07-01', endDate: '2023-07-15', budget: 2500, reach: 12500, conversions: 420 },
    { id: 2, name: 'New Product Launch', status: 'scheduled', startDate: '2023-07-25', endDate: '2023-08-10', budget: 3500, reach: 0, conversions: 0 },
    { id: 3, name: 'Clearance Event', status: 'planning', startDate: '2023-08-15', endDate: '2023-08-30', budget: 1800, reach: 0, conversions: 0 },
    { id: 4, name: 'Loyalty Program', status: 'active', startDate: '2023-01-01', endDate: '2023-12-31', budget: 5000, reach: 8700, conversions: 685 }
  ];

  const promotions = [
    { id: 1, name: 'Buy One Get One Free', discountType: 'BOGO', productCategory: 'Power Tools', redemptions: 87, status: 'active' },
    { id: 2, name: 'Summer Discount 25%', discountType: 'percentage', productCategory: 'All Products', redemptions: 145, status: 'active' },
    { id: 3, name: 'Free Shipping', discountType: 'shipping', productCategory: 'All Products', redemptions: 210, status: 'active' }
  ];

  const emailStats = {
    totalSubscribers: 3750,
    openRate: 24.5,
    clickRate: 3.8,
    conversionRate: 1.2,
    unsubscribeRate: 0.3
  };

  const socialStats = {
    followers: 5280,
    engagement: 3.4,
    reach: 12500,
    interactions: 950,
    shares: 285
  };

  return (
    <Box className="tab-content">
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
        <CampaignIcon sx={{ mr: 1 }} /> Marketing Dashboard
      </Typography>

      {/* Quick Stats - Modified for horizontal alignment */}
      <Box sx={{ mb: 4, overflow: 'auto', pb: 2 }}>
        <Grid container spacing={3} sx={{ flexWrap: 'nowrap', minWidth: 'max-content' }}>
          <Grid item sx={{ minWidth: 280 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2.5, 
                borderRadius: '8px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: theme.components.card.border,
                backgroundColor: theme.colors.background.card
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>
                    Active Campaigns
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {campaigns.filter(c => c.status === 'active').length}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    bgcolor: `${theme.colors.primary.light}20`, 
                    color: theme.colors.primary.dark,
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px'
                  }}
                >
                  <CampaignIcon />
                </Box>
              </Box>
              
              <Button 
                variant="outlined" 
                color="primary" 
                size="small" 
                onClick={() => navigate('/marketing/campaigns')}
              >
                View Campaigns
              </Button>
            </Paper>
          </Grid>

          <Grid item sx={{ minWidth: 280 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2.5, 
                borderRadius: '8px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: theme.components.card.border,
                backgroundColor: theme.colors.background.card
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>
                    Active Promotions
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {promotions.filter(p => p.status === 'active').length}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    bgcolor: `${theme.colors.success.light}20`, 
                    color: theme.colors.success.dark,
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px'
                  }}
                >
                  <LocalOfferIcon />
                </Box>
              </Box>
              
              <Button 
                variant="outlined" 
                color="success" 
                size="small" 
                onClick={() => navigate('/marketing/promotions')}
              >
                View Promotions
              </Button>
            </Paper>
          </Grid>

          <Grid item sx={{ minWidth: 280 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2.5, 
                borderRadius: '8px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: theme.components.card.border,
                backgroundColor: theme.colors.background.card
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>
                    Email Subscribers
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {emailStats.totalSubscribers.toLocaleString()}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    bgcolor: `${theme.colors.info.light}20`, 
                    color: theme.colors.info.dark,
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px'
                  }}
                >
                  <EmailIcon />
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Open Rate:
                </Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ ml: 0.5 }}>
                  {emailStats.openRate}%
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item sx={{ minWidth: 280 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2.5, 
                borderRadius: '8px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: theme.components.card.border,
                backgroundColor: theme.colors.background.card
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>
                    Social Followers
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {socialStats.followers.toLocaleString()}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    bgcolor: `${theme.colors.secondary.light}20`, 
                    color: theme.colors.secondary.dark,
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px'
                  }}
                >
                  <ShareIcon />
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Engagement:
                </Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ ml: 0.5 }}>
                  {socialStats.engagement}%
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Active Campaigns */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: theme.shape.borderRadius, boxShadow: theme.shadows[1] }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">Active Campaigns</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/marketing/campaigns/new')}
          >
            New Campaign
          </Button>
        </Box>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                <TableCell>Campaign Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date Range</TableCell>
                <TableCell>Budget</TableCell>
                <TableCell align="right">Reach</TableCell>
                <TableCell align="right">Conv.</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id} hover>
                  <TableCell>{campaign.name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={campaign.status} 
                      color={
                        campaign.status === 'active' ? 'success' :
                        campaign.status === 'scheduled' ? 'primary' : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>${campaign.budget.toLocaleString()}</TableCell>
                  <TableCell align="right">{campaign.reach.toLocaleString()}</TableCell>
                  <TableCell align="right">{campaign.conversions}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => navigate(`/marketing/campaigns/${campaign.id}`)}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Active Promotions */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: theme.shape.borderRadius, boxShadow: theme.shadows[1] }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">Active Promotions</Typography>
          <Button 
            variant="contained" 
            color="success" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/marketing/promotions/new')}
          >
            New Promotion
          </Button>
        </Box>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                <TableCell>Promotion Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Redemptions</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {promotions.map((promo) => (
                <TableRow key={promo.id} hover>
                  <TableCell>{promo.name}</TableCell>
                  <TableCell>{promo.discountType}</TableCell>
                  <TableCell>{promo.productCategory}</TableCell>
                  <TableCell align="right">{promo.redemptions}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => navigate(`/marketing/promotions/${promo.id}`)}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

const StaffDashboard = () => {
  const muiTheme = useMuiTheme(); // MUI theme
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState(0);
  const [restockDialogOpen, setRestockDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  
  // Create a merged theme object that works with both our custom theme and MUI theme
  const mergedTheme = useMemo(() => {
    return {
      ...muiTheme,
      ...customTheme,
      // Ensure palette and colors properties exist
      palette: muiTheme?.palette || {},
      colors: customTheme?.colors || {}
    };
  }, [muiTheme]);
  
  // Check if the current user is a manager
  const isManager = currentUser && (currentUser.role === 'manager' || currentUser.role === 'admin');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleRestockClick = (product) => {
    setSelectedProduct(product);
    setRestockQuantity(product.reorderThreshold - product.quantity);
    setRestockDialogOpen(true);
  };

  const handleRestockClose = () => {
    setRestockDialogOpen(false);
  };

  const handleRestockSubmit = () => {
    // Mock restock logic
    const updatedDashboardData = { ...dashboardData };
    const productIndex = updatedDashboardData.lowStockItems.findIndex(
      item => item.id === selectedProduct.id
    );
    
    if (productIndex !== -1) {
      updatedDashboardData.lowStockItems[productIndex].quantity += restockQuantity;
    }
    
    // Update state
    setDashboardData(updatedDashboardData);
    handleRestockClose();
    
    // Show fake confirmation
    setError({
      severity: 'success',
      message: `Successfully restocked ${selectedProduct.name}`
    });
    
    // Clear confirmation after 3 seconds
    setTimeout(() => {
      setError(null);
    }, 3000);
  };
  
  const handleTaskView = (task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  const handleTaskClose = () => {
    setTaskDialogOpen(false);
  };

  const handleCompleteTask = (task) => {
    // Mock completion logic
    const updatedDashboardData = { ...dashboardData };
    const taskIndex = updatedDashboardData.recentTasks.findIndex(
      item => item.id === task.id
    );
    
    if (taskIndex !== -1) {
      updatedDashboardData.recentTasks[taskIndex].status = 'completed';
      updatedDashboardData.summary.pendingTasks--;
    }
    
    // Update state
    setDashboardData(updatedDashboardData);
    
    // Show fake confirmation
    setError({
      severity: 'success',
      message: `Task "${task.name}" marked as complete`
    });
    
    // Clear confirmation after 3 seconds
    setTimeout(() => {
      setError(null);
    }, 3000);
  };

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStaffDashboardData();
      setDashboardData(data || mockDashboardData);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setDashboardData(mockDashboardData);
      setError({
        severity: 'warning',
        message: 'Could not fetch live data. Showing sample data instead.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Determine which content to show based on the current route
  const renderContent = () => {
    // Get the path after /staff/
    const path = location.pathname.split('/').slice(2).join('/');
    
    console.log("StaffDashboard renderContent: Current path", path);

    switch(path) {
      case 'tasks':
        console.log("StaffDashboard renderContent: Rendering TasksTab");
        return (
          <TasksTab 
            dashboardData={dashboardData} 
            navigate={navigate}
            handleTaskView={handleTaskView}
            handleCompleteTask={handleCompleteTask}
            theme={mergedTheme}
          />
        );
      case 'settings':
        console.log("StaffDashboard renderContent: Rendering SettingsTab");
        return isManager ? <SettingsTab dashboardData={dashboardData} navigate={navigate} theme={mergedTheme} /> : null;
      case 'marketing':
        console.log("StaffDashboard renderContent: Rendering MarketingDashboard");
        return <MarketingDashboard />;
      case 'dashboard':
      default:
        console.log("StaffDashboard renderContent: Rendering OverviewTab");
        return isManager ? 
          <ManagerOverviewTab 
            dashboardData={dashboardData} 
            navigate={navigate}
            handleTaskView={handleTaskView}
            handleCompleteTask={handleCompleteTask}
            handleRestockClick={handleRestockClick}
            theme={mergedTheme}
          /> : 
          <StaffOverviewTab 
            dashboardData={dashboardData}
            navigate={navigate}
            handleTaskView={handleTaskView}
            handleCompleteTask={handleCompleteTask}
            handleRestockClick={handleRestockClick}
            theme={mergedTheme}
          />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {error && (
        <Alert severity={error.severity || 'error'} sx={{ mb: 2, mx: 2 }}>
          {error.message}
        </Alert>
      )}
      
      {/* Display the appropriate content based on the current route */}
      {renderContent()}

      {/* Notifications Menu - Keep the existing one */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        PaperProps={{
          sx: { width: 320, maxWidth: '100%' }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <Typography variant="subtitle1">Notifications</Typography>
        </Box>
        <MenuItem onClick={handleNotificationsClose}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Low Stock Alert
            </Typography>
            <Typography variant="body2" color="text.secondary">
              5 products are below reorder level
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotificationsClose}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Task Assigned
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You have been assigned a new task
            </Typography>
          </Box>
        </MenuItem>
        <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)', textAlign: 'center' }}>
          <Button size="small" onClick={handleNotificationsClose}>
            View All Notifications
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default StaffDashboard;