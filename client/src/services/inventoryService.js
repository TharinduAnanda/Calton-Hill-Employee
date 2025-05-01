import axios from '../utils/axiosConfig';

const API_URL = '/api/inventory';

/**
 * Get all inventory items with optional filtering and pagination
 * @param {Object} options - Query parameters
 * @returns {Promise<Object>} Response data
 */
const getInventoryItems = async (options = {}) => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        page: options.page || 1,
        limit: options.limit || 10,
        search: options.search || '',
        category: options.category || '',
        sortBy: options.sortBy || 'name',
        sortOrder: options.sortOrder || 'asc'
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    throw error;
  }
};

/**
 * Get a specific inventory item by ID
 * @param {string|number} id - Item ID
 * @returns {Promise<Object>} Response data
 */
const getInventoryItemById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching inventory item #${id}:`, error);
    throw error;
  }
};

/**
 * Create a new inventory item
 * @param {Object} itemData - Inventory item data
 * @returns {Promise<Object>} Response data
 */
const createInventoryItem = async (itemData) => {
  try {
    const response = await axios.post(API_URL, itemData);
    return response;
  } catch (error) {
    console.error('Error creating inventory item:', error);
    throw error;
  }
};

/**
 * Update an existing inventory item
 * @param {string|number} id - Item ID
 * @param {Object} itemData - Updated item data
 * @returns {Promise<Object>} Response data
 */
const updateInventoryItem = async (id, itemData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, itemData);
    return response;
  } catch (error) {
    console.error(`Error updating inventory item #${id}:`, error);
    throw error;
  }
};

/**
 * Delete an inventory item
 * @param {string|number} id - Item ID
 * @returns {Promise<Object>} Response data
 */
const deleteInventoryItem = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response;
  } catch (error) {
    console.error(`Error deleting inventory item #${id}:`, error);
    throw error;
  }
};

/**
 * Adjust inventory quantity (add or reduce stock)
 * @param {string|number} id - Item ID
 * @param {Object} adjustmentData - Adjustment data with quantity and reason
 * @returns {Promise<Object>} Response data
 */
const adjustInventoryQuantity = async (id, adjustmentData) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/adjust`, adjustmentData);
    return response;
  } catch (error) {
    console.error(`Error adjusting inventory for item #${id}:`, error);
    throw error;
  }
};

/**
 * Get inventory summary statistics
 * @returns {Promise<Object>} Response with inventory summary data
 */
const getInventorySummary = async () => {
  try {
    const response = await axios.get(`${API_URL}/summary`);
    
    // Handle different response structures
    if (response.data && response.data.data) {
      return response.data.data; // If response has data property
    } else if (response.data) {
      return response.data; // If response is the data directly
    } else {
      throw new Error('Invalid response structure from server');
    }
  } catch (error) {
    console.error('Error fetching inventory summary:', error);
    
    // Handle specific 400 error
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Invalid request parameters');
    }
    
    throw new Error(error.response?.data?.message || 
                  'Failed to fetch inventory summary');
  }
};

/**
 * Get low stock items
 * @param {Object} options - Query parameters
 * @returns {Promise<Object>} Response with low stock items
 */
const getLowStockItems = async (options = {}) => {
  try {
    const response = await axios.get(`${API_URL}/low-stock`, {
      params: {
        page: options.page || 1,
        limit: options.limit || 10,
        threshold: options.threshold || 10
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    throw error;
  }
};

/**
 * Get stock movement history
 * @param {Object} options - Query parameters
 * @returns {Promise<Object>} Response with stock movement history
 */
const getStockMovementHistory = async (options = {}) => {
  try {
    const response = await axios.get(`${API_URL}/stock-movements`, {
      params: {
        page: options.page || 1,
        limit: options.limit || 10,
        startDate: options.startDate || '',
        endDate: options.endDate || '',
        itemId: options.itemId || '',
        type: options.type || ''
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching stock movement history:', error);
    throw error;
  }
};

/**
 * Get inventory item batches
 * @param {string|number} itemId - Item ID
 * @param {Object} options - Query parameters
 * @returns {Promise<Object>} Response with batches data
 */
const getInventoryItemBatches = async (itemId, options = {}) => {
  try {
    const response = await axios.get(`${API_URL}/${itemId}/batches`, {
      params: {
        page: options.page || 1,
        limit: options.limit || 10,
        includeExpired: options.includeExpired || false
      }
    });
    return response;
  } catch (error) {
    console.error(`Error fetching batches for item #${itemId}:`, error);
    throw error;
  }
};

/**
 * Add a new batch for an inventory item
 * @param {string|number} itemId - Item ID
 * @param {Object} batchData - Batch data
 * @returns {Promise<Object>} Response data
 */
const addInventoryBatch = async (itemId, batchData) => {
  try {
    const response = await axios.post(`${API_URL}/${itemId}/batches`, batchData);
    return response;
  } catch (error) {
    console.error(`Error adding batch for item #${itemId}:`, error);
    throw error;
  }
};

const inventoryService = {
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  adjustInventoryQuantity,
  getInventorySummary,
  getLowStockItems,
  getStockMovementHistory,
  getInventoryItemBatches,
  addInventoryBatch
};

export default inventoryService;