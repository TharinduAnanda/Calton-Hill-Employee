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
    console.log('Creating inventory item with data:', itemData);
    
    // Format the data properly for the API
    const formattedData = {
      sku: itemData.sku,
      name: itemData.name,
      description: itemData.description || '',
      category: itemData.category || '',
      subcategory: itemData.subcategory || '',
      brand: itemData.brand || '',
      manufacturer: itemData.manufacturer || '',
      
      // Ensure these field names match what the API expects
      stock_level: Number(itemData.quantity || 0),
      reorder_level: Number(itemData.reorderThreshold || 10),
      location: itemData.location || '',
      cost_price: Number(itemData.costPrice || 0),
      sell_price: Number(itemData.sellPrice || 0),
      
      // Convert IDs to integers (or null) and use the correct field names
      product_id: itemData.productId ? parseInt(itemData.productId, 10) : null,
      supplier_id: itemData.supplier_id ? parseInt(itemData.supplier_id, 10) : null,
    };
    
    console.log('Sending formatted data to API:', formattedData);
    const response = await axios.post(API_URL, formattedData);
    return response.data;
  } catch (error) {
    console.error('Error creating inventory item:', error);
    
    if (error.response && error.response.data) {
      console.error('Server validation errors:', error.response.data.errors);
      
      if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.map(err => 
          `${err.param || ''}: ${err.msg || err.message || 'Invalid'}`
        ).join(', ');
        
        error.message = errorMessages || error.message;
      }
    }
    
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
        itemName: options.itemName || '',
        type: options.type || ''
      }
    });
    
    // Ensure we're returning an array even if response structure varies
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn('Unexpected response structure:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching stock movement history:', error);
    return []; // Return empty array to prevent UI errors
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

/**
 * Get inventory categories
 * @returns {Promise<Object>} Response with inventory categories
 */
const getInventoryCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/categories`);
    return response;
  } catch (error) {
    console.error('Error fetching inventory categories:', error);
    throw error;
  }
};

/**
 * Get inventory forecast
 * @param {Object} options - Query parameters
 * @returns {Promise<Object>} Response with inventory forecast data
 */
const getInventoryForecast = async (options = {}) => {
  try {
    const response = await axios.get(`${API_URL}/forecast`, {
      params: {
        days: options.days || 30
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching inventory forecast:', error);
    throw error;
  }
};

/**
 * Generate purchase orders for low stock items
 * @returns {Promise<Object>} Response with purchase orders data
 */
const generatePurchaseOrders = async () => {
  try {
    const response = await axios.get(`${API_URL}/purchase-orders`);
    return response;
  } catch (error) {
    console.error('Error generating purchase orders:', error);
    throw error;
  }
};

/**
 * Get inventory turnover report
 * @param {Object} options - Query parameters
 * @returns {Promise<Object>} Response with turnover report data
 */
const getInventoryTurnoverReport = async (options = {}) => {
  try {
    const response = await axios.get(`${API_URL}/turnover-report`, {
      params: {
        period: options.period || 90
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching inventory turnover report:', error);
    throw error;
  }
};

/**
 * Calculate inventory value using specified method
 * @param {Object} options - Query parameters
 * @returns {Promise<Object>} Response with valuation data
 */
const calculateInventoryValue = async (options = {}) => {
  try {
    const response = await axios.get(`${API_URL}/value`, {
      params: {
        method: options.method || 'fifo'
      }
    });
    return response;
  } catch (error) {
    console.error('Error calculating inventory value:', error);
    throw error;
  }
};

/**
 * Record stock count
 * @param {Array} counts - Array of count objects with product_id and counted_quantity
 * @returns {Promise<Object>} Response data
 */
const recordStockCount = async (counts) => {
  try {
    const response = await axios.post(`${API_URL}/stock-count`, { counts });
    return response;
  } catch (error) {
    console.error('Error recording stock count:', error);
    throw error;
  }
};

/**
 * Get inventory audit log
 * @param {Object} options - Query parameters
 * @returns {Promise<Object>} Response with audit log data
 */
const getInventoryAuditLog = async (options = {}) => {
  try {
    const response = await axios.get(`${API_URL}/audit-log`, {
      params: {
        page: options.page || 1,
        limit: options.limit || 20,
        startDate: options.startDate || '',
        endDate: options.endDate || '',
        productId: options.productId || '',
        username: options.username || '',
        movementType: options.movementType || ''
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching inventory audit log:', error);
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
  addInventoryBatch,
  getInventoryCategories,
  getInventoryForecast,
  generatePurchaseOrders,
  getInventoryTurnoverReport,
  calculateInventoryValue,
  recordStockCount,
  getInventoryAuditLog
};

export default inventoryService;