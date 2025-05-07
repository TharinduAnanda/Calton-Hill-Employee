import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  IconButton,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Email as EmailIcon,
  Send as SendIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon,
  ContentCopy as DuplicateIcon,
  BarChart as StatsIcon,
  Group as SegmentIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Description as TemplateIcon,
  CheckCircle as SentIcon,
  Schedule as PendingIcon,
  Edit as DraftIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import marketingService from '../../services/marketingService';

const EmailCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  const [campaignDialog, setCampaignDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    subject: '',
    from_name: 'Hardware Store',
    from_email: 'marketing@hardwarestore.com',
    content: '',
    template_id: '',
    segment_id: '',
    schedule_date: null,
    status: 'draft'
  });

  const [testEmailDialog, setTestEmailDialog] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(new Date());
  
  useEffect(() => {
    const fetchEmailData = async () => {
      try {
        setLoading(true);
        const [campaignsData, templatesData, segmentsData] = await Promise.all([
          marketingService.getEmailCampaigns(),
          // Mock templates for now
          Promise.resolve([
            { id: 1, name: 'New Products Announcement', category: 'Promotional' },
            { id: 2, name: 'Seasonal Sale', category: 'Promotional' },
            { id: 3, name: 'Tool Tips Newsletter', category: 'Newsletter' },
            { id: 4, name: 'DIY Project Ideas', category: 'Newsletter' },
            { id: 5, name: 'Customer Appreciation', category: 'Relationship' }
          ]),
          marketingService.getCustomerSegments()
        ]);
        
        setCampaigns(campaignsData);
        setTemplates(templatesData);
        setSegments(segmentsData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching email campaign data:', err);
        setError('Failed to load email campaign data');
      } finally {
        setLoading(false);
      }
    };

    fetchEmailData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Campaign dialog handlers
  const handleOpenCampaignDialog = (campaign = null) => {
    if (campaign) {
      setSelectedCampaign(campaign);
      setCampaignForm({
        name: campaign.name,
        subject: campaign.subject,
        from_name: campaign.from_name,
        from_email: campaign.from_email,
        content: campaign.content,
        template_id: campaign.template_id || '',
        segment_id: campaign.segment_id || '',
        schedule_date: campaign.schedule_date ? new Date(campaign.schedule_date) : null,
        status: campaign.status
      });
    } else {
      setSelectedCampaign(null);
      setCampaignForm({
        name: '',
        subject: '',
        from_name: 'Hardware Store',
        from_email: 'marketing@hardwarestore.com',
        content: '',
        template_id: '',
        segment_id: '',
        schedule_date: null,
        status: 'draft'
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

  const handleSubmitCampaign = async () => {
    try {
      setLoading(true);
      
      if (selectedCampaign) {
        const updated = await marketingService.updateEmailCampaign(selectedCampaign.id, campaignForm);
        setCampaigns(prev => 
          prev.map(c => c.id === selectedCampaign.id ? updated : c)
        );
      } else {
        const newCampaign = await marketingService.createEmailCampaign(campaignForm);
        setCampaigns(prev => [...prev, newCampaign]);
      }
      
      setCampaignDialog(false);
      setError(null);
    } catch (err) {
      console.error('Error saving campaign:', err);
      setError('Failed to save campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      setLoading(true);
      await marketingService.deleteEmailCampaign(id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting campaign:', err);
      setError('Failed to delete campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateCampaign = async (campaign) => {
    try {
      setLoading(true);
      const duplicateData = {
        ...campaign,
        name: `Copy of ${campaign.name}`,
        status: 'draft',
        schedule_date: null
      };
      delete duplicateData.id;
      
      const newCampaign = await marketingService.createEmailCampaign(duplicateData);
      setCampaigns(prev => [...prev, newCampaign]);
      setError(null);
    } catch (err) {
      console.error('Error duplicating campaign:', err);
      setError('Failed to duplicate campaign');
    } finally {
      setLoading(false);
    }
  };

  // Test email handlers
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
      alert(`Test email sent to ${testEmail}`);
      setTestEmailDialog(false);
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
    setScheduleDate(campaign.schedule_date ? new Date(campaign.schedule_date) : new Date());
    setScheduleDialog(true);
  };

  const handleCloseScheduleDialog = () => {
    setScheduleDialog(false);
  };

  const handleScheduleCampaign = async () => {
    try {
      setLoading(true);
      await marketingService.scheduleCampaign(selectedCampaign.id, { schedule_date: scheduleDate });
      
      setCampaigns(prev => 
        prev.map(c => c.id === selectedCampaign.id ? { 
          ...c, 
          status: 'scheduled', 
          schedule_date: scheduleDate 
        } : c)
      );
      
      setScheduleDialog(false);
    } catch (err) {
      console.error('Error scheduling campaign:', err);
      setError('Failed to schedule campaign');
    } finally {
      setLoading(false);
    }
  };

  // Filter campaigns based on active tab
  const filteredCampaigns = campaigns.filter(campaign => {
    if (activeTab === 0) return true; // All
    if (activeTab === 1) return campaign.status === 'draft';
    if (activeTab === 2) return campaign.status === 'scheduled';
    if (activeTab === 3) return campaign.status === 'sent';
    return true;
  });

  const getStatusChip = (status) => {
    switch (status) {
      case 'draft':
        return <Chip icon={<DraftIcon />} label="Draft" color="default" size="small" />;
      case 'scheduled':
        return <Chip icon={<PendingIcon />} label="Scheduled" color="primary" size="small" />;
      case 'sending':
        return <Chip icon={<SendIcon />} label="Sending" color="warning" size="small" />;
      case 'sent':
        return <Chip icon={<SentIcon />} label="Sent" color="success" size="small" />;
      case 'error':
        return <Chip icon={<ErrorIcon />} label="Error" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Email Campaigns</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenCampaignDialog()}
        >
          Create Campaign
        </Button>
      </Box>
      
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
        
        <Box p={2}>
          <TextField 
            placeholder="Search campaigns..."
            size="small"
            variant="outlined"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Campaign Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Segment</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Open Rate</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress size={40} sx={{ my: 2 }} />
                    </TableCell>
                  </TableRow>
                ) : filteredCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Box py={3}>
                        <Typography variant="body1" color="textSecondary">
                          No campaigns found in this category.
                        </Typography>
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
                          {getStatusChip(campaign.status)}
                        </TableCell>
                        <TableCell>
                          {segment ? segment.name : 'All Customers'}
                        </TableCell>
                        <TableCell>
                          {campaign.schedule_date ? format(new Date(campaign.schedule_date), 'MMM dd, yyyy') : 
                           campaign.sent_date ? format(new Date(campaign.sent_date), 'MMM dd, yyyy') : 
                           '—'}
                        </TableCell>
                        <TableCell>
                          {campaign.status === 'sent' ? `${campaign.open_rate || 0}%` : '—'}
                        </TableCell>
                        <TableCell align="right">
                          <Box>
                            {campaign.status === 'draft' && (
                              <Tooltip title="Edit">
                                <IconButton 
                                  size="small"
                                  onClick={() => handleOpenCampaignDialog(campaign)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            {campaign.status === 'draft' && (
                              <Tooltip title="Schedule">
                                <IconButton 
                                  size="small"
                                  onClick={() => handleOpenScheduleDialog(campaign)}
                                >
                                  <ScheduleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            {campaign.status !== 'draft' && (
                              <Tooltip title="View Stats">
                                <IconButton size="small">
                                  <StatsIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            <Tooltip title="Send Test Email">
                              <IconButton 
                                size="small"
                                onClick={() => handleOpenTestEmailDialog(campaign)}
                              >
                                <SendIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Duplicate">
                              <IconButton 
                                size="small"
                                onClick={() => handleDuplicateCampaign(campaign)}
                              >
                                <DuplicateIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
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

      {/* Campaign Dialog */}
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
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Subject Line"
                name="subject"
                value={campaignForm.subject}
                onChange={handleCampaignFormChange}
                fullWidth
                required
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
                  <MenuItem value="">No Template</MenuItem>
                  {templates.map(template => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name}
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
                      {segment.name}
                    </MenuItem>
                  ))}
                </Select>
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
                  style={{ height: '300px' }}
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
            {loading ? <CircularProgress size={24} /> : 'Save Campaign'}
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
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Schedule Date & Time"
              value={scheduleDate}
              onChange={setScheduleDate}
              renderInput={(params) => <TextField {...params} fullWidth />}
              minDate={new Date()}
            />
          </LocalizationProvider>
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
    </Box>
  );
};

export default EmailCampaigns;