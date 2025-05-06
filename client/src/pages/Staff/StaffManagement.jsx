import React, { useState} from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  Paper,
  TableCell,
  Chip
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
 * Staff Management component
 */
function StaffManagement() {
  // State declarations
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [refreshList, setRefreshList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  
  /**
   * Formats staff data for the form
   * @param {Object} staff - Staff data from API
   * @returns {Object|null} - Formatted staff data for form
   */
  function formatStaffFormData(staff) {
    if (!staff) return null;
    
    return {
      First_Name: staff.first_name || staff.First_Name || '',
      Last_Name: staff.last_name || staff.Last_Name || '',
      Email: staff.email || staff.Email || '',
      Phone_Number: staff.phone_number || staff.Phone_Number || '',
      Role: (staff.role || staff.Role || 'staff').toLowerCase(),
      Password: '' // Empty for existing staff
    };
  }
  
  /**
   * Transforms form data to API format
   * @param {Object} formData - Form data from UI
   * @returns {Object} - API compatible staff data
   */
  function transformFormDataToApiFormat(formData) {
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
   * Gets priority value for role-based sorting
   * @param {string} role - Staff role
   * @returns {number} - Priority value (higher = more senior)
   */
  function getRolePriority(role) {
    const rolePriority = {
      'admin': 3,
      'manager': 2,
      'staff': 1
    };
    
    return rolePriority[role?.toLowerCase()] || 0;
  }

  /**
   * Helper function to get role color
   * @param {string} role - Staff role
   * @returns {string} - Color code for the role
   */


  /**
   * Handles staff selection for editing
   * @param {Object} staff - Selected staff member
   */
  function handleStaffSelection(staff) {
    setSelectedStaff(staff);
    setFormDialogOpen(true);
  }

  /**
   * Handles adding a new staff
   */
  function handleAddNewStaff() {
    setSelectedStaff(null);
    setFormDialogOpen(true);
  }

  /**
   * Handles form submission
   * @param {Object} formData - Form data from UI
   */
  function handleFormSubmit(formData) {
    if (!formData) {
      // Cancel was clicked
      setFormDialogOpen(false);
      return;
    }
    
    setLoading(true);
    const staffData = transformFormDataToApiFormat(formData);
    
    let apiCall;
    let successMessage;
    
    if (selectedStaff) {
      // Update existing staff
      const staffId = selectedStaff.staff_id || selectedStaff.id;
      apiCall = updateStaff(staffId, staffData);
      successMessage = 'Staff updated successfully';
    } else {
      // Create new staff
      apiCall = createStaff(staffData);
      successMessage = 'Staff created successfully';
    }
    
    apiCall
      .then(() => {
        setNotification({
          open: true,
          message: successMessage,
          severity: 'success'
        });
        
        setFormDialogOpen(false);
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

  /**
   * Closes form dialog
   */
  function handleCloseDialog() {
    setFormDialogOpen(false);
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
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddNewStaff}
          disabled={loading}
        >
          Add Staff
        </Button>
      </Box>
      
      {/* Role filter for staff list */}
      <Box sx={{ mb: 3 }}>
        <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Role</InputLabel>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              label="Filter by Role"
            >
              <MenuItem value="all">All Roles</MenuItem>
               
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="staff">Staff</MenuItem>
            </Select>
          </FormControl>
        </Paper>
      </Box>
      
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}
      
      <StaffList 
        onStaffSelect={handleStaffSelection} 
        refreshTrigger={refreshList}
        onDeleteStaff={handleDeleteStaff}
        roleFilter={roleFilter}
        roleSortFunction={getRolePriority}
      />
      
      {/* Staff Form Dialog */}
      <Dialog 
        open={formDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <StaffForm 
          initialData={formatStaffFormData(selectedStaff)} 
          onSubmit={handleFormSubmit}
          title={selectedStaff ? "Edit Staff Member" : "Add New Staff Member"}
        />
      </Dialog>
      
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