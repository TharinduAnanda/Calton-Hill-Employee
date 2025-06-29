const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with the credentials
cloudinary.config({ 
  cloud_name: 'dyuyhfrch', 
  api_key: '742696356823931', 
  api_secret: 'ibYIiCsyQI-0Yg6gOIzfZJQEc4o'
});

// Upload a test image
cloudinary.uploader.upload(
  'https://cloudinary-res.cloudinary.com/image/upload/cloudinary_logo.png',
  { folder: "test" }
)
.then(result => {
  console.log('✅ Cloudinary connection successful!');
  console.log('Image uploaded:', result.secure_url);
})
.catch(error => {
  console.error('❌ Cloudinary connection error:', error);
}); 