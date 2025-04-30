const express = require('express');
const { body } = require('express-validator');
const customerController = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Customer management
router.get('/', customerController.getAllCustomers);
router.get('/segments/all', customerController.getCustomerSegments);
router.post('/segments', [
  body('segment_name').notEmpty().withMessage('Segment name is required')
], customerController.createCustomerSegment);

// Support tickets
router.get('/support/tickets', customerController.getTickets);
router.get('/support/tickets/:id', customerController.getTicketDetails);
router.post('/support/tickets', [
  body('customer_id').isNumeric().withMessage('Valid customer ID is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('description').notEmpty().withMessage('Description is required')
], customerController.createTicket);
router.post('/support/tickets/:id/message', [
  body('message').notEmpty().withMessage('Message is required')
], customerController.addTicketMessage);
router.patch('/support/tickets/:id/status', [
  body('status').notEmpty().withMessage('Status is required')
], customerController.updateTicketStatus);

// Put more specific routes before generic ones with parameters
router.get('/:id', customerController.getCustomerDetails);
router.patch('/:id', [
  body('email').optional().isEmail().withMessage('Valid email is required')
], customerController.updateCustomer);

module.exports = router;