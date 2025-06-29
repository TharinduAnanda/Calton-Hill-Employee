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
const { protect, requireRole } = require('../middleware/authMiddleware');

// Test route - no auth required for test/debug
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

// Public PDF route - no auth required
router.get('/stock-movements/pdf', inventoryController.getStockMovementPdf);
router.get('/turnover-report/pdf', inventoryController.getInventoryTurnoverPdf);

// Debug route to create a test stock movement - no auth for testing
router.get('/create-test-movement', async (req, res) => {
  try {
    // Get a random product ID
    const { executeQuery } = require('../config/db');
    const products = await executeQuery('SELECT Product_ID FROM product LIMIT 5');
    
    console.log('Products query result:', products);
    
    // Handle different result formats
    let productList = [];
    if (Array.isArray(products) && products.length > 0) {
      if (Array.isArray(products[0])) {
        productList = products[0]; // Handle nested array format
      } else {
        productList = products; // Handle flat array format
      }
    }
    
    if (!productList || productList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No products found to create test movement'
      });
    }
    
    console.log('Using product:', productList[0]);
    const productId = productList[0].Product_ID;
    
    // Insert a test stock movement
    await executeQuery(
      `INSERT INTO stock_movement 
       (product_id, quantity_change, movement_type, notes, movement_date, previous_quantity, new_quantity) 
       VALUES (?, ?, ?, ?, NOW(), ?, ?)`,
      [productId, 10, 'TEST', 'Test movement for debugging', 0, 10]
    );
    
    return res.status(200).json({
      success: true,
      message: 'Test stock movement created successfully',
      product_id: productId
    });
  } catch (error) {
    console.error('Error creating test movement:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create test movement',
      error: error.message
    });
  }
});

// Debug route to seed inventory turnover data
router.get('/seed-turnover-data', async (req, res) => {
  try {
    const seedInventoryTurnoverData = require('../scripts/seedInventoryTurnoverData');
    const result = await seedInventoryTurnoverData();
    
    return res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error('Error running inventory turnover data seed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to seed inventory turnover data',
      error: error.message
    });
  }
});

// Debug route to check inventory turnover data
router.get('/check-turnover-data', async (req, res) => {
  try {
    const checkTurnoverData = require('../scripts/checkTurnoverData');
    const result = await checkTurnoverData();
    
    return res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error('Error checking inventory turnover data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check inventory turnover data',
      error: error.message
    });
  }
});

// Seed multiple stock movements - no auth for testing
router.get('/seed-stock-movements', async (req, res) => {
  try {
    const seedStockMovements = require('../scripts/seedStockMovements');
    await seedStockMovements();
    
    return res.status(200).json({
      success: true,
      message: 'Stock movement seed process completed'
    });
  } catch (error) {
    console.error('Error running stock movement seed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to seed stock movements',
      error: error.message
    });
  }
});

// Create a completely public route for turnover report testing
router.get('/public-turnover-test', async (req, res) => {
  try {
    console.log('public-turnover-test endpoint hit');
    console.log('Query params:', req.query);
    
    // Check database connection first
    const { executeQuery } = require('../config/db');
    const testQuery = await executeQuery('SELECT 1 as test');
    console.log('Database connection test:', testQuery);
    
    // Use the controller function directly, bypassing authentication
    await inventoryController.getInventoryTurnoverReport(req, res);
  } catch (error) {
    console.error('Error in public turnover test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate turnover report in public test route',
      error: error.message
    });
  }
});

// Apply authentication to all remaining inventory routes
router.use(protect);

// Main inventory routes
router.get('/', inventoryController.getAllInventory);
router.get('/combined', inventoryController.getCombinedInventory);
router.get('/summary', inventoryController.getInventorySummary);
router.get('/low-stock', inventoryController.getLowStockItems);
router.get('/stock-movements', inventoryController.getStockMovementHistory);
router.post('/initial', inventoryController.setupInitialInventory);

// Special fix route to repair inventory data issues
router.get('/fix-data', inventoryController.fixInventoryDataIssues);

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

// Purchase order receiving
router.post('/receive', inventoryController.receiveInventoryFromPurchaseOrder);
router.post('/receive-partial', inventoryController.receivePartialInventory);

// Get inventory turnover report
router.get('/turnover-report', inventoryController.getInventoryTurnoverReport);

// Add a debug endpoint to check the inventory turnover report directly
router.get('/debug-turnover-report', async (req, res) => {
  try {
    console.log('=== DEBUG TURNOVER REPORT ===');
    console.log('Query params:', req.query);
    
    // First check if we have any paid orders in the system
    const checkOrdersQuery = `
      SELECT COUNT(*) as order_count 
      FROM customerorder 
      WHERE Payment_Status = 'paid'
    `;
    
    const [orderCheck] = await executeQuery(checkOrdersQuery);
    console.log('Paid orders in system:', orderCheck);
    
    // Check if we have order items linked to paid orders
    const checkOrderItemsQuery = `
      SELECT COUNT(*) as item_count 
      FROM order_item oi
      JOIN customerorder co ON oi.Order_ID = co.Order_ID
      WHERE co.Payment_Status = 'paid'
    `;
    
    const [orderItemCheck] = await executeQuery(checkOrderItemsQuery);
    console.log('Order items from paid orders:', orderItemCheck);
    
    // Check inventory and product cost data
    const checkInventoryQuery = `
      SELECT COUNT(*) as inventory_count 
      FROM inventory i
      JOIN product p ON i.Product_ID = p.Product_ID
      WHERE p.cost_price IS NOT NULL AND p.cost_price > 0
    `;
    
    const [inventoryCheck] = await executeQuery(checkInventoryQuery);
    console.log('Products with inventory and valid cost price:', inventoryCheck);
    
    // Forward the request to the actual controller
    return inventoryController.getInventoryTurnoverReport(req, res);
  } catch (error) {
    console.error('Error in debug turnover report:', error);
    return res.status(500).json({
      success: false,
      message: 'Error in debug turnover report',
      error: error.message
    });
  }
});

// Debug route to test-run inventory turnover report without authentication
router.get('/public-debug-turnover', async (req, res) => {
  try {
    // Forward to the controller directly
    await inventoryController.getInventoryTurnoverReport(req, res);
  } catch (error) {
    console.error('Error in public debug turnover endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Error in debug endpoint',
      error: error.message
    });
  }
});

module.exports = router;