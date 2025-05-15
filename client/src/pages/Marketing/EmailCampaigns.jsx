import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, Button, TextField, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, Select, MenuItem, Chip, CircularProgress, 
  Alert, Card, CardContent, CardHeader, Divider, InputAdornment,
  FormControlLabel, Switch, Tooltip, RadioGroup, Radio, FormHelperText
} from '@mui/material';
import {
  Email as EmailIcon,
  Send as SendIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon,
  ContentCopy as DuplicateIcon,
  BarChart as AnalyticsIcon,
  Group as SegmentIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as SentIcon,
  ListAlt as TemplateIcon,
  PendingActions as PendingIcon,
  Edit as DraftIcon,
  Error as ErrorIcon,
  Visibility as ViewIcon,
  ShoppingCart as CartIcon,
  NewReleases as NewIcon,
  School as EducationIcon,
  Person as CustomerIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays } from 'date-fns';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import marketingService from '../../services/marketingService';

const EmailCampaignManager = () => {
  // State variables
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [campaignType, setCampaignType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Performance metrics
  const [metrics, setMetrics] = useState({
    totalSent: 0,
    openRate: 0,
    clickRate: 0,
    bounceRate: 0,
    conversionRate: 0,
    revenue: 0,
    hasData: false
  });
  
  // Dialog state
  const [campaignDialog, setCampaignDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    subject: '',
    from_name: 'Calton Hill',
    from_email: 'caltonhillrakwana@gmail.com',
    content: '',
    template_id: '',
    segment_id: '',
    campaign_type: 'product_promotion',
    schedule_date: null,
    status: 'DRAFT'
  });

  const [testEmailDialog, setTestEmailDialog] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(addDays(new Date(), 1));
  
  const [analyticsDialog, setAnalyticsDialog] = useState(false);
  const [campaignAnalytics, setCampaignAnalytics] = useState(null);

  const [sendOptionsDialog, setSendOptionsDialog] = useState(false);
  const [sendOptions, setSendOptions] = useState({
    mode: 'batch',  // 'batch' or 'single'
    singleEmail: '',
    batchSize: 100
  });

  // Send options dialog handlers
  const handleOpenSendOptionsDialog = (campaign) => {
    setSelectedCampaign(campaign);
    setSendOptions({
      mode: 'batch',
      singleEmail: '',
      batchSize: 100
    });
    setSendOptionsDialog(true);
  };

  const handleCloseSendOptionsDialog = () => {
    setSendOptionsDialog(false);
  };

  const handleSendOptionsChange = (e) => {
    const { name, value } = e.target;
    setSendOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Campaign types for dropdown
  const campaignTypes = [
    { value: 'product_promotion', label: 'Product Promotion', icon: <CartIcon /> },
    { value: 'new_arrivals', label: 'New Arrivals', icon: <NewIcon /> },
    { value: 'educational', label: 'Educational Content', icon: <EducationIcon /> },
    { value: 'abandoned_cart', label: 'Abandoned Cart', icon: <CartIcon /> },
    { value: 'reorder_reminder', label: 'Reorder Reminder', icon: <CalendarIcon /> },
    { value: 'loyalty_program', label: 'Loyalty Program', icon: <CustomerIcon /> },
    { value: 'welcome_series', label: 'Welcome Series', icon: <EmailIcon /> }
  ];
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchEmailData = async () => {
      try {
        setLoading(true);
        
        // Fetch campaigns, segments, metrics in parallel
        const [campaignsData, segmentsData, metricsData] = await Promise.all([
          marketingService.getEmailCampaigns(),
          marketingService.getCustomerSegments(),
          marketingService.getEmailMetrics()
        ]);
        
        // Set state with fetched data
        setCampaigns(campaignsData);
        setSegments(segmentsData);
        
        // Set metrics from API data
        setMetrics({
          totalSent: metricsData.totalSent,
          openRate: metricsData.openRate,
          clickRate: metricsData.clickRate,
          conversionRate: metricsData.conversionRate,
          revenue: metricsData.revenue,
          hasData: metricsData.hasData // This should come from the API
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching email campaign data:', err);
        setError('Failed to load email campaign data');
        setCampaigns([]);
        
        // No data case - don't use mock values
        setMetrics({
          totalSent: 0,
          openRate: 0,
          clickRate: 0,
          conversionRate: 0,
          revenue: 0,
          hasData: false
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEmailData();
  }, []);

  // Handle tab changes
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle campaign type filter changes
  const handleCampaignTypeChange = (event) => {
    setCampaignType(event.target.value);
  };

  // Dialog handlers for campaign creation/editing
  const handleOpenCampaignDialog = (campaign = null) => {
    if (campaign) {
      setSelectedCampaign(campaign);
      setCampaignForm({
        name: campaign.name,
        subject: campaign.subject,
        from_name: campaign.from_name || 'Calton Hill',
        from_email: campaign.from_email || 'caltonhillrakwana@gmail.com',
        content: campaign.content,
        template_id: campaign.template_id || '',
        segment_id: campaign.segment_id || '',
        campaign_type: campaign.campaign_type || 'product_promotion',
        schedule_date: campaign.scheduled_date ? new Date(campaign.scheduled_date) : null,
        status: campaign.status || 'DRAFT'
      });
    } else {
      setSelectedCampaign(null);
      setCampaignForm({
        name: '',
        subject: '',
        from_name: 'Calton Hill',
        from_email: 'caltonhillrakwana@gmail.com',
        content: '',
        template_id: '',
        segment_id: '',
        campaign_type: 'product_promotion',
        schedule_date: null,
        status: 'DRAFT'
      });
    }
    
    setCampaignDialog(true);
  };

  const handleCloseCampaignDialog = () => {
    setCampaignDialog(false);
  };

  const handleCampaignFormChange = (e) => {
    const { name, value } = e.target;
    setCampaignForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleContentChange = (content) => {
    setCampaignForm(prev => ({
      ...prev,
      content
    }));
  };

  // Handle form submission for creating/updating campaigns
  const handleSubmitCampaign = async () => {
    try {
      setLoading(true);
      
      if (selectedCampaign) {
        // Update existing campaign
        const updated = await marketingService.updateEmailCampaign(selectedCampaign.id, campaignForm);
        setCampaigns(prev => 
          prev.map(c => c.id === selectedCampaign.id ? updated : c)
        );
        setSuccess(`Campaign "${updated.name}" updated successfully`);
      } else {
        // Create new campaign
        const newCampaign = await marketingService.createEmailCampaign(campaignForm);
        setCampaigns(prev => [...prev, newCampaign]);
        setSuccess(`Campaign "${newCampaign.name}" created successfully`);
      }
      
      setCampaignDialog(false);
      setError(null);
    } catch (err) {
      console.error('Error saving campaign:', err);
      setError('Failed to save campaign: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle campaign deletion
  const handleDeleteCampaign = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      setLoading(true);
      await marketingService.deleteEmailCampaign(id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
      setSuccess('Campaign deleted successfully');
      setError(null);
    } catch (err) {
      console.error('Error deleting campaign:', err);
      setError('Failed to delete campaign');
    } finally {
      setLoading(false);
    }
  };

  // Handle duplicating a campaign
  const handleDuplicateCampaign = async (campaign) => {
    try {
      setLoading(true);
      const duplicateData = {
        ...campaign,
        name: `Copy of ${campaign.name}`,
        status: 'DRAFT',
        schedule_date: null
      };
      delete duplicateData.id;
      
      const newCampaign = await marketingService.createEmailCampaign(duplicateData);
      setCampaigns(prev => [...prev, newCampaign]);
      setSuccess(`Campaign "${newCampaign.name}" duplicated successfully`);
      setError(null);
    } catch (err) {
      console.error('Error duplicating campaign:', err);
      setError('Failed to duplicate campaign');
    } finally {
      setLoading(false);
    }
  };

  // Handle sending a campaign
  const handleSendCampaign = async () => {
    try {
      setLoading(true);
      
      // Send based on the selected mode
      if (sendOptions.mode === 'single' && sendOptions.singleEmail) {
        // Send to a single email address
        await marketingService.sendSingleCampaignEmail(selectedCampaign.id, {
          email: sendOptions.singleEmail
        });
        setSuccess(`Campaign "${selectedCampaign.name}" sent to ${sendOptions.singleEmail}`);
      } else {
        // Send as a batch to all recipients
        await marketingService.sendEmailCampaign(selectedCampaign.id, {
          batchSize: parseInt(sendOptions.batchSize) || 100
        });
        setSuccess(`Campaign "${selectedCampaign.name}" batch sending initiated`);
      }
      
      // Update the campaign status in the local state
      setCampaigns(prev => 
        prev.map(c => c.id === selectedCampaign.id ? { 
          ...c, 
          status: 'SENT', 
          sent_at: new Date().toISOString()
        } : c)
      );
      
      setSendOptionsDialog(false);
      setError(null);
    } catch (err) {
      console.error('Error sending campaign:', err);
      setError('Failed to send campaign: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Test email dialog handlers
  const handleOpenTestEmailDialog = (campaign) => {
    setSelectedCampaign(campaign);
    setTestEmail('');
    setTestEmailDialog(true);
  };

  const handleCloseTestEmailDialog = () => {
    setTestEmailDialog(false);
  };

  const handleSendTestEmail = async () => {
    if (!testEmail || !selectedCampaign) return;
    
    try {
      setSendingTest(true);
      await marketingService.sendTestEmail(selectedCampaign.id, testEmail);
      setSuccess(`Test email sent to ${testEmail}`);
      setTestEmailDialog(false);
      setError(null);
    } catch (err) {
      console.error('Error sending test email:', err);
      setError('Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  // Schedule dialog handlers
  const handleOpenScheduleDialog = (campaign) => {
    setSelectedCampaign(campaign);
    setScheduleDate(campaign.scheduled_date ? new Date(campaign.scheduled_date) : addDays(new Date(), 1));
    setScheduleDialog(true);
  };

  const handleCloseScheduleDialog = () => {
    setScheduleDialog(false);
  };

  const handleScheduleCampaign = async () => {
    try {
      setLoading(true);
      
      await marketingService.scheduleCampaign(selectedCampaign.id, { 
        schedule_date: scheduleDate.toISOString() 
      });
      
      setCampaigns(prev => 
        prev.map(c => c.id === selectedCampaign.id ? { 
          ...c, 
          status: 'SCHEDULED', 
          scheduled_date: scheduleDate 
        } : c)
      );
      
      setScheduleDialog(false);
      setSuccess('Campaign scheduled successfully');
      setError(null);
    } catch (err) {
      console.error('Error scheduling campaign:', err);
      setError('Failed to schedule campaign');
    } finally {
      setLoading(false);
    }
  };
  
  // Analytics dialog handlers
  const handleOpenAnalyticsDialog = async (campaign) => {
    try {
      setLoading(true);
      setAnalyticsDialog(true);
      
      // Fetch real analytics data
      const analyticsData = await marketingService.getCampaignAnalytics(campaign.id);
      setCampaignAnalytics(analyticsData);
    } catch (err) {
      console.error('Error fetching campaign analytics:', err);
      setError('Failed to load campaign analytics');
      
      // Use campaign object with empty analytics as fallback
      setCampaignAnalytics({
        ...campaign,
        analytics: {
          sent: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          deviceBreakdown: {
            desktop: 0,
            mobile: 0,
            tablet: 0
          },
          topLinks: [],
          timeDistribution: {
            morning: 0,
            afternoon: 0,
            evening: 0,
            night: 0
          }
        }
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseAnalyticsDialog = () => {
    setAnalyticsDialog(false);
    setCampaignAnalytics(null);
  };

  // Filter campaigns based on active tab, campaign type and search term
  const filteredCampaigns = campaigns.filter(campaign => {
    // First filter by search term
    const searchMatch = 
      searchTerm === '' || 
      campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!searchMatch) return false;
    
    // Then filter by selected tab (status)
    if (activeTab === 0) {
      // All campaigns
      return true;
    } else if (activeTab === 1) {
      // Draft campaigns
      return campaign.status === 'DRAFT';
    } else if (activeTab === 2) {
      // Scheduled campaigns
      return campaign.status === 'SCHEDULED';
    } else if (activeTab === 3) {
      // Sent campaigns
      return campaign.status === 'SENT';
    }
    
    // Finally filter by campaign type if specified
    if (campaignType !== 'all' && campaign.campaign_type !== campaignType) {
      return false;
    }
    
    return true;
  });

  // Get display elements for campaign status
  const getStatusChip = (status) => {
    switch (status) {
      case 'DRAFT':
        return <Chip icon={<DraftIcon />} label="Draft" color="default" size="small" />;
      case 'SCHEDULED':
        return <Chip icon={<PendingIcon />} label="Scheduled" color="primary" size="small" />;
      case 'SENDING':
        return <Chip icon={<SendIcon />} label="Sending" color="warning" size="small" />;
      case 'SENT':
        return <Chip icon={<SentIcon />} label="Sent" color="success" size="small" />;
      case 'CANCELLED':
        return <Chip icon={<ErrorIcon />} label="Cancelled" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };
  
  // Get campaign type display name and icon
  const getCampaignTypeDisplay = (type) => {
    const campaignType = campaignTypes.find(ct => ct.value === type) || 
                         { label: type, icon: <EmailIcon /> };
                         
    return (
      <Box display="flex" alignItems="center">
        {campaignType.icon}
        <Typography variant="body2" sx={{ ml: 1 }}>
          {campaignType.label}
        </Typography>
      </Box>
    );
  };

  // Render the UI
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Button placed directly below navbar, with enhanced visibility */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          mb: 3,
          mt: 10,
          position: 'sticky',
          top: 10,
          zIndex: 2
        }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenCampaignDialog()}
            sx={{ 
              fontWeight: 'bold', 
              py: 1.5, 
              px: 4,
              fontSize: '1rem',
              boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
              textTransform: 'none',
              '&:hover': {
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              }
            }}
            size="large"
          >
            Create Campaign
          </Button>
        </Box>
        
        {/* Alert messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}
        
        {/* Dashboard metrics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                  Total Emails Sent
                </Typography>
                <Typography variant="h4">
                  {metrics.hasData ? metrics.totalSent.toLocaleString() : "No data available"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                  Average Open Rate
                </Typography>
                <Typography variant="h4">
                  {metrics.hasData ? `${metrics.openRate}%` : "No data available"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                  Conversion Rate
                </Typography>
                <Typography variant="h4">
                  {metrics.hasData ? `${metrics.conversionRate}%` : "No data available"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                  Revenue Generated
                </Typography>
                <Typography variant="h4">
                  {metrics.hasData ? `$${metrics.revenue.toLocaleString()}` : "No data available"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Filter controls */}
        <Paper sx={{ mb: 3, p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField 
                placeholder="Search campaigns..."
                size="small"
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Campaign Type</InputLabel>
                <Select
                  value={campaignType}
                  label="Campaign Type"
                  onChange={handleCampaignTypeChange}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  {campaignTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box display="flex" alignItems="center">
                        {type.icon}
                        <Box ml={1}>{type.label}</Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Main content tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Campaigns" />
            <Tab label="Drafts" />
            <Tab label="Scheduled" />
            <Tab label="Sent" />
          </Tabs>
          
          {/* Campaigns table */}
          <Box p={2}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Campaign</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Customer Segment</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Performance</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <CircularProgress size={40} sx={{ my: 2 }} />
                      </TableCell>
                    </TableRow>
                  ) : filteredCampaigns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Box py={3}>
                          <Typography variant="body1" color="textSecondary">
                            {searchTerm ? 
                              "No campaigns match your search term." : 
                              activeTab === 0 ?
                                "No campaigns found. Create your first campaign." :
                                activeTab === 1 ?
                                  "No draft campaigns found." :
                                  activeTab === 2 ?
                                    "No scheduled campaigns found." :
                                    "No sent campaigns found."
                            }
                          </Typography>
                          {activeTab === 0 && (
                            <Button
                              variant="contained"
                              startIcon={<AddIcon />}
                              onClick={() => handleOpenCampaignDialog()}
                              sx={{ mt: 2 }}
                            >
                              Create First Campaign
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCampaigns.map(campaign => {
                      const segment = segments.find(s => s.id === campaign.segment_id);
                      
                      return (
                        <TableRow key={campaign.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {campaign.name}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {campaign.subject}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {getCampaignTypeDisplay(campaign.campaign_type || 'product_promotion')}
                          </TableCell>
                          <TableCell>
                            {getStatusChip(campaign.status)}
                          </TableCell>
                          <TableCell>
                            {segment ? segment.name : 'All Customers'}
                          </TableCell>
                          <TableCell>
                            {campaign.status === 'SCHEDULED' && campaign.scheduled_date ? 
                              format(new Date(campaign.scheduled_date), 'MMM dd, yyyy h:mm a') : 
                              campaign.status === 'SENT' && campaign.sent_at ? 
                                format(new Date(campaign.sent_at), 'MMM dd, yyyy h:mm a') : 
                                '—'
                            }
                          </TableCell>
                          <TableCell>
                            {campaign.status === 'SENT' ? 
                              <Box>
                                <Typography variant="body2" color="textSecondary">
                                  Open Rate: {campaign.analytics?.openRate || "No data"}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Click Rate: {campaign.analytics?.clickRate || "No data"}
                                </Typography>
                              </Box> : 
                              '—'
                            }
                          </TableCell>
                          <TableCell align="right">
                            <Box>
                              {/* Edit button - only for draft campaigns */}
                              {campaign.status === 'DRAFT' && (
                                <Tooltip title="Edit">
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleOpenCampaignDialog(campaign)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              {/* Schedule button - only for draft campaigns */}
                              {campaign.status === 'DRAFT' && (
                                <Tooltip title="Schedule">
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleOpenScheduleDialog(campaign)}
                                  >
                                    <ScheduleIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              {/* Send button - only for draft campaigns */}
                              {campaign.status === 'DRAFT' && (
                                <Tooltip title="Send Now">
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleOpenSendOptionsDialog(campaign)}
                                  >
                                    <SendIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              {/* Analytics button - for sent campaigns */}
                              {campaign.status === 'SENT' && (
                                <Tooltip title="View Analytics">
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleOpenAnalyticsDialog(campaign)}
                                  >
                                    <AnalyticsIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              {/* View button - for all campaigns */}
                              <Tooltip title="Preview">
                                <IconButton size="small">
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              {/* Duplicate button */}
                              <Tooltip title="Duplicate">
                                <IconButton 
                                  size="small"
                                  onClick={() => handleDuplicateCampaign(campaign)}
                                >
                                  <DuplicateIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              {/* Delete button */}
                              <Tooltip title="Delete">
                                <IconButton 
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteCampaign(campaign.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>

        {/* Create/Edit Campaign Dialog */}
        <Dialog 
          open={campaignDialog} 
          onClose={handleCloseCampaignDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedCampaign ? 'Edit Campaign' : 'Create New Campaign'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Campaign Name"
                  name="name"
                  value={campaignForm.name}
                  onChange={handleCampaignFormChange}
                  fullWidth
                  required
                  helperText="Internal name for this campaign"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Campaign Type</InputLabel>
                  <Select
                    name="campaign_type"
                    value={campaignForm.campaign_type}
                    onChange={handleCampaignFormChange}
                    label="Campaign Type"
                  >
                    {campaignTypes.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box display="flex" alignItems="center">
                          {type.icon}
                          <Box ml={1}>{type.label}</Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Subject Line"
                  name="subject"
                  value={campaignForm.subject}
                  onChange={handleCampaignFormChange}
                  fullWidth
                  required
                  helperText="The subject line recipients will see in their inbox"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="From Name"
                  name="from_name"
                  value={campaignForm.from_name}
                  onChange={handleCampaignFormChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="From Email"
                  name="from_email"
                  value={campaignForm.from_email}
                  onChange={handleCampaignFormChange}
                  fullWidth
                  required
                  type="email"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Template</InputLabel>
                  <Select
                    name="template_id"
                    value={campaignForm.template_id}
                    onChange={handleCampaignFormChange}
                    label="Template"
                  >
                    <MenuItem value="">No Template (Custom)</MenuItem>
                    {templates.map(template => (
                      <MenuItem key={template.id} value={template.id}>
                        {template.name} ({template.category})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Customer Segment</InputLabel>
                  <Select
                    name="segment_id"
                    value={campaignForm.segment_id}
                    onChange={handleCampaignFormChange}
                    label="Customer Segment"
                  >
                    <MenuItem value="">All Customers</MenuItem>
                    {segments.map(segment => (
                      <MenuItem key={segment.id} value={segment.id}>
                        {segment.name} ({segment.customer_count || 0} customers)
                      </MenuItem>
                    ))}
                  </Select>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                    Target specific customer groups (DIY homeowners, contractors, etc.)
                  </Typography>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Email Content
                </Typography>
                <Box sx={{ border: '1px solid #ddd', mb: 2 }}>
                  <ReactQuill 
                    value={campaignForm.content} 
                    onChange={handleContentChange}
                    style={{ minHeight: '300px' }}
                  />
                </Box>
                <Typography variant="caption" color="textSecondary">
                  You can use [FIRST_NAME], [LAST_NAME], and other placeholders that will be replaced with customer data.
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCampaignDialog}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSubmitCampaign} 
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : selectedCampaign ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Test Email Dialog */}
        <Dialog open={testEmailDialog} onClose={handleCloseTestEmailDialog}>
          <DialogTitle>Send Test Email</DialogTitle>
          <DialogContent>
            <Typography variant="body2" paragraph>
              Send a test email to verify how the campaign will look for recipients.
            </Typography>
            <TextField
              label="Email Address"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              fullWidth
              type="email"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseTestEmailDialog}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSendTestEmail} 
              disabled={sendingTest || !testEmail}
            >
              {sendingTest ? <CircularProgress size={24} /> : 'Send Test'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Schedule Dialog */}
        <Dialog open={scheduleDialog} onClose={handleCloseScheduleDialog}>
          <DialogTitle>Schedule Campaign</DialogTitle>
          <DialogContent>
            <Typography variant="body2" paragraph>
              Choose when to send this email campaign:
            </Typography>
            <DateTimePicker
              label="Schedule Date & Time"
              value={scheduleDate}
              onChange={setScheduleDate}
              renderInput={(params) => <TextField {...params} fullWidth />}
              minDateTime={new Date()}
            />
            <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
              {campaignForm.campaign_type === 'product_promotion' && (
                "Promotional emails perform best when sent Tuesday-Thursday mornings."
              )}
              {campaignForm.campaign_type === 'new_arrivals' && (
                "New product announcements perform best early in the week when contractors plan their purchases."
              )}
              {campaignForm.campaign_type === 'educational' && (
                "Educational content performs best on weekends when DIY customers have time to read."
              )}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseScheduleDialog}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleScheduleCampaign} 
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Schedule'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Analytics Dialog */}
        <Dialog 
          open={analyticsDialog} 
          onClose={handleCloseAnalyticsDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Campaign Analytics: {campaignAnalytics?.name}
          </DialogTitle>
          <DialogContent dividers>
            {!campaignAnalytics ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary">Sent</Typography>
                      <Typography variant="h5">
                        {campaignAnalytics.analytics.sent > 0 ? 
                          campaignAnalytics.analytics.sent : 
                          "No data"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary">Opens</Typography>
                      <Typography variant="h5">
                        {campaignAnalytics.analytics.opened > 0 ? 
                          <>
                            {campaignAnalytics.analytics.opened}
                            <Typography component="span" variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                              ({Math.round(campaignAnalytics.analytics.opened / campaignAnalytics.analytics.sent * 100)}%)
                            </Typography>
                          </> : 
                          "No data"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary">Clicks</Typography>
                      <Typography variant="h5">
                        {campaignAnalytics.analytics.clicked}
                        <Typography component="span" variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                          ({Math.round(campaignAnalytics.analytics.clicked / campaignAnalytics.analytics.opened * 100)}%)
                        </Typography>
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary">Bounced</Typography>
                      <Typography variant="h5">
                        {campaignAnalytics.analytics.bounced}
                        <Typography component="span" variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                          ({Math.round(campaignAnalytics.analytics.bounced / campaignAnalytics.analytics.sent * 100)}%)
                        </Typography>
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardHeader title="Device Breakdown" />
                    <CardContent>
                      <Typography variant="body2">Desktop: {campaignAnalytics.analytics.deviceBreakdown.desktop}%</Typography>
                      <Typography variant="body2">Mobile: {campaignAnalytics.analytics.deviceBreakdown.mobile}%</Typography>
                      <Typography variant="body2">Tablet: {campaignAnalytics.analytics.deviceBreakdown.tablet}%</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardHeader title="Time Distribution" />
                    <CardContent>
                      <Typography variant="body2">Morning (6am-12pm): {campaignAnalytics.analytics.timeDistribution.morning}%</Typography>
                      <Typography variant="body2">Afternoon (12pm-5pm): {campaignAnalytics.analytics.timeDistribution.afternoon}%</Typography>
                      <Typography variant="body2">Evening (5pm-10pm): {campaignAnalytics.analytics.timeDistribution.evening}%</Typography>
                      <Typography variant="body2">Night (10pm-6am): {campaignAnalytics.analytics.timeDistribution.night}%</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card>
                    <CardHeader title="Top Clicked Links" />
                    <CardContent>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>URL</TableCell>
                              <TableCell align="right">Clicks</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {campaignAnalytics.analytics.topLinks.map((link, index) => (
                              <TableRow key={index}>
                                <TableCell>{link.url}</TableCell>
                                <TableCell align="right">{link.clicks}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAnalyticsDialog}>Close</Button>
            <Button variant="outlined" startIcon={<AnalyticsIcon />}>
              Export Report
            </Button>
          </DialogActions>
        </Dialog>

        {/* Send Options Dialog */}
        <Dialog open={sendOptionsDialog} onClose={handleCloseSendOptionsDialog}>
          <DialogTitle>Send Campaign</DialogTitle>
          <DialogContent>
            <Typography variant="body2" paragraph>
              Choose how you want to send the campaign "{selectedCampaign?.name}":
            </Typography>
            
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <RadioGroup
                name="mode"
                value={sendOptions.mode}
                onChange={handleSendOptionsChange}
              >
                <FormControlLabel 
                  value="batch" 
                  control={<Radio />} 
                  label="Send to all recipients in segment" 
                />
                <FormControlLabel 
                  value="single" 
                  control={<Radio />} 
                  label="Send to a single email address" 
                />
              </RadioGroup>
            </FormControl>
            
            {sendOptions.mode === 'single' && (
              <TextField
                label="Email Address"
                name="singleEmail"
                value={sendOptions.singleEmail}
                onChange={handleSendOptionsChange}
                fullWidth
                type="email"
                required
                sx={{ mb: 2 }}
              />
            )}
            
            {sendOptions.mode === 'batch' && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="batch-size-label">Batch Size</InputLabel>
                <Select
                  labelId="batch-size-label"
                  name="batchSize"
                  value={sendOptions.batchSize}
                  onChange={handleSendOptionsChange}
                  label="Batch Size"
                >
                  <MenuItem value={50}>Small (50 recipients at a time)</MenuItem>
                  <MenuItem value={100}>Medium (100 recipients at a time)</MenuItem>
                  <MenuItem value={200}>Large (200 recipients at a time)</MenuItem>
                  <MenuItem value={500}>Very Large (500 recipients at a time)</MenuItem>
                </Select>
                <FormHelperText>
                  Larger batch sizes are faster but may have higher failure rates
                </FormHelperText>
              </FormControl>
            )}
            
            <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 2 }}>
              {sendOptions.mode === 'batch' ? 
                "This action will send emails to all recipients in the selected segment. This cannot be undone." : 
                "This will send the campaign to a single recipient for verification purposes."}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseSendOptionsDialog}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSendCampaign}
              disabled={sendOptions.mode === 'single' && !sendOptions.singleEmail}
              color="primary"
            >
              {loading ? <CircularProgress size={24} /> : 'Send Now'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default EmailCampaignManager;