const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { protect, requireRole } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(protect);

// GET /api/staff - Get all staff members (owner only)
router.get('/', requireRole(['owner']), staffController.getAllStaff);

// GET /api/staff/:staffId - Get a specific staff member
router.get('/:staffId', requireRole(['owner']), staffController.getStaffById);

// POST /api/staff - Create a new staff member (owner only)
router.post('/', requireRole(['owner']), staffController.createStaff);

// PUT /api/staff/:staffId - Update a staff member
router.put('/:staffId', requireRole(['owner']), staffController.updateStaff);

// DELETE /api/staff/:staffId - Delete a staff member (owner only)
router.delete('/:staffId', requireRole(['owner']), staffController.deleteStaff);

// PUT /api/staff/profile - Update own profile (for staff members)
router.put('/profile', requireRole(['staff', 'manager']), staffController.updateSelfProfile);

module.exports = router;