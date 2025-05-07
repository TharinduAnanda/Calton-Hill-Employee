import axios from '../utils/axiosConfig';

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
const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product #${id}:`, error);
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
    // Since the endpoint is missing, use a fallback approach
    const response = await getAllProducts();
    
    // Extract unique categories from products
    const uniqueCategories = [];
    const categoryMap = {};
    
    // Process the response based on possible structures
    const products = Array.isArray(response) ? response : 
                    (response.data ? response.data : []);
    
    products.forEach(product => {
      const category = product.category || product.Category;
      if (category && !categoryMap[category]) {
        categoryMap[category] = true;
        uniqueCategories.push({
          id: category.toLowerCase().replace(/\s+/g, '-'),
          name: category
        });
      }
    });
    
    return uniqueCategories;
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
 * Create a new product
 */
const createProduct = async (productData) => {
  try {
    // Set up headers for FormData
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    
    const response = await axios.post(API_URL, productData, config);
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
    // Set up headers for FormData
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    
    const response = await axios.put(`${API_URL}/${id}`, productData, config);
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

const productService = {
  getAllProducts,
  getProductById,
  getProductSuppliers,
  getProductCategories,
  createProduct,
  updateProduct,
  deleteProduct
};

export default productService;