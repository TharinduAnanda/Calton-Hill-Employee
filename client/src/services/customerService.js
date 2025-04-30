import instance from '../utils/axiosConfig';

// Define the base API URL - will be combined with baseURL from axiosConfig
const API_URL = '/api/customers';

/**
 * Handle API errors consistently
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default error message
 * @throws {Error} Formatted error
 */
function handleApiError(error, defaultMessage = 'An error occurred') {
  console.error('Customer API Error:', error);
  throw new Error(
    error.response?.data?.message || error.message || defaultMessage
  );
}

/**
 * Get all customers with pagination and search
 * @param {Object} options - Query parameters
 * @returns {Promise<Object>} Response data
 */
async function getAllCustomers(options = {}) {
  try {
    const response = await instance.get(API_URL, { 
      params: {
        page: options.page || 1,
        limit: options.limit || 10,
        search: options.search || '',
        segment: options.segment || ''
      }
    });
    
    console.log('Customer data received:', response.data);
    
    // Return the data in a consistent structure
    return {
      success: true,
      customers: response.data.data,
      pagination: response.data.pagination,
      total: response.data.pagination?.total || response.data.data?.length || 0
    };
  } catch (error) {
    return {
      success: false,
      error: handleApiError(error, 'Failed to fetch customers')
    };
  }
}


/**
 * Get a specific customer by ID
 * @param {number|string} id - Customer ID
 * @returns {Promise<Object>} Response data
 */
async function getCustomerById(id) {
  try {
    const response = await instance.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, `Failed to fetch customer #${id}`);
  }
}

/**
 * Get all customer segments
 * @returns {Promise<Object>} Response data
 */
async function getAllCustomerSegments() {
  try {
    const response = await instance.get(`${API_URL}/segments/all`);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Failed to fetch customer segments');
  }
}

/**
 * Create a new customer
 * @param {Object} customerData - Customer data
 * @returns {Promise<Object>} Response data
 */
async function createCustomer(customerData) {
  try {
    const response = await instance.post(API_URL, customerData);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Failed to create customer');
  }
}

/**
 * Update an existing customer
 * @param {string} id - Customer ID
 * @param {Object} customerData - Customer data
 * @returns {Promise<Object>} Response data
 */
async function updateCustomer(id, customerData) {
  try {
    const response = await instance.put(`${API_URL}/${id}`, customerData);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Failed to update customer');
  }
}

/**
 * Delete a customer
 * @param {string} id - Customer ID
 * @returns {Promise<Object>} Response data
 */
async function deleteCustomer(id) {
  try {
    const response = await instance.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Failed to delete customer');
  }
}

const customerService = {
  getAllCustomers,
  getCustomerById,
  getAllCustomerSegments,
  createCustomer,
  updateCustomer,
  deleteCustomer
};

export {
  getAllCustomers,
  getCustomerById,
  getAllCustomerSegments,
  createCustomer,
  updateCustomer,
  deleteCustomer
};

export default customerService;