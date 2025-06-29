import axios from '../utils/axiosConfig';
import authService from '../services/authService';

const API_URL = '/api/products';

/**
 * Get all products
 */
const getAllProducts = async () => {
  try {
    console.log('Calling API to get all products...');
    const response = await axios.get(API_URL);
    console.log('Raw API response:', response);
    return response.data;
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    throw error;
  }
};

/**
 * Get product by ID
 */
const getProductById = async (id, config = {}) => {
  try {
    console.log(`Fetching product details for ID: ${id}`);
    const response = await axios.get(`${API_URL}/${id}`, config);
    
    // Log the response for debugging
    console.log('Raw product response:', response);
    
    // Check if we have valid data
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    // Return data directly as the server returns the product object
    return response.data;
  } catch (error) {
    console.error(`Error fetching product #${id}:`, error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get suppliers for a specific product
 */
const getProductSuppliers = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/${productId}/suppliers`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching suppliers for product #${productId}:`, error);
    throw error;
  }
};

/**
 * Get product categories
 */
const getProductCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/categories`);
    console.log('Categories response:', response.data);
    
    // Check if we have data
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else {
      throw new Error('Invalid categories data format');
    }
  } catch (error) {
    console.error('Error fetching product categories:', error);
    // Return a default set of hardware store categories if API fails
    return [
      { id: 'building-materials', name: '🧱 Building & Construction Materials' },
      { id: 'fasteners', name: '🔩 Fasteners & Fixings' },
      { id: 'tools', name: '🛠️ Tools & Equipment' },
      { id: 'plumbing', name: '🔧 Plumbing & Sanitary' },
      { id: 'electrical', name: '💡 Electrical & Lighting' },
      { id: 'paints', name: '🎨 Paints & Surface Finishing' },
      { id: 'doors-windows', name: '🚪 Doors, Windows & Accessories' },
      { id: 'furniture-fittings', name: '🪑 Furniture & Cabinet Fittings' },
      { id: 'garden', name: '🌳 Garden & Outdoor' },
      { id: 'hvac', name: '🔥 Heating, Cooling & Ventilation' },
      { id: 'safety', name: '🛡️ Safety, Security & Fire Protection' },
      { id: 'cleaning', name: '🧽 Cleaning & Maintenance' },
      { id: 'automotive', name: '🚗 Automotive Tools & Supplies' },
      { id: 'adhesives', name: '🧯 Adhesives, Sealants & Chemicals' },
      { id: 'glass', name: '🪞 Glass, Acrylic & Mirrors' },
      { id: 'interior-fixtures', name: '🪟 Blinds, Curtains & Interior Fixtures' },
      { id: 'storage', name: '📦 Packaging, Storage & Organization' },
      { id: 'industrial', name: '🧰 Industrial Supplies' },
      { id: 'miscellaneous', name: '⚙️ Miscellaneous' }
    ];
  }
};

/**
 * Get subcategories for a specific category
 * @param {string} categoryId - The ID of the category
 */
const getSubcategories = async (categoryId) => {
  try {
    const response = await axios.get(`${API_URL}/categories/${categoryId}/subcategories`);
    console.log(`Subcategories for ${categoryId}:`, response.data);
    
    // Check if we have data
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else {
      throw new Error('Invalid subcategories data format');
    }
  } catch (error) {
    console.error(`Error fetching subcategories for ${categoryId}:`, error);
    
    // Return hardcoded subcategories based on categoryId if API fails
    const subcategoriesByCategory = {
      'building-materials': [
        {id: 'cement-concrete', name: 'Cement, Concrete & Aggregates'},
        {id: 'bricks-blocks', name: 'Bricks & Blocks'},
        {id: 'lumber-timber', name: 'Lumber & Timber Products'},
        {id: 'drywall', name: 'Drywall & Plasterboard'},
        {id: 'insulation', name: 'Insulation Materials'},
        {id: 'roofing', name: 'Roofing Materials'}
      ],
      'fasteners': [
        {id: 'screws', name: 'Screws (Wood, Metal, Drywall)'},
        {id: 'nails-brads', name: 'Nails & Brads'},
        {id: 'bolts-nuts', name: 'Bolts & Nuts'}
      ],
      'tools': [
        {id: 'hand-tools', name: 'Hand Tools'},
        {id: 'power-tools', name: 'Power Tools'},
        {id: 'measuring-tools', name: 'Measuring & Layout Tools'}
      ],
      'plumbing': [
        {id: 'pipes-fittings', name: 'Pipes & Fittings'},
        {id: 'valves-controls', name: 'Valves & Controls'},
        {id: 'faucets-taps', name: 'Faucets & Taps'}
      ],
      'electrical': [
        {id: 'wiring-cables', name: 'Wiring & Cables'},
        {id: 'switches-outlets', name: 'Switches & Outlets'},
        {id: 'interior-lighting', name: 'Interior Lighting'}
      ]
    };
    
    return subcategoriesByCategory[categoryId] || [];
  }
};

/**
 * Create a new product
 */
const createProduct = async (productData) => {
  try {
    console.log('Creating product with data:', productData);
    
    // Check if the data is FormData (for file uploads) or a regular object
    const isFormData = productData instanceof FormData;
    
    // Set up headers based on data type
    const config = {
      headers: isFormData 
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' }
    };
    
    // If it's FormData, use it directly
    // If it's not FormData, create a regular JSON object and ensure proper fields
    const dataToSend = isFormData ? productData : {
      ...productData,
      stock_level: 0, // Initialize with zero stock
      // Make sure price is a number
      price: typeof productData.price === 'string' ? Number(productData.price) : productData.price,
      // Ensure we always have an image_public_id to prevent database NULL errors
      image_public_id: productData.image_public_id || 'placeholder_image_id_' + Date.now()
    };
    
    console.log('Sending data to API:', isFormData ? 'FormData (binary)' : dataToSend);
    
    const response = await axios.post(API_URL, dataToSend, config);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Update an existing product
 */
const updateProduct = async (id, productData) => {
  try {
    // Log debugging info about the price
    console.log(`Original price type: ${typeof productData.price}, value: ${productData.price}`);
    
    // Create a deep copy of the data to avoid reference issues
    const formattedData = JSON.parse(JSON.stringify(productData));
    
    // Ensure the price is explicitly a number
    formattedData.price = Number(formattedData.price);
    
    // Validate price is a proper number
    if (isNaN(formattedData.price) || formattedData.price <= 0) {
      console.error('Invalid price value:', formattedData.price);
      throw new Error('Price must be a valid number greater than zero');
    }
    
    console.log(`Price after conversion: ${typeof formattedData.price}, value: ${formattedData.price}`);
    console.log(`Sending formatted data to update product #${id}:`, formattedData);
    
    // Set up headers for JSON data
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const response = await axios.put(`${API_URL}/${id}`, formattedData, config);
    return response.data;
  } catch (error) {
    console.error(`Error updating product #${id}:`, error);
    throw error;
  }
};

/**
 * Delete a product
 */
const deleteProduct = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting product #${id}:`, error);
    throw error;
  }
};

/**
 * Add initial inventory for a newly created product
 * This should only be used once after product creation
 */
const addInitialInventory = async (productId, inventoryData) => {
  try {
    // Get token from authService
    const token = authService.getToken();
    console.log('Token exists:', !!token);
    if (token) {
      console.log('Token first 10 chars:', token.substring(0, 10) + '...');
    } else {
      console.log('No token found in authService');
      
      // If no token in authService but user is supposed to be logged in,
      // this could be a session issue - let's refresh the page
      if (localStorage.getItem('token')) {
        console.log('Found token in localStorage but not in authService, refreshing auth state');
        const lsToken = localStorage.getItem('token');
        authService.storeToken(lsToken);
      }
    }
    
    // Make sure we explicitly set the Authorization header for this request
    const config = {
      headers: {
        'Authorization': `Bearer ${token || localStorage.getItem('token')}`
      }
    };
    
    // Get the current user info
    const currentUser = authService.getCurrentUser();
    console.log('Current user for inventory creation:', currentUser);
    
    // Log the exact reorder_level value we're sending to the server
    const reorderLevel = inventoryData.reorder_level || 10;
    console.log(`Sending reorder_level to server: ${reorderLevel} for product ID: ${productId}`);
    
    // Log the user data for debugging
    console.log('Current user data for inventory:', currentUser);
    
    const response = await axios.post('/api/inventory/initial', {
      product_id: productId,
      stock_level: inventoryData.quantity || 0,
      supplier_id: inventoryData.supplier_id || null,
      reorder_level: reorderLevel,
      notes: 'Initial inventory setup',
      created_by: currentUser?.id || currentUser?.staff_id || currentUser?.Staff_ID || currentUser?.userId || 1 // Add staff ID with more potential fields
    }, config);
    
    return response.data;
  } catch (error) {
    console.error(`Error adding initial inventory for product #${productId}:`, error);
    throw error;
  }
};

/**
 * Search products by name, sku, or description
 */
const searchProducts = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: { query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

/**
 * Mark a product as discontinued
 */
const discontinueProduct = async (id) => {
  try {
    console.log(`Marking product #${id} as discontinued`);
    const response = await axios.put(`${API_URL}/${id}/discontinue`);
    return response.data;
  } catch (error) {
    console.error(`Error discontinuing product #${id}:`, error);
    throw error;
  }
};

/**
 * Mark a discontinued product as active (continue selling)
 */
const continueSellingProduct = async (id) => {
  try {
    console.log(`Marking product #${id} as active (continue selling)`);
    const response = await axios.put(`${API_URL}/${id}/continue`);
    return response.data;
  } catch (error) {
    console.error(`Error reactivating product #${id}:`, error);
    throw error;
  }
};

const productService = {
  getAllProducts,
  getProductById,
  getProductSuppliers,
  getProductCategories,
  getSubcategories,
  createProduct,
  updateProduct,
  deleteProduct,
  addInitialInventory,
  searchProducts,
  discontinueProduct,
  continueSellingProduct
};

export default productService;