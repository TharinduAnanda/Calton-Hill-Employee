import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, IconButton, Dialog, DialogActions,
  DialogContent, DialogTitle, FormControl, InputLabel,
  Select, MenuItem, Chip, CircularProgress, Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Mail as MailIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  Message as MessageIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import marketingService from '../../services/marketingService';

const CampaignManagement = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    type: 'email',
    status: 'draft',
    target_segment: '',
    subject: '',
    content: '',
    scheduled_date: ''
  });

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const response = await marketingService.getCampaigns();
        
        // Enhanced error handling and data normalization
        let campaignsData;
        if (response && response.data) {
          // If API returns { data: [...] } structure
          campaignsData = Array.isArray(response.data) ? response.data : [];
        } else if (Array.isArray(response)) {
          // If API returns direct array
          campaignsData = response;
        } else if (response && typeof response === 'object') {
          // If API returns other object structure, try to extract data
          campaignsData = Array.isArray(response.campaigns) ? response.campaigns : [];
        } else {
          // Fallback to empty array
          campaignsData = [];
        }
        
        console.log('Campaigns data:', campaignsData);
        setCampaigns(campaignsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setCampaigns([]); // Set to empty array on error
        setError('Failed to load campaigns: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCampaignForm({
      name: '',
      type: 'email',
      status: 'draft',
      target_segment: '',
      subject: '',
      content: '',
      scheduled_date: ''
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCampaignForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const newCampaign = await marketingService.createCampaign(campaignForm);
      setCampaigns(prev => [...prev, newCampaign]);
      handleClose();
      setError(null);
    } catch (err) {
      console.error('Error creating campaign:', err);
      setError('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    let color;
    switch (status) {
      case 'active': color = 'success'; break;
      case 'draft': color = 'default'; break;
      case 'scheduled': color = 'info'; break;
      case 'completed': color = 'primary'; break;
      default: color = 'default';
    }
    return <Chip label={status} color={color} size="small" />;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'email': return <MailIcon fontSize="small" />;
      case 'sms': return <MessageIcon fontSize="small" />;
      default: return <MailIcon fontSize="small" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Campaign Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleClickOpen}
        >
          New Campaign
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading && !campaigns.length ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Campaign Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Target Segment</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Scheduled</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Box py={3}>
                        <Typography variant="body1" color="textSecondary">
                          No campaigns yet. Create your first campaign.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>{campaign.name}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {getTypeIcon(campaign.type)}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {campaign.type}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{campaign.target_segment}</TableCell>
                      <TableCell>{getStatusChip(campaign.status)}</TableCell>
                      <TableCell>{format(new Date(campaign.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        {campaign.scheduled_date ? format(new Date(campaign.scheduled_date), 'MMM dd, yyyy') : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* New Campaign Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Create New Campaign</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Campaign Name"
                fullWidth
                value={campaignForm.name}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Campaign Type</InputLabel>
                <Select
                  name="type"
                  value={campaignForm.type}
                  label="Campaign Type"
                  onChange={handleFormChange}
                >
                  <MenuItem value="email">Email Campaign</MenuItem>
                  <MenuItem value="sms">SMS Campaign</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Target Segment</InputLabel>
                <Select
                  name="target_segment"
                  value={campaignForm.target_segment}
                  label="Target Segment"
                  onChange={handleFormChange}
                >
                  <MenuItem value="all_customers">All Customers</MenuItem>
                  <MenuItem value="loyalty_members">Loyalty Members</MenuItem>
                  <MenuItem value="new_customers">New Customers (30 days)</MenuItem>
                  <MenuItem value="inactive">Inactive Customers (90+ days)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="scheduled_date"
                label="Scheduled Date"
                type="date"
                fullWidth
                value={campaignForm.scheduled_date}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="subject"
                label="Subject Line"
                fullWidth
                value={campaignForm.subject}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="content"
                label="Campaign Content"
                multiline
                rows={6}
                fullWidth
                value={campaignForm.content}
                onChange={handleFormChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Create Campaign</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CampaignManagement;