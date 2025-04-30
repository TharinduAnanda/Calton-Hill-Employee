const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply JSON middleware to all routes
router.use(authMiddleware.ensureJson);

// Public routes
router.post('/login', ownerController.login);

// Protected routes - use the generic protect middleware instead of non-existent protectOwner
router.use(authMiddleware.protect);

// Profile management - also check for owner role
router.get('/profile', authMiddleware.requireRole(['owner']), ownerController.getProfile);
router.put('/profile', authMiddleware.requireRole(['owner']), ownerController.updateProfile);

// Staff management (owner role required)
router.post('/staff', 
  authMiddleware.requireRole(['owner']), 
  ownerController.createStaff
);
router.get('/staff', 
  authMiddleware.requireRole(['owner']), 
  ownerController.getAllStaff
);
router.get('/staff/:id', 
  authMiddleware.requireRole(['owner']), 
  ownerController.getStaffById
);
router.put('/staff/:id', 
  authMiddleware.requireRole(['owner']), 
  ownerController.updateStaff
);
router.delete('/staff/:id', 
  authMiddleware.requireRole(['owner']), 
  ownerController.deleteStaff
);

module.exports = router;