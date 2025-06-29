import { Cloudinary } from 'cloudinary-core';

const cloudinaryConfig = {
  cloudName: 'dyuyhfrch',
  apiKey: '742696356823931',
  uploadPreset: 'ml_default'
};

export const cloudinary = new Cloudinary({
  cloud_name: cloudinaryConfig.cloudName,
  secure: true
});

export default cloudinaryConfig;