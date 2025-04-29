import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Container, Paper } from '@mui/material';
import { getStoreSettings, updateStoreSettings } from '../../services/storeService';

const StoreSettings = () => {
  const [settings, setSettings] = useState({
    storeName: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    taxRate: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getStoreSettings();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateStoreSettings(settings);
      alert('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings');
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Store Settings
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Store Name"
            name="storeName"
            value={settings.storeName}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Address"
            name="address"
            value={settings.address}
            onChange={handleChange}
            multiline
            rows={4}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Contact Email"
            name="contactEmail"
            type="email"
            value={settings.contactEmail}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Contact Phone"
            name="contactPhone"
            value={settings.contactPhone}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Tax Rate (%)"
            name="taxRate"
            type="number"
            value={settings.taxRate}
            onChange={handleChange}
            inputProps={{ min: 0, max: 100, step: 0.01 }}
          />
          <Box sx={{ mt: 3 }}>
            <Button type="submit" variant="contained" size="large">
              Save Settings
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default StoreSettings;