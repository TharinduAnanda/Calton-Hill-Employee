import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText
} from '@mui/material';
import { createSupplier, updateSupplier, getSupplierById } from '../../services/supplierService';
import productService from '../../services/productService';
import { toast } from 'react-toastify';

// Import styles
import './SupplierForm.css';

const SupplierForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    products: [] // Array of product IDs
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch products
        setLoadingProducts(true);
        const productsData = await productService.getAllProducts();
        setProducts(Array.isArray(productsData) ? productsData : 
                  (productsData?.data ? productsData.data : []));
        setLoadingProducts(false);
        
        // If editing, fetch supplier data
        if (isEditing) {
          setLoading(true);
          const response = await getSupplierById(id);
          const supplier = response.data;
          
          setFormData({
            name: supplier.Name || '',
            contactPerson: supplier.Contact_Person || '',
            email: supplier.Email || '',
            phone: supplier.Phone_Number || '',
            address: {
              street: supplier.street || '',
              city: supplier.city || '',
              state: supplier.state || '',
              zipCode: supplier.zipCode || '',
              country: supplier.country || ''
            },
            products: supplier.products ? supplier.products.map(p => p.Product_ID) : []
          });
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to load data');
        console.error('Error loading form data:', err);
        setLoading(false);
        setLoadingProducts(false);
      }
    };
    
    fetchInitialData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested address fields
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleProductChange = (event) => {
    const {
      target: { value },
    } = event;
    
    setFormData({
      ...formData,
      products: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        name: formData.name,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        // Address fields
        street: formData.address.street,
        city: formData.address.city,
        state: formData.address.state,
        zipCode: formData.address.zipCode,
        country: formData.address.country,
        // Products
        products: formData.products || []
      };
      
      console.log('Submitting supplier data:', payload);
      
      let response;
      
      // Use a longer timeout for this specific request
      const requestConfig = { timeout: 30000 };
      
      if (isEditing) {
        console.log(`Updating supplier #${id}...`);
        response = await updateSupplier(id, payload, requestConfig);
      } else {
        console.log('Creating new supplier...');
        response = await createSupplier(payload, requestConfig);
      }
      
      console.log('Server response:', response);
      
      toast.success(isEditing ? 'Supplier updated successfully!' : 'Supplier created successfully!');
      navigate('/suppliers');
    } catch (err) {
      console.error('Error saving supplier:', err);
      
      // Improved error reporting
      let errorMessage = 'An unknown error occurred while saving the supplier.';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'The request took too long to complete. Please try again later.';
      } else if (err.response) {
        // Server responded with an error status
        errorMessage = err.response.data?.message || `Server error (${err.response.status})`;
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'No response received from server. Please check your connection.';
      } else {
        // Something else went wrong
        errorMessage = err.message || 'An error occurred while processing your request.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" className="form-container">
      <Paper elevation={3} className="form-paper">
        <Typography variant="h4" className="form-title">
          {isEditing ? 'Edit Supplier' : 'Add New Supplier'}
        </Typography>
        
        {error && (
          <Typography color="error" className="error-message">
            {error}
          </Typography>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit} className="form-content">
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" className="section-title">
                  Basic Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6} className="form-field">
                <TextField
                  label="Company Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} md={6} className="form-field">
                <TextField
                  label="Contact Person"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  helperText="Name of your primary contact at this supplier"
                />
              </Grid>
              
              <Grid item xs={12} md={6} className="form-field">
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} md={6} className="form-field">
                <TextField
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              
              {/* Address Information */}
              <Grid item xs={12}>
                <Typography variant="h6" className="section-title">
                  Address Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} className="form-field">
                <TextField
                  label="Street Address"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} md={6} className="form-field">
                <TextField
                  label="City"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} md={6} className="form-field">
                <TextField
                  label="State/Province"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} md={6} className="form-field">
                <TextField
                  label="ZIP/Postal Code"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} md={6} className="form-field">
                <TextField
                  label="Country"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              
              {/* Product Selection */}
              <Grid item xs={12}>
                <Typography variant="h6" className="section-title">
                  Products Supplied
                </Typography>
              </Grid>
              
              <Grid item xs={12} className="form-field">
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Products</InputLabel>
                  <Select
                    multiple
                    value={formData.products}
                    onChange={handleProductChange}
                    input={<OutlinedInput label="Products" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((productId) => {
                          const product = products.find(p => p.Product_ID === productId);
                          return (
                            <Chip 
                              key={productId} 
                              label={product ? product.Name : productId} 
                              size="small" 
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {loadingProducts ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} />
                      </MenuItem>
                    ) : (
                      products.map((product) => (
                        <MenuItem key={product.Product_ID} value={product.Product_ID}>
                          <Checkbox checked={formData.products.indexOf(product.Product_ID) > -1} />
                          <ListItemText primary={product.Name} secondary={`SKU: ${product.SKU || 'N/A'}`} />
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} className="form-actions">
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                  className="submit-button"
                >
                  {loading ? 'Saving...' : isEditing ? 'Update Supplier' : 'Create Supplier'}
                </Button>
                
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate('/suppliers')}
                  className="cancel-button"
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </Paper>
    </Container>
  );
};

export default SupplierForm;