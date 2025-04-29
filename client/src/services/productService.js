import axios from '../utils/axiosConfig';

const API_URL = '/api/products';

const productService = {
  // Get all products
  getAllProducts: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a single product by ID
  getProductById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new product
  createProduct: async (productData) => {
    try {
      const response = await axios.post(API_URL, productData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update an existing product
  updateProduct: async (id, productData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, productData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a product
  deleteProduct: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search products
  searchProducts: async (query) => {
    try {
      const response = await axios.get(`${API_URL}/search/${query}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get low stock products
  getLowStockProducts: async () => {
    try {
      const response = await axios.get(`${API_URL}/status/low-stock`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get product categories
  getProductCategories: async () => {
    try {
      const response = await axios.get(`${API_URL}/categories/all`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (categoryId) => {
    try {
      const response = await axios.get(`${API_URL}/category/${categoryId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get products by supplier
  getProductsBySupplier: async (supplierId) => {
    try {
      const response = await axios.get(`${API_URL}/supplier/${supplierId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default productService;