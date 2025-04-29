import React from 'react';
import { TextField, Button, Box, MenuItem } from '@mui/material';
import PropTypes from 'prop-types'; // Add PropTypes for better type checking

const StaffForm = ({ onSubmit = () => {}, initialData = null }) => {
  const defaultFormData = {
    First_Name: '',
    Last_Name: '',
    Email: '',
    Phone_Number: '',
    Role: 'staff',
    Password: ''
  };

  const [formData, setFormData] = React.useState(() => 
    initialData ? {
      ...defaultFormData,
      ...initialData,
      Password: '' // Clear password when editing
    } : defaultFormData
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Basic validation
    if (!formData.First_Name || !formData.Last_Name || !formData.Email) {
      return;
    }
    onSubmit(formData);
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ 
        mt: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2 
      }}
    >
      <TextField
        fullWidth
        margin="normal"
        label="First Name"
        name="First_Name"
        value={formData.First_Name || ''}
        onChange={handleChange}
        required
      />
      <TextField
        fullWidth
        margin="normal"
        label="Last Name"
        name="Last_Name"
        value={formData.Last_Name || ''}
        onChange={handleChange}
        required
      />
      <TextField
        fullWidth
        margin="normal"
        label="Email"
        name="Email"
        type="email"
        value={formData.Email || ''}
        onChange={handleChange}
        required
      />
      <TextField
        fullWidth
        margin="normal"
        label="Phone Number"
        name="Phone_Number"
        value={formData.Phone_Number || ''}
        onChange={handleChange}
      />
      <TextField
        select
        fullWidth
        margin="normal"
        label="Role"
        name="Role"
        value={formData.Role || 'staff'}
        onChange={handleChange}
      >
        <MenuItem value="staff">Staff</MenuItem>
        <MenuItem value="manager">Manager</MenuItem>
      </TextField>
      <TextField
        fullWidth
        margin="normal"
        label="Password"
        name="Password"
        type="password"
        value={formData.Password || ''}
        onChange={handleChange}
        required={!initialData}
      />
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button 
          variant="outlined" 
          onClick={(e) => {
            e.preventDefault();
            onSubmit(null);
          }}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained"
          disabled={!formData.First_Name || !formData.Last_Name || !formData.Email}
        >
          {initialData ? 'Update' : 'Create'}
        </Button>
      </Box>
    </Box>
  );
};

// Add PropTypes
StaffForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    First_Name: PropTypes.string,
    Last_Name: PropTypes.string,
    Email: PropTypes.string,
    Phone_Number: PropTypes.string,
    Role: PropTypes.oneOf(['staff', 'manager'])
  })
};

export default StaffForm;