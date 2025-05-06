import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip
} from '@mui/material';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { getAllStaff } from '../../services/staffService';

/**
 * Fetch staff members from the API
 * @param {Function} setStaffMembers - Function to set staff state
 * @param {Function} setLoading - Function to set loading state
 * @param {Function} setError - Function to set error state
 */
function fetchStaffMembers(setStaffMembers, setLoading, setError) {
  setLoading(true);
  
  getAllStaff()
    .then(response => {
      // Log the full response for debugging
      console.log('Staff API response:', response);
      
      // Check if we have the expected structure
      if (response) {
        // Handle different response structures
        let staffData = [];
        if (response.data && response.data.staff) {
          // Format: { data: { staff: [...] } }
          staffData = response.data.staff;
        } else if (response.data && Array.isArray(response.data)) {
          // Format: { data: [...] }
          staffData = response.data;
        } else if (Array.isArray(response)) {
          // Format: [...]
          staffData = response;
        }
        
        console.log('Extracted staff data:', staffData);
        setStaffMembers(staffData);
        setError(null);
      } else {
        console.warn('Empty response from server');
        setStaffMembers([]);
        setError('No data received from server');
      }
    })
    .catch(err => {
      console.error('Error fetching staff:', err);
      setStaffMembers([]);
      setError('Failed to fetch staff members: ' + err.message);
    })
    .finally(() => {
      setLoading(false);
    });
}

/**
 * StaffList component displays a table of staff members
 * @param {Object} props - Component props
 * @param {Function} props.onStaffSelect - Handler for staff selection
 * @param {boolean} props.refreshTrigger - Trigger to refresh staff list
 * @param {Function} props.onDeleteStaff - Handler for staff deletion
 * @param {string} props.roleFilter - Filter staff by role
 * @param {Function} props.roleSortFunction - Function to sort staff by role seniority
 */
function StaffList({ onStaffSelect, refreshTrigger, onDeleteStaff, roleFilter = 'all', roleSortFunction }) {
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

  // Fetch staff whenever the component loads or refreshTrigger changes
  useEffect(() => {
    fetchStaffMembers(setStaffMembers, setLoading, setError);
  }, [refreshTrigger]); 

  // Filter and sort staff by role
  const filteredStaff = useMemo(() => {
    // First filter by role if needed
    const filtered = roleFilter === 'all' 
      ? [...staffMembers]
      : staffMembers.filter(staff => 
          (staff.role || staff.Role || '').toLowerCase() === roleFilter.toLowerCase()
        );
    
    // Then sort by role seniority if showing all roles and roleSortFunction exists
    if (roleFilter === 'all' && typeof roleSortFunction === 'function') {
      return filtered.sort((a, b) => {
        const roleA = a.role || a.Role || 'staff';
        const roleB = b.role || b.Role || 'staff';
        return roleSortFunction(roleB) - roleSortFunction(roleA); // Higher priority first
      });
    }
    
    return filtered;
  }, [staffMembers, roleFilter, roleSortFunction]);

  /**
   * Opens delete confirmation dialog
   * @param {Object} staff - Staff to delete
   * @param {Event} e - Click event
   */
  function handleDeleteClick(staff, e) {
    e.stopPropagation();
    setStaffToDelete(staff);
    setConfirmDeleteOpen(true);
  }

  /**
   * Confirms staff deletion
   */
  function confirmDelete() {
    if (staffToDelete && onDeleteStaff) {
      onDeleteStaff(staffToDelete.staff_id || staffToDelete.id);
    }
    setConfirmDeleteOpen(false);
    setStaffToDelete(null);
  }

  /**
   * Cancels staff deletion
   */
  function cancelDelete() {
    setConfirmDeleteOpen(false);
    setStaffToDelete(null);
  }

  /**
   * Get style for role badge
   * @param {string} role - Role of the staff member
   * @returns {Object} - Style object for the badge
   */
  function getRoleBadgeStyle(role) {
    switch (role?.toLowerCase()) {
      
      case 'manager':
        return { bgcolor: '#2196f3', color: 'white' };
      case 'staff':
        return { bgcolor: '#4caf50', color: 'white' };
      default:
        return { bgcolor: '#757575', color: 'white' };
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStaff.length > 0 ? (
              filteredStaff.map((staff) => (
                <TableRow key={staff.staff_id || staff.id || staff._id}>
                  <TableCell>
                    {staff.name || `${staff.first_name || staff.First_Name} ${staff.last_name || staff.Last_Name}`}
                  </TableCell>
                  <TableCell>{staff.email || staff.Email}</TableCell>
                  <TableCell>{staff.phone_number || staff.Phone_Number || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={staff.role || staff.Role} 
                      size="small"
                      sx={getRoleBadgeStyle(staff.role || staff.Role)}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit Staff">
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          console.log('Editing staff member:', staff);
                          onStaffSelect(staff);
                        }}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {onDeleteStaff && (
                      <Tooltip title="Delete Staff">
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleDeleteClick(staff, e)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {staffMembers.length > 0 ? 
                    `No staff members found with role: ${roleFilter}` :
                    'No staff members found'
                  }
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={cancelDelete}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {staffToDelete ? 
              (staffToDelete.name || 
               `${staffToDelete.first_name || staffToDelete.First_Name} ${staffToDelete.last_name || staffToDelete.Last_Name}`) : 
              'this staff member'}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

StaffList.propTypes = {
  onStaffSelect: PropTypes.func.isRequired,
  refreshTrigger: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  onDeleteStaff: PropTypes.func,
  roleFilter: PropTypes.string,
  roleSortFunction: PropTypes.func
};

export default StaffList;