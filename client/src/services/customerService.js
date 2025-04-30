// src/services/customerService.js
import axios from 'axios';

// Define the base URL for the API
const API_URL = '/api/customers';

/**
 * Handle API errors consistently
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default message
 * @throws {Error} Formatted error
 */
function handleApiError(error, defaultMessage) {
  console.error('Customer API Error:', error);
  throw error.response?.data || { message: defaultMessage };
}

/**
 * Get all customers with pagination and search
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.search - Search term
 * @returns {Promise<Object>} Response data
 */
function getAllCustomers(options = {}) {
  const { page = 1, limit = 10, search = '', segment = '' } = options;
  
  let url = `${API_URL}?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (segment) url += `&segment=${encodeURIComponent(segment)}`;
  
  return axios.get(url)
    .then(response => response)
    .catch(error => {
      return handleApiError(error, 'Failed to fetch customers');
    });
}

/**
 * Get a customer by ID
 * @param {string} id - Customer ID
 * @returns {Promise<Object>} Response data
 */
function getCustomerById(id) {
  return axios.get(`${API_URL}/${id}`)
    .then(response => response)
    .catch(error => {
      return handleApiError(error, `Failed to fetch customer with id ${id}`);
    });
}

/**
 * Create a new customer
 * @param {Object} customerData - Customer data
 * @returns {Promise<Object>} Response data
 */
function createCustomer(customerData) {
  return axios.post(API_URL, customerData)
    .then(response => response.data)
    .catch(error => {
      return handleApiError(error, 'Failed to create customer');
    });
}

/**
 * Update an existing customer
 * @param {string} id - Customer ID
 * @param {Object} customerData - Customer data
 * @returns {Promise<Object>} Response data
 */
function updateCustomer(id, customerData) {
  return axios.put(`${API_URL}/${id}`, customerData)
    .then(response => response.data)
    .catch(error => {
      return handleApiError(error, 'Failed to update customer');
    });
}

/**
 * Delete a customer
 * @param {string} id - Customer ID
 * @returns {Promise<Object>} Response data
 */
function deleteCustomer(id) {
  return axios.delete(`${API_URL}/${id}`)
    .then(response => response.data)
    .catch(error => {
      return handleApiError(error, 'Failed to delete customer');
    });
}

// Create a named service object
const customerService = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};

export {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};

export default customerService;