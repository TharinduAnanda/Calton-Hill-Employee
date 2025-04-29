const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/login', staffController.loginStaff);  // Changed from login to loginStaff

// Protected routes
router.use(authMiddleware.protect);

// This route is duplicated - removing one
router.get('/', 
  authMiddleware.requireRole('owner'), 
  staffController.getAllStaff
);

router.post('/', 
  authMiddleware.requireRole('owner'), 
  staffController.createStaff  // Changed from create to createStaff
);

router.get('/:id', 
  staffController.getStaffById
);

router.put('/:id', 
  staffController.updateStaff
);

router.delete('/:id', 
  authMiddleware.requireRole('owner'), 
  staffController.deleteStaff
);

module.exports = router;