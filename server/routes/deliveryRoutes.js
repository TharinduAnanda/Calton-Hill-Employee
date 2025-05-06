const express = require('express');
const { body } = require('express-validator');
const deliveryController = require('../controllers/deliveryController');
const { authenticateJWT } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Delivery zones
router.get('/zones', deliveryController.getAllDeliveryZones);
router.post('/zones', [
  body('zone_name').notEmpty().withMessage('Zone name is required')
], deliveryController.createDeliveryZone);

// Vehicles
router.get('/vehicles', deliveryController.getAllVehicles);
router.post('/vehicles', [
  body('vehicle_name').notEmpty().withMessage('Vehicle name is required'),
  body('vehicle_number').notEmpty().withMessage('Vehicle number is required'),
  body('vehicle_type').notEmpty().withMessage('Vehicle type is required')
], deliveryController.createVehicle);

// Schedule and manage deliveries
router.get('/', deliveryController.getDeliveries);
router.get('/:id', deliveryController.getDeliveryDetails);
router.post('/schedule', [
  body('order_id').isNumeric().withMessage('Order ID is required')
], deliveryController.scheduleDelivery);
router.patch('/:id/status', [
  body('status').notEmpty().withMessage('Status is required')
], deliveryController.updateDeliveryStatus);

// Delivery drivers
router.get('/drivers', deliveryController.getDeliveryDrivers);

module.exports = router;