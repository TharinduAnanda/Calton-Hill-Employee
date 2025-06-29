const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware'); // Fixed the import path

// All routes are protected
router.use(protect); // Using the protect function directly

// Regular order routes
router.get('/', orderController.getAllOrders);
router.get('/stats', orderController.getOrderStats);
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', orderController.updateOrderStatus);
router.post('/', orderController.createOrder);

// Manager-specific routes
router.get('/manager/stats', orderController.getManagerOrderStats);
router.get('/manager/filtered', orderController.getFilteredOrders);
router.put('/:id/payment', orderController.updateOrderPayment);
router.put('/:id/assign-staff', orderController.assignStaffToOrder);

module.exports = router;