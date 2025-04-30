import React, { useState, useEffect } from 'react';
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
  DialogActions
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
      const staffData = response.data || [];
      console.log('Staff data:', staffData); // Debugging
      setStaffMembers(Array.isArray(staffData) ? staffData : []);
      setError(null);
    })
    .catch(err => {
      console.error('Error fetching staff:', err);
      // Check if this is the "No staff found" error
      if (err.message === 'No staff found for this owner') {
        // This is not a true error - just means empty list
        setStaffMembers([]);
        setError(null);
      } else {
        // This is a real error
        setError('Failed to fetch staff members');
      }
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
 */
function StaffList({ onStaffSelect, refreshTrigger, onDeleteStaff }) {
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

  // Fetch staff whenever the component loads or refreshTrigger changes
  useEffect(() => {
    fetchStaffMembers(setStaffMembers, setLoading, setError);
  }, [refreshTrigger]); 

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
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staffMembers.length > 0 ? (
              staffMembers.map((staff) => (
                <TableRow key={staff.staff_id || staff.id || staff._id}>
                  <TableCell>
                    {staff.name || `${staff.first_name || staff.First_Name} ${staff.last_name || staff.Last_Name}`}
                  </TableCell>
                  <TableCell>{staff.email || staff.Email}</TableCell>
                  <TableCell>{staff.role || staff.Role}</TableCell>
                  <TableCell>
                    <Tooltip title="Edit Staff">
                      <IconButton 
                        size="small" 
                        onClick={() => onStaffSelect(staff)}
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
                <TableCell colSpan={4} align="center">
                  No staff members found
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
  onDeleteStaff: PropTypes.func
};

export default StaffList;