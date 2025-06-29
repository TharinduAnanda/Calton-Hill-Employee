const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with the credentials
cloudinary.config({ 
  cloud_name: 'dyuyhfrch', 
  api_key: '742696356823931', 
  api_secret: 'ibYIiCsyQI-0Yg6gOIzfZJQEc4o'
});

async function checkAndCreatePreset() {
  try {
    console.log('Checking for existing upload presets...');
    const presets = await cloudinary.api.upload_presets();
    
    // Check if ml_default preset exists
    const mlDefaultPreset = presets.presets.find(p => p.name === 'ml_default');
    
    if (mlDefaultPreset) {
      console.log('Found existing ml_default preset:', {
        name: mlDefaultPreset.name,
        unsigned: mlDefaultPreset.unsigned
      });
      
      // If the preset is unsigned, update it to be signed
      if (mlDefaultPreset.unsigned) {
        console.log('Updating preset to be signed...');
        const result = await cloudinary.api.update_upload_preset('ml_default', {
          unsigned: false,
          folder: 'products'
        });
        console.log('Updated preset:', {
          name: result.name,
          unsigned: result.unsigned,
          folder: result.folder
        });
      }
    } else {
      // Create the preset if it doesn't exist
      console.log('Creating ml_default preset...');
      const result = await cloudinary.api.create_upload_preset({
        name: 'ml_default',
        unsigned: false,
        folder: 'products'
      });
      console.log('Created new preset:', {
        name: result.name,
        unsigned: result.unsigned,
        folder: result.folder
      });
    }
    
    // Test the signed upload
    console.log('Testing signed upload...');
    
    // Generate signature
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = {
      timestamp,
      folder: 'test',
      upload_preset: 'ml_default'
    };
    
    const signature = cloudinary.utils.api_sign_request(
      params,
      cloudinary.config().api_secret
    );
    
    console.log('Generated signature for test upload');
    
    // Upload test image with signature
    const uploadResult = await cloudinary.uploader.upload(
      'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      {
        timestamp,
        folder: 'test',
        upload_preset: 'ml_default',
        api_key: cloudinary.config().api_key,
        signature
      }
    );
    
    console.log('✅ Test upload successful:', {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

// Run the check
checkAndCreatePreset()
  .then(success => {
    if (success) {
      console.log('✅ Cloudinary preset verification completed successfully');
      process.exit(0);
    } else {
      console.log('❌ Cloudinary preset verification failed');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }); 