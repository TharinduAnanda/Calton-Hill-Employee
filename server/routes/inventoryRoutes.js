const express = require('express');
const { body } = require('express-validator');
const inventoryController = require('../controllers/inventoryController');
const enhancedInventoryController = require('../controllers/enhancedInventoryController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Summary route - this should be BEFORE the /:id routes to avoid confusion
router.get('/summary', authorizeRoles(['owner', 'manager', 'staff']), inventoryController.getInventorySummary);

// Low stock items route - also before /:id
router.get('/low-stock', authorizeRoles(['owner', 'manager', 'staff']), inventoryController.getLowStockItems);

// Stock movement history route - also before /:id
router.get('/stock-movements', authorizeRoles(['owner', 'manager']), inventoryController.getStockMovementHistory);

// Basic CRUD operations
router.get('/', authorizeRoles(['owner', 'manager', 'staff']), inventoryController.getAllItems);
router.post('/', authorizeRoles(['owner', 'manager']), inventoryController.createItem);
router.get('/:id', authorizeRoles(['owner', 'manager', 'staff']), inventoryController.getInventoryById);
router.put('/:id', authorizeRoles(['owner', 'manager']), inventoryController.updateItem);
router.delete('/:id', authorizeRoles(['owner']), inventoryController.deleteItem);

// Adjust inventory quantity
router.post('/:id/adjust', authorizeRoles(['owner', 'manager', 'staff']), inventoryController.adjustQuantity);

// Batch management
router.get('/:id/batches', authorizeRoles(['owner', 'manager', 'staff']), inventoryController.getItemBatches);
router.post('/:id/batches', authorizeRoles(['owner', 'manager']), inventoryController.addItemBatch);

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