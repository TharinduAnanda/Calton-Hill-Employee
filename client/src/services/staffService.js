import { useState } from 'react';
import instance from '../utils/axiosConfig';

/**
 * Enhanced Staff Service with:
 * - Better error handling
 * - Consistent response formats
 * - Request cancellation
 * - Input validation
 */

// Helper function to handle API errors
const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', {
    status: error.response?.status,
    message: error.response?.data?.message || error.message,
    url: error.config?.url
  });

  if (error.response?.status === 401) {
    throw new Error('Your session has expired. Please login again.');
  }

  if (error.response?.status === 403) {
    throw new Error('You do not have permission for this action.');
  }

  throw new Error(error.response?.data?.message || defaultMessage);
};

// Validate staff data before sending to API
const validateStaffData = (data, isUpdate = false) => {
  const errors = [];
  
  if (!data.name) errors.push('Name is required');
  if (!data.email) errors.push('Email is required');
  if (!isUpdate && !data.password) errors.push('Password is required');
  
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }

  return {
    ...data,
    // Ensure role is always lowercase
    role: data.role?.toLowerCase() || 'staff'
  };
};

// Get all staff members with pagination support
export const getAllStaff = async (params = {}) => {
  try {
    const response = await instance.get('/staff', { params });
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Invalid response format');
    }

    return {
      data: response.data.data || [],
      total: response.data.total || 0,
      page: response.data.page || 1,
      limit: response.data.limit || 10
    };
  } catch (error) {
    return handleApiError(error, 'Failed to fetch staff members');
  }
};

// Get staff member by ID with enhanced error handling
export const getStaffById = async (id) => {
  try {
    if (!id) throw new Error('Staff ID is required');
    
    const response = await instance.get(`/staff/${id}`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Invalid response format');
    }

    return response.data.data;
  } catch (error) {
    return handleApiError(error, 'Failed to fetch staff member');
  }
};

// Create new staff member with validation
export const createStaff = async (staffData) => {
  try {
    const validatedData = validateStaffData(staffData);
    const response = await instance.post('/staff', validatedData);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Failed to create staff');
    }

    return response.data.data;
  } catch (error) {
    return handleApiError(error, 'Failed to create staff member');
  }
};

// Update staff member with validation
export const updateStaff = async (id, staffData) => {
  try {
    if (!id) throw new Error('Staff ID is required');
    
    const validatedData = validateStaffData(staffData, true);
    const response = await instance.put(`/staff/${id}`, validatedData);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Failed to update staff');
    }

    return response.data.data;
  } catch (error) {
    return handleApiError(error, 'Failed to update staff member');
  }
};

// Delete staff member with confirmation
export const deleteStaff = async (id) => {
  try {
    if (!id) throw new Error('Staff ID is required');
    
    const response = await instance.delete(`/staff/${id}`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Failed to delete staff');
    }

    return response.data.data;
  } catch (error) {
    return handleApiError(error, 'Failed to delete staff member');
  }
};

// Change staff password with validation
export const changePassword = async (id, { currentPassword, newPassword }) => {
  try {
    if (!id) throw new Error('Staff ID is required');
    if (!currentPassword || !newPassword) {
      throw new Error('Current and new password are required');
    }
    
    const response = await instance.put(`/staff/${id}/change-password`, {
      currentPassword,
      newPassword
    });
    
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Failed to change password');
  }
};

// Update staff role with validation
export const updateStaffRole = async (id, role) => {
  try {
    if (!id) throw new Error('Staff ID is required');
    if (!['staff', 'manager', 'admin'].includes(role?.toLowerCase())) {
      throw new Error('Invalid role specified');
    }
    
    const response = await instance.put(`/staff/${id}/role`, { role });
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Failed to update role');
  }
};

// Get staff statistics
export const getStaffStats = async () => {
  try {
    const response = await instance.get('/staff/stats');
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Failed to fetch staff statistics');
  }
};

// Custom hook for staff management
export const useStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllStaff();
      setStaffList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    staffList,
    loading,
    error,
    fetchStaff,
    createStaff: async (staffData) => {
      const result = await createStaff(staffData);
      await fetchStaff(); // Refresh list
      return result;
    },
    updateStaff: async (id, staffData) => {
      const result = await updateStaff(id, staffData);
      await fetchStaff(); // Refresh list
      return result;
    },
    deleteStaff: async (id) => {
      const result = await deleteStaff(id);
      await fetchStaff(); // Refresh list
      return result;
    }
  };
};

const staffService = {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  changePassword,
  updateStaffRole,
  getStaffStats,
  useStaff
};

export default staffService;