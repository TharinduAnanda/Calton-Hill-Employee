import axios from 'axios'; // Regular axios for Cloudinary
import axiosWithAuth from './axiosConfig'; // Authenticated axios for our server
import cloudinaryConfig from './cloudinaryConfig';

/**
 * Upload an image to Cloudinary
 * @param {File} file - The file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload result
 */
export const uploadImage = async (file, options = {}) => {
  try {
    // Set default folder if not provided
    const folder = options.folder || 'products';
    
    console.log('Starting image upload process for folder:', folder);
    
    // Get the upload signature from our backend
    // Pass the folder parameter to the signature request
    console.log('Requesting upload signature from server...');
    const signatureResponse = await axiosWithAuth.get(`/api/upload/signature?folder=${folder}`);
    console.log('Signature received from server');
    
    const { 
      signature, 
      timestamp, 
      apikey, 
      cloudname, 
      folder: signedFolder,
      upload_preset,
      transformation
    } = signatureResponse.data;

    // Create form data for the upload - IMPORTANT: include ALL parameters that were used in signature
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apikey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', signedFolder);
    formData.append('upload_preset', upload_preset);
    
    // Add transformation if it was included in the signature
    if (transformation) {
      formData.append('transformation', transformation);
    }
    
    // Add other optional parameters
    if (options.public_id) {
      formData.append('public_id', options.public_id);
    }
    
    console.log('Uploading to Cloudinary with params:', {
      cloudname,
      apikey: apikey.substring(0, 5) + '...',
      timestamp,
      folder: signedFolder,
      upload_preset,
      transformation: transformation || 'none',
      hasSignature: !!signature
    });
    
    // Upload to Cloudinary using regular axios (no auth header)
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudname}/image/upload`;
    console.log('Sending request to Cloudinary URL:', cloudinaryUrl);
    
    const uploadResponse = await axios.post(
      cloudinaryUrl,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    
    console.log('Upload successful, response received from Cloudinary');
    return uploadResponse.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    
    // Enhanced error reporting
    if (error.response) {
      console.error('Cloudinary response status:', error.response.status);
      console.error('Cloudinary response data:', error.response.data);
    }
    
    throw error;
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteImage = async (publicId) => {
  try {
    // Use authenticated request for deleting images via our server
    const response = await axiosWithAuth.delete(`/api/upload/image/${publicId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}; 