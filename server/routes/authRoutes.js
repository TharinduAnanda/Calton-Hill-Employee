const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public authentication routes
router.post('/login', authController.loginStaff); // Staff login endpoint
router.post('/owner/login', authController.loginOwner); // Owner login endpoint
router.post('/verify-staff', authController.verifyStaffEmail); // New endpoint for verifying staff email
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/me', protect, authController.getCurrentUser);
router.get('/validate-token', protect, authController.validateToken);

module.exports = router;