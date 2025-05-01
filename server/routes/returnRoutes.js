const express = require('express');
const { body } = require('express-validator');
const returnsController = require('../controllers/returnsController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Get all returns with filtering
router.get('/', authorizeRoles(['owner', 'manager', 'staff']), returnsController.getReturns);

// Get returns statistics
router.get('/statistics', authorizeRoles(['owner', 'manager']), returnsController.getReturnsStatistics);

// Get single return details
router.get('/:id', authorizeRoles(['owner', 'manager', 'staff']), returnsController.getReturnById);

// Create a new return
router.post('/', [
  body('order_id').notEmpty().withMessage('Order ID is required'),
  body('customer_id').notEmpty().withMessage('Customer ID is required'),
  body('return_reason').notEmpty().withMessage('Return reason is required'),
  body('items').isArray().withMessage('Items must be an array')
], authorizeRoles(['owner', 'manager', 'staff']), returnsController.createReturn);

// Process a return (approve/reject)
router.patch('/:id/process', [
  body('status').isIn(['APPROVED', 'REJECTED']).withMessage('Status must be either APPROVED or REJECTED')
], authorizeRoles(['owner', 'manager']), returnsController.processReturn);

// Complete a return
router.patch('/:id/complete', [
  body('refund_method').notEmpty().withMessage('Refund method is required')
], authorizeRoles(['owner', 'manager']), returnsController.completeReturn);

module.exports = router;