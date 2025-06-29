import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Grid } from '@mui/material';
import ImageUpload from './ImageUpload';

const ImageUploadExample = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    imagePublicId: ''
  });

  const handleImageUploaded = (imageData) => {
    setFormData({
      ...formData,
      imageUrl: imageData.url,
      imagePublicId: imageData.publicId
    });
  };

  const handleImageDeleted = () => {
    setFormData({
      ...formData,
      imageUrl: '',
      imagePublicId: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the formData to your API
    console.log('Form submitted with data:', formData);
    alert('Form submitted with image: ' + (formData.imageUrl || 'No image'));
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', my: 4 }}>
      <Typography variant="h5" gutterBottom>
        Product Form with Image Upload
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Price"
              name="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Product Image
            </Typography>
            <ImageUpload
              onImageUploaded={handleImageUploaded}
              onImageDeleted={handleImageDeleted}
              initialImage={formData.imageUrl}
              folder="products"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth
              disabled={!formData.name || !formData.price}
            >
              Save Product
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default ImageUploadExample; 