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
  FormHelperText,
  Autocomplete,
  Chip,
  Avatar,
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
  Search as SearchIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
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

// Add product option styling
const ProductOptionWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  padding: theme.spacing(1, 0),
}));

const ProductImageAvatar = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  marginRight: theme.spacing(2),
  backgroundColor: theme.palette.grey[100],
  border: `1px solid ${theme.palette.grey[300]}`,
  borderRadius: theme.shape.borderRadius,
}));

const ProductOptionDetails = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const ProductOptionTitle = styled(Typography)({
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const ProductOptionSKU = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
}));

const AddInventoryItem = () => {
  const initialFormState = {
    // Basic Product Information
    productId: '',
    sku: '',
    name: '',
    description: '',
    category: '',
    subcategory: '',
    brand: '',
    manufacturer: '',
    model_number: '',
    
    // Inventory Quantities
    quantity: 0,
    unit_of_measure: 'each',
    reorder_level: 10,
    optimal_level: 50,
    reorder_quantity: 0,
    package_size: '',
    
    // Location Details
    warehouse_zone: '',
    bin_location: '',
    aisle_number: '',
    storage_location: '',
    display_location: '',
    
    // Pricing Information
    cost_price: 0,
    sell_price: 0,
    markup_percentage: 0,
    tax_percentage: 0,
    
    // Supplier Details
    supplier_id: '',
    supplier_part_number: '',
    lead_time: 0,
    minimum_order_quantity: 1,
    alternate_suppliers: '',
    
    // Product Specifications
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    color_options: '',
    material_type: '',
    specifications: '',
    barcode: '',
    
    // Additional Information
    image_url: '',
    status: 'active',
    notes: '',
    warranty_period: 0,
    
    // Date Information
    date_added: new Date().toISOString().split('T')[0],
    expiry_date: '',
    is_seasonal: false,
    
    // Inventory Value Method
    inventory_value_method: 'FIFO',
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
    
    // Handle numeric fields
    if ([
      'quantity', 
      'reorder_level', 
      'optimal_level',
      'cost_price', 
      'sell_price', 
      'markup_percentage',
      'tax_percentage',
      'lead_time',
      'minimum_order_quantity',
      'reorder_quantity',
      'weight',
      'length',
      'width',
      'height',
      'warranty_period'
    ].includes(name)) {
      setFormData({
        ...formData,
        [name]: value === '' ? '' : Number(value),
      });
    } 
    // Handle boolean fields
    else if (name === 'is_seasonal') {
      setFormData({
        ...formData,
        [name]: Boolean(value),
      });
    } 
    // Handle all other fields as strings
    else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    // Auto-calculate markup if cost_price and sell_price change
    if (name === 'cost_price' || name === 'sell_price') {
      const costPrice = name === 'cost_price' ? Number(value) : Number(formData.cost_price);
      const sellPrice = name === 'sell_price' ? Number(value) : Number(formData.sell_price);
      
      if (costPrice > 0 && sellPrice > 0) {
        const markup = ((sellPrice / costPrice) - 1) * 100;
        setFormData(prevData => ({
          ...prevData,
          markup_percentage: markup.toFixed(2)
        }));
      }
    }
  };

  const handleProductSelect = (e) => {
    const productId = e.target.value;
    
    if (!productId) {
      // Reset to initial state if "None" is selected
      setFormData(initialFormState);
      return;
    }
    
    const selectedProduct = products.find(product => 
      product._id === productId || 
      product.Product_ID === productId
    );
    
    if (selectedProduct) {
      // Map product fields to form fields, accounting for different possible field name formats
      setFormData({
        ...formData,
        productId,
        
        // Basic Product Information
        sku: selectedProduct.SKU || selectedProduct.sku || formData.sku,
        name: selectedProduct.Name || selectedProduct.name || formData.name,
        description: selectedProduct.Description || selectedProduct.description || formData.description,
        category: selectedProduct.Category || selectedProduct.category || formData.category,
        subcategory: selectedProduct.Subcategory || selectedProduct.subcategory || formData.subcategory,
        brand: selectedProduct.Brand || selectedProduct.brand || formData.brand,
        manufacturer: selectedProduct.Manufacturer || selectedProduct.manufacturer || formData.manufacturer,
        model_number: selectedProduct.model_number || selectedProduct.Model_Number || formData.model_number,
        
        // Pricing Information
        cost_price: selectedProduct.cost_price || selectedProduct.Cost_Price || formData.cost_price,
        sell_price: selectedProduct.Price || selectedProduct.price || selectedProduct.sellPrice || formData.sell_price,
        tax_percentage: selectedProduct.tax_percentage || selectedProduct.Tax_Percentage || formData.tax_percentage,
        
        // Supplier Information
        supplier_id: selectedProduct.Supplier_ID || selectedProduct.supplier_id || formData.supplier_id,
        lead_time: selectedProduct.lead_time || selectedProduct.Lead_Time || formData.lead_time,
        
        // Product Specifications
        weight: selectedProduct.weight || selectedProduct.Weight || formData.weight,
        length: selectedProduct.length || selectedProduct.Length || formData.length,
        width: selectedProduct.width || selectedProduct.Width || formData.width,
        height: selectedProduct.height || selectedProduct.Height || formData.height,
        color_options: selectedProduct.color_options || selectedProduct.Color_Options || formData.color_options,
        material_type: selectedProduct.material_type || selectedProduct.Material_Type || formData.material_type,
        specifications: selectedProduct.specifications || selectedProduct.Specifications || formData.specifications,
        
        // Additional Information
        image_url: selectedProduct.Image_URL || selectedProduct.image_url || formData.image_url,
        status: selectedProduct.Status || selectedProduct.status || formData.status,
        warranty_period: selectedProduct.warranty_period || selectedProduct.Warranty_Period || formData.warranty_period,
        
        // Date Information
        expiry_date: selectedProduct.expiry_date || selectedProduct.Expiry_Date || formData.expiry_date,
        
        // Unit information
        unit_of_measure: selectedProduct.unit_of_measure || selectedProduct.Unit_Of_Measure || formData.unit_of_measure,
      });
      
      // Auto-calculate markup percentage if cost price and sell price are available
      if ((selectedProduct.cost_price || selectedProduct.Cost_Price) && 
          (selectedProduct.Price || selectedProduct.price || selectedProduct.sellPrice)) {
        const cost = Number(selectedProduct.cost_price || selectedProduct.Cost_Price);
        const price = Number(selectedProduct.Price || selectedProduct.price || selectedProduct.sellPrice);
        
        if (cost > 0) {
          const markup = ((price / cost) - 1) * 100;
          setFormData(prevData => ({
            ...prevData,
            markup_percentage: markup.toFixed(2)
          }));
        }
      }
    }
  };

  const validateForm = () => {
    const errors = {};

    // Basic Product Information validation
    if (!formData.name) errors.name = 'Product name is required';
    if (!formData.sku) errors.sku = 'SKU is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.brand && !formData.manufacturer) errors.brand = 'Either brand or manufacturer is required';
    
    // Inventory Quantities validation
    if (formData.quantity < 0) errors.quantity = 'Quantity cannot be negative';
    if (!formData.unit_of_measure) errors.unit_of_measure = 'Unit of measure is required';
    if (formData.reorder_level < 0) errors.reorder_level = 'Reorder level cannot be negative';
    
    // Location Details validation  
    if (!formData.warehouse_zone) errors.warehouse_zone = 'Warehouse zone is required';
    if (!formData.bin_location) errors.bin_location = 'Bin location is required';
    
    // Pricing Information validation
    if (formData.cost_price < 0) errors.cost_price = 'Cost price cannot be negative';
    if (formData.sell_price < 0) errors.sell_price = 'Selling price cannot be negative';
    if (!formData.tax_percentage && formData.tax_percentage !== 0) errors.tax_percentage = 'Tax rate is required';
    
    // Supplier Details validation
    if (!formData.supplier_id) errors.supplier_id = 'Primary supplier is required';
    
    // Status validation
    if (!formData.status) errors.status = 'Status is required';
    
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
        // Basic Product Information
        product_id: formData.productId ? parseInt(formData.productId, 10) : null,
        sku: formData.sku,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory || '',
        brand: formData.brand || '',
        manufacturer: formData.manufacturer || '',
        model_number: formData.model_number || '',
        
        // Inventory Quantities
        stock_level: Number(formData.quantity), 
        unit_of_measure: formData.unit_of_measure || 'each',
        reorder_level: Number(formData.reorder_level),
        optimal_level: Number(formData.optimal_level),
        reorder_quantity: Number(formData.reorder_quantity),
        package_size: formData.package_size || '',
        
        // Location Details
        warehouse_zone: formData.warehouse_zone || '',
        bin_location: formData.bin_location || '',
        aisle_number: formData.aisle_number || '',
        storage_location: formData.storage_location || '',
        display_location: formData.display_location || '',
        
        // Pricing Information
        cost_price: Number(formData.cost_price),
        price: Number(formData.sell_price),
        markup_percentage: Number(formData.markup_percentage),
        tax_percentage: Number(formData.tax_percentage),
        
        // Supplier Details
        supplier_id: formData.supplier_id ? parseInt(formData.supplier_id, 10) : null,
        supplier_part_number: formData.supplier_part_number || '',
        lead_time: Number(formData.lead_time),
        minimum_order_quantity: Number(formData.minimum_order_quantity),
        alternate_suppliers: formData.alternate_suppliers || '',
        
        // Product Specifications
        weight: Number(formData.weight),
        length: Number(formData.length),
        width: Number(formData.width),
        height: Number(formData.height),
        color_options: formData.color_options || '',
        material_type: formData.material_type || '',
        specifications: formData.specifications || '',
        barcode: formData.barcode || '',
        
        // Additional Information
        image_url: formData.image_url || '',
        status: formData.status || 'active',
        notes: formData.notes || '',
        warranty_period: Number(formData.warranty_period),
        
        // Date Information
        date_added: formData.date_added || new Date().toISOString().split('T')[0],
        expiry_date: formData.expiry_date || null,
        is_seasonal: Boolean(formData.is_seasonal),
        
        // Inventory Value Method
        inventory_value_method: formData.inventory_value_method || 'FIFO',
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

      {/* Product Selection Card - Enhanced with Autocomplete */}
      <StyledCard sx={{ mb: 3, animation: 'fadeIn 0.3s ease-in-out' }}>
        <StyledCardHeader 
          title={
            <FormSectionTitle>
              <SearchIcon />
              Select Product
            </FormSectionTitle>
          }
        />
        <Divider />
        <StyledCardContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Start by selecting an existing product to automatically fill in product details, or choose "None" to create a custom inventory item.
          </Typography>
          
          <Autocomplete
            id="product-search"
            options={products}
            loading={loadingProducts}
            loadingText="Loading products..."
            getOptionLabel={(option) => 
              option.name || option.Name || ''
            }
            isOptionEqualToValue={(option, value) => 
              (option._id || option.Product_ID) === (value._id || value.Product_ID)
            }
            onChange={(event, newValue) => {
              // Simulate the handleProductSelect behavior with the selected product
              if (newValue) {
                const productId = newValue._id || newValue.Product_ID;
                handleProductSelect({ target: { value: productId } });
              } else {
                handleProductSelect({ target: { value: '' } });
              }
            }}
            renderOption={(props, option) => (
              <li {...props}>
                <ProductOptionWrapper>
                  <ProductImageAvatar 
                    src={option.image_url || option.Image_URL || ''}
                    alt={option.name || option.Name || 'Product Image'}
                  >
                    {!option.image_url && !option.Image_URL && <InventoryIcon />}
                  </ProductImageAvatar>
                  <ProductOptionDetails>
                    <ProductOptionTitle>
                      {option.name || option.Name || 'Unnamed Product'}
                    </ProductOptionTitle>
                      <ProductOptionSKU>
                      SKU: {option.sku || option.SKU || 'No SKU'} | 
                      {option.category || option.Category || 'Uncategorized'}
                      </ProductOptionSKU>
                  </ProductOptionDetails>
                </ProductOptionWrapper>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search for existing product"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingProducts ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </StyledCardContent>
      </StyledCard>

      <form onSubmit={handleSubmit}>
        {/* Basic Product Information */}
        <StyledCard>
            <StyledCardHeader 
              title={
                <FormSectionTitle>
                  <DescriptionIcon />
                Basic Product Information
                </FormSectionTitle>
              }
            />
            <Divider />
            <StyledCardContent>
              <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                  <FieldContainer>
                    <FieldLabel>
                    <FieldIcon>📝</FieldIcon>
                    Product Name*
                    </FieldLabel>
                    <StyledFormField
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                      fullWidth
                      required
                    placeholder="Enter product name"
                    variant="outlined"
                    error={error && error.includes('name')}
                  />
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>🏷️</FieldIcon>
                    SKU/Item ID*
                  </FieldLabel>
                  <StyledFormField
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                    fullWidth
                    required
                    placeholder="Enter SKU or Item ID"
                      variant="outlined"
                    error={error && error.includes('sku')}
                    />
                  </FieldContainer>
                </Grid>

                <Grid item xs={12}>
                  <FieldContainer>
                    <FieldLabel>
                    <FieldIcon>📄</FieldIcon>
                    Product Description
                    </FieldLabel>
                    <StyledFormField
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                      fullWidth
                    multiline
                    rows={3}
                    placeholder="Enter product description"
                    variant="outlined"
                  />
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>📂</FieldIcon>
                    Category/Department*
                  </FieldLabel>
                  <FormControl fullWidth required>
                    <StyledSelect
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      error={error && error.includes('category')}
                    >
                      <MenuItem value="">Select Category</MenuItem>
                      {/* Map through available categories */}
                      {['building-materials', 'electrical', 'plumbing', 'garden', 'fasteners', 'tools'].map(category => (
                        <MenuItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')}
                        </MenuItem>
                      ))}
                    </StyledSelect>
                  </FormControl>
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>📂</FieldIcon>
                    Subcategory
                  </FieldLabel>
                  <StyledFormField
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    fullWidth
                    placeholder="Enter subcategory"
                      variant="outlined"
                    />
                  </FieldContainer>
                </Grid>

              <Grid item xs={12} sm={6}>
                  <FieldContainer>
                    <FieldLabel>
                    <FieldIcon>🏢</FieldIcon>
                    Brand/Manufacturer*
                    </FieldLabel>
                    <StyledFormField
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                      fullWidth
                    required
                    placeholder="Enter brand"
                    variant="outlined"
                    error={error && error.includes('brand')}
                  />
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>🔍</FieldIcon>
                    Model Number
                  </FieldLabel>
                  <StyledFormField
                    name="model_number"
                    value={formData.model_number}
                      onChange={handleChange}
                    fullWidth
                    placeholder="Enter model number"
                      variant="outlined"
                    />
                  </FieldContainer>
                </Grid>
              </Grid>
            </StyledCardContent>
          </StyledCard>

        {/* Inventory Quantities */}
        <StyledCard sx={{ mt: 4 }}>
            <StyledCardHeader 
              title={
                <FormSectionTitle>
                <InventoryIcon />
                Inventory Quantities
                </FormSectionTitle>
              } 
            />
            <Divider />
            <StyledCardContent>
              <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                  <FieldContainer>
                    <FieldLabel>
                    <FieldIcon>🔢</FieldIcon>
                    Initial Quantity*
                    </FieldLabel>
                  <StyledFormField
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleChange}
                    fullWidth
                    required
                    inputProps={{ min: 0 }}
                    variant="outlined"
                    error={error && error.includes('quantity')}
                  />
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>📏</FieldIcon>
                    Unit of Measure*
                  </FieldLabel>
                  <FormControl fullWidth required>
                      <StyledSelect
                      name="unit_of_measure"
                      value={formData.unit_of_measure}
                        onChange={handleChange}
                      error={error && error.includes('unit_of_measure')}
                    >
                      <MenuItem value="each">Each</MenuItem>
                      <MenuItem value="box">Box</MenuItem>
                      <MenuItem value="pack">Pack</MenuItem>
                      <MenuItem value="kg">Kilogram</MenuItem>
                      <MenuItem value="g">Gram</MenuItem>
                      <MenuItem value="lb">Pound</MenuItem>
                      <MenuItem value="oz">Ounce</MenuItem>
                      <MenuItem value="l">Liter</MenuItem>
                      <MenuItem value="ml">Milliliter</MenuItem>
                      <MenuItem value="gal">Gallon</MenuItem>
                      <MenuItem value="m">Meter</MenuItem>
                      <MenuItem value="cm">Centimeter</MenuItem>
                      <MenuItem value="mm">Millimeter</MenuItem>
                      <MenuItem value="in">Inch</MenuItem>
                      <MenuItem value="ft">Foot</MenuItem>
                      <MenuItem value="yd">Yard</MenuItem>
                      <MenuItem value="sqm">Square Meter</MenuItem>
                      <MenuItem value="sqft">Square Foot</MenuItem>
                      <MenuItem value="set">Set</MenuItem>
                      <MenuItem value="piece">Piece</MenuItem>
                      <MenuItem value="pair">Pair</MenuItem>
                      <MenuItem value="roll">Roll</MenuItem>
                      <MenuItem value="sheet">Sheet</MenuItem>
                      </StyledSelect>
                    </FormControl>
                  </FieldContainer>
                </Grid>

              <Grid item xs={12} sm={6}>
                  <FieldContainer>
                    <FieldLabel>
                    <FieldIcon>⚠️</FieldIcon>
                    Reorder Point/Minimum Stock Level*
                    </FieldLabel>
                    <StyledFormField
                    name="reorder_level"
                    type="number"
                    value={formData.reorder_level}
                    onChange={handleChange}
                      fullWidth
                    required
                    inputProps={{ min: 0 }}
                    variant="outlined"
                    error={error && error.includes('reorder_level')}
                  />
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>📈</FieldIcon>
                    Maximum Stock Level (Optimal Level)
                  </FieldLabel>
                  <StyledFormField
                    name="optimal_level"
                    type="number"
                    value={formData.optimal_level}
                      onChange={handleChange}
                    fullWidth
                    inputProps={{ min: 0 }}
                      variant="outlined"
                    />
                  </FieldContainer>
                </Grid>

              <Grid item xs={12} sm={6}>
                  <FieldContainer>
                    <FieldLabel>
                    <FieldIcon>📦</FieldIcon>
                    Package Size
                    </FieldLabel>
                    <StyledFormField
                    name="package_size"
                    value={formData.package_size}
                    onChange={handleChange}
                      fullWidth
                    placeholder="E.g. 10 per box"
                    variant="outlined"
                  />
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>🔄</FieldIcon>
                    Reorder Quantity
                  </FieldLabel>
                  <StyledFormField
                    name="reorder_quantity"
                    type="number"
                    value={formData.reorder_quantity}
                      onChange={handleChange}
                    fullWidth
                    inputProps={{ min: 0 }}
                      variant="outlined"
                    />
                  </FieldContainer>
                </Grid>
            </Grid>
          </StyledCardContent>
        </StyledCard>
        
        {/* Location Details */}
        <StyledCard sx={{ mt: 4 }}>
          <StyledCardHeader
            title={
              <FormSectionTitle>
                <LocationIcon />
                Location Details
              </FormSectionTitle>
            }
          />
          <Divider />
          <StyledCardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                  <FieldContainer>
                    <FieldLabel>
                    <FieldIcon>🏭</FieldIcon>
                    Warehouse Zone*
                    </FieldLabel>
                  <StyledFormField
                    name="warehouse_zone"
                    value={formData.warehouse_zone}
                        onChange={handleChange}
                    fullWidth
                    required
                    placeholder="E.g. Zone A, North Wing"
                    variant="outlined"
                    error={error && error.includes('warehouse_zone')}
                  />
                  </FieldContainer>
                </Grid>

              <Grid item xs={12} sm={6}>
                  <FieldContainer>
                    <FieldLabel>
                    <FieldIcon>📍</FieldIcon>
                    Shelf/Bin Location*
                    </FieldLabel>
                    <StyledFormField
                    name="bin_location"
                    value={formData.bin_location}
                    onChange={handleChange}
                      fullWidth
                    required
                    placeholder="E.g. Shelf 3, Bin B2"
                    variant="outlined"
                    error={error && error.includes('bin_location')}
                  />
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>🛣️</FieldIcon>
                    Aisle Number
                  </FieldLabel>
                  <StyledFormField
                    name="aisle_number"
                    value={formData.aisle_number}
                      onChange={handleChange}
                    fullWidth
                    placeholder="E.g. Aisle 5"
                      variant="outlined"
                  />
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>🏪</FieldIcon>
                    Store Display Location
                  </FieldLabel>
                  <StyledFormField
                    name="display_location"
                    value={formData.display_location}
                    onChange={handleChange}
                    fullWidth
                    placeholder="E.g. Front display, End cap 3"
                    variant="outlined"
                  />
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>📍</FieldIcon>
                    Storage Location
                  </FieldLabel>
                  <StyledFormField
                    name="storage_location"
                    value={formData.storage_location}
                    onChange={handleChange}
                    fullWidth
                    placeholder="Additional storage details"
                    variant="outlined"
                  />
                  </FieldContainer>
                </Grid>
              </Grid>
            </StyledCardContent>
          </StyledCard>

        {/* Pricing Information */}
        <StyledCard sx={{ mt: 4 }}>
            <StyledCardHeader 
              title={
                <FormSectionTitle>
                <MoneyIcon />
                Pricing Information
                </FormSectionTitle>
              }
            />
            <Divider />
            <StyledCardContent>
              <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                  <FieldContainer>
                    <FieldLabel>
                    <FieldIcon>💲</FieldIcon>
                    Cost Price*
                    </FieldLabel>
                    <StyledFormField
                    name="cost_price"
                    type="number"
                    value={formData.cost_price}
                    onChange={handleChange}
                      fullWidth
                      required
                    inputProps={{ min: 0, step: 0.01 }}
                    variant="outlined"
                    error={error && error.includes('cost_price')}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>💰</FieldIcon>
                    Selling Price*
                  </FieldLabel>
                  <StyledFormField
                    name="sell_price"
                      type="number"
                    value={formData.sell_price}
                      onChange={handleChange}
                    fullWidth
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                      variant="outlined"
                    error={error && error.includes('sell_price')}
                      InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </FieldContainer>
                </Grid>

              <Grid item xs={12} sm={6}>
                  <FieldContainer>
                    <FieldLabel>
                    <FieldIcon>📊</FieldIcon>
                    Markup Percentage
                    </FieldLabel>
                    <StyledFormField
                    name="markup_percentage"
                      type="number"
                    value={formData.markup_percentage}
                      onChange={handleChange}
                    fullWidth
                    inputProps={{ step: 0.01 }}
                      variant="outlined"
                      InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />
                    <HelperText>
                    Auto-calculated from cost and selling price
                    </HelperText>
                  </FieldContainer>
                </Grid>

              <Grid item xs={12} sm={6}>
                  <FieldContainer>
                    <FieldLabel>
                    <FieldIcon>🧾</FieldIcon>
                    Tax Category/Rate*
                    </FieldLabel>
                    <StyledFormField
                    name="tax_percentage"
                    type="number"
                    value={formData.tax_percentage}
                    onChange={handleChange}
                      fullWidth
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                    variant="outlined"
                    error={error && error.includes('tax_percentage')}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </FieldContainer>
              </Grid>
            </Grid>
          </StyledCardContent>
        </StyledCard>
        
        {/* Supplier Details */}
        <StyledCard sx={{ mt: 4 }}>
          <StyledCardHeader
            title={
              <FormSectionTitle>
                <SupplierIcon />
                Supplier Details
              </FormSectionTitle>
            }
          />
          <Divider />
          <StyledCardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>🏢</FieldIcon>
                    Primary Supplier*
                  </FieldLabel>
                  <FormControl fullWidth required>
                    <StyledSelect
                      name="supplier_id"
                      value={formData.supplier_id}
                      onChange={handleChange}
                      error={error && error.includes('supplier_id')}
                    >
                      <MenuItem value="">Select Supplier</MenuItem>
                      {suppliers.map((supplier) => (
                        <MenuItem 
                          key={supplier.Supplier_ID || supplier.supplier_id || supplier.id} 
                          value={supplier.Supplier_ID || supplier.supplier_id || supplier.id}
                        >
                          {supplier.Name || supplier.name || 'Unknown Supplier'}
                        </MenuItem>
                      ))}
                    </StyledSelect>
                  </FormControl>
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>🔢</FieldIcon>
                    Supplier Part Number
                  </FieldLabel>
                  <StyledFormField
                    name="supplier_part_number"
                    value={formData.supplier_part_number}
                    onChange={handleChange}
                    fullWidth
                    placeholder="Supplier's part number"
                      variant="outlined"
                  />
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>⏱️</FieldIcon>
                    Lead Time (Days)
                  </FieldLabel>
                  <StyledFormField
                    name="lead_time"
                    type="number"
                    value={formData.lead_time}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ min: 0 }}
                    variant="outlined"
                  />
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>📦</FieldIcon>
                    Minimum Order Quantity
                  </FieldLabel>
                  <StyledFormField
                    name="minimum_order_quantity"
                    type="number"
                    value={formData.minimum_order_quantity}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ min: 1 }}
                    variant="outlined"
                  />
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>🔄</FieldIcon>
                    Alternate Suppliers
                  </FieldLabel>
                  <StyledFormField
                    name="alternate_suppliers"
                    value={formData.alternate_suppliers}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="List alternative suppliers"
                    variant="outlined"
                  />
                  </FieldContainer>
                </Grid>
              </Grid>
            </StyledCardContent>
          </StyledCard>

        {/* Product Specifications */}
        <StyledCard sx={{ mt: 4 }}>
            <StyledCardHeader 
              title={
                <FormSectionTitle>
                <InfoIcon />
                Product Specifications
                </FormSectionTitle>
              } 
            />
            <Divider />
            <StyledCardContent>
              <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                  <FieldContainer>
                    <FieldLabel>
                    <FieldIcon>⚖️</FieldIcon>
                    Weight
                    </FieldLabel>
                    <StyledFormField
                    name="weight"
                    type="number"
                    value={formData.weight}
                    onChange={handleChange}
                      fullWidth
                    inputProps={{ min: 0, step: 0.01 }}
                    variant="outlined"
                  />
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>📏</FieldIcon>
                    Length
                  </FieldLabel>
                  <StyledFormField
                    name="length"
                      type="number"
                    value={formData.length}
                      onChange={handleChange}
                    fullWidth
                    inputProps={{ min: 0, step: 0.01 }}
                      variant="outlined"
                    />
                  </FieldContainer>
                </Grid>

              <Grid item xs={12} sm={6} md={3}>
                  <FieldContainer>
                    <FieldLabel>
                    <FieldIcon>📏</FieldIcon>
                    Width
                    </FieldLabel>
                    <StyledFormField
                    name="width"
                    type="number"
                    value={formData.width}
                    onChange={handleChange}
                      fullWidth
                    inputProps={{ min: 0, step: 0.01 }}
                    variant="outlined"
                  />
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>📏</FieldIcon>
                    Height
                  </FieldLabel>
                  <StyledFormField
                    name="height"
                      type="number"
                    value={formData.height}
                      onChange={handleChange}
                    fullWidth
                    inputProps={{ min: 0, step: 0.01 }}
                      variant="outlined"
                  />
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>🎨</FieldIcon>
                    Color
                  </FieldLabel>
                  <StyledFormField
                    name="color_options"
                    value={formData.color_options}
                    onChange={handleChange}
                    fullWidth
                    placeholder="E.g. Red, Blue, Assorted"
                    variant="outlined"
                  />
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>🧱</FieldIcon>
                    Material
                  </FieldLabel>
                  <StyledFormField
                    name="material_type"
                    value={formData.material_type}
                    onChange={handleChange}
                    fullWidth
                    placeholder="E.g. Steel, Plastic, Wood"
                    variant="outlined"
                  />
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>📊</FieldIcon>
                    Barcode/UPC
                  </FieldLabel>
                  <StyledFormField
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    fullWidth
                    placeholder="Enter product barcode"
                    variant="outlined"
                  />
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>📋</FieldIcon>
                    Specifications
                  </FieldLabel>
                  <StyledFormField
                    name="specifications"
                    value={formData.specifications}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Enter detailed specifications"
                    variant="outlined"
                  />
                </FieldContainer>
              </Grid>
            </Grid>
          </StyledCardContent>
        </StyledCard>
        
        {/* Additional Information */}
        <StyledCard sx={{ mt: 4 }}>
          <StyledCardHeader
            title={
              <FormSectionTitle>
                <InfoIcon />
                Additional Information
              </FormSectionTitle>
            }
          />
          <Divider />
          <StyledCardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>🖼️</FieldIcon>
                    Product Image URL
                  </FieldLabel>
                  <StyledFormField
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    fullWidth
                    placeholder="Enter image URL"
                    variant="outlined"
                  />
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>🏷️</FieldIcon>
                    Status*
                  </FieldLabel>
                  <FormControl fullWidth required>
                    <StyledSelect
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      error={error && error.includes('status')}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                      <MenuItem value="discontinued">Discontinued</MenuItem>
                      <MenuItem value="seasonal">Seasonal</MenuItem>
                    </StyledSelect>
                  </FormControl>
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>📝</FieldIcon>
                    Notes/Special Handling
                  </FieldLabel>
                  <StyledFormField
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Enter any special notes"
                    variant="outlined"
                  />
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>🔧</FieldIcon>
                    Warranty Period (Months)
                  </FieldLabel>
                  <StyledFormField
                    name="warranty_period"
                    type="number"
                    value={formData.warranty_period}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ min: 0 }}
                    variant="outlined"
                  />
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>📅</FieldIcon>
                    Date Added*
                  </FieldLabel>
                  <StyledFormField
                    name="date_added"
                    type="date"
                    value={formData.date_added}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                  />
                      <HelperText>
                    Auto-filled with current date
                      </HelperText>
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>⏱️</FieldIcon>
                    Expiration Date
                  </FieldLabel>
                  <StyledFormField
                    name="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                  />
                </FieldContainer>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FieldContainer>
                  <FieldLabel>
                    <FieldIcon>🏷️</FieldIcon>
                    Inventory Value Method
                  </FieldLabel>
                  <FormControl fullWidth>
                    <StyledSelect
                      name="inventory_value_method"
                      value={formData.inventory_value_method}
                      onChange={handleChange}
                    >
                      <MenuItem value="FIFO">FIFO (First In, First Out)</MenuItem>
                      <MenuItem value="LIFO">LIFO (Last In, First Out)</MenuItem>
                      <MenuItem value="AVERAGE">Weighted Average</MenuItem>
                    </StyledSelect>
                  </FormControl>
                  </FieldContainer>
                </Grid>
              </Grid>
            </StyledCardContent>
          </StyledCard>

          {/* Form Actions */}
          <FormActions>
            <Button
            variant="outlined"
            component={Link}
            to="/inventory"
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
              px: 4
              }}
            >
            Cancel
            </Button>
            <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
              px: 4,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
              }
            }}
          >
            {loading ? 'Saving...' : 'Save Inventory Item'}
            </Button>
          </FormActions>
      </form>
    </Box>
  );
};

export default AddInventoryItem;