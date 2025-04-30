import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Warning as WarningIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format, isAfter, formatDistanceToNow } from 'date-fns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const BatchManagement = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [openNewBatchDialog, setOpenNewBatchDialog] = useState(false);
  const [openAdjustDialog, setOpenAdjustDialog] = useState(false);
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  
  const [newBatch, setNewBatch] = useState({
    product_id: productId,
    batch_number: '',
    quantity: '',
    cost_per_unit: '',
    manufactured_date: null,
    expiry_date: null,
    supplier_id: '',
    notes: ''
  });
  
  const [adjustment, setAdjustment] = useState({
    product_id: productId,
    batch_id: '',
    quantity_change: '',
    adjustment_reason: ''
  });
  
  const [settings, setSettings] = useState({
    reorder_level: '',
    optimal_level: '',
    bin_location: '',
    warehouse_zone: '',
    inventory_value_method: ''
  });
  
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchInventoryData();
    fetchSuppliers();
  }, [productId]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/inventory/product/${productId}/batches`);
      setInventoryData(response.data.data);
      
      // Set initial settings values
      if (response.data.data.inventory) {
        setSettings({
          reorder_level: response.data.data.inventory.reorder_level || '',
          optimal_level: response.data.data.inventory.optimal_level || '',
          bin_location: response.data.data.inventory.bin_location || '',
          warehouse_zone: response.data.data.inventory.warehouse_zone || '',
          inventory_value_method: response.data.data.inventory.inventory_value_method || 'FIFO'
        });
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching inventory data:', err);
      setError('Failed to fetch inventory data. Please try again.');
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get('/api/suppliers');
      setSuppliers(response.data);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };

  const handleNewBatchChange = (e) => {
    const { name, value } = e.target;
    setNewBatch({
      ...newBatch,
      [name]: value
    });
  };

  const handleNewBatchDateChange = (name, value) => {
    setNewBatch({
      ...newBatch,
      [name]: value
    });
  };

  const handleAdjustmentChange = (e) => {
    const { name, value } = e.target;
    setAdjustment({
      ...adjustment,
      [name]: value
    });
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value
    });
  };

  const validateNewBatch = () => {
    const errors = {};
    
    if (!newBatch.batch_number) errors.batch_number = 'Batch number is required';
    if (!newBatch.quantity) errors.quantity = 'Quantity is required';
    else if (isNaN(newBatch.quantity) || parseInt(newBatch.quantity) <= 0) {
      errors.quantity = 'Quantity must be a positive number';
    }
    
    if (!newBatch.cost_per_unit) errors.cost_per_unit = 'Cost per unit is required';
    else if (isNaN(newBatch.cost_per_unit) || parseFloat(newBatch.cost_per_unit) <= 0) {
      errors.cost_per_unit = 'Cost per unit must be a positive number';
    }
    
    if (newBatch.expiry_date && newBatch.manufactured_date) {
      if (isAfter(new Date(newBatch.manufactured_date), new Date(newBatch.expiry_date))) {
        errors.expiry_date = 'Expiry date cannot be before manufactured date';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAdjustment = () => {
    const errors = {};
    
    if (!adjustment.quantity_change) errors.quantity_change = 'Quantity change is required';
    else if (isNaN(adjustment.quantity_change)) {
      errors.quantity_change = 'Quantity change must be a number';
    }
    
    if (!adjustment.adjustment_reason) errors.adjustment_reason = 'Reason is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateNewBatch = async () => {
    if (!validateNewBatch()) return;
    
    try {
      await axios.post('/api/inventory/batch', newBatch);
      setOpenNewBatchDialog(false);
      setNewBatch({
        product_id: productId,
        batch_number: '',
        quantity: '',
        cost_per_unit: '',
        manufactured_date: null,
        expiry_date: null,
        supplier_id: '',
        notes: ''
      });
      fetchInventoryData(); // Refresh data
    } catch (err) {
      console.error('Error creating new batch:', err);
      alert('Failed to create new batch.');
    }
  };

  const handleAdjustInventory = async () => {
    if (!validateAdjustment()) return;
    
    try {
      await axios.post('/api/inventory/adjust', adjustment);
      setOpenAdjustDialog(false);
      setAdjustment({
        product_id: productId,
        batch_id: '',
        quantity_change: '',
        adjustment_reason: ''
      });
      fetchInventoryData(); // Refresh data
    } catch (err) {
      console.error('Error adjusting inventory:', err);
      alert(err.response?.data?.message || 'Failed to adjust inventory.');
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await axios.patch(`/api/inventory/settings/${productId}`, settings);
      setOpenSettingsDialog(false);
      fetchInventoryData(); // Refresh data
    } catch (err) {
      console.error('Error updating settings:', err);
      alert('Failed to update inventory settings.');
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
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchInventoryData}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (!inventoryData || !inventoryData.inventory) {
    return (
      <Box p={3}>
        <Alert severity="warning">Inventory data not found for this product.</Alert>
        <Button
          variant="outlined"
          onClick={() => navigate('/inventory')}
          sx={{ mt: 2 }}
        >
          Back to Inventory
        </Button>
      </Box>
    );
  }

  const { inventory, batches, auditHistory } = inventoryData;
  const product = inventory;
  
  // Calculate inventory values
  const totalBatchQuantity = batches.reduce((sum, batch) => sum + batch.quantity, 0);
  const totalBatchValue = batches.reduce((sum, batch) => sum + (batch.quantity * batch.cost_per_unit), 0);
  const averageCost = totalBatchQuantity > 0 ? totalBatchValue / totalBatchQuantity : 0;
  
  // Check for expiring batches
  const expiringBatches = batches.filter(
    batch => batch.expiry_date && 
    isAfter(new Date(batch.expiry_date), new Date()) && 
    isAfter(new Date(batch.expiry_date), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Batch Management</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setOpenSettingsDialog(true)}
            sx={{ mr: 1 }}
          >
            Inventory Settings
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenNewBatchDialog(true)}
          >
            Add New Batch
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Product Information Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">{product.product_name}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                SKU: {product.product_sku}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">Category:</Typography>
                <Typography variant="body2">{product.category}</Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">Current Stock:</Typography>
                <Chip 
                  label={product.Stock_Level} 
                  color={
                    product.Stock_Level <= 0 ? 'error' :
                    product.Stock_Level <= product.reorder_level ? 'warning' : 'success'
                  }
                  size="small"
                />
              </Box>
              
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">Reorder Level:</Typography>
                <Typography variant="body2">{product.reorder_level || 'Not set'}</Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">Optimal Level:</Typography>
                <Typography variant="body2">{product.optimal_level || 'Not set'}</Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">Location:</Typography>
                <Typography variant="body2">
                  {product.bin_location ? `${product.warehouse_zone || ''} - ${product.bin_location}` : 'Not specified'}
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">Valuation Method:</Typography>
                <Chip 
                  label={product.inventory_value_method || 'FIFO'} 
                  size="small"
                  variant="outlined"
                />
              </Box>
              
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">Last Updated:</Typography>
                <Typography variant="body2">
                  {product.Last_Updated ? format(new Date(product.Last_Updated), 'MMM dd, yyyy') : 'Never'}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box mb={1}>
                <Typography variant="subtitle2" gutterBottom>Inventory Valuation</Typography>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2" color="text.secondary">Average Cost:</Typography>
                  <Typography variant="body2">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(averageCost)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2" color="text.secondary">Total Value:</Typography>
                  <Typography variant="body2">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(totalBatchValue)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Retail Value:</Typography>
                  <Typography variant="body2">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(product.Stock_Level * product.Price)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Quick Actions</Typography>
              <Button 
                fullWidth 
                variant="outlined" 
                color="primary" 
                startIcon={<RefreshIcon />}
                onClick={() => setOpenAdjustDialog(true)}
                sx={{ mb: 1 }}
              >
                Adjust Inventory
              </Button>
              <Button 
                fullWidth 
                variant="outlined" 
                color="secondary" 
                startIcon={<HistoryIcon />}
                onClick={() => navigate(`/inventory/audit-log?productId=${productId}`)}
              >
                View Audit History
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Batches Table */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Batch/Lot Tracking</Typography>
              
              {expiringBatches.length > 0 && (
                <Tooltip title={`${expiringBatches.length} batches expiring soon`}>
                  <Chip
                    icon={<WarningIcon />}
                    label={`${expiringBatches.length} Expiring`}
                    color="warning"
                    size="small"
                  />
                </Tooltip>
              )}
            </Box>
            
            {batches.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                No batches found for this product. Add a batch to start tracking.
              </Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Batch Number</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Cost/Unit</TableCell>
                      <TableCell>Received Date</TableCell>
                      <TableCell>Expiry Date</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {batches.map((batch) => (
                      <TableRow key={batch.batch_id}>
                        <TableCell>{batch.batch_number}</TableCell>
                        <TableCell>{batch.quantity}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                          }).format(batch.cost_per_unit)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(batch.received_date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          {batch.expiry_date ? (
                            <>
                              {format(new Date(batch.expiry_date), 'MMM dd, yyyy')}
                              {isAfter(new Date(), new Date(batch.expiry_date)) && (
                                <Chip size="small" label="Expired" color="error" sx={{ ml: 1 }} />
                              )}
                              {!isAfter(new Date(), new Date(batch.expiry_date)) && 
                               isAfter(new Date(batch.expiry_date), new Date()) && 
                               !isAfter(new Date(batch.expiry_date), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) && (
                                <Chip 
                                  size="small" 
                                  label={`Expires in ${formatDistanceToNow(new Date(batch.expiry_date))}`} 
                                  color="warning" 
                                  sx={{ ml: 1 }} 
                                />
                              )}
                            </>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                          }).format(batch.quantity * batch.cost_per_unit)}
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              setAdjustment({
                                ...adjustment,
                                batch_id: batch.batch_id
                              });
                              setOpenAdjustDialog(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>Recent Audit History</Typography>
            {auditHistory.length === 0 ? (
              <Alert severity="info">No audit history available.</Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Change</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Adjusted By</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {auditHistory.map((entry) => (
                      <TableRow key={entry.audit_id}>
                        <TableCell>
                          {format(new Date(entry.adjusted_at), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          {entry.previous_quantity} → {entry.new_quantity}
                          <Typography variant="caption" display="block" color="text.secondary">
                            {entry.new_quantity > entry.previous_quantity ? '+' : ''}
                            {entry.new_quantity - entry.previous_quantity} units
                          </Typography>
                        </TableCell>
                        <TableCell>{entry.adjustment_reason}</TableCell>
                        <TableCell>{entry.adjusted_by_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      
            {/* New Batch Dialog */}
      <Dialog open={openNewBatchDialog} onClose={() => setOpenNewBatchDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Inventory Batch</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Batch Number"
                name="batch_number"
                value={newBatch.batch_number}
                onChange={handleNewBatchChange}
                error={!!validationErrors.batch_number}
                helperText={validationErrors.batch_number}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={newBatch.quantity}
                onChange={handleNewBatchChange}
                error={!!validationErrors.quantity}
                helperText={validationErrors.quantity}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cost Per Unit"
                name="cost_per_unit"
                type="number"
                inputProps={{ step: "0.01" }}
                value={newBatch.cost_per_unit}
                onChange={handleNewBatchChange}
                error={!!validationErrors.cost_per_unit}
                helperText={validationErrors.cost_per_unit}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Supplier</InputLabel>
                <Select
                  name="supplier_id"
                  value={newBatch.supplier_id}
                  onChange={handleNewBatchChange}
                  label="Supplier"
                >
                  <MenuItem value="">None</MenuItem>
                  {suppliers.map(supplier => (
                    <MenuItem key={supplier.Supplier_ID} value={supplier.Supplier_ID}>
                      {supplier.Name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Manufactured Date"
                  value={newBatch.manufactured_date}
                  onChange={(date) => handleNewBatchDateChange('manufactured_date', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Expiry Date"
                  value={newBatch.expiry_date}
                  onChange={(date) => handleNewBatchDateChange('expiry_date', date)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      error={!!validationErrors.expiry_date}
                      helperText={validationErrors.expiry_date}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={newBatch.notes}
                onChange={handleNewBatchChange}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewBatchDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateNewBatch} variant="contained" color="primary">
            Create Batch
          </Button>
        </DialogActions>
      </Dialog>

      {/* Adjust Inventory Dialog */}
      <Dialog open={openAdjustDialog} onClose={() => setOpenAdjustDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {adjustment.batch_id ? 'Adjust Batch Quantity' : 'Adjust Inventory Quantity'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {!adjustment.batch_id && batches.length > 0 && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Batch</InputLabel>
                  <Select
                    name="batch_id"
                    value={adjustment.batch_id}
                    onChange={handleAdjustmentChange}
                    label="Batch"
                  >
                    <MenuItem value="">All Inventory (No Specific Batch)</MenuItem>
                    {batches.map(batch => (
                      <MenuItem key={batch.batch_id} value={batch.batch_id}>
                        {batch.batch_number} ({batch.quantity} units)
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    Select a specific batch or adjust overall inventory
                  </FormHelperText>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quantity Change"
                name="quantity_change"
                type="number"
                value={adjustment.quantity_change}
                onChange={handleAdjustmentChange}
                error={!!validationErrors.quantity_change}
                helperText={
                  validationErrors.quantity_change ||
                  "Enter positive number to increase, negative to decrease"
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adjustment Reason"
                name="adjustment_reason"
                value={adjustment.adjustment_reason}
                onChange={handleAdjustmentChange}
                error={!!validationErrors.adjustment_reason}
                helperText={validationErrors.adjustment_reason}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdjustDialog(false)}>Cancel</Button>
          <Button onClick={handleAdjustInventory} variant="contained" color="primary">
            Submit Adjustment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Inventory Settings Dialog */}
      <Dialog open={openSettingsDialog} onClose={() => setOpenSettingsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Inventory Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Reorder Level"
                name="reorder_level"
                type="number"
                value={settings.reorder_level}
                onChange={handleSettingsChange}
                helperText="Minimum stock level before reordering"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Optimal Level"
                name="optimal_level"
                type="number"
                value={settings.optimal_level}
                onChange={handleSettingsChange}
                helperText="Target stock level"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bin Location"
                name="bin_location"
                value={settings.bin_location}
                onChange={handleSettingsChange}
                helperText="Storage bin identifier"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Warehouse Zone"
                name="warehouse_zone"
                value={settings.warehouse_zone}
                onChange={handleSettingsChange}
                helperText="Storage area in warehouse"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Inventory Valuation Method</InputLabel>
                <Select
                  name="inventory_value_method"
                  value={settings.inventory_value_method}
                  onChange={handleSettingsChange}
                  label="Inventory Valuation Method"
                >
                  <MenuItem value="FIFO">FIFO (First In, First Out)</MenuItem>
                  <MenuItem value="LIFO">LIFO (Last In, First Out)</MenuItem>
                  <MenuItem value="AVERAGE">Average Cost</MenuItem>
                </Select>
                <FormHelperText>
                  Method used for calculating inventory value
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettingsDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateSettings} variant="contained" color="primary">
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BatchManagement;