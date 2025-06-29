const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrderController');
const { protect } = require('../middleware/authMiddleware');

// Generate a PO number without creating an order
// This route must come first to avoid conflicts with /:id
router.get('/generate-po-number', (req, res) => {
  console.log("Generate PO Number route hit");
  purchaseOrderController.generatePONumber(req, res);
});

// Get all purchase orders
router.get('/', protect, purchaseOrderController.getAllPurchaseOrders);

// Get purchase order by ID
router.get('/:id', protect, purchaseOrderController.getPurchaseOrderById);

// Create new purchase order - removed auth middleware temporarily for testing
router.post('/', purchaseOrderController.createPurchaseOrder);

// Update purchase order status only route
router.put('/:id/status', protect, purchaseOrderController.updatePurchaseOrderStatus);

// Receive items (partial fulfillment)
router.put('/:id/receive-items', protect, purchaseOrderController.receiveItems);

// Update purchase order
router.put('/:id', protect, purchaseOrderController.updatePurchaseOrder);

// Delete purchase order
router.delete('/:id', protect, purchaseOrderController.deletePurchaseOrder);

// Generate PDF for purchase order
router.get('/:id/pdf', purchaseOrderController.generatePDF);

// Send purchase order email
router.post('/:id/send-email', protect, purchaseOrderController.sendEmail);

module.exports = router;