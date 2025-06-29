import React, { useState } from 'react';
import { 
  Box, Typography, TextField, Button, FormControl,
  InputLabel, MenuItem, Select, Alert, CircularProgress 
} from '@mui/material';
import inventoryService from '../../services/inventoryService';

const StockAdjustment = ({ productId, productName, onComplete, onCancel }) => {
  const [adjustment, setAdjustment] = useState({
    quantity_change: '',
    adjustment_reason: 'Manual adjustment'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdjustment(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!adjustment.quantity_change) {
      setError('Quantity change is required');
      return;
    }
    
    try {
      setLoading(true);
      // Use the inventory service to adjust quantity
      await inventoryService.adjustInventoryQuantity(productId, adjustment);
      if (onComplete) onComplete();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <TextField
        fullWidth
        label="Quantity Change"
        name="quantity_change"
        type="number"
        value={adjustment.quantity_change}
        onChange={handleChange}
        helperText="Use positive values to add stock, negative to remove"
        sx={{ mb: 2 }}
        required
      />
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Reason</InputLabel>
        <Select
          name="adjustment_reason"
          value={adjustment.adjustment_reason}
          onChange={handleChange}
          label="Reason"
        >
          <MenuItem value="Manual adjustment">Manual adjustment</MenuItem>
          <MenuItem value="Stock count correction">Stock count correction</MenuItem>
          <MenuItem value="Damaged items">Damaged items</MenuItem>
          <MenuItem value="Returned items">Returned items</MenuItem>
          <MenuItem value="Promotional giveaway">Promotional giveaway</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </Select>
      </FormControl>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        {onCancel && <Button onClick={onCancel}>Cancel</Button>}
        <Button 
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </Box>
    </Box>
  );
};

export default StockAdjustment;