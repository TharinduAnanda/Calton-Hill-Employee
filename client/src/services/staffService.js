import instance from '../utils/axiosConfig';
import { useState } from 'react';

/**
 * Handle API errors consistently
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default error message
 * @throws {Error} Formatted error
 */
function handleApiError(error, defaultMessage = 'An error occurred') {
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
}

/**
 * Validate staff data before sending to API
 * @param {Object} data - The staff data to validate
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} Normalized staff data
 */
function validateStaffData(data, isUpdate = false) {
  const errors = [];
  
  // Check required fields
  if (!data.first_name && !data.First_Name && !isUpdate) {
    errors.push('First name is required');
  }
  
  if (!data.last_name && !data.Last_Name && !isUpdate) {
    errors.push('Last name is required');
  }
  
  if (!data.email && !data.Email && !isUpdate) {
    errors.push('Email is required');
  }
  
  if (!isUpdate && !data.password && !data.Password) {
    errors.push('Password is required');
  }
  
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }

  // Transform data to ensure consistent format
  return {
    first_name: data.first_name || data.First_Name,
    last_name: data.last_name || data.Last_Name,
    email: data.email || data.Email,
    phone_number: data.phone_number || data.Phone_Number || null,
    password: data.password || data.Password,
    role: (data.role || data.Role || 'staff').toLowerCase(),
    address: data.address || null
  };
}

/**
 * Create a new staff member
 * @param {Object} staffData - Staff data to create
 * @returns {Promise<Object>} Created staff data
 */
function createStaff(staffData) {
  try {
    // Use validateStaffData to validate and normalize input
    const validatedData = validateStaffData(staffData);
    
    return instance.post('/api/staff', validatedData)
      .then(response => {
        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Failed to create staff');
        }
        
        return response.data.data;
      })
      .catch(error => {
        return handleApiError(error, 'Failed to create staff member');
      });
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Update an existing staff member
 * @param {string} staffId - ID of staff to update
 * @param {Object} staffData - Staff data to update
 * @returns {Promise<Object>} Updated staff data
 */
function updateStaff(staffId, staffData) {
  try {
    // Validate with isUpdate=true to make password optional
    const validatedData = validateStaffData(staffData, true);
    
    return instance.put(`/api/staff/${staffId}`, validatedData)
      .then(response => {
        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Failed to update staff');
        }
        
        return response.data.data;
      })
      .catch(error => {
        return handleApiError(error, 'Failed to update staff member');
      });
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Get all staff with pagination
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Staff list and pagination data
 */
function getAllStaff(page = 1, limit = 10) {
  return instance.get(`/api/staff?page=${page}&limit=${limit}`)
    .then(response => {
      // Add detailed debugging
      console.log('Raw API response:', JSON.stringify(response.data));
      
      if (!response.data?.success) {
        console.warn('API returned unsuccessful response:', response.data);
        return { data: [], total: 0, page, limit };
      }
      
      // Handle different response structures
      let staffData = [];
      let totalCount = 0;
      
      if (response.data.data && response.data.data.staff) {
        // Standard format
        staffData = response.data.data.staff;
        totalCount = response.data.data.total || 0;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // Alternative format
        staffData = response.data.data;
        totalCount = response.data.total || 0;
      }
      
      console.log('Extracted staff data:', staffData);
      
      return {
        data: staffData,
        total: totalCount,
        page,
        limit
      };
    })
    .catch(error => {
      return handleApiError(error, 'Failed to fetch staff list');
    });
}

/**
 * Get a specific staff member by ID
 * @param {string} staffId - ID of staff to retrieve
 * @returns {Promise<Object>} Staff data
 */
function getStaffById(staffId) {
  if (!staffId) {
    return Promise.reject(new Error('Staff ID is required'));
  }
  
  return instance.get(`/api/staff/${staffId}`)
    .then(response => {
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch staff details');
      }
      
      return response.data.data;
    })
    .catch(error => {
      return handleApiError(error, 'Failed to fetch staff details');
    });
}

/**
 * Delete a staff member
 * @param {string} staffId - ID of staff to delete
 * @returns {Promise<Object>} Result of deletion
 */
function deleteStaff(staffId) {
  if (!staffId) {
    return Promise.reject(new Error('Staff ID is required'));
  }
  
  return instance.delete(`/api/staff/${staffId}`)
    .then(response => {
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to delete staff member');
      }
      
      return response.data.data;
    })
    .catch(error => {
      return handleApiError(error, 'Failed to delete staff member');
    });
}

/**
 * Custom hook for staff management
 * @returns {Object} Staff management functions and state
 */
function useStaff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  function fetchStaff(page = 1, limit = 10) {
    setLoading(true);
    setError(null);
    
    return getAllStaff(page, limit)
      .then(result => {
        setStaffList(result.data);
        setPagination({
          page: result.page,
          limit: result.limit,
          total: result.total
        });
        return result;
      })
      .catch(err => {
        setError(err.message);
        throw err;
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return {
    staffList,
    loading,
    error,
    pagination,
    fetchStaff,
    createStaff: async (staffData) => {
      try {
        const result = await createStaff(staffData);
        await fetchStaff(pagination.page, pagination.limit);
        return result;
      } catch (error) {
        setError(error.message);
        throw error;
      }
    },
    updateStaff: async (id, staffData) => {
      try {
        const result = await updateStaff(id, staffData);
        await fetchStaff(pagination.page, pagination.limit);
        return result;
      } catch (error) {
        setError(error.message);
        throw error;
      }
    },
    deleteStaff: async (id) => {
      try {
        const result = await deleteStaff(id);
        await fetchStaff(pagination.page, pagination.limit);
        return result;
      } catch (error) {
        setError(error.message);
        throw error;
      }
    },
    resetError: () => setError(null)
  };
}

// Create a named object for the staff service
const staffService = {
  createStaff,
  updateStaff,
  getAllStaff,
  getStaffById,
  deleteStaff,
  validateStaffData,
  handleApiError
};

// Export individual functions for direct use
export {
  createStaff,
  updateStaff,
  getAllStaff,
  getStaffById,
  deleteStaff,
  useStaff,
  validateStaffData,
  handleApiError
};

// Export the named service object as default
export default staffService;