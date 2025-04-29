const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const authMiddleware = require('../middleware/authMiddleware');

// Debug middleware verification
console.log('Owner Routes Middleware Check:', {
  protectOwner: typeof authMiddleware.protectOwner,
  requireRole: typeof authMiddleware.requireRole
});

// Apply JSON middleware to all routes
router.use(authMiddleware.ensureJson);

// Public routes
router.post('/login', ownerController.login);

// Owner-protected routes
router.use(authMiddleware.protectOwner);

// Profile management
router.get('/profile', ownerController.getProfile);
router.put('/profile', ownerController.updateProfile);

// Staff management (owner role required)
router.post('/staff', 
  authMiddleware.requireRole('owner'), 
  ownerController.createStaff
);
router.get('/staff', 
  authMiddleware.requireRole('owner'), 
  ownerController.getAllStaff
);
router.get('/staff/:id', 
  authMiddleware.requireRole('owner'), 
  ownerController.getStaffById
);
router.put('/staff/:id', 
  authMiddleware.requireRole('owner'), 
  ownerController.updateStaff
);
router.delete('/staff/:id', 
  authMiddleware.requireRole('owner'), 
  ownerController.deleteStaff
);

module.exports = router;