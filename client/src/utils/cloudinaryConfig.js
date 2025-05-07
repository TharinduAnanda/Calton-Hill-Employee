import { Cloudinary } from 'cloudinary-core';

const cloudinaryConfig = {
  cloudName: 'djy8hclco',
  apiKey: '172476961585941',
  uploadPreset: 'ml_default' // Use an unsigned upload preset
};

export const cloudinary = new Cloudinary({
  cloud_name: cloudinaryConfig.cloudName,
  secure: true
});

export default cloudinaryConfig;