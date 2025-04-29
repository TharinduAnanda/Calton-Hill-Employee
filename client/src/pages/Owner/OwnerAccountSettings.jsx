import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Avatar,
  Container,
  Divider
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { updateOwnerAccount } from '../../services/ownerService';

const OwnerAccountSettings = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'owner@example.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate passwords match if changing password
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        throw new Error("New passwords don't match");
      }

      await updateOwnerAccount({
        name: formData.name,
        email: formData.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        avatar: avatar // You'd need to handle file upload properly in a real app
      });

      enqueueSnackbar('Account updated successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to update account', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h5" gutterBottom>
        Account Settings
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        {/* Profile Picture Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            src={avatar || '/default-avatar.png'}
            sx={{ width: 80, height: 80, mr: 3 }}
          />
          <Box>
            <Button
              variant="outlined"
              component="label"
              sx={{ mr: 2 }}
            >
              Upload New Photo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </Button>
            <Button
              variant="text"
              color="error"
              disabled={!avatar}
              onClick={() => setAvatar(null)}
            >
              Remove
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Recommended size: 200x200 pixels
            </Typography>
          </Box>
        </Box>

        {/* Basic Info Section */}
        <Typography variant="h6" gutterBottom>
          Basic Information
        </Typography>
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Password Section */}
        <Typography variant="h6" gutterBottom>
          Change Password
        </Typography>
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            label="Current Password"
            name="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="New Password"
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{ px: 4 }}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default OwnerAccountSettings;