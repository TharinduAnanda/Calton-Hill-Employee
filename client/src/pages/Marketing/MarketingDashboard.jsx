import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardHeader,
  CircularProgress, Alert, Button, Divider, Tabs, Tab,
  List, ListItem, ListItemText, Skeleton, Paper, Chip,
  Avatar
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Loyalty as LoyaltyIcon, 
  Campaign as CampaignIcon,
  BarChart as AnalyticsIcon,
  Mail as EmailIcon,
  CardGiftcard as PromotionsIcon,
  TrendingUp as TrendingUpIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Refresh as RefreshIcon,
   
} from '@mui/icons-material';
import marketingService from '../../services/marketingService';
import './MarketingDashboard.css';

const MarketingDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isOwner = currentUser && currentUser.role === 'owner';
  const isManager = currentUser && currentUser.role === 'manager';
  
  // Helper function to determine initial tab based on URL path
  const getInitialTabFromPath = (path) => {
    console.log("MarketingDashboard: Determining initial tab from path:", path);
    
    // Don't navigate further if we're already on the marketing dashboard
    if (path.includes('/marketing/dashboard')) {
      console.log("MarketingDashboard: Already on marketing dashboard, staying here");
      return 0;
    }
    
    // Handle other paths
    if (path.includes('/marketing/loyalty')) return 1;
    if (path.includes('/marketing/email')) return 2;
    if (path.includes('/marketing/promotions')) return 3;
    if (path.includes('/marketing/campaigns')) return 4;
    if (path.includes('/marketing/analytics')) return 5;
    
    return 0; // Default to overview tab
  };
  
  const [dashboardData, setDashboardData] = useState({
    loyalty: {
      totalMembers: 0,
      activeRewards: 0,
      pointsIssued: 0,
      pointsRedeemed: 0
    },
    campaigns: {
      active: 0,
      scheduled: 0,
      completed: 0,
      totalSent: 0
    },
    recentActivity: [] // Ensure this is initialized as an empty array
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(getInitialTabFromPath(location.pathname));
  
  useEffect(() => {
    console.log("MarketingDashboard: Component mounted with activeTab:", activeTab);
    console.log("MarketingDashboard: Current URL path:", window.location.pathname);
    
    // Determine if we're in an owner or manager context
    const currentPath = window.location.pathname;
    const isOwnerContext = currentPath.includes('/owner/');
    const isManagerContext = !isOwnerContext;
    
    console.log(`MarketingDashboard: Running in ${isOwnerContext ? 'owner' : 'manager'} context`);
    
    fetchDashboardData();
    
    return () => {
      console.log("MarketingDashboard: Component unmounted");
    };
  }, []);
  
  // Monitor activeTab changes
  useEffect(() => {
    console.log("MarketingDashboard: activeTab changed to:", activeTab);
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await marketingService.getMarketingDashboard();
      
      // Ensure all expected properties exist in the data
      setDashboardData({
        loyalty: {
          totalMembers: data?.loyalty?.totalMembers || 0,
          activeRewards: data?.loyalty?.activeRewards || 0,
          pointsIssued: data?.loyalty?.pointsIssued || 0,
          pointsRedeemed: data?.loyalty?.pointsRedeemed || 0
        },
        campaigns: {
          active: data?.campaigns?.active || 0,
          scheduled: data?.campaigns?.scheduled || 0,
          completed: data?.campaigns?.completed || 0,
          totalSent: data?.campaigns?.totalSent || 0
        },
        recentActivity: Array.isArray(data?.recentActivity) ? data.recentActivity : []
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching marketing dashboard data:', err);
      
      // Set fallback data to ensure UI renders even if API fails
      setDashboardData({
        loyalty: {
          totalMembers: 120,
          activeRewards: 5,
          pointsIssued: 2450,
          pointsRedeemed: 1280
        },
        campaigns: {
          active: 2,
          scheduled: 3,
          completed: 8,
          totalSent: 12500
        },
        recentActivity: [
          { 
            id: 1, 
            action: "New loyalty member signup", 
            date: new Date().toISOString(), 
            type: "loyalty" 
          },
          {
            id: 2,
            action: "Monthly newsletter sent",
            date: new Date(Date.now() - 86400000).toISOString(),
            type: "email"
          },
          {
            id: 3,
            action: "Summer promotion activated",
            date: new Date(Date.now() - 172800000).toISOString(),
            type: "promotion"
          }
        ]
      });
      
      setError('Using sample data. Failed to load live marketing data. Please check your network connection or server status.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    console.log("MarketingDashboard: Tab change requested from", activeTab, "to", newValue);
    
    // Always update the active tab state
    setActiveTab(newValue);
    
    // Determine if we're in an owner or manager context
    const currentPath = window.location.pathname;
    const isOwnerContext = currentPath.includes('/owner/');
    
    // Prevent navigation if already on this page
    const newPath = getPathFromTabIndex(newValue, isOwnerContext);
    if (currentPath === newPath) {
      console.log(`MarketingDashboard: Already on ${newPath}. Preventing unnecessary navigation.`);
      return;
    }
    
    // Navigate based on tab selection and context
    navigate(newPath);
  };

  // Helper function to get path from tab index
  const getPathFromTabIndex = (tabIndex, isOwnerContext) => {
    const basePrefix = isOwnerContext ? '/owner/marketing' : '/marketing';
    
    switch(tabIndex) {
      case 0: return `${basePrefix}/dashboard`;
      case 1: return `${basePrefix}/loyalty`;
      case 2: return `${basePrefix}/email`;
      case 3: return `${basePrefix}/promotions`;
      case 4: return `${basePrefix}/campaigns`;
      case 5: return `${basePrefix}/analytics`;
      default: return `${basePrefix}/dashboard`;
    }
  };

  // Stat card component with styling from CSS
  const StatCard = ({ title, value, icon, colorClass, changeValue, changeText, changeDirection }) => (
    <div className={`stat-card ${colorClass}`}>
      <div className="card-content">
        <h4>{title}</h4>
        <div className="stat-value">{value}</div>
        {changeValue && (
          <div className={`metric-change ${changeDirection === 'up' ? 'positive' : 'negative'}`}>
            {changeDirection === 'up' ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />}
            <span>{changeText}</span>
          </div>
        )}
      </div>
      <Avatar className="MuiAvatar-root">{icon}</Avatar>
    </div>
  );

  const renderDashboardOverview = () => {
    // Add default values if loyalty or campaigns are undefined
    const loyalty = dashboardData.loyalty || {
      totalMembers: 0,
      activeRewards: 0,
      pointsIssued: 0,
      pointsRedeemed: 0
    };
    
    const campaigns = dashboardData.campaigns || {
      active: 0,
      scheduled: 0,
      completed: 0,
      totalSent: 0
    };
    
    return (
      <Box sx={{ mt: 3 }} className="dashboard-overview">
        {/* Key Stats Row */}
        <div className="stats-container">
          <StatCard 
            title="Total Members" 
            value={loading ? <Skeleton variant="text" height={40} /> : loyalty.totalMembers || 0} 
            icon={<LoyaltyIcon />}
            colorClass="loyalty-stats"
            changeValue={!loading}
            changeText="+12% vs last month"
            changeDirection="up"
          />
          
          <StatCard 
            title="Active Campaigns" 
            value={loading ? <Skeleton variant="text" height={40} /> : campaigns.active || 0} 
            icon={<CampaignIcon />}
            colorClass="campaign-stats"
            changeValue={!loading}
            changeText="+3 since last week"
            changeDirection="up"
          />
          
          <StatCard 
            title="Points Issued" 
            value={loading ? <Skeleton variant="text" height={40} /> : (loyalty.pointsIssued || 0).toLocaleString()} 
            icon={<TrendingUpIcon />}
            colorClass="points-stats"
            changeValue={!loading}
            changeText="+8.5% conversion rate"
            changeDirection="up"
          />
          
          <StatCard 
            title="Messages Sent" 
            value={loading ? <Skeleton variant="text" height={40} /> : (campaigns.totalSent || 0).toLocaleString()} 
            icon={<EmailIcon />}
            colorClass="email-stats"
            changeValue={!loading}
            changeText="28% open rate"
            changeDirection="up"
          />
        </div>

        <Grid container spacing={3} className="detail-cards">
          {/* Loyalty Program */}
          <Grid item xs={12} md={6}>
            <Card className="analytics-card">
              <CardHeader 
                title={
                  <div className="card-title">
                    <LoyaltyIcon />
                    <span>Loyalty Program</span>
                  </div>
                }
                action={
                  <Button 
                    variant="outlined" 
                    size="small"
                    className="action-button"
                    onClick={() => navigate('/marketing/loyalty')}
                  >
                    Manage
                  </Button>
                }
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper className="stat-summary">
                      {loading ? (
                        <Skeleton variant="text" height={40} width="80%" sx={{ mx: 'auto' }} />
                      ) : (
                        <Typography variant="h5" sx={{ fontWeight: 500 }}>
                          {loyalty.activeRewards}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        Active Rewards
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper className="stat-summary">
                      {loading ? (
                        <Skeleton variant="text" height={40} width="80%" sx={{ mx: 'auto' }} />
                      ) : (
                        <Typography variant="h5" sx={{ fontWeight: 500 }}>
                          {(loyalty.pointsRedeemed || 0).toLocaleString()}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        Points Redeemed
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
                
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>Program Value</Typography>
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-inner" 
                      style={{ 
                        width: `${loading ? 0 : Math.min(Math.round(((loyalty.pointsRedeemed || 0) / (loyalty.pointsIssued || 1)) * 100) || 0, 100)}%`,
                        background: 'var(--primary-gradient)'
                      }} 
                    />
                  </div>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      Points Redeemed
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {loading ? '-' : `${Math.round(((loyalty.pointsRedeemed || 0) / (loyalty.pointsIssued || 1)) * 100) || 0}%`}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Campaigns */}
          <Grid item xs={12} md={6}>
            <Card className="analytics-card">
              <CardHeader 
                title={
                  <div className="card-title">
                    <CampaignIcon />
                    <span>Campaigns</span>
                  </div>
                }
                action={
                  <Button 
                    variant="outlined" 
                    size="small"
                    className="action-button"
                    onClick={() => navigate('/marketing/campaigns')}
                  >
                    Manage
                  </Button>
                }
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper className="stat-summary">
                      {loading ? (
                        <Skeleton variant="text" height={40} width="80%" sx={{ mx: 'auto' }} />
                      ) : (
                        <Typography variant="h5" sx={{ fontWeight: 500 }}>
                          {campaigns.scheduled}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        Scheduled
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper className="stat-summary">
                      {loading ? (
                        <Skeleton variant="text" height={40} width="80%" sx={{ mx: 'auto' }} />
                      ) : (
                        <Typography variant="h5" sx={{ fontWeight: 500 }}>
                          {campaigns.completed}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        Completed
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
                
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>Campaign Status</Typography>
                  <Box display="flex" justifyContent="space-between" mt={1}>
                    <Chip 
                      size="small" 
                      label={
                        <Box display="flex" alignItems="center" justifyContent="space-between" width={100}>
                          <Typography variant="body2">Active</Typography>
                          <Typography variant="body2">{campaigns.active}</Typography>
                        </Box>
                      }
                      variant="outlined"
                      className="status-active"
                    />
                    <Chip 
                      size="small" 
                      label={
                        <Box display="flex" alignItems="center" justifyContent="space-between" width={100}>
                          <Typography variant="body2">Scheduled</Typography>
                          <Typography variant="body2">{campaigns.scheduled}</Typography>
                        </Box>
                      }
                      variant="outlined"
                      className="status-scheduled"
                    />
                    <Chip 
                      size="small" 
                      label={
                        <Box display="flex" alignItems="center" justifyContent="space-between" width={100}>
                          <Typography variant="body2">Completed</Typography>
                          <Typography variant="body2">{campaigns.completed}</Typography>
                        </Box>
                      }
                      variant="outlined"
                      className="status-ended"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Card className="analytics-card activity-list" sx={{ mt: 3 }}>
          <CardHeader 
            title={
              <div className="card-title">
                <AnalyticsIcon />
                <span>Recent Activity</span>
              </div>
            }
            action={
              <Button
                startIcon={<RefreshIcon />}
                size="small"
                className="action-button"
                onClick={fetchDashboardData}
                disabled={loading}
              >
                Refresh
              </Button>
            }
          />
          <Divider />
          {loading ? (
            <Box p={2}>
              {[...Array(4)].map((_, i) => (
                <Box key={i} sx={{ my: 2 }} className="MuiSkeleton-root">
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="60%" />
                </Box>
              ))}
            </Box>
          ) : dashboardData.recentActivity && dashboardData.recentActivity.length > 0 ? (
            <List>
              {dashboardData.recentActivity.map((activity, index) => (
                <ListItem 
                  key={activity.id} 
                  divider={index < dashboardData.recentActivity.length - 1}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {activity.action}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {new Date(activity.date).toLocaleString()}
                      </Typography>
                    }
                  />
                  {activity.type === 'loyalty' && <LoyaltyIcon fontSize="small" color="primary" />}
                  {activity.type === 'campaign' && <CampaignIcon fontSize="small" color="success" />}
                  {activity.type === 'email' && <EmailIcon fontSize="small" color="info" />}
                  {activity.type === 'promotion' && <PromotionsIcon fontSize="small" color="secondary" />}
                </ListItem>
              ))}
            </List>
          ) : (
            <Box p={4} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                No recent activity to display
              </Typography>
            </Box>
          )}
        </Card>
      </Box>
    );
  };

  return (
    <div className="marketing-dashboard">
      <div className="dashboard-header">
        <h4 className="dashboard-title">Marketing Dashboard</h4>
        <div>
          <Button 
            variant="contained" 
            startIcon={<EmailIcon />}
            onClick={() => navigate('/marketing/email')}
            className="action-button"
            sx={{ mr: 2 }}
          >
            New Email Campaign
          </Button>
          <Button 
            variant="contained" 
            color="secondary"
            startIcon={<LoyaltyIcon />}
            onClick={() => navigate('/marketing/loyalty')}
            className="action-button"
          >
            Loyalty Program
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      <div className="tabs-container">
        <div className="tab-buttons">
          <Tabs 
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              icon={<AnalyticsIcon />} 
              label="Overview" 
              iconPosition="start" 
            />
            <Tab 
              icon={<LoyaltyIcon />} 
              label="Loyalty Program" 
              iconPosition="start" 
            />
            <Tab 
              icon={<EmailIcon />} 
              label="Email Campaigns" 
              iconPosition="start"
            />
            <Tab 
              icon={<PromotionsIcon />} 
              label="Promotions" 
              iconPosition="start"
            />
            
            <Tab 
              icon={<CampaignIcon />} 
              label="All Campaigns" 
              iconPosition="start"
            />
            <Tab 
              icon={<AnalyticsIcon />} 
              label="Analytics" 
              iconPosition="start"
            />
          </Tabs>
        </div>

        {activeTab === 0 && (
          <div className="tab-content">
            {renderDashboardOverview()}
          </div>
        )}
      </div>
      
      {/* Refresh button at bottom */}
      <Box mt={3} display="flex" justifyContent="center">
        <Button 
          variant="outlined" 
          onClick={fetchDashboardData}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
          className="action-button"
        >
          {loading ? 'Loading...' : 'Refresh Data'}
        </Button>
      </Box>
      
      
    </div>
  );
};

export default MarketingDashboard;