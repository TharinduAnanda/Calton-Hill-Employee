import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Staff Form component for creating or editing staff members
 * @param {Object} props - Component props
 * @param {Object} props.initialData - Initial form data
 * @param {Function} props.onSubmit - Form submission handler
 */
function StaffForm({ initialData, onSubmit }) {
  const isEditMode = Boolean(initialData?.Email);
  
  const [formData, setFormData] = useState({
    First_Name: initialData?.First_Name || '',
    Last_Name: initialData?.Last_Name || '',
    Email: initialData?.Email || '',
    Phone_Number: initialData?.Phone_Number || '',
    Role: initialData?.Role || 'staff',
    Password: '',
    ConfirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  
  /**
   * Handles form field changes
   * @param {Event} e - Change event
   */
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }
  
  /**
   * Validates the form
   * @returns {boolean} - Whether the form is valid
   */
  function validateForm() {
    const newErrors = {};
    
    if (!formData.First_Name.trim()) {
      newErrors.First_Name = 'First name is required';
    }
    
    if (!formData.Last_Name.trim()) {
      newErrors.Last_Name = 'Last name is required';
    }
    
    if (!formData.Email.trim()) {
      newErrors.Email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.Email)) {
      newErrors.Email = 'Email is invalid';
    }
    
    // Phone validation (optional)
    if (formData.Phone_Number && !/^[0-9+\s()-]{10,15}$/.test(formData.Phone_Number)) {
      newErrors.Phone_Number = 'Phone number is invalid';
    }
    
    // Password validation for new staff
    if (!isEditMode) {
      if (!formData.Password) {
        newErrors.Password = 'Password is required for new staff';
      } else if (formData.Password.length < 8) {
        newErrors.Password = 'Password must be at least 8 characters';
      }
      
      if (formData.Password !== formData.ConfirmPassword) {
        newErrors.ConfirmPassword = 'Passwords do not match';
      }
    } else if (formData.Password && formData.Password.length < 8) {
      newErrors.Password = 'Password must be at least 8 characters';
    } else if (formData.Password && formData.Password !== formData.ConfirmPassword) {
      newErrors.ConfirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }
  
  /**
   * Handles form submission
   * @param {Event} e - Form submit event
   */
  function handleSubmit(e) {
    e.preventDefault();
    
    if (validateForm()) {
      // Remove confirm password before submitting
      const { ConfirmPassword, ...dataToSubmit } = formData;
      onSubmit(dataToSubmit);
    }
  }
  
  /**
   * Handles form cancellation
   */
  function handleCancel() {
    onSubmit(null);
  }
  
  return (
    <Paper elevation={1} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        {isEditMode ? 'Edit Staff Member' : 'Add New Staff Member'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              name="First_Name"
              value={formData.First_Name}
              onChange={handleChange}
              margin="normal"
              error={Boolean(errors.First_Name)}
              helperText={errors.First_Name}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              name="Last_Name"
              value={formData.Last_Name}
              onChange={handleChange}
              margin="normal"
              error={Boolean(errors.Last_Name)}
              helperText={errors.Last_Name}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              name="Email"
              type="email"
              value={formData.Email}
              onChange={handleChange}
              margin="normal"
              error={Boolean(errors.Email)}
              helperText={errors.Email}
              required
              disabled={isEditMode} // Cannot change email in edit mode
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              name="Phone_Number"
              value={formData.Phone_Number}
              onChange={handleChange}
              margin="normal"
              error={Boolean(errors.Phone_Number)}
              helperText={errors.Phone_Number}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl 
              fullWidth 
              margin="normal"
            >
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                name="Role"
                value={formData.Role}
                onChange={handleChange}
                label="Role"
              >
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="owner">Owner</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={isEditMode ? "New Password (leave blank to keep current)" : "Password"}
              name="Password"
              type="password"
              value={formData.Password}
              onChange={handleChange}
              margin="normal"
              error={Boolean(errors.Password)}
              helperText={errors.Password}
              required={!isEditMode}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Confirm Password"
              name="ConfirmPassword"
              type="password"
              value={formData.ConfirmPassword}
              onChange={handleChange}
              margin="normal"
              error={Boolean(errors.ConfirmPassword)}
              helperText={errors.ConfirmPassword}
              required={!isEditMode || Boolean(formData.Password)}
            />
          </Grid>
          <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              type="button"
              variant="outlined"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="contained"
              color="primary"
            >
              {isEditMode ? 'Update' : 'Create'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}

StaffForm.propTypes = {
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired
};

export default StaffForm;