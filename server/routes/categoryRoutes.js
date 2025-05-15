const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/db');

/**
 * Get all categories
 * @route GET /api/products/categories
 */
router.get('/categories', async (req, res) => {
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

module.exports = router;