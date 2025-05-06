const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { protect } = require('../middleware/authMiddleware'); // Changed from '../middleware/auth'

// GET all suppliers
router.get('/', protect, supplierController.getSuppliers);

// GET supplier by ID
router.get('/:id', protect, supplierController.getSupplierById);

// POST create new supplier
router.post('/', protect, supplierController.createSupplier);

// PUT update supplier
router.put('/:id', protect, supplierController.updateSupplier);

// DELETE supplier
router.delete('/:id', protect, supplierController.deleteSupplier);

// GET supplier inventory
router.get('/:id/inventory', protect, supplierController.getSupplierInventory);

module.exports = router;