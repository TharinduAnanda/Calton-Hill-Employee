const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with the credentials
cloudinary.config({ 
  cloud_name: 'dyuyhfrch', 
  api_key: '742696356823931', 
  api_secret: 'ibYIiCsyQI-0Yg6gOIzfZJQEc4o'
});

// Create a signed upload preset for products
const createProductsPreset = async () => {
  try {
    const result = await cloudinary.api.create_upload_preset({
      name: 'ml_default',
      unsigned: false,
      folder: 'products',
      allowed_formats: 'jpg,png,jpeg,gif,webp'
    });
    
    console.log('✅ Upload preset created successfully:', result.name);
    console.log('Settings:', {
      folder: result.folder,
      unsigned: result.unsigned,
      allowed_formats: result.allowed_formats
    });
    
    return result;
  } catch (error) {
    // If preset already exists, update it
    if (error.error && error.error.message === 'Upload preset already exists') {
      console.log('Preset already exists, updating settings...');
      try {
        const updateResult = await cloudinary.api.update_upload_preset('ml_default', {
          unsigned: false,
          folder: 'products',
          allowed_formats: 'jpg,png,jpeg,gif,webp'
        });
        
        console.log('✅ Upload preset updated successfully:', updateResult.name);
        console.log('Updated settings:', {
          folder: updateResult.folder,
          unsigned: updateResult.unsigned,
          allowed_formats: updateResult.allowed_formats
        });
        
        return updateResult;
      } catch (updateError) {
        console.error('❌ Error updating preset:', updateError);
        throw updateError;
      }
    } else {
      console.error('❌ Error creating preset:', error);
      throw error;
    }
  }
};

createProductsPreset()
  .then(() => console.log('Done!'))
  .catch(error => console.error('Failed to complete operation:', error)); 