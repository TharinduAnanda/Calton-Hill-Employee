const { executeQuery } = require('../config/db');
const { productQueries } = require('../models/queries');

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await executeQuery(productQueries.getAllProducts);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const products = await executeQuery(productQueries.getProductById, [productId]);
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(products[0]);
  } catch (error) {
    console.error('Error fetching product:', error.message);
    res.status(500).json({ message: 'Error fetching product' });
  }
};

// Create new product
const createProduct = async (req, res) => {
  try {
    const { name, category, stockLevel, manufacturer, imageUrl, supplierId, price, imagePublicId } = req.body;
    
    const result = await executeQuery(
      productQueries.createProduct,
      [name, category, stockLevel, manufacturer, imageUrl, supplierId || null, price, imagePublicId || '']
    );
    
    if (result.affectedRows === 1) {
      const newProduct = await executeQuery(
        productQueries.getProductById,
        [result.insertId]
      );
      
      res.status(201).json({
        message: 'Product created successfully',
        product: newProduct[0]
      });
    } else {
      res.status(400).json({ message: 'Failed to create product' });
    }
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(500).json({ message: 'Error creating product' });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, category, stockLevel, manufacturer, imageUrl, supplierId, price } = req.body;
    
    // Check if product exists
    const products = await executeQuery(
      productQueries.getProductById,
      [productId]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const result = await executeQuery(
      'UPDATE product SET Name = ?, Category = ?, Stock_Level = ?, Manufacturer = ?, Image_URL = ?, Supplier_ID = ?, Price = ? WHERE Product_ID = ?',
      [name, category, stockLevel, manufacturer, imageUrl, supplierId || null, price, productId]
    );
    
    if (result.affectedRows === 1) {
      const updatedProduct = await executeQuery(
        productQueries.getProductById,
        [productId]
      );
      
      res.json({
        message: 'Product updated successfully',
        product: updatedProduct[0]
      });
    } else {
      res.status(400).json({ message: 'Failed to update product' });
    }
  } catch (error) {
    console.error('Error updating product:', error.message);
    res.status(500).json({ message: 'Error updating product' });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Check if product exists
    const products = await executeQuery(
      productQueries.getProductById,
      [productId]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const result = await executeQuery(
      productQueries.deleteProduct,
      [productId]
    );
    
    if (result.affectedRows === 1) {
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete product' });
    }
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).json({ message: 'Error deleting product' });
  }
};

// Search products
const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    const searchTerm = `%${query}%`;
    
    const products = await executeQuery(
      productQueries.searchProducts,
      [searchTerm, searchTerm, searchTerm]
    );
    
    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error.message);
    res.status(500).json({ message: 'Error searching products' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts
};