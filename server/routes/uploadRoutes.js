const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

// Make signature route public (remove protect middleware)
router.get('/signature', uploadController.getSignature);

// Protected route for deleting images
router.delete('/image/:publicId', protect, uploadController.deleteImage);

module.exports = router;