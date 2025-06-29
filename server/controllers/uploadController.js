const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with your credentials
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dyuyhfrch', 
  api_key: process.env.CLOUDINARY_API_KEY || '742696356823931', 
  api_secret: process.env.CLOUDINARY_API_SECRET || 'ibYIiCsyQI-0Yg6gOIzfZJQEc4o' // Keep this server-side only
});

/**
 * Generate a signature for Cloudinary uploads
 */
const getSignature = (req, res) => {
  try {
    console.log('Generating Cloudinary signature');
    console.log('Cloudinary config:', {
      cloud_name: cloudinary.config().cloud_name,
      api_key: cloudinary.config().api_key,
      api_secret_exists: !!cloudinary.config().api_secret
    });
    
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Add folder to the signature params to ensure it's included in the signature
    const folder = req.query.folder || 'products';
    console.log('Using folder:', folder);
    
    // Create params object with all parameters that will be sent to Cloudinary
    // Include all parameters that will be sent to Cloudinary in the upload
    const params = {
      timestamp: timestamp,
      folder: folder,
      upload_preset: 'ml_default'  // Add the upload preset
    };
    
    // If using transformation, include it in the signature
    if (folder === 'products') {
      params.transformation = 'c_limit,w_800,h_800,q_auto';
    }
    
    console.log('Signing parameters:', params);
    
    // Generate signature based on all these parameters
    const signature = cloudinary.utils.api_sign_request(
      params,
      cloudinary.config().api_secret
    );
    
    console.log('Signature generated successfully');
    
    res.status(200).json({
      timestamp,
      signature,
      folder,
      cloudname: cloudinary.config().cloud_name,
      apikey: cloudinary.config().api_key,
      upload_preset: 'ml_default',  // Include in response
      transformation: folder === 'products' ? 'c_limit,w_800,h_800,q_auto' : undefined
    });
  } catch (error) {
    console.error('Error generating signature:', error);
    res.status(500).json({ 
      message: 'Error generating upload signature',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete an image from Cloudinary
 */
const deleteImage = async (req, res) => {
  try {
    const publicId = req.params.publicId;
    
    if (!publicId) {
      return res.status(400).json({ message: 'Public ID is required' });
    }
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.status(200).json({ message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ message: 'Image not found or could not be deleted' });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Error deleting image from Cloudinary' });
  }
};

module.exports = {
  getSignature,
  deleteImage
};