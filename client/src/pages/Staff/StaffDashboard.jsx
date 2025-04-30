// src/pages/StaffDashboard/StaffDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '@mui/material/styles';
import { 
  Box, 
  Typography,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
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
  Grid
} from '@mui/material';

// Material Icons
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Assignment as TaskIcon,
  ShoppingCart as OrderIcon,
  Warning as AlertIcon,
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
} from '@mui/icons-material';

// Charts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Services
import dashboardService from '../../services/dashboardService';

// Import CSS
import './StaffDashboard.css';

// Mock data when API fails
const mockDashboardData = {
  summary: {
    pendingTasks: 4,
    lowStockItems: 7,
    activeOrders: 12,
    totalProducts: 156,
    dailySales: 2350.75,
    mostSoldCategory: 'Power Tools'
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
const DashboardCard = ({ title, icon, children, action, color }) => {
  const theme = useTheme();
  
  return (
    <Paper className="dashboard-card">
      <div 
        className="card-header" 
        style={{ 
          backgroundColor: color || theme.palette.primary.light 
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
  const { name, quantity, reorderThreshold, sku, supplier } = product || {};
  const criticalStock = quantity <= reorderThreshold / 2;
  
  return (
    <Card className={`item-card product-card ${criticalStock ? 'critical' : ''}`}>
      <div 
        className="product-icon-container" 
        style={{ backgroundColor: criticalStock ? '#f44336' : '#ff9800' }}
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
  const { id, name, status, dueDate, description } = task || {};
  const isOverdue = new Date(dueDate) < new Date();
  
  return (
    <Card className={`item-card task-card ${isOverdue ? 'overdue' : ''} ${status?.toLowerCase() === 'completed' ? 'completed' : ''}`}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h6" component="div">
            {name}
          </Typography>
          <Chip 
            label={status} 
            size="small"
            color={
              status?.toLowerCase() === 'completed' ? 'success' :
              status?.toLowerCase() === 'in progress' ? 'primary' :
              status?.toLowerCase() === 'pending' ? 'warning' :
              'error'
            }
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          <CalendarIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
          Due: {new Date(dueDate).toLocaleDateString()}
          {isOverdue && (
            <Chip label="OVERDUE" size="small" color="error" sx={{ ml: 1 }} className="overdue-indicator" />
          )}
        </Typography>
        
        {description && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {description}
          </Typography>
        )}
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => onViewTask(task)}>View</Button>
        {status?.toLowerCase() !== 'completed' && (
          <Button size="small" color="success" onClick={() => onCompleteTask(task)}>
            Mark Complete
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

// StatCard component 
const StatCard = ({ title, value, subtitle, borderColor }) => {
  const theme = useTheme();
  
  const getCardClass = () => {
    if (borderColor === "#f44336") return "stat-card critical";
    if (borderColor === "#ff9800") return "stat-card warning";
    if (borderColor === "#4caf50") return "stat-card success";
    return "stat-card info";
  };
  
  return (
    <Card className={getCardClass()}>
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4">
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// The main StaffDashboard component
const StaffDashboard = () => {
  const theme = useTheme();
  const { currentUser } = useAuth() || { currentUser: null };
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    summary: {
      pendingTasks: 0,
      lowStockItems: 0,
      activeOrders: 0,
      totalProducts: 0,
      dailySales: 0,
      mostSoldCategory: '',
    },
    recentTasks: [],
    lowStockItems: [],
    salesData: [],
    categoryBreakdown: []
  });
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  // Header state
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialogs state
  const [restockDialog, setRestockDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [restockAmount, setRestockAmount] = useState(0);
  const [taskDialog, setTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Tab handling
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Notification handling
  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  // User menu handling
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  // Restock dialog handling
  const handleRestockClick = (product) => {
    setSelectedProduct(product);
    setRestockAmount((product.reorderThreshold || 10) - (product.quantity || 0) + 5);
    setRestockDialog(true);
  };

  const handleRestockClose = () => {
    setRestockDialog(false);
  };

  const handleRestockSubmit = () => {
    // Implementation for restock functionality
    console.log(`Restocking ${selectedProduct?.name || 'product'} with ${restockAmount} units`);
    
    // For demo purposes, update the UI
    if (selectedProduct && dashboardData.lowStockItems) {
      const updatedItems = dashboardData.lowStockItems.map(item => {
        if (item.id === selectedProduct.id) {
          return { ...item, quantity: item.quantity + parseInt(restockAmount) };
        }
        return item;
      });
      
      setDashboardData({
        ...dashboardData,
        lowStockItems: updatedItems.filter(item => item.quantity <= item.reorderThreshold),
        summary: {
          ...dashboardData.summary,
          lowStockItems: updatedItems.filter(item => item.quantity <= item.reorderThreshold).length
        }
      });
    }
    
    setRestockDialog(false);
  };

  // Task dialog handling
  const handleTaskView = (task) => {
    setSelectedTask(task);
    setTaskDialog(true);
  };

  const handleTaskClose = () => {
    setTaskDialog(false);
  };

  const handleCompleteTask = (task) => {
    // Implementation for completing a task
    console.log(`Completing task: ${task?.name || 'task'}`);
    
    // For demo purposes, update the UI
    if (task && dashboardData.recentTasks) {
      const updatedTasks = dashboardData.recentTasks.map(t => {
        if (t.id === task.id) {
          return { ...t, status: 'completed' };
        }
        return t;
      });
      
      setDashboardData({
        ...dashboardData,
        recentTasks: updatedTasks,
        summary: {
          ...dashboardData.summary,
          pendingTasks: updatedTasks.filter(t => t.status.toLowerCase() !== 'completed').length
        }
      });
    }
  };

  // Fetch dashboard data
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        
        try {
          // Try to fetch data from API
          const response = await dashboardService.getStaffDashboardData();
          setDashboardData(response || mockDashboardData);
        } catch (apiError) {
          // API call failed, fall back to mock data
          console.error('API Error:', apiError);
          setError('Failed to load data from server. Showing sample data instead.');
          setDashboardData(mockDashboardData);
        }
      } catch (err) {
        console.error('Error in dashboard data processing:', err);
        setError('An unexpected error occurred. Showing sample data.');
        setDashboardData(mockDashboardData);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser, navigate]);

  // Demo notifications
  const notifications = [
    { id: 1, message: 'Shipment of power drills arrived', time: '10 mins ago' },
    { id: 2, message: 'Critical stock alert: Pipe fittings', time: '1 hour ago' },
    { id: 3, message: 'New order #25467 requires attention', time: '2 hours ago' },
    { id: 4, message: 'Weekly sales report is ready', time: 'Yesterday' }
  ];

  // OverviewTab component
  const OverviewTab = ({ dashboardData }) => {
    const data = {
      salesData: dashboardData?.salesData || [],
      categoryBreakdown: dashboardData?.categoryBreakdown || [],
      summary: dashboardData?.summary || {}
    };
  
    return (
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: {
          xs: '1fr',
          md: '1fr 1fr'
        },
        gap: 3
      }}>
        <Box>
          <DashboardCard 
            title="Sales Trend" 
            icon={<TrendingUpIcon color="primary" />}
            color={theme.palette.primary.light}
          >
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.salesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="sales" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>
        </Box>
        
        <Box>
          <DashboardCard 
            title="Category Breakdown" 
            icon={<PieChart width={20} height={20} />}
            color={theme.palette.success.light}
          >
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Most sold category: <b>{data.summary.mostSoldCategory}</b>
              </Typography>
            </Box>
          </DashboardCard>
        </Box>
      </Box>
    );
  };

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return (
      <div className="loading-container">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Dashboard Header */}
      <header className="dashboard-header">
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <StoreIcon sx={{ color: theme.palette.primary.main, fontSize: 32, mr: 1 }} />
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            Hardware Store
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <div className="search-container">
            <SearchIcon sx={{ color: theme.palette.text.secondary }} />
            <input
              className="search-input"
              placeholder="Search products, orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <IconButton onClick={handleNotificationsOpen}>
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <Menu
            anchorEl={notificationsAnchor}
            open={Boolean(notificationsAnchor)}
            onClose={handleNotificationsClose}
          >
            <Box sx={{ p: 1, width: 300 }}>
              <Typography variant="h6">Notifications</Typography>
            </Box>
            <Divider />
            {notifications.map((notification) => (
              <MenuItem key={notification.id} onClick={handleNotificationsClose}>
                <Box sx={{ py: 0.5 }}>
                  <Typography variant="body1">{notification.message}</Typography>
                  <Typography variant="caption" color="text.secondary">{notification.time}</Typography>
                </Box>
              </MenuItem>
            ))}
            <Divider />
            <MenuItem onClick={handleNotificationsClose} sx={{ justifyContent: 'center' }}>
              <Typography variant="body2" color="primary">View All Notifications</Typography>
            </MenuItem>
          </Menu>
          
          <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={handleUserMenuOpen}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                JD
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
            >
              <MenuItem onClick={() => { navigate('/profile'); handleUserMenuClose(); }}>
                <PersonIcon sx={{ mr: 1 }} /> Profile
              </MenuItem>
              <MenuItem onClick={() => { navigate('/settings'); handleUserMenuClose(); }}>
                <BuildIcon sx={{ mr: 1 }} /> Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { navigate('/logout'); handleUserMenuClose(); }}>Logout</MenuItem>
            </Menu>
          </Box>
        </Box>
      </header>

      {/* Main Content */}
      <div className="content-container">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" className="dashboard-title">
            <DashboardIcon className="dashboard-title-icon" sx={{ color: theme.palette.primary.main }} />
            Hardware Store Dashboard
          </Typography>
          
          <Box>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              sx={{ mr: 1 }}
            >
              New Task
            </Button>
            
            <Button 
              variant="outlined"
              startIcon={<HelpIcon />}
            >
              Help
            </Button>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Stats cards */}
        <div className="stats-container">
          <StatCard 
            title="Low Stock Items" 
            value={dashboardData?.summary?.lowStockItems || 0}
            subtitle={
              <Box component="span" sx={{ 
                color: (dashboardData?.summary?.lowStockItems || 0) > 5 ? '#f44336' : '#ff9800',
                fontWeight: 'bold'
              }}>
                {(dashboardData?.summary?.lowStockItems || 0) > 5 ? 'Critical' : 'Attention needed'}
              </Box>
            }
            borderColor="#f44336"
          />
          
          <StatCard 
            title="Active Orders" 
            value={dashboardData?.summary?.activeOrders || 0}
            subtitle={
              <Box component="span" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                +5% from last week
              </Box>
            }
            borderColor="#2196f3"
          />
          
          <StatCard 
            title="Daily Sales" 
            value={`$${(dashboardData?.summary?.dailySales || 0).toLocaleString()}`}
            subtitle={
              <Box component="span" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                +12% from yesterday
              </Box>
            }
            borderColor="#4caf50"
          />
          
          <StatCard 
            title="Pending Tasks" 
            value={dashboardData?.summary?.pendingTasks || 0}
            subtitle={
              (dashboardData?.summary?.pendingTasks || 0) > 0 ? (
                <Box component="span" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                  {dashboardData.summary.pendingTasks} tasks need attention
                </Box>
              ) : (
                <Box component="span" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                  All tasks complete
                </Box>
              )
            }
            borderColor="#ff9800"
          />
        </div>
        
        {/* Dashboard tabs */}
        <div className="dashboard-tabs">
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab icon={<DashboardIcon />} label="OVERVIEW" />
            <Tab icon={<InventoryIcon />} label="INVENTORY" />
            <Tab icon={<TaskIcon />} label="TASKS" />
            <Tab icon={<TrendingUpIcon />} label="SALES" />
          </Tabs>
        </div>
        
        {/* Tab content */}
        <div className="tab-content">
          {tabValue === 0 && <OverviewTab dashboardData={dashboardData} />}
          
          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <DashboardCard 
                  title="Low Stock Items" 
                  icon={<AlertIcon color="warning" />}
                  color={theme.palette.warning.light}
                >
                  {dashboardData.lowStockItems.length > 0 ? (
                    dashboardData.lowStockItems.map((item) => (
                      <ProductCard 
                        key={item.id} 
                        product={item} 
                        onRestock={handleRestockClick}
                      />
                    ))
                  ) : (
                    <Typography>No low stock items found.</Typography>
                  )}
                </DashboardCard>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <DashboardCard 
                  title="Quick Actions" 
                  icon={<InventoryIcon color="primary" />}
                  color={theme.palette.info.light}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      startIcon={<AddIcon />}
                      className="gradient-blue"
                    >
                      Add New Product
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      fullWidth
                      startIcon={<InventoryIcon />}
                    >
                      Manage Inventory
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      fullWidth
                      startIcon={<OrderIcon />}
                    >
                      Manage Orders
                    </Button>
                  </Box>
                  
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Inventory Summary
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Typography variant="body2">Total Products:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {dashboardData.summary.totalProducts}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2">Low Stock Items:</Typography>
                      <Typography variant="body2" fontWeight="bold" color="error">
                        {dashboardData.summary.lowStockItems}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2">Categories:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {dashboardData.categoryBreakdown?.length || 0}
                      </Typography>
                    </Box>
                  </Box>
                </DashboardCard>
              </Grid>
            </Grid>
          )}
          
          {tabValue === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <DashboardCard 
                  title="Recent Tasks" 
                  icon={<TaskIcon color="primary" />}
                  color={theme.palette.info.light}
                >
                  {dashboardData.recentTasks?.length > 0 ? (
                    dashboardData.recentTasks.map((task) => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onViewTask={handleTaskView}
                        onCompleteTask={handleCompleteTask}
                      />
                    ))
                  ) : (
                    <Typography>No tasks found.</Typography>
                  )}
                </DashboardCard>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <DashboardCard 
                  title="Task Stats" 
                  icon={<AssignmentIcon color="primary" />}
                  color={theme.palette.secondary.light}
                >
                  {/* Task stats and charts would go here */}
                  <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body1">Task statistics chart would appear here</Typography>
                  </Box>
                </DashboardCard>
              </Grid>
            </Grid>
          )}
          
          {tabValue === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <DashboardCard 
                  title="Monthly Sales" 
                  icon={<TrendingUpIcon color="primary" />}
                  color={theme.palette.success.light}
                >
                  <div className="chart-container" style={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={dashboardData.salesData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip formatter={(value) => [`${value}`, 'Sales']} />
                        <Bar dataKey="sales" fill={theme.palette.success.main} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </DashboardCard>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <DashboardCard 
                    title="Top Categories" 
                    icon={<InventoryIcon color="primary" />}
                    color={theme.palette.primary.light}
                  >
                    {/* Categories chart here */}
                  </DashboardCard>
                  
                  <DashboardCard 
                    title="Sales Summary" 
                    icon={<OrderIcon color="primary" />}
                    color={theme.palette.warning.light}
                  >
                    {/* Sales summary here */}
                  </DashboardCard>
                </Box>
              </Grid>
            </Grid>
          )}
        </div>
        
        {/* Quick actions section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <BuildIcon sx={{ mr: 1 }} /> Quick Actions
          </Typography>
          
          <div className="actions-grid">
            <Button 
              variant="contained" 
              onClick={() => navigate('/inventory')}
              startIcon={<InventoryIcon />}
              fullWidth
              className="action-button gradient-blue"
            >
              Manage Inventory
            </Button>
            
            <Button 
              variant="contained"
              onClick={() => navigate('/orders')}
              startIcon={<OrderIcon />}
              fullWidth
              className="action-button gradient-orange"
            >
              View Orders
            </Button>
            
            <Button 
              variant="contained"
              onClick={() => navigate('/products')}
              startIcon={<BuildIcon />}
              fullWidth
              className="action-button gradient-green"
            >
              Manage Products
            </Button>
            
            <Button 
              variant="contained"
              onClick={() => navigate('/profile')}
              startIcon={<PersonIcon />}
              fullWidth
              className="action-button gradient-purple"
            >
              My Profile
            </Button>
          </div>
        </Box>
      </div>
      
      {/* Dialogs for restocking, task details, etc. would go here */}
    </div>
  );
};

export default StaffDashboard;