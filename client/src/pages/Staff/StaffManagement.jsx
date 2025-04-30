import React, { useState} from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Tabs, 
  Tab,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import StaffList from './StaffList';
import StaffForm from './StaffForm';
import { 
  createStaff,
  updateStaff,
  deleteStaff
} from '../../services/staffService';

/**
 * Formats staff data for the form
 * @param {Object} staff - Staff data from API
 * @returns {Object|null} - Formatted staff data for form
 */
function formatStaffFormData(staff) {
  if (!staff) return null;
  
  return {
    First_Name: staff.first_name || '',
    Last_Name: staff.last_name || '',
    Email: staff.email || '',
    Phone_Number: staff.phone_number || '',
    Role: staff.role || 'staff',
    Password: '' // Empty for existing staff
  };
}

/**
 * Transforms form data to API format
 * @param {Object} formData - Form data from UI
 * @param {Object} selectedStaff - Currently selected staff (if editing)
 * @returns {Object} - API compatible staff data
 */
function transformFormDataToApiFormat(formData, selectedStaff) {
  // Transform form data to match API expectations
  const staffData = {
    first_name: formData.First_Name,
    last_name: formData.Last_Name,
    email: formData.Email,
    phone_number: formData.Phone_Number,
    role: formData.Role || 'staff'
  };

  // Add password only if provided and not empty
  if (formData.Password) {
    staffData.password = formData.Password;
  }
  
  return staffData;
}

/**
 * Handles form submission (create or update staff)
 * @param {Object} formData - Form data from UI
 * @param {Object} selectedStaff - Currently selected staff (if editing)
 * @param {Function} setNotification - State setter for notifications
 * @param {Function} setActiveTab - State setter for active tab
 * @param {Function} setRefreshList - State setter for refresh trigger
 * @param {Function} setLoading - State setter for loading state
 * @returns {Promise<void>}
 */
function handleFormSubmit(formData, selectedStaff, setNotification, setActiveTab, setRefreshList, setLoading) {
  if (!formData) {
    // Cancel was clicked
    setActiveTab('list');
    return Promise.resolve();
  }
  
  setLoading(true);
  const staffData = transformFormDataToApiFormat(formData, selectedStaff);
  
  let apiCall;
  let successMessage;
  
  if (selectedStaff) {
    // Update existing staff
    apiCall = updateStaff(selectedStaff.staff_id, staffData);
    successMessage = 'Staff updated successfully';
  } else {
    // Create new staff
    apiCall = createStaff(staffData);
    successMessage = 'Staff created successfully';
  }
  
  return apiCall
    .then(() => {
      setNotification({
        open: true,
        message: successMessage,
        severity: 'success'
      });
      
      // Switch back to list view and trigger refresh
      setActiveTab('list');
      setRefreshList(prev => !prev);
    })
    .catch(error => {
      console.error('Error submitting staff form:', error);
      setNotification({
        open: true,
        message: error.message || 'Failed to save staff member',
        severity: 'error'
      });
    })
    .finally(() => {
      setLoading(false);
    });
}

/**
 * Staff Management component
 */
function StaffManagement() {
  // State declarations
  const [activeTab, setActiveTab] = useState('list');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [refreshList, setRefreshList] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Handles staff selection for editing
   * @param {Object} staff - Selected staff member
   */
  function handleStaffSelection(staff) {
    setSelectedStaff(staff);
    setActiveTab('form');
  }

  /**
   * Handles adding a new staff
   */
  function handleAddNewStaff() {
    setSelectedStaff(null);
    setActiveTab('form');
  }

  /**
   * Handles form submission wrapper
   * @param {Object} formData - Form data from UI
   */
  function onFormSubmit(formData) {
    handleFormSubmit(
      formData, 
      selectedStaff, 
      setNotification, 
      setActiveTab, 
      setRefreshList,
      setLoading
    );
  }

  /**
   * Handles staff deletion
   * @param {string} staffId - ID of staff to delete
   */
  function handleDeleteStaff(staffId) {
    setLoading(true);
    deleteStaff(staffId)
      .then(() => {
        setNotification({
          open: true,
          message: 'Staff deleted successfully',
          severity: 'success'
        });
        setRefreshList(prev => !prev);
      })
      .catch(error => {
        setNotification({
          open: true,
          message: error.message || 'Failed to delete staff member',
          severity: 'error'
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }

  /**
   * Closes notification
   */
  function closeNotification() {
    setNotification({ ...notification, open: false });
  }

  // Render component
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4">Staff Management</Typography>
        {activeTab === 'list' && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddNewStaff}
            disabled={loading}
          >
            Add Staff
          </Button>
        )}
      </Box>
      
      <Tabs 
        value={activeTab} 
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Staff List" value="list" />
        <Tab label={selectedStaff ? 'Edit Staff' : 'Add Staff'} value="form" />
      </Tabs>
      
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}
      
      {!loading && activeTab === 'list' ? (
        <StaffList 
          onStaffSelect={handleStaffSelection} 
          refreshTrigger={refreshList}
          onDeleteStaff={handleDeleteStaff}
        />
      ) : !loading && (
        <StaffForm 
          initialData={formatStaffFormData(selectedStaff)} 
          onSubmit={onFormSubmit}
        />
      )}
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={closeNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default StaffManagement;