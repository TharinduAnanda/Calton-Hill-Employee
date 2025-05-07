const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

// Protected route for generating upload signatures
router.get('/signature', protect, uploadController.getSignature);

module.exports = router;