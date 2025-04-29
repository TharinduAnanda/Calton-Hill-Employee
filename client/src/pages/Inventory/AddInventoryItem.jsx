import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInventoryItem } from '../../services/inventoryService';
import productService from '../../services/productService';
import { getSuppliers } from '../../services/supplierService';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const AddInventoryItem = () => {
  const initialFormState = {
    sku: '',
    name: '',
    description: '',
    category: '',
    quantity: 0,
    reorderThreshold: 10,
    costPrice: 0,
    sellPrice: 0,
    productId: '',
    supplierId: '',
    location: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductsAndSuppliers = async () => {
      try {
        setLoadingProducts(true);
        setLoadingSuppliers(true);
        
        const productsData = await productService.getAllProducts();
        setProducts(productsData);
        
        const suppliersData = await getSuppliers();
        setSuppliers(suppliersData);
      } catch (err) {
        setError('Failed to load products or suppliers');
      } finally {
        setLoadingProducts(false);
        setLoadingSuppliers(false);
      }
    };

    fetchProductsAndSuppliers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For numeric fields, convert string to number
    if (['quantity', 'reorderThreshold', 'costPrice', 'sellPrice'].includes(name)) {
      setFormData({
        ...formData,
        [name]: value === '' ? '' : Number(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleProductSelect = (e) => {
    const productId = e.target.value;
    const selectedProduct = products.find(product => product._id === productId);
    
    if (selectedProduct) {
      setFormData({
        ...formData,
        productId,
        name: selectedProduct.name,
        description: selectedProduct.description,
        category: selectedProduct.category,
        sellPrice: selectedProduct.price,
      });
    }
  };

  const validateForm = () => {
    if (!formData.sku || !formData.name || formData.quantity < 0) {
      setError('Please fill in all required fields correctly');
      return false;
    }
    
    if (formData.sellPrice < formData.costPrice) {
      setError('Selling price cannot be less than cost price');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await createInventoryItem(formData);
      navigate('/inventory');
    } catch (err) {
      setError(err.message || 'Failed to create inventory item');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink component={Link} to="/" underline="hover" sx={{ display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Dashboard
        </MuiLink>
        <MuiLink component={Link} to="/inventory" underline="hover">
          Inventory
        </MuiLink>
        <Typography color="text.primary">Add Item</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Add Inventory Item
        </Typography>
        <Button
          component={Link}
          to="/inventory"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          Back to Inventory
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                name="sku"
                label="SKU"
                value={formData.sku}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="product-select-label">Product</InputLabel>
                <Select
                  labelId="product-select-label"
                  name="productId"
                  value={formData.productId}
                  onChange={handleProductSelect}
                  label="Product"
                  disabled={loadingProducts}
                >
                  <MenuItem value="">
                    <em>None (Custom Item)</em>
                  </MenuItem>
                  {products.map((product) => (
                    <MenuItem key={product._id} value={product._id}>
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                name="name"
                label="Item Name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="category"
                label="Category"
                value={formData.category}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="supplier-select-label">Supplier</InputLabel>
                <Select
                  labelId="supplier-select-label"
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleChange}
                  label="Supplier"
                  disabled={loadingSuppliers}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier._id} value={supplier._id}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                required
                type="number"
                name="quantity"
                label="Quantity"
                value={formData.quantity}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                name="reorderThreshold"
                label="Reorder Threshold"
                value={formData.reorderThreshold}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                name="location"
                label="Storage Location"
                value={formData.location}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="number"
                name="costPrice"
                label="Cost Price"
                value={formData.costPrice}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="number"
                name="sellPrice"
                label="Sell Price"
                value={formData.sellPrice}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 }
                }}
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<SaveIcon />}
                disabled={loading}
                sx={{ mr: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Item'}
              </Button>
              <Button
                component={Link}
                to="/inventory"
                variant="outlined"
                size="large"
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default AddInventoryItem;