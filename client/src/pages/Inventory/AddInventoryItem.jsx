import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import inventoryService from '../../services/inventoryService';
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
  Divider,
  Card,
  CardContent,
  CardHeader,
  Tooltip,
  styled,
} from '@mui/material';
import { 
  Home as HomeIcon, 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  LocalShipping as SupplierIcon,
  AttachMoney as PriceIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import axios from 'axios';



// Styled components
const StyledFormField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${theme.palette.primary.light}30`,
    },
  },
  '& .MuiInputBase-input': {
    padding: '16px',
    borderRadius: '8px',
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  '& .MuiOutlinedInput-notchedOutline': {
    transition: 'border-color 0.3s ease',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${theme.palette.primary.light}30`,
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  border: '1px solid #eef2f6',
  overflow: 'visible',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
  },
}));

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: '#f9fafc',
  '& .MuiCardHeader-title': {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.primary.main,
    fontWeight: 600,
    fontSize: '1.1rem',
  },
}));

const StyledCardContent = styled(CardContent)({
  padding: '24px',
});

const FormSectionTitle = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
}));

const FieldContainer = styled(Box)(({ theme }) => ({
  padding: '16px',
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  border: '1px solid transparent',
  marginBottom: theme.spacing(2),
  position: 'relative',
  '&:hover': {
    backgroundColor: 'rgba(25,118,210,0.02)',
    borderColor: 'rgba(25,118,210,0.1)',
  },
}));

const FieldLabel = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  fontWeight: 500,
  color: theme.palette.grey[700],
  fontSize: '0.875rem',
  display: 'flex',
  alignItems: 'center',
}));

const FieldIcon = styled('span')({
  marginRight: '8px',
});

const HelperText = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.grey[600],
  marginTop: theme.spacing(0.5),
}));

const PageHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const FormActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
  marginTop: theme.spacing(4),
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const AddInventoryItem = () => {
  const initialFormState = {
    sku: '',
    name: '',
    description: '',
    category: '',
    subcategory: '',
    brand: '',
    manufacturer: '',
    quantity: 0,
    reorderThreshold: 10,
    costPrice: 0,
    sellPrice: 0,
    productId: '',
    supplier_id: '',
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
        setSuppliers(Array.isArray(suppliersData?.data) ? suppliersData.data : []);
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
    const errors = {};

    if (!formData.sku) errors.sku = 'SKU is required';
    if (!formData.name) errors.name = 'Name is required';
    if (formData.quantity < 0) errors.quantity = 'Quantity cannot be negative';
    if (formData.sellPrice < formData.costPrice) {
      errors.sellPrice = 'Selling price cannot be less than cost price';
    }
    
    // Validate that productId is a valid integer if provided
    if (formData.productId && isNaN(parseInt(formData.productId, 10))) {
      errors.productId = 'Product ID must be a valid number';
    }
    
    // Validate that supplier_id is a valid integer if provided
    if (formData.supplier_id && isNaN(parseInt(formData.supplier_id, 10))) {
      errors.supplier_id = 'Supplier ID must be a valid number';
    }

    // Log all validation errors
    if (Object.keys(errors).length > 0) {
      console.log('Validation errors:', errors);
      setError(Object.values(errors).join(', '));
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
      
      // Create the data in the exact format the API expects
      const formattedData = {
        // Basic information
        sku: formData.sku,
        name: formData.name,
        description: formData.description,
        
        // Classification
        category: formData.category,
        subcategory: formData.subcategory || '',
        brand: formData.brand || '',
        manufacturer: formData.manufacturer || '',
        
        // Stock information
        quantity: Number(formData.quantity), 
        reorderThreshold: Number(formData.reorderThreshold), 
        location: formData.location || '',
        
        // Price information
        costPrice: Number(formData.costPrice),
        sellPrice: Number(formData.sellPrice),
        
        // References - converting string IDs to integers or null if empty
        productId: formData.productId ? parseInt(formData.productId, 10) : null,
        supplier_id: formData.supplier_id ? parseInt(formData.supplier_id, 10) : null,
      };
      
      // Log data being sent to help debug
      console.log("Sending to inventory service:", formattedData);
      
      await inventoryService.createInventoryItem(formattedData);
      console.log("Item created successfully!");
      
      navigate('/inventory');
    } catch (err) {
      console.error('Form submission error:', err);
      
      // Extract and display the specific error messages from the response
      let errorMessage = 'Failed to create inventory item';
      
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMessage = err.response.data.errors
          .map(e => e.msg || e.message || JSON.stringify(e))
          .join(', ');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      padding: 3, 
      maxWidth: 1200, 
      margin: '0 auto', 
      backgroundColor: '#f9fafc',
      borderRadius: 2,
    }}>
      {/* Breadcrumb navigation */}
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

      {/* Page header */}
      <PageHeader>
        <Typography variant="h4" component="h1" sx={{ 
          display: 'flex', 
          alignItems: 'center',
          color: 'primary.main', 
          fontWeight: 500 
        }}>
          <InventoryIcon sx={{ mr: 1 }} />
          Add Inventory Item
        </Typography>
        <Button
          component={Link}
          to="/inventory"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          sx={{ 
            borderRadius: '8px',
            textTransform: 'none', 
            px: 2
          }}
        >
          Back to Inventory
        </Button>
      </PageHeader>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            animation: 'fadeIn 0.3s ease-in-out',
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateY(-10px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          {error}
        </Alert>
      )}

      {/* Main Form */}
      <Paper sx={{ 
        p: 4, 
        borderRadius: '12px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        maxWidth: '1000px',
        margin: '0 auto',
        backgroundColor: '#ffffff' 
      }}>
        <Box component="form" onSubmit={handleSubmit}>
          <StyledCard sx={{ 
            animation: 'slideIn 0.4s ease forwards', 
            opacity: 0,
            '@keyframes slideIn': {
              '0%': { opacity: 0, transform: 'translateY(20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
          }}>
            <StyledCardHeader 
              title={
                <FormSectionTitle>
                  <DescriptionIcon />
                  Basic Information
                </FormSectionTitle>
              } 
            />
            <Divider />
            <StyledCardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FieldContainer>
                    <FieldLabel>
                      <FieldIcon>⚡</FieldIcon> SKU (Stock Keeping Unit)
                    </FieldLabel>
                    <StyledFormField
                      fullWidth
                      required
                      name="sku"
                      label="SKU"
                      value={formData.sku}
                      onChange={handleChange}
                      variant="outlined"
                      placeholder="e.g., ITM-12345"
                    />
                    <HelperText>
                      Unique identifier for this inventory item
                    </HelperText>
                  </FieldContainer>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FieldContainer>
                    <FieldLabel>
                      <FieldIcon>📦</FieldIcon> Product Reference
                    </FieldLabel>
                    <FormControl fullWidth>
                      <InputLabel id="product-select-label">Product</InputLabel>
                      <StyledSelect
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
                      </StyledSelect>
                      <HelperText>
                        Link to an existing product or create a custom item
                      </HelperText>
                    </FormControl>
                  </FieldContainer>
                </Grid>

                <Grid item xs={12}>
                  <FieldContainer>
                    <FieldLabel>
                      <FieldIcon>📝</FieldIcon> Item Name
                    </FieldLabel>
                    <StyledFormField
                      fullWidth
                      required
                      name="name"
                      label="Item Name"
                      value={formData.name}
                      onChange={handleChange}
                      variant="outlined"
                      placeholder="e.g., Premium Cotton T-Shirt"
                    />
                  </FieldContainer>
                </Grid>

                <Grid item xs={12}>
                  <FieldContainer>
                    <FieldLabel>
                      <FieldIcon>📄</FieldIcon> Description
                    </FieldLabel>
                    <StyledFormField
                      fullWidth
                      multiline
                      rows={3}
                      name="description"
                      label="Description"
                      value={formData.description}
                      onChange={handleChange}
                      variant="outlined"
                      placeholder="Provide a detailed description of this item..."
                    />
                    <HelperText>
                      Detailed information about the item, its features and specifications
                    </HelperText>
                  </FieldContainer>
                </Grid>
              </Grid>
            </StyledCardContent>
          </StyledCard>

          <StyledCard sx={{ 
            animation: 'slideIn 0.4s ease forwards',
            animationDelay: '0.1s',
            opacity: 0,
            '@keyframes slideIn': {
              '0%': { opacity: 0, transform: 'translateY(20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
          }}>
            <StyledCardHeader 
              title={
                <FormSectionTitle>
                  <CategoryIcon />
                  Hardware Classification
                </FormSectionTitle>
              } 
            />
            <Divider />
            <StyledCardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <FieldContainer>
                    <FieldLabel>
                      <FieldIcon>🏷️</FieldIcon> Category
                    </FieldLabel>
                    <FormControl fullWidth>
                      <InputLabel id="category-label">Category</InputLabel>
                      <StyledSelect
                        labelId="category-label"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        label="Category"
                      >
                        <MenuItem value="">
                          <em>Select a category</em>
                        </MenuItem>
                        <MenuItem value="Power Tools">Power Tools</MenuItem>
                        <MenuItem value="Hand Tools">Hand Tools</MenuItem>
                        <MenuItem value="Plumbing">Plumbing</MenuItem>
                        <MenuItem value="Electrical">Electrical</MenuItem>
                        <MenuItem value="Hardware">Hardware</MenuItem>
                        <MenuItem value="Fasteners">Fasteners</MenuItem>
                        <MenuItem value="Building Materials">Building Materials</MenuItem>
                        <MenuItem value="Paint & Supplies">Paint & Supplies</MenuItem>
                        <MenuItem value="Lawn & Garden">Lawn & Garden</MenuItem>
                        <MenuItem value="Safety Equipment">Safety Equipment</MenuItem>
                        <MenuItem value="Lighting">Lighting</MenuItem>
                        <MenuItem value="Heating & Cooling">Heating & Cooling</MenuItem>
                        <MenuItem value="Storage & Organization">Storage & Organization</MenuItem>
                      </StyledSelect>
                      <HelperText>
                        Select the department this item belongs to
                      </HelperText>
                    </FormControl>
                  </FieldContainer>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FieldContainer>
                    <FieldLabel>
                      <FieldIcon>🔧</FieldIcon> Subcategory
                    </FieldLabel>
                    <StyledFormField
                      fullWidth
                      name="subcategory"
                      label="Subcategory"
                      value={formData.subcategory || ''}
                      onChange={handleChange}
                      variant="outlined"
                      placeholder="e.g., Drills, Screwdrivers, Pipe Fittings"
                    />
                    <HelperText>
                      More specific classification within the category
                    </HelperText>
                  </FieldContainer>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FieldContainer>
                    <FieldLabel>
                      <FieldIcon>🏭</FieldIcon> Brand
                    </FieldLabel>
                    <StyledFormField
                      fullWidth
                      name="brand"
                      label="Brand"
                      value={formData.brand || ''}
                      onChange={handleChange}
                      variant="outlined"
                      placeholder="e.g., DeWalt, Milwaukee, Stanley"
                    />
                    <HelperText>
                      Manufacturer or brand name
                    </HelperText>
                  </FieldContainer>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FieldContainer>
                    <FieldLabel>
                      <FieldIcon>🚚</FieldIcon> Supplier
                    </FieldLabel>
                    <FormControl fullWidth>
                      <InputLabel id="supplier-label">Supplier</InputLabel>
                      <StyledSelect
                        labelId="supplier-label"
                        id="supplier"
                        name="supplier_id"
                        value={formData.supplier_id || ''}
                        onChange={handleChange}
                        label="Supplier"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {Array.isArray(suppliers) ? (
                          suppliers.map((supplier) => (
                            <MenuItem key={supplier.Supplier_ID} value={supplier.Supplier_ID}>
                              {supplier.Name}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem value="" disabled>
                            No suppliers available
                          </MenuItem>
                        )}
                      </StyledSelect>
                      <HelperText>
                        Primary distributor or wholesaler for this item
                      </HelperText>
                    </FormControl>
                  </FieldContainer>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FieldContainer>
                    <FieldLabel>
                      <FieldIcon>🏢</FieldIcon> Manufacturer
                    </FieldLabel>
                    <StyledFormField
                      fullWidth
                      name="manufacturer"
                      label="Manufacturer"
                      value={formData.manufacturer || ''}
                      onChange={handleChange}
                      variant="outlined"
                      placeholder="e.g., Black & Decker, 3M, Rubbermaid"
                    />
                    <HelperText>
                      Company that produces this item (may differ from brand)
                    </HelperText>
                  </FieldContainer>
                </Grid>
              </Grid>
            </StyledCardContent>
          </StyledCard>

          <StyledCard sx={{ 
            animation: 'slideIn 0.4s ease forwards',
            animationDelay: '0.2s',
            opacity: 0,
            '@keyframes slideIn': {
              '0%': { opacity: 0, transform: 'translateY(20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
          }}>
            <StyledCardHeader 
              title={
                <FormSectionTitle>
                  <InventoryIcon />
                  Stock Information
                </FormSectionTitle>
              }
            />
            <Divider />
            <StyledCardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <FieldContainer>
                    <FieldLabel>
                      <FieldIcon>🔢</FieldIcon> Initial Quantity
                    </FieldLabel>
                    <StyledFormField
                      fullWidth
                      required
                      type="number"
                      name="quantity"
                      label="Initial Quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      variant="outlined"
                      InputProps={{
                        inputProps: { min: 0 }
                      }}
                    />
                    <HelperText>
                      Current available stock
                    </HelperText>
                  </FieldContainer>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FieldContainer>
                    <FieldLabel>
                      <FieldIcon>⚠️</FieldIcon> Reorder Threshold
                    </FieldLabel>
                    <StyledFormField
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
                    <HelperText>
                      Stock level at which to place a new order
                    </HelperText>
                  </FieldContainer>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FieldContainer>
                    <FieldLabel>
                      <FieldIcon>📍</FieldIcon> Storage Location
                    </FieldLabel>
                    <StyledFormField
                      fullWidth
                      name="location"
                      label="Storage Location"
                      value={formData.location}
                      onChange={handleChange}
                      variant="outlined"
                      placeholder="e.g., Shelf A3"
                    />
                    <HelperText>
                      Where this item is stored in your warehouse
                    </HelperText>
                  </FieldContainer>
                </Grid>
              </Grid>
            </StyledCardContent>
          </StyledCard>

          <StyledCard sx={{ 
            animation: 'slideIn 0.4s ease forwards',
            animationDelay: '0.3s',
            opacity: 0,
            '@keyframes slideIn': {
              '0%': { opacity: 0, transform: 'translateY(20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
          }}>
            <StyledCardHeader 
              title={
                <FormSectionTitle>
                  <PriceIcon />
                  Pricing Information
                </FormSectionTitle>
              } 
            />
            <Divider />
            <StyledCardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FieldContainer>
                    <FieldLabel>
                      <FieldIcon>💲</FieldIcon> Cost Price
                    </FieldLabel>
                    <StyledFormField
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
                    <HelperText>
                      Price paid to acquire this item
                    </HelperText>
                  </FieldContainer>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FieldContainer>
                    <FieldLabel>
                      <FieldIcon>💰</FieldIcon> Sell Price
                    </FieldLabel>
                    <StyledFormField
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
                    <HelperText>
                      Price at which this item will be sold
                    </HelperText>
                  </FieldContainer>
                </Grid>
              </Grid>
            </StyledCardContent>
          </StyledCard>

          {/* Form Actions */}
          <FormActions>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              startIcon={loading ? undefined : <SaveIcon />}
              disabled={loading}
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
                minWidth: '120px',
                px: 3
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Item'}
            </Button>
            <Button
              component={Link}
              to="/inventory"
              variant="outlined"
              size="large"
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
                minWidth: '120px'
              }}
            >
              Cancel
            </Button>
          </FormActions>
        </Box>
      </Paper>
    </Box>
  );
};

export default AddInventoryItem;