import React, { useState } from 'react';
import { Button, Box, Typography, CircularProgress, IconButton, FormControl, FormControlLabel, Switch } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { uploadImage, deleteImage } from '../utils/imageUpload';

/**
 * Reusable Image Upload component
 * @param {Object} props - Component props
 * @param {function} props.onImageUploaded - Callback function when image is uploaded
 * @param {function} props.onImageDeleted - Callback function when image is deleted
 * @param {string} props.initialImage - Initial image URL if already exists
 * @param {string} props.folder - Cloudinary folder to upload to
 * @param {Object} props.imageStyles - Styles for the image preview
 * @param {number} props.standardWidth - Width to resize image to (default: 800)
 * @param {number} props.standardHeight - Height to resize image to (default: 800)
 * @param {boolean} props.maintainAspectRatio - Whether to maintain aspect ratio (default: true)
 * @param {boolean} props.showResizeToggle - Whether to show the resize toggle option (default: true)
 */
const ImageUpload = ({ 
  onImageUploaded, 
  onImageDeleted, 
  initialImage = null, 
  folder = 'inventory',
  imageStyles = { maxWidth: '100%', maxHeight: '300px' },
  standardWidth = 800,
  standardHeight = 800,
  maintainAspectRatio = true,
  showResizeToggle = true
}) => {
  const [image, setImage] = useState(initialImage);
  const [publicId, setPublicId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enableResize, setEnableResize] = useState(true);

  // Function to resize the image using Canvas API
  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      // Create a FileReader instance
      const reader = new FileReader();
      
      // Set up the reader onload callback
      reader.onload = (event) => {
        // Create an Image object
        const img = new Image();
        
        // Set up image onload callback
        img.onload = () => {
          // Calculate dimensions while maintaining aspect ratio if needed
          let width = standardWidth;
          let height = standardHeight;
          
          if (maintainAspectRatio) {
            // Calculate aspect ratio
            const aspectRatio = img.width / img.height;
            
            if (img.width > img.height) {
              // Landscape image
              width = standardWidth;
              height = width / aspectRatio;
            } else {
              // Portrait image
              height = standardHeight;
              width = height * aspectRatio;
            }
          }
          
          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          // Draw the image on canvas
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Get the resized image as a data URL
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob conversion failed'));
              return;
            }
            
            // Create a new File object
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            
            resolve(resizedFile);
          }, file.type);
        };
        
        // Handle image loading error
        img.onerror = () => {
          reject(new Error('Failed to load image for resizing'));
        };
        
        // Set the image source to the FileReader result
        img.src = event.target.result;
      };
      
      // Handle FileReader errors
      reader.onerror = () => {
        reject(new Error('Failed to read file for resizing'));
      };
      
      // Read the file as a data URL
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Process the file if resize is enabled
      let processedFile = file;
      if (enableResize) {
        try {
          processedFile = await resizeImage(file);
          console.log(`Image resized: Original: ${file.size} bytes, Resized: ${processedFile.size} bytes`);
        } catch (resizeError) {
          console.error('Error resizing image:', resizeError);
          // Continue with original file if resize fails
          processedFile = file;
        }
      }

      // Upload image to Cloudinary
      const result = await uploadImage(processedFile, { folder });
      
      // Update state with the uploaded image URL and public_id
      setImage(result.secure_url);
      setPublicId(result.public_id);
      
      // Call the callback function with the result
      if (onImageUploaded) {
        onImageUploaded({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height
        });
      }
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!publicId && !image) return;
    
    try {
      setLoading(true);
      
      // If we have a public ID, delete from Cloudinary
      if (publicId) {
        await deleteImage(publicId);
      }
      
      // Update state
      setImage(null);
      setPublicId(null);
      
      // Call the callback function
      if (onImageDeleted) {
        onImageDeleted();
      }
    } catch (err) {
      setError('Failed to delete image. Please try again.');
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {showResizeToggle && (
        <FormControl component="fieldset" sx={{ mb: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={enableResize}
                onChange={(e) => setEnableResize(e.target.checked)}
                color="primary"
              />
            }
            label="Standardize image size"
          />
          <Typography variant="caption" color="text.secondary">
            {enableResize ? 
              `Images will be resized to standard dimensions (${maintainAspectRatio ? 'preserving aspect ratio' : `${standardWidth}x${standardHeight}px`})` : 
              'Images will be uploaded with original dimensions'}
          </Typography>
        </FormControl>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress />
        </Box>
      ) : image ? (
        <Box position="relative" my={2}>
          <img 
            src={image} 
            alt="Uploaded preview" 
            style={imageStyles} 
          />
          <IconButton 
            color="error" 
            onClick={handleDelete}
            style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(255,255,255,0.7)' }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ) : (
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUploadIcon />}
          fullWidth
          sx={{ my: 2, p: 2, border: '1px dashed grey' }}
        >
          Upload Image
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />
        </Button>
      )}
      
      {error && (
        <Typography color="error" variant="body2" my={1}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default ImageUpload; 