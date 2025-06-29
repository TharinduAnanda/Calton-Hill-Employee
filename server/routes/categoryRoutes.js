const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/db');

/**
 * Get all categories
 * @route GET /api/categories
 */
router.get('/', async (req, res) => {
  try {
    const categories = await executeQuery(
      'SELECT * FROM product_categories WHERE store_id = ? ORDER BY name',
      [req.user?.storeId || 1]
    );
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get a single category by ID
 * @route GET /api/categories/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await executeQuery(
      'SELECT * FROM product_categories WHERE id = ? AND store_id = ?',
      [id, req.user?.storeId || 1]
    );
    
    if (!category || category.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category[0]
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;