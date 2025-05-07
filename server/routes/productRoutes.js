const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

// IMPORTANT: Place specific routes before parameter routes
// Categories endpoint must come BEFORE :id routes
router.get('/categories', productController.getProductCategories);

// Standard CRUD routes
router.get('/', productController.getProducts);
router.post('/', productController.createProduct);
router.get('/search', productController.searchProducts);
router.get('/:id/suppliers', productController.getProductSuppliers);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;