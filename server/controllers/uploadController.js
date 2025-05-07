const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with your credentials
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'djy8hclco', 
  api_key: process.env.CLOUDINARY_API_KEY || '172476961585941', 
  api_secret: process.env.CLOUDINARY_API_SECRET // Keep this server-side only
});

/**
 * Generate a signature for Cloudinary uploads
 */
const getSignature = (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, upload_preset: 'ml_default' },
      cloudinary.config().api_secret
    );
    
    res.status(200).json({ 
      timestamp, 
      signature,
      cloudname: cloudinary.config().cloud_name,
      apikey: cloudinary.config().api_key
    });
  } catch (error) {
    console.error('Error generating signature:', error);
    res.status(500).json({ message: 'Error generating upload signature' });
  }
};

module.exports = {
  getSignature
};