const express = require('express');
const { body } = require('express-validator');
const inventoryController = require('../controllers/inventoryController');
const enhancedInventoryController = require('../controllers/enhancedInventoryController');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Original inventory routes
router.get('/', inventoryController.getAllInventory);
router.get('/low-stock', inventoryController.getLowStockItems);
router.get('/:id', inventoryController.getInventoryById);
router.post('/', inventoryController.createInventory);
router.put('/:id', inventoryController.updateInventory);
router.delete('/:id', inventoryController.deleteInventory);

// Enhanced inventory management
router.get('/product/:productId/batches', enhancedInventoryController.getInventoryWithBatches);
router.post('/batch', [
  body('product_id').isNumeric().withMessage('Valid product ID is required'),
  body('batch_number').notEmpty().withMessage('Batch number is required'),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('cost_per_unit').isNumeric().withMessage('Cost per unit must be a number')
], enhancedInventoryController.addInventoryBatch);

router.post('/adjust', [
  body('product_id').isNumeric().withMessage('Valid product ID is required'),
  body('quantity_change').isNumeric().withMessage('Quantity change must be a number'),
  body('adjustment_reason').notEmpty().withMessage('Adjustment reason is required')
], enhancedInventoryController.adjustInventory);

router.get('/enhanced/low-stock', enhancedInventoryController.getEnhancedLowStockItems);
router.get('/audit/log', enhancedInventoryController.getInventoryAuditLog);
router.patch('/settings/:productId', enhancedInventoryController.updateInventorySettings);
router.get('/report/value', enhancedInventoryController.getInventoryValueReport);

// Purchase orders
router.post('/purchase-orders', [
  body('supplier_id').isNumeric().withMessage('Valid supplier ID is required'),
  body('items').isArray().withMessage('Items must be an array')
], enhancedInventoryController.createPurchaseOrder);

module.exports = router;