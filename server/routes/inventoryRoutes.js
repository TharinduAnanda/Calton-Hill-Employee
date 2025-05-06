const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Try to import validators, but provide empty validators if the module isn't available
let inventoryValidators = {
  validateInventoryItem: [],
  validateInventoryAdjustment: [],
  validateBatch: [],
  validateStockCount: []
};

try {
  inventoryValidators = require('../middleware/validators/inventoryValidators');
} catch (err) {
  console.warn('Warning: Inventory validators not found, proceeding with no validation');
}

// Import auth middleware
const { protect } = require('../middleware/authMiddleware');

// Apply authentication to all inventory routes
// Uncomment the following line if you want to enforce authentication
// router.use(protect);

// Test route
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Inventory API is working'
  });
});

router.get('/test-stock-movements', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Stock movements API is working',
    date: new Date()
  });
});

// Main inventory routes
router.get('/', inventoryController.getAllInventory);
router.get('/summary', inventoryController.getInventorySummary);
router.get('/low-stock', inventoryController.getLowStockItems);
router.get('/stock-movements', inventoryController.getStockMovementHistory);

// Analytics routes
router.get('/categories', inventoryController.getInventoryCategories);
router.get('/forecast', inventoryController.getInventoryForecast);
router.get('/turnover-report', inventoryController.getInventoryTurnoverReport);
router.get('/value', inventoryController.calculateInventoryValue);
router.get('/purchase-orders', inventoryController.generatePurchaseOrders);
router.get('/audit-log', inventoryController.getInventoryAuditLog);

// Item specific routes
router.get('/:id', inventoryController.getInventoryById);
router.post('/', inventoryValidators.validateInventoryItem, inventoryController.createInventory);
router.put('/:id', inventoryValidators.validateInventoryItem, inventoryController.updateInventory);
router.delete('/:id', inventoryController.deleteInventory);
router.post('/:id/adjust', inventoryValidators.validateInventoryAdjustment, inventoryController.adjustQuantity);

// Batch management
router.get('/:id/batches', inventoryController.getItemBatches);
router.post('/:id/batches', inventoryValidators.validateBatch, inventoryController.addItemBatch);

// Stock movement
router.get('/:id/stock-movements', inventoryController.getStockMovementHistory);
router.post('/stock-count', inventoryValidators.validateStockCount, inventoryController.recordStockCount);

module.exports = router;