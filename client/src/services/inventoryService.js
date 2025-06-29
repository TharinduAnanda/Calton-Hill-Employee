import axios from '../utils/axiosConfig';

const API_URL = '/api/inventory';

/**
 * Get all inventory items with optional filtering and pagination
 * @param {Object} options - Query parameters
 * @returns {Promise<Object>} Response data
 */
const getInventoryItems = async (options = {}) => {
  try {
    console.log('Fetching inventory items with options:', options);
    
    // Try to get a combined view from the API
    const response = await axios.get(`${API_URL}/combined`, {
      params: {
        page: options.page || 1,
        limit: options.limit || 10,
        search: options.search || '',
        category: options.category || '',
        sortBy: options.sortBy || 'name',
        sortOrder: options.sortOrder || 'asc'
      }
    });
    
    // Log the response for debugging
    console.log('Raw API response from combined endpoint:', response.data);
    
    // Handle different response structures
    let inventoryData = [];
    
    if (response.data?.data && Array.isArray(response.data.data)) {
      inventoryData = response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      inventoryData = response.data;
    } else if (response.data && typeof response.data === 'object') {
      // If we got an object but not in expected format
      const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
      if (possibleArrays.length > 0) {
        inventoryData = possibleArrays[0];
      }
    }
    
    // If we have data, return it
    if (inventoryData.length > 0) {
      return { data: { data: inventoryData } };
    }
    
    // If we didn't get data from the combined endpoint, try individual fetches
    console.log('No data from combined endpoint, fetching separately');
    
    // Get inventory data
    const inventoryResponse = await axios.get(API_URL, {
      params: {
        page: options.page || 1,
        limit: options.limit || 999, // Get all inventory to ensure we can match with products
        sortBy: options.sortBy || 'name',
        sortOrder: options.sortOrder || 'asc'
      }
    });
    
    let inventoryItems = [];
    if (inventoryResponse.data?.data && Array.isArray(inventoryResponse.data.data)) {
      inventoryItems = inventoryResponse.data.data;
    } else if (Array.isArray(inventoryResponse.data)) {
      inventoryItems = inventoryResponse.data;
    }
    
    console.log('Fetched inventory items:', inventoryItems.length);
    
    // Get product data
    const productResponse = await axios.get('/api/products', {
      params: {
        page: options.page || 1,
        limit: options.limit || 999, // Get all products to ensure we have all needed
        search: options.search || '',
        category: options.category || ''
      }
    });
    
    let productItems = [];
    if (productResponse.data?.data && Array.isArray(productResponse.data.data)) {
      productItems = productResponse.data.data;
    } else if (Array.isArray(productResponse.data)) {
      productItems = productResponse.data;
    }
    
    console.log('Fetched product items:', productItems.length);
    
    // Combine inventory and product data
    const combinedData = combineInventoryAndProductData(inventoryItems, productItems);
    
    // Apply filtering and sorting based on options
    let filteredData = combinedData;
    
    // Filter by search term
    if (options.search) {
      const searchTerm = options.search.toLowerCase();
      filteredData = filteredData.filter(item => 
        (item.name && item.name.toLowerCase().includes(searchTerm)) ||
        (item.sku && item.sku.toLowerCase().includes(searchTerm)) ||
        (item.category && item.category.toLowerCase().includes(searchTerm))
      );
    }
    
    // Filter by category
    if (options.category) {
      filteredData = filteredData.filter(item => 
        item.category === options.category
      );
    }
    
    // Sort data
    if (options.sortBy) {
      const sortKey = options.sortBy;
      const sortDirection = options.sortOrder === 'asc' ? 1 : -1;
      
      filteredData.sort((a, b) => {
        const valueA = typeof a[sortKey] === 'string' ? a[sortKey].toLowerCase() : a[sortKey];
        const valueB = typeof b[sortKey] === 'string' ? b[sortKey].toLowerCase() : b[sortKey];
        
        if (valueA < valueB) return -1 * sortDirection;
        if (valueA > valueB) return 1 * sortDirection;
        return 0;
      });
    }
    
    // Apply pagination
    const startIndex = (options.page - 1) * options.limit;
    const paginatedData = filteredData.slice(startIndex, startIndex + options.limit);
    
    return { data: { data: paginatedData, total: filteredData.length } };
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    throw error;
  }
};

/**
 * Helper function to combine inventory and product data
 * @param {Array} inventoryItems - Inventory items from inventory table
 * @param {Array} productItems - Product items from product table
 * @returns {Array} Combined data
 */
const combineInventoryAndProductData = (inventoryItems, productItems) => {
  // Create a map of products for easier access
  const productsMap = {};
  productItems.forEach(product => {
    productsMap[product.Product_ID || product.product_id || product.id] = product;
  });
  
  // Combine inventory with product data
  return inventoryItems.map(inventory => {
    const productId = inventory.Product_ID || inventory.product_id;
    const product = productsMap[productId] || {};
    
    return {
      // Inventory Primary Data
      inventory_id: inventory.Inventory_ID || inventory.inventory_id || null,
      product_id: productId,
      
      // Basic Item Information
      id: productId,
      sku: product.SKU || product.sku || 'No SKU',
      name: product.Name || product.name || 'Unknown Product',
      description: product.Description || product.description || '',
      category: product.Category || product.category || 'Uncategorized',
      subcategory: product.Subcategory || product.subcategory || '',
      brand: product.Brand || product.brand || '',
      manufacturer: product.Manufacturer || product.manufacturer || '',
      model_number: product.model_number || product.Model_Number || '',
      
      // Inventory Metrics
      stock_level: inventory.Stock_Level || inventory.stock_level || 0,
      unit_of_measure: inventory.unit_of_measure || inventory.Unit_Of_Measure || 'each',
      reorder_level: inventory.reorder_level || inventory.Reorder_Level || 10,
      optimal_level: inventory.optimal_level || inventory.Optimal_Level || 50,
      reorder_quantity: inventory.reorder_quantity || inventory.Reorder_Quantity || 0,
      average_daily_usage: inventory.average_daily_usage || inventory.Average_Daily_Usage || 0,
      
      // Location Information
      warehouse_zone: inventory.warehouse_zone || inventory.Warehouse_Zone || '',
      bin_location: inventory.bin_location || inventory.Bin_Location || '',
      aisle_number: inventory.aisle_number || inventory.Aisle_Number || '',
      storage_location: inventory.storage_location || inventory.Storage_Location || '',
      display_location: inventory.display_location || inventory.Display_Location || '',
      
      // Pricing Details
      cost_price: product.cost_price || product.Cost_Price || 0,
      price: product.Price || product.price || 0,
      discount_percentage: product.discount_percentage || product.Discount_Percentage || 0,
      markup_percentage: (((product.Price || product.price || 0) / (product.cost_price || product.Cost_Price || 1) - 1) * 100) || 0,
      
      // Supplier Information
      supplier_id: inventory.Supplier_ID || inventory.supplier_id || product.Supplier_ID || product.supplier_id || null,
      alternate_suppliers: inventory.alternate_suppliers || inventory.Alternate_Suppliers || '',
      lead_time: product.lead_time || product.Lead_Time || 0,
      minimum_order_quantity: inventory.minimum_order_quantity || inventory.Minimum_Order_Quantity || 1,
      supplier_part_number: inventory.supplier_part_number || inventory.Supplier_Part_Number || '',
      
      // Product Specifics
      weight: product.weight || product.Weight || 0,
      length: product.length || product.Length || 0,
      width: product.width || product.Width || 0,
      height: product.height || product.Height || 0,
      material_type: product.material_type || product.Material_Type || '',
      color_options: product.color_options || product.Color_Options || '',
      specifications: product.specifications || product.Specifications || '',
      compatibility: product.compatibility || product.Compatibility || '',
      
      // Status Indicators
      status: product.Status || product.status || 'active',
      is_seasonal: product.is_seasonal || product.Is_Seasonal || false,
      is_featured: product.is_featured || product.Is_Featured || false,
      on_promotion: product.on_promotion || product.On_Promotion || false,
      inventory_value_method: inventory.inventory_value_method || inventory.Inventory_Value_Method || 'FIFO',
      
      // Dates
      date_added: product.createdAt || product.created_at || product.CreatedAt || new Date().toISOString(),
      last_stock_count: inventory.last_stock_count || inventory.Last_Stock_Count || null,
      last_order_date: inventory.last_order_date || inventory.Last_Order_Date || null,
      expiry_date: product.expiry_date || product.Expiry_Date || null,
      last_updated: inventory.Last_Updated || inventory.last_updated || new Date().toISOString(),
      
      // Additional
      image_url: product.Image_URL || product.image_url || '',
      tax_percentage: product.tax_percentage || product.Tax_Percentage || 0,
      certification_info: product.certification_info || product.Certification_Info || '',
      warranty_period: product.warranty_period || product.Warranty_Period || 0,
      notes: inventory.notes || inventory.Notes || ''
    };
  }).filter(item => item.id); // Filter out any items without a product ID
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
 * @param {number} productId - Product ID
 * @param {Object} adjustmentData - Adjustment details
 * @returns {Promise<Object>} Response data
 */
const adjustInventoryQuantity = async (productId, adjustmentData) => {
  try {
    const response = await axios.post(`${API_URL}/${productId}/adjust`, {
      quantity_change: adjustmentData.quantity_change,
      adjustment_reason: adjustmentData.adjustment_reason || 'Manual adjustment',
      batch_id: adjustmentData.batch_id,
      notes: adjustmentData.notes
    });
    return response.data;
  } catch (error) {
    console.error(`Error adjusting inventory for product #${productId}:`, error);
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
    console.log('Raw inventory summary response:', response);
    
    // Handle different response structures
    if (response.data && response.data.success && response.data.data) {
      return response.data.data; // Standard structure from our API
    } else if (response.data && response.data.data) {
      return response.data.data; // If response has nested data property
    } else if (response.data) {
      return response.data; // If response is the data directly
    } else {
      console.error('Unexpected response structure:', response);
      throw new Error('Invalid response structure from server');
    }
  } catch (error) {
    console.error('Error fetching inventory summary:', error);
    throw error;
  }
};

/**
 * Get low stock items
 * @param {Object} options - Query parameters
 * @returns {Promise<Object>} Response with low stock items
 */
const getLowStockItems = async (options = {}) => {
  try {
    console.log('Fetching low stock items with options:', options);
    
    // Set a very high limit to ensure we get all items
    const params = {
      page: options.page || 1,
      limit: options.limit || 100, // Increased to get more items
      threshold: options.threshold || 10,
      includeOutOfStock: true, // Explicitly include out of stock items
      includeLowStock: true,    // Explicitly include low stock items
      includeAll: true          // Backup parameter in case API uses different naming
    };
    
    console.log('Using API params:', params);
    
    // Try multiple endpoint variations
    const endpoints = [
      `${API_URL}/low-stock`,
      `${API_URL}/lowstock`,
      `${API_URL}/low_stock`,
      `${API_URL}/out-of-stock`
    ];
    
    let response = null;
    let lastError = null;
    
    // Try each endpoint in sequence until one works
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        response = await axios.get(endpoint, { params });
        console.log(`Success with endpoint ${endpoint}, response:`, response?.data?.data?.length || 0);
        break;  // Exit the loop if successful
      } catch (error) {
        console.error(`Error with endpoint ${endpoint}:`, error);
        lastError = error;
      }
    }
    
    // If we got a response from any endpoint, return it
    if (response) {
      return response;
    }
    
    // If all endpoints failed, try getting all inventory and filtering client-side
    console.error('All low stock endpoints failed, trying fallback to all inventory items');
    
    const allInventoryResponse = await axios.get(API_URL, { 
      params: { 
        page: 1,
        limit: 1000,
        includeOutOfStock: true
      } 
    });
    
    let items = [];
    
    if (allInventoryResponse.data?.data && Array.isArray(allInventoryResponse.data.data)) {
      items = allInventoryResponse.data.data;
    } else if (Array.isArray(allInventoryResponse.data)) {
      items = allInventoryResponse.data;
    }
    
    console.log(`Fetched ${items.length} total inventory items for client-side filtering`);
    
    // Filter for low stock items
    const lowStockItems = items.filter(item => {
      const stockLevel = Number(item.stock_level || item.Stock_Level || 0);
      const reorderLevel = Number(item.reorder_level || item.Reorder_Level || 10);
      return stockLevel <= reorderLevel;
    });
    
    console.log(`Found ${lowStockItems.length} low stock items after client-side filtering`);
    
    // Return in the same format as the API would
    return { 
      data: { 
        data: lowStockItems,
        pagination: {
          total: lowStockItems.length,
          page: 1,
          limit: lowStockItems.length,
          pages: 1
        }
      }
    };
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    throw error;
  }
};

/**
 * Get stock movement history
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of stock movement records
 */
const getStockMovementHistory = async (options = {}) => {
  try {
    // Convert any Date objects in options to strings
    const params = {};
    if (options.startDate && options.startDate instanceof Date) {
      params.startDate = options.startDate.toISOString().split('T')[0];
    } else if (typeof options.startDate === 'string') {
      params.startDate = options.startDate;
    }
    
    if (options.endDate && options.endDate instanceof Date) {
      params.endDate = options.endDate.toISOString().split('T')[0];
    } else if (typeof options.endDate === 'string') {
      params.endDate = options.endDate;
    }
    
    // Add other options
    if (options.itemName) params.itemName = options.itemName;
    if (options.type) params.type = options.type;
    if (options.limit) params.limit = options.limit;
    if (options.productId) params.productId = options.productId;
    
    // Build query string
    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const response = await axios.get(`${API_URL}/stock-movements${queryString ? '?' + queryString : ''}`);
    
    console.log('Stock movement response:', response);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching stock movement history:', error);
    throw error;
  }
};

/**
 * Get the URL for a stock movement PDF without attempting to download it directly
 * Using this approach instead of direct fetch/axios to avoid CORS issues
 * @param {Object} options - Query options
 * @returns {string} - The URL to access the PDF
 */
const getStockMovementPdfUrl = (options = {}) => {
  try {
    // Format the base API URL
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const endpoint = '/api/inventory/stock-movements/pdf';
    
    // Build query parameters
    const params = new URLSearchParams();
    
    // Add date parameters with proper formatting
    if (options.startDate) {
      const startDate = options.startDate instanceof Date 
        ? options.startDate.toISOString().split('T')[0]
        : options.startDate;
      params.append('startDate', startDate);
    }
    
    if (options.endDate) {
      const endDate = options.endDate instanceof Date 
        ? options.endDate.toISOString().split('T')[0] 
        : options.endDate;
      params.append('endDate', endDate);
    }
    
    // Add other filtering options
    if (options.itemName) params.append('itemName', options.itemName);
    if (options.type) params.append('type', options.type);
    if (options.limit) params.append('limit', options.limit);
    if (options.productId) params.append('productId', options.productId);
    
    // Construct the final URL
    return `${baseUrl}${endpoint}?${params.toString()}`;
  } catch (error) {
    console.error('Error generating PDF URL:', error);
    throw error;
  }
};

/**
 * Create a test stock movement for debugging
 */
const createTestMovement = async () => {
  try {
    console.log('Creating test stock movement for debugging');
    const response = await axios.get(`${API_URL}/create-test-movement`);
    console.log('Test movement created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to create test movement:', error);
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
 * Add a new batch of inventory to an existing item
 * @param {string|number} itemId - Item ID
 * @param {Object} batchData - Batch data
 * @returns {Promise<Object>} Response data
 */
const addInventoryBatch = async (itemId, batchData) => {
  try {
    const response = await axios.post(`${API_URL}/${itemId}/batches`, batchData);
    return response.data;
  } catch (error) {
    console.error(`Error adding batch for inventory item #${itemId}:`, error);
    throw error;
  }
};

/**
 * Get inventory categories with statistics (items, quantities, value)
 * @returns {Promise<Object>} Response data
 */
const getInventoryCategories = async () => {
  try {
    console.log('Calling API endpoint for inventory categories');
    const response = await axios.get(`${API_URL}/categories`);
    console.log('API Response for inventory categories:', response);
    
    // Log the detailed structure of the response
    console.log('Categories response structure:', {
      status: response.status,
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
      hasSuccessFlag: response.data && 'success' in response.data,
      hasDataArray: response.data && response.data.data && Array.isArray(response.data.data),
      dataArrayLength: response.data && response.data.data && Array.isArray(response.data.data) ? response.data.data.length : 0
    });
    
    // Process the data to ensure consistent format
    if (response.data && response.data.success && response.data.data && Array.isArray(response.data.data)) {
      // Standard API response with data array
      console.log(`Returning ${response.data.data.length} categories from standard response`);
      return response;
    } else if (response.data && Array.isArray(response.data)) {
      // Direct array response
      console.log(`Returning ${response.data.length} categories from direct array response`);
      return { data: { data: response.data } };
    } else if (response.data && response.data.success && Array.isArray(response.data.categories)) {
      // Alternative field name
      console.log(`Returning ${response.data.categories.length} categories from categories field`);
      return { data: { data: response.data.categories } };
    } else if (response.data && typeof response.data === 'object') {
      // Try to find an array in the response object
      const arrayEntries = Object.entries(response.data)
        .filter(([key, val]) => Array.isArray(val) && val.length > 0)
        .map(([key, val]) => ({ key, length: val.length, data: val }));
      
      console.log('Potential arrays in response:', arrayEntries.map(e => `${e.key} (${e.length} items)`));
      
      if (arrayEntries.length > 0) {
        // Use the first array found
        const bestMatch = arrayEntries[0];
        console.log(`Using array from '${bestMatch.key}' field with ${bestMatch.length} items`);
        return { data: { data: bestMatch.data } };
      }
      
      // If no arrays were found, try to use the categoryBreakdown if it exists
      if (response.data.categoryBreakdown && typeof response.data.categoryBreakdown === 'object') {
        console.log('Using categoryBreakdown object to create categories');
        const categories = Object.keys(response.data.categoryBreakdown)
          .map(category => ({ 
            Category: category, 
            total_value: response.data.categoryBreakdown[category]
          }));
        return { data: { data: categories } };
      }
      
      // If we still don't have categories, use product categories as fallback
      console.log('No category data found, trying product categories fallback');
      try {
        const productsResponse = await axios.get('/api/products', { 
          params: { limit: 1000 } 
        });
        
        const products = Array.isArray(productsResponse.data) ? 
          productsResponse.data : 
          (productsResponse.data?.data || []);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(
          products
            .map(product => product.Category || product.category)
            .filter(Boolean)
        )];
        
        // Format into category objects
        const categories = uniqueCategories
          .map(cat => ({ Category: cat, item_count: 0, total_value: 0 }));
        
        console.log(`Created ${categories.length} categories from products fallback`);
        return { data: { data: categories } };
      } catch (fallbackError) {
        console.error('Failed to get categories from products fallback:', fallbackError);
        return { data: { data: [] } }; // Return empty array as last resort
      }
    }
    
    // If we get here, just return the original response
    console.log('Returning original response as last resort');
    return response;
  } catch (error) {
    console.error('Error fetching inventory categories:', error);
    
    // Try a fallback direct query if the main API fails
    try {
      console.log('Trying fallback query for categories');
      const fallbackResponse = await axios.get('/api/products/categories');
      
      if (fallbackResponse.data && Array.isArray(fallbackResponse.data)) {
        console.log(`Got ${fallbackResponse.data.length} categories from fallback`);
        return { data: { data: fallbackResponse.data } };
      }
      
      return { data: { data: [] } };
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return { data: { data: [] } };
    }
  }
};

/**
 * Get inventory forecast data
 * @param {Object} options - Query parameters
 * @returns {Promise<Object>} Response data
 */
const getInventoryForecast = async (options = {}) => {
  try {
    const response = await axios.get(`${API_URL}/forecast`, {
      params: {
        days: options.days || 30,
        itemId: options.itemId || ''
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
 * @returns {Promise<Object>} Response data
 */
const generatePurchaseOrders = async () => {
  try {
    const response = await axios.post(`${API_URL}/generate-purchase-orders`);
    return response.data;
  } catch (error) {
    console.error('Error generating purchase orders:', error);
    throw error;
  }
};

/**
 * Get inventory turnover report
 * @param {Object} options - Query parameters
 * @returns {Promise<Object>} Response data
 */
const getInventoryTurnoverReport = async (options = {}) => {
  try {
    // Convert any period values to numeric to ensure clean queries
    const params = {
      period: options.period || 90
    };
    
    // Only add category if it's provided and not empty
    if (options.category) {
      params.category = options.category;
    }
    
    // Add any other optional filters
    if (options.startDate) params.startDate = options.startDate;
    if (options.endDate) params.endDate = options.endDate;
    
    console.log('Fetching inventory turnover report with params:', params);
    console.log('API URL being used:', API_URL);
    
    const response = await axios.get(`${API_URL}/turnover-report`, { params });
    
    // Log detailed information about the response
    console.log('Turnover report API response status:', response.status);
    console.log('Full response data:', response.data);
    
    if (!response.data?.success) {
      console.warn('API returned success=false:', response.data);
    }
    
    if (response.data?.products && response.data.products.length > 0) {
      console.log('First product in results:', response.data.products[0]);
    } else {
      console.warn('No products returned in API response');
    }
    
    return response;
  } catch (err) {
    console.error('Error fetching inventory turnover report:', err);
    throw err;
  }
};

/**
 * Calculate inventory value
 * @param {Object} options - Query parameters
 * @returns {Promise<Object>} Response data
 */
const calculateInventoryValue = async (options = {}) => {
  try {
    const response = await axios.get(`${API_URL}/value`, {
      params: {
        valuationType: options.valuationType || 'cost', // cost, retail
        valuationMethod: options.valuationMethod || 'FIFO', // FIFO, WEIGHTED_AVERAGE, SPECIFIC_IDENTIFICATION
        includeZeroStock: options.includeZeroStock || false,
        category: options.category || ''
      }
    });
    return response;
  } catch (error) {
    console.error('Error calculating inventory value:', error);
    throw error;
  }
};

/**
 * Record stock count (inventory audit)
 * @param {Array} counts - Stock count data
 * @returns {Promise<Object>} Response data
 */
const recordStockCount = async (counts) => {
  try {
    const response = await axios.post(`${API_URL}/stock-count`, { counts });
    return response.data;
  } catch (error) {
    console.error('Error recording stock count:', error);
    throw error;
  }
};

/**
 * Get inventory audit log
 * @param {Object} options - Query parameters
 * @returns {Promise<Object>} Response data
 */
const getInventoryAuditLog = async (options = {}) => {
  try {
    const response = await axios.get(`${API_URL}/audit-log`, {
      params: {
        page: options.page || 1,
        limit: options.limit || 10,
        startDate: options.startDate || '',
        endDate: options.endDate || '',
        itemId: options.itemId || ''
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory audit log:', error);
    throw error;
  }
};

/**
 * Create or update an initial inventory record for a product
 * @param {Object} inventoryData - Initial inventory data
 * @returns {Promise<Object>} Response data
 */
const setupInitialInventory = async (inventoryData) => {
  try {
    // Validate required fields
    if (!inventoryData.product_id) {
      throw new Error('Product ID is required');
    }
    
    // Format the data for the API
    const payload = {
      product_id: parseInt(inventoryData.product_id, 10),
      stock_level: parseInt(inventoryData.stock_level || 0, 10),
      reorder_level: parseInt(inventoryData.reorder_level || 10, 10),
      supplier_id: inventoryData.supplier_id ? parseInt(inventoryData.supplier_id, 10) : null,
      notes: inventoryData.notes || 'Initial inventory setup'
    };
    
    // Call the API endpoint
    const response = await axios.post(`${API_URL}/setup-initial`, payload);
    return response.data;
  } catch (error) {
    console.error('Error setting up initial inventory:', error);
    throw error;
  }
};

/**
 * Update the reorder level for an inventory item
 * @param {string|number} productId - The product ID
 * @param {number} reorderLevel - The new reorder level
 * @returns {Promise<Object>} Response data
 */
const updateReorderLevel = async (productId, reorderLevel) => {
  try {
    // First, check if the product exists and get its inventory record
    const inventoryResponse = await axios.get(`${API_URL}`, {
      params: { product_id: productId }
    });
    
    let inventoryId;
    let inventoryData = [];
    
    if (inventoryResponse.data && Array.isArray(inventoryResponse.data)) {
      inventoryData = inventoryResponse.data;
    } else if (inventoryResponse.data?.data && Array.isArray(inventoryResponse.data.data)) {
      inventoryData = inventoryResponse.data.data;
    }
    
    // Find the inventory record for this product
    const inventoryRecord = inventoryData.find(inv => 
      inv.Product_ID === productId || inv.product_id === productId
    );
    
    if (inventoryRecord) {
      inventoryId = inventoryRecord.Inventory_ID || inventoryRecord.inventory_id;
    }
    
    if (!inventoryId) {
      // No existing inventory record, create one with the specified reorder level
      return await setupInitialInventory({
        product_id: productId,
        stock_level: 0, // Default to 0 stock
        reorder_level: reorderLevel
      });
    }
    
    // Update the existing inventory record with the new reorder level
    const response = await axios.put(`${API_URL}/${inventoryId}`, {
      reorder_level: reorderLevel
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error updating reorder level for product #${productId}:`, error);
    throw error;
  }
};

/**
 * Fix inventory data issues
 * @returns {Promise<Object>} Response data with fix results
 */
const fixInventoryData = async () => {
  try {
    const response = await axios.get(`${API_URL}/fix-data`);
    return response.data;
  } catch (error) {
    console.error('Error fixing inventory data:', error);
    throw error;
  }
};

/**
 * Get all categories from the categories table
 * @returns {Promise<Object>} Response data
 */
const getAllCategories = async () => {
  try {
    const response = await axios.get('/api/categories');
    console.log('API Response for all categories:', response);
    return response;
  } catch (error) {
    console.error('Error fetching all categories:', error);
    throw error;
  }
};

/**
 * Get stock movement history as PDF - compatibility function 
 * @param {Object} options - Query options
 * @returns {string} The PDF URL
 */
const getStockMovementPdf = (options = {}) => {
  console.warn('getStockMovementPdf is deprecated, use getStockMovementPdfUrl instead');
  return getStockMovementPdfUrl(options);
};

/**
 * Get inventory turnover report PDF
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Object with blob data and filename
 */
const getInventoryTurnoverReportPdf = async (params) => {
  try {
    // Use direct URL to backend
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const pdfUrl = `${baseUrl}/api/inventory/turnover-report/pdf`;
    
    // Simple request with only essential options
    const response = await axios.get(pdfUrl, {
      params: params,
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      },
      withCredentials: true
    });
    
    // Return just what's needed for FileSaver
    const timestamp = new Date().toISOString().split('T')[0];
    return {
      data: response.data,
      fileName: `inventory-turnover-report-${timestamp}.pdf`
    };
  } catch (error) {
    console.error('Error downloading turnover report PDF:', error);
    throw error;
  }
};

/**
 * Debug function to test the low stock items API directly
 * @returns {Promise<Object>} Response data
 */
const debugLowStockAPI = async () => {
  try {
    console.log('DEBUG: Testing low stock API directly');
    const params = {
      includeOutOfStock: true,
      includeLowStock: true
    };
    
    console.log('DEBUG: Calling API endpoint directly');
    
    // Try both endpoints to determine which one works
    try {
      const response = await axios.get(`${API_URL}/low-stock`, { params });
      console.log('DEBUG: low-stock endpoint response:', response);
      return response;
    } catch (error) {
      console.error('DEBUG: Error with low-stock endpoint:', error);
      // Try alternative endpoint
      try {
        const altResponse = await axios.get(`${API_URL}/lowstock`, { params });
        console.log('DEBUG: lowstock endpoint response:', altResponse);
        return altResponse;
      } catch (altError) {
        console.error('DEBUG: Error with lowstock endpoint:', altError);
        // Fall back to base API endpoint
        const fallbackResponse = await axios.get(API_URL, { 
          params: { 
            includeOutOfStock: true,
            limit: 1000
          } 
        });
        console.log('DEBUG: Base API fallback response:', fallbackResponse);
        return fallbackResponse;
      }
    }
  } catch (error) {
    console.error('DEBUG: All attempts failed:', error);
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
  getStockMovementPdf,
  getStockMovementPdfUrl,
  getInventoryItemBatches,
  addInventoryBatch,
  getInventoryCategories,
  getAllCategories,
  getInventoryForecast,
  generatePurchaseOrders,
  getInventoryTurnoverReport,
  calculateInventoryValue,
  recordStockCount,
  getInventoryAuditLog,
  updateReorderLevel,
  fixInventoryData,
  getInventoryTurnoverReportPdf,
  debugLowStockAPI
};

export default inventoryService;