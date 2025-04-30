import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Receipt as ReceiptIcon,
  Support as SupportIcon,
  Add as AddIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';

const CustomerDetails = ({ id: customerId, isEmbedded = false }) => {
  const { id: urlId } = useParams();
  const id = customerId || urlId;
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    customer_segment: '',
    loyalty_points: 0,
    notes: '',
    marketing_consent: false
  });
  const [segments, setSegments] = useState([]);
  const [openNewTicketDialog, setOpenNewTicketDialog] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    order_id: '',
    priority: 'MEDIUM'
  });

  useEffect(() => {
    fetchCustomerDetails();
    fetchCustomerSegments();
  }, [id]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/customers/${id}`);
      setCustomer(response.data.data);
      
      // Set edit data
      const customerData = response.data.data.customer;
      setEditData({
        name: customerData.name || '',
        email: customerData.email || '',
        phone: customerData.phone || '',
        address: customerData.address || '',
        customer_segment: customerData.customer_segment || '',
        loyalty_points: customerData.loyalty_points || 0,
        notes: customerData.notes || '',
        marketing_consent: Boolean(customerData.marketing_consent)
      });
      
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch customer details. Please try again.');
      setLoading(false);
      console.error('Error fetching customer details:', err);
    }
  };

  const fetchCustomerSegments = async () => {
    try {
      const response = await axios.get('/api/customers/segments/all');
      setSegments(response.data.data || []);
    } catch (err) {
      console.error('Error fetching customer segments:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleOpenEditDialog = () => {
    setOpenEditDialog(true);
  };
  
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };
  
  const handleEditChange = (e) => {
    const { name, value, checked, type } = e.target;
    setEditData({
      ...editData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleUpdateCustomer = async () => {
    try {
      await axios.patch(`/api/customers/${id}`, editData);
      handleCloseEditDialog();
      fetchCustomerDetails(); // Refresh data
    } catch (err) {
      console.error('Error updating customer:', err);
      alert('Failed to update customer information.');
    }
  };
  
  const handleOpenNewTicketDialog = () => {
    setOpenNewTicketDialog(true);
  };
  
  const handleCloseNewTicketDialog = () => {
    setOpenNewTicketDialog(false);
    setNewTicket({
      subject: '',
      description: '',
      order_id: '',
      priority: 'MEDIUM'
    });
  };
  
  const handleNewTicketChange = (e) => {
    const { name, value } = e.target;
    setNewTicket({
      ...newTicket,
      [name]: value
    });
  };
  
  const handleCreateTicket = async () => {
    try {
      if (!newTicket.subject || !newTicket.description) {
        alert('Subject and description are required.');
        return;
      }
      
      const ticketData = {
        customer_id: id,
        subject: newTicket.subject,
        description: newTicket.description,
        priority: newTicket.priority
      };
      
      if (newTicket.order_id) {
        ticketData.order_id = newTicket.order_id;
      }
      
      await axios.post('/api/customers/support/tickets', ticketData);
      handleCloseNewTicketDialog();
      
      // If we're on the tickets tab, refresh the tickets
      if (tabValue === 2) {
        fetchCustomerDetails();
      }
      
    } catch (err) {
      console.error('Error creating support ticket:', err);
      alert('Failed to create support ticket.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="500px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!customer) {
    return (
      <Box p={3}>
        <Alert severity="warning">Customer not found</Alert>
      </Box>
    );
  }

  const { customer: customerData, orders, tickets, feedback, analytics } = customer;

  return (
    <Box sx={{ p: isEmbedded ? 0 : 3 }}>
      {!isEmbedded && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Customer Details</Typography>
          <Button 
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/customers')}
          >
            Back to Customers
          </Button>
        </Box>
      )}
      
      <Grid container spacing={3}>
        {/* Customer Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="center" mb={2}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
                  {customerData.name.charAt(0)}
                </Avatar>
              </Box>
              <Typography variant="h5" align="center" gutterBottom>{customerData.name}</Typography>
              
              {customerData.segment_name && (
                <Box display="flex" justifyContent="center" mb={2}>
                  <Chip 
                    label={customerData.segment_name} 
                    color="primary" 
                    variant="outlined" 
                    size="small"
                  />
                </Box>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <List dense disablePadding>
                <ListItem>
                  <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText primary={customerData.email} />
                </ListItem>
                <ListItem>
                  <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText primary={customerData.phone || 'Not provided'} />
                </ListItem>
                <ListItem>
                  <LocationIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText primary={customerData.address || 'No address'} />
                </ListItem>
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Customer Since</Typography>
                  <Typography variant="body1">
                    {customerData.customer_since
                      ? format(new Date(customerData.customer_since), 'MMM dd, yyyy')
                      : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Last Purchase</Typography>
                  <Typography variant="body1">
                    {customerData.last_purchase_date
                      ? format(new Date(customerData.last_purchase_date), 'MMM dd, yyyy')
                      : 'No purchases'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Loyalty Points
                    </Typography>
                    <Chip 
                      label={customerData.loyalty_points || 0} 
                      color="secondary"
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Customer Analytics */}
          <Card sx={{ mt: 2 }}>
            <CardHeader title="Customer Analytics" />
            <CardContent>
              <List dense disablePadding>
                <ListItem>
                  <ListItemText 
                    primary="Lifetime Value" 
                    secondary={new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(analytics.lifetime_value)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Total Orders" 
                    secondary={analytics.total_orders}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Average Order Value" 
                    secondary={new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(analytics.average_order_value)}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Details Tabs */}
        <Grid item xs={12} md={8}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="customer detail tabs">
                <Tab label="Orders" />
                <Tab label="Feedback" />
                <Tab label="Support Tickets" />
                <Tab label="Notes" />
              </Tabs>
            </Box>
            
            {/* Orders Tab */}
            {tabValue === 0 && (
              <Box p={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Order History</Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<AddIcon />}
                    component={Link}
                    to="/orders/create"
                    state={{ customerId: customerData.ID }}
                  >
                    New Order
                  </Button>
                </Box>

                {orders.length === 0 ? (
                  <Alert severity="info">No orders found for this customer.</Alert>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Order ID</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.Order_ID}>
                            <TableCell>#{order.Order_ID}</TableCell>
                            <TableCell>
                              {format(new Date(order.Order_Date), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD'
                              }).format(order.Total_Amount)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={order.Payment_Status}
                                color={
                                  order.Payment_Status === 'Paid' ? 'success' :
                                  order.Payment_Status === 'Partial' ? 'warning' : 'default'
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton 
                                size="small" 
                                component={Link}
                                to={`/orders/${order.Order_ID}`}
                              >
                                <ReceiptIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
            
            {/* Feedback Tab */}
            {tabValue === 1 && (
              <Box p={2}>
                <Typography variant="h6" gutterBottom>Customer Feedback</Typography>
                
                {feedback.length === 0 ? (
                  <Alert severity="info">No feedback submitted by this customer.</Alert>
                ) : (
                  <List>
                    {feedback.map((item) => (
                      <ListItem key={item.Feedback_ID} divider>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" mb={1}>
                              <Typography variant="subtitle1">{item.product_name}</Typography>
                              <Box ml={1} display="flex">
                                {[...Array(5)].map((_, index) => (
                                  index < item.Rating ? 
                                  <StarIcon key={index} fontSize="small" color="warning" /> :
                                  <StarBorderIcon key={index} fontSize="small" color="warning" />
                                ))}
                              </Box>
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="text.primary" paragraph>
                                {item.Feedback_Text}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Submitted on {format(new Date(item.Feedback_Date), 'MMM dd, yyyy')}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            )}
            
            {/* Support Tickets Tab */}
            {tabValue === 2 && (
              <Box p={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Support Tickets</Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<AddIcon />}
                    onClick={handleOpenNewTicketDialog}
                  >
                    New Support Ticket
                  </Button>
                </Box>
                
                {tickets.length === 0 ? (
                  <Alert severity="info">No support tickets found for this customer.</Alert>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Ticket ID</TableCell>
                          <TableCell>Subject</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Priority</TableCell>
                          <TableCell>Created</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tickets.map((ticket) => (
                          <TableRow key={ticket.ticket_id}>
                            <TableCell>#{ticket.ticket_id}</TableCell>
                            <TableCell>{ticket.subject}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={ticket.status}
                                color={
                                  ticket.status === 'OPEN' ? 'error' :
                                  ticket.status === 'IN_PROGRESS' ? 'warning' :
                                  ticket.status === 'RESOLVED' ? 'success' : 'default'
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={ticket.priority}
                                color={
                                  ticket.priority === 'HIGH' || ticket.priority === 'CRITICAL' ? 'error' :
                                  ticket.priority === 'MEDIUM' ? 'warning' : 'default'
                                }
                              />
                            </TableCell>
                            <TableCell>
                              {format(new Date(ticket.created_at), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>
                              <IconButton 
                                size="small" 
                                component={Link}
                                to={`/support/tickets/${ticket.ticket_id}`}
                              >
                                <SupportIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
            
            {/* Notes Tab */}
            {tabValue === 3 && (
              <Box p={2}>
                <Typography variant="h6" gutterBottom>Customer Notes</Typography>
                
                {!customerData.notes ? (
                  <Alert severity="info">No notes for this customer.</Alert>
                ) : (
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body1">
                      {customerData.notes}
                    </Typography>
                  </Paper>
                )}
                
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleOpenEditDialog}
                  sx={{ mt: 2 }}
                >
                  Edit Notes
                </Button>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Edit Customer Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Customer Information</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={editData.name}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={editData.email}
                onChange={handleEditChange}
                type="email"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={editData.phone}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={editData.address}
                onChange={handleEditChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Customer Segment"
                name="customer_segment"
                value={editData.customer_segment}
                onChange={handleEditChange}
              >
                <MenuItem value="">None</MenuItem>
                {segments.map((segment) => (
                  <MenuItem key={segment.segment_id} value={segment.segment_id}>
                    {segment.segment_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Loyalty Points"
                name="loyalty_points"
                value={editData.loyalty_points}
                onChange={handleEditChange}
                type="number"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={editData.notes}
                onChange={handleEditChange}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editData.marketing_consent}
                    onChange={handleEditChange}
                    name="marketing_consent"
                  />
                }
                label="Marketing Consent"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleUpdateCustomer} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Support Ticket Dialog */}
      <Dialog open={openNewTicketDialog} onClose={handleCloseNewTicketDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Support Ticket</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Create a new support ticket for this customer.
          </DialogContentText>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                name="subject"
                value={newTicket.subject}
                onChange={handleNewTicketChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={newTicket.description}
                onChange={handleNewTicketChange}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Related Order (Optional)"
                name="order_id"
                value={newTicket.order_id}
                onChange={handleNewTicketChange}
                placeholder="Enter order number"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Priority"
                name="priority"
                value={newTicket.priority}
                onChange={handleNewTicketChange}
              >
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="CRITICAL">Critical</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewTicketDialog}>Cancel</Button>
          <Button onClick={handleCreateTicket} variant="contained" color="primary">
            Create Ticket
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerDetails;