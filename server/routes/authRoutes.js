const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { executeQuery } = require('../config/db');

// IMPORTANT: Import middleware directly, not as destructured object
const authMiddleware = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

// Debug verification
console.log('Middleware verification:', {
  protect: typeof authMiddleware.protect,
  protectStaff: typeof authMiddleware.protectStaff,
  ensureJson: typeof authMiddleware.ensureJson
});

// Apply middleware
router.use(authMiddleware.ensureJson);
router.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

// Routes
router.get('/verify', authMiddleware.protect, (req, res) => {
  res.json({
    valid: true,
    user: req.user
  });
});

router.post('/reset-password-temp', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await executeQuery(
      'UPDATE owner SET Password = ? WHERE Email = ?',
      [hashedPassword, email]
    );
    
    res.json({ success: true, message: 'Password updated' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ success: false, message: 'Reset failed' });
  }
});

// Authentication routes
router.post('/staff/login', authController.loginStaff);
router.post('/owner/login', authController.loginOwner); 

// Staff routes
router.post('/staff/register', (req, res) => {
  res.status(501).json({ message: 'Staff registration not implemented yet' });
});

router.get('/staff/profile', authMiddleware.protect, (req, res) => {
  res.status(501).json({ message: 'Staff profile endpoint not implemented yet' });
});

// Error handling
router.use((err, req, res, next) => {
  console.error('Route error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = router;