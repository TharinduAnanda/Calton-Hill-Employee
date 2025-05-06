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
      { id: 'tools', name: 'Tools' },
      { id: 'plumbing', name: 'Plumbing' },
      { id: 'electrical', name: 'Electrical' },
      { id: 'hardware', name: 'Hardware' },
      { id: 'building-materials', name: 'Building Materials' }
    ];
  }
};

/**
 * Create a new product
 */
const createProduct = async (productData) => {
  try {
    // FormData requires different headers - axios will set these automatically
    const response = await axios.post(API_URL, productData);
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
    const response = await axios.put(`${API_URL}/${id}`, productData);
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