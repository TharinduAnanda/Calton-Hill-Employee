import axios from 'axios';

// Constants
const API_URL = '/api/orders';

/**
 * Handle API errors consistently
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default error message
 * @throws {Error} Formatted error
 */
function handleApiError(error, defaultMessage) {
  console.error('Order API Error:', error);
  throw error.response?.data || { message: defaultMessage };
}

/**
 * Get all orders with optional pagination
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Orders data
 */
function getAllOrders(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${API_URL}?${queryString}` : API_URL;
  
  return axios.get(url)
    .then(response => response.data)
    .catch(error => {
      return handleApiError(error, 'Failed to fetch orders');
    });
}

/**
 * Get order by ID
 * @param {string} id - Order ID
 * @returns {Promise<Object>} Order data
 */
function getOrderById(id) {
  return axios.get(`${API_URL}/${id}`)
    .then(response => response.data)
    .catch(error => {
      return handleApiError(error, 'Failed to fetch order details');
    });
}

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} Created order data
 */
function createOrder(orderData) {
  return axios.post(API_URL, orderData)
    .then(response => response.data)
    .catch(error => {
      return handleApiError(error, 'Failed to create order');
    });
}

/**
 * Update an existing order
 * @param {string} id - Order ID
 * @param {Object} orderData - Order data to update
 * @returns {Promise<Object>} Updated order data
 */
function updateOrder(id, orderData) {
  return axios.put(`${API_URL}/${id}`, orderData)
    .then(response => response.data)
    .catch(error => {
      return handleApiError(error, 'Failed to update order');
    });
}

/**
 * Delete an order
 * @param {string} id - Order ID
 * @returns {Promise<Object>} Result of deletion
 */
function deleteOrder(id) {
  return axios.delete(`${API_URL}/${id}`)
    .then(response => response.data)
    .catch(error => {
      return handleApiError(error, 'Failed to delete order');
    });
}

/**
 * Update an order's status
 * @param {string} id - Order ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated order data
 */
function updateOrderStatus(id, status) {
  return axios.patch(`${API_URL}/${id}/status`, { status })
    .then(response => response.data)
    .catch(error => {
      return handleApiError(error, 'Failed to update order status');
    });
}

/**
 * Get order items
 * @param {string} id - Order ID
 * @returns {Promise<Array>} Order items
 */
function getOrderItems(id) {
  return axios.get(`${API_URL}/${id}/items`)
    .then(response => response.data)
    .catch(error => {
      return handleApiError(error, 'Failed to fetch order items');
    });
}

/**
 * Get manager-specific order statistics
 * @returns {Promise<Object>} Manager order statistics
 */
function getManagerOrderStats() {
  return axios.get(`${API_URL}/manager/stats`)
    .then(response => response.data)
    .catch(error => {
      return handleApiError(error, 'Failed to fetch manager order statistics');
    });
}

/**
 * Get filtered orders for managers
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} Filtered orders data
 */
function getFilteredOrders(filters = {}) {
  const queryString = new URLSearchParams(filters).toString();
  const url = `${API_URL}/manager/filtered?${queryString}`;
  
  return axios.get(url)
    .then(response => response.data)
    .catch(error => {
      return handleApiError(error, 'Failed to fetch filtered orders');
    });
}

/**
 * Update order payment details
 * @param {string} id - Order ID
 * @param {Object} paymentData - Payment data to update
 * @returns {Promise<Object>} Result of update
 */
function updateOrderPayment(id, paymentData) {
  return axios.put(`${API_URL}/${id}/payment`, paymentData)
    .then(response => response.data)
    .catch(error => {
      return handleApiError(error, 'Failed to update order payment details');
    });
}

/**
 * Assign staff to an order
 * @param {string} id - Order ID
 * @param {number} staffId - Staff ID to assign
 * @returns {Promise<Object>} Result of assignment
 */
function assignStaffToOrder(id, staffId) {
  return axios.put(`${API_URL}/${id}/assign-staff`, { staffId })
    .then(response => response.data)
    .catch(error => {
      return handleApiError(error, 'Failed to assign staff to order');
    });
}

// Create named service object
const orderService = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  getOrderItems,
  getManagerOrderStats,
  getFilteredOrders,
  updateOrderPayment,
  assignStaffToOrder
};

export {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  getOrderItems,
  getManagerOrderStats,
  getFilteredOrders,
  updateOrderPayment,
  assignStaffToOrder
};

export default orderService;