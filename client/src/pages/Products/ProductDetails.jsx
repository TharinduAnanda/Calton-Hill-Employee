import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import productService from '../../services/productService';
import axios from '../../utils/axiosConfig';
import { 
  FaEdit, 
  FaArrowLeft, 
  FaWarehouse,  
  FaBoxOpen,
  FaDollarSign,
  FaClipboardList,
  FaBan
} from 'react-icons/fa';
import { 
  Box, 
  Typography, 
  Button, 
  Chip, 
  Paper, 
  Grid, 
  Card,
  CardContent, 
  Divider,
  Container,
  Alert,
  LinearProgress,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  CardMedia
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ConfirmDialog from '../../components/common/ConfirmDialog';

// Styled components for consistency
const SectionCard = styled(Card)(({ theme }) => ({
  borderRadius: 8,
  marginBottom: theme.spacing(3),
  border: '1px solid #e0e0e0',
  boxShadow: 'none',
  overflow: 'visible',
}));

const SectionTitle = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '& svg': {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main
  }
}));

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [discontinuing, setDiscontinuing] = useState(false);
  const [continuing, setContinuing] = useState(false);
  
  // Use this ref to prevent repeated fetching
  const dataFetchedRef = useRef(false);
  
  // Add state for confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  
  // Fetch supplier data
  const fetchSupplierData = useCallback(async (supplierId) => {
    if (!supplierId) return null;
    
    try {
      console.log(`Fetching supplier data for ID ${supplierId}`);
      const response = await axios.get(`/api/suppliers/${supplierId}`);
      console.log('Raw supplier API response:', response);
      
      if (response.data) {
        console.log('Supplier data from API:', response.data);
        
        // Handle different response shapes
        let supplierData;
        
        if (response.data.success === true && response.data.data) {
          // Success/data API structure
          supplierData = response.data.data;
        } else if (response.data.supplier) {
          // Nested supplier object
          supplierData = response.data.supplier;
        } else if (response.data.Name || response.data.name || 
                   response.data.Company_Name || response.data.company_name) {
          // Direct supplier object
          supplierData = response.data;
        } else if (Array.isArray(response.data) && response.data.length > 0) {
          // Array of suppliers - get the first one
          supplierData = response.data[0];
        } else {
          // Default to the raw response data
          supplierData = response.data;
        }
        
        console.log('Extracted supplier data:', supplierData);
        setSupplier(supplierData);
        return supplierData;
      }
      return null;
    } catch (err) {
      console.error(`Error fetching supplier data for ID ${supplierId}:`, err);
      
      // Create a fallback supplier with the ID to avoid showing N/A
      const fallbackSupplier = {
        id: supplierId,
        name: `Supplier #${supplierId}`,
        Name: `Supplier #${supplierId}`
      };
      setSupplier(fallbackSupplier);
      return fallbackSupplier;
    }
  }, []);
  
  const fetchInventoryData = useCallback(async (productId, productData) => {
    try {
      console.log(`Fetching inventory data for product ID: ${productId}`);
      console.log('Product data being passed to fetchInventoryData:', productData);
      
      // Store any existing reorder level from productData
      const productReorderLevel = productData?.Reorder_Level || productData?.reorder_level;
      
      // Create a direct request to get inventory data for this specific product ID
      try {
        // Make a direct request to get inventory for this specific product
        const directResponse = await axios.get(`/api/inventory?product_id=${productId}`);
        console.log(`Direct inventory response for product ${productId}:`, directResponse.data);
        
        if (directResponse.data && 
            (Array.isArray(directResponse.data) || 
             Array.isArray(directResponse.data.data))) {
          const inventoryArray = Array.isArray(directResponse.data) ? 
                               directResponse.data : 
                               directResponse.data.data;
                               
          const matchingItem = inventoryArray.find(item => 
            item.Product_ID === productId || item.product_id === productId
          );
          
          if (matchingItem) {
            console.log(`Found direct inventory data:`, matchingItem);
            setInventory(matchingItem);
            return matchingItem;
          }
        }
      } catch (directErr) {
        console.log('Direct inventory endpoint failed, trying alternative methods');
      }
      
      // If direct request failed, try the main inventory endpoint
      try {
        const response = await axios.get(`/api/inventory`);
        
        if (response && response.data) {
          // Handle array format
          if (Array.isArray(response.data)) {
            const matchingItem = response.data.find(item => 
              item.Product_ID === productId || item.product_id === productId
            );
            
            if (matchingItem) {
              console.log(`Found inventory data in array:`, matchingItem);
              
              // Preserve original reorder level from product if it exists
              if (productReorderLevel && !matchingItem.Reorder_Level && !matchingItem.reorder_level) {
                matchingItem.Reorder_Level = productReorderLevel;
              }
              
              setInventory(matchingItem);
              return matchingItem;
            }
          } 
          // Handle nested data format
          else if (response.data.data && Array.isArray(response.data.data)) {
            const matchingItem = response.data.data.find(item => 
              item.Product_ID === productId || item.product_id === productId
            );
            
            if (matchingItem) {
              console.log(`Found inventory data in nested array:`, matchingItem);
              
              // Preserve original reorder level from product if it exists
              if (productReorderLevel && !matchingItem.Reorder_Level && !matchingItem.reorder_level) {
                matchingItem.Reorder_Level = productReorderLevel;
              }
              
              setInventory(matchingItem);
              return matchingItem;
            }
          }
        }
      } catch (err) {
        console.log('Main inventory endpoint failed, using product data directly');
      }
      
      // If we have explicit reorder_level in the product data, use that directly
      if (productReorderLevel) {
        console.log('Using reorder level directly from product data:', productReorderLevel);
        const inventoryFromProduct = {
          Stock_Level: productData.Stock_Level || 0,
          Reorder_Level: productReorderLevel,
          Product_ID: productId,
          Supplier_ID: productData.Supplier_ID || productData.supplier_id || null
        };
        
        setInventory(inventoryFromProduct);
        return inventoryFromProduct;
      }
      
      // As a last resort, we'll create a minimal inventory object with default values
      console.log('Creating minimal inventory record with default values');
      const defaultInventory = {
        Stock_Level: productData.Stock_Level || 0,
        // Use 20 as the default reorder level - this is just a placeholder 
        // that should never be used unless the database is completely empty
        Reorder_Level: 20,
        Product_ID: productId,
        Supplier_ID: productData.Supplier_ID || productData.supplier_id || null
      };
      
      setInventory(defaultInventory);
      return defaultInventory;
    } catch (err) {
      console.error(`Error fetching inventory for product #${productId}:`, err);
      return null;
    }
  }, []);

  // Update your fetchProductData function
  const fetchProductData = useCallback(async () => {
    try {
      setLoading(true);
      // Check for special paths that should not be treated as IDs
      if (id === 'add' || id === 'edit') {
        throw new Error('Invalid product ID');
      }
      
      // Add cache-busting query parameter to prevent caching
      const timestamp = new Date().getTime();
      
      // First try the service method
      let response = await productService.getProductById(id, { 
        params: { _t: timestamp }
      });
      console.log('Raw product API response:', response);
      
      // Handle different response formats
      let data;
      if (Array.isArray(response) && response.length > 0) {
        // If response is an array, take first item
        data = response[0];
        
        // If data is still an array (nested), take first item
        if (Array.isArray(data) && data.length > 0) {
          data = data[0];
        }
      } else {
        // Direct object response
        data = response;
      }
      
      console.log('Processed product data:', data);
      
      // Try to fetch more detailed product info directly from the API
      try {
        const directResponse = await axios.get(`/api/products/${id}?_t=${timestamp}`);
        if (directResponse.data) {
          console.log('Enhanced product data from direct API:', directResponse.data);
          // Merge the data, preferring the direct API response for any fields it has
          if (Array.isArray(directResponse.data) && directResponse.data.length > 0) {
            data = { ...data, ...directResponse.data[0] };
          } else {
            data = { ...data, ...directResponse.data };
          }
        }
      } catch (directErr) {
        console.log('Could not fetch additional product details');
      }
      
      // Normalize field names for consistent access
      data = {
        ...data,
        Product_ID: data.Product_ID || data.product_id || id,
        Name: data.Name || data.name,
        Description: data.Description || data.description,
        SKU: data.SKU || data.sku,
        Price: data.Price || data.price,
        Brand: data.Brand || data.brand,
        Manufacturer: data.Manufacturer || data.manufacturer,
        Category: data.Category || data.category || data.category_id,
        Subcategory: data.Subcategory || data.subcategory,
        Stock_Level: data.Stock_Level || data.stock || data.stock_quantity || 0,
        specifications: data.specifications || data.Specifications,
        material_type: data.material_type || data.Material_Type,
        weight: data.weight || data.Weight,
        // Create dimensions string from individual dimensions if available
        dimensions: data.dimensions || 
          ((data.length || data.width || data.height) ? 
            `${data.length || 0} × ${data.width || 0} × ${data.height || 0} cm` : null),
      };
      
      // Set reasonable defaults for critical missing values
      if (!data.cost_price && data.Price) {
        // Assume cost price is 75% of selling price if not provided
        data.cost_price = parseFloat(data.Price) * 0.75;
      }
      
      console.log('Normalized product data:', data);
      setProduct(data);
      
      // Fetch inventory for this product
      await fetchInventoryData(id, data);
      
      // Fetch supplier information if product has a supplier_id
      const supplierId = data.supplier_id || data.Supplier_ID;
      if (supplierId) {
        console.log(`Product has supplier ID: ${supplierId}, fetching supplier data`);
        await fetchSupplierData(supplierId);
      }
      
      // Mark as fetched
      dataFetchedRef.current = true;
      setError(null);
      return data;
    } catch (err) {
      console.error(`Error fetching product #${id}:`, err);
      setError(`Could not load product details. ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [id, fetchInventoryData, fetchSupplierData]);

  useEffect(() => {
    // Reset the ref when the product ID changes or when component mounts
    dataFetchedRef.current = false;
    
    fetchProductData();
    
    // Add a cleanup function to reset the ref when component unmounts
    return () => {
      dataFetchedRef.current = false;
    };
  }, [id, fetchProductData]); // Only depend on ID and the memoized fetch function


  // Calculate profit margin if cost_price exists
  const calculateMargin = () => {
    if (product?.cost_price && product?.Price) {
      const cost = parseFloat(product.cost_price);
      const price = parseFloat(product.Price);
      if (price > 0) {
        return ((price - cost) / price * 100).toFixed(2);
      }
    }
    return 'N/A';
  };

  // Calculate stock level percentage for progress bar
  const calculateStockPercentage = () => {
    const stock = getStockLevel();
    const optimalLevel = 50; // From your inventory table
    
    // Return percentage between 0-100
    return Math.min(100, Math.max(0, (stock / optimalLevel) * 100));
  };

  // Update the stock level indicator to match the product list style
  const getStockLevelColor = () => {
    const stock = getStockLevel();
    
    if (isDiscontinued) return "error";
    if (stock <= 0) return "error";
    if (stock <= reorderLevel) return "warning";
    return "success";
  };

  // Helper to format price
  // (Removed unused formatPrice function)

  // Get product SKU
  const getProductSku = () => {
    if (product?.SKU) return product.SKU;
    if (product?.sku) return product.sku;
    return `ITM-${product?.Product_ID || id}`;
  };

  // Get supplier name
  const getSupplierName = () => {
    // Debug supplier data to help fix the issue
    console.log('Current supplier data:', supplier);
    
    // First check if product has supplier_name directly
    if (product?.supplier_name) return product.supplier_name;
    
    // Check for supplier data - handle different formats
    if (supplier) {
      // Check for common name fields
      if (supplier.Name) return supplier.Name;
      if (supplier.name) return supplier.name;
      if (supplier.Company_Name) return supplier.Company_Name;
      if (supplier.company_name) return supplier.company_name;
      
      // Check if supplier info is nested in a data property
      if (supplier.data) {
        if (supplier.data.Name) return supplier.data.Name;
        if (supplier.data.name) return supplier.data.name;
        if (supplier.data.Company_Name) return supplier.data.Company_Name;
        if (supplier.data.company_name) return supplier.data.company_name;
      }
      
      // If we have an ID but no name, create a placeholder
      if (supplier.id || supplier.ID || supplier.supplier_id || supplier.Supplier_ID) {
        const supplierId = supplier.id || supplier.ID || supplier.supplier_id || supplier.Supplier_ID;
        return `Supplier #${supplierId}`;
      }
    }
    
    // Check if product has supplier ID but no supplier object fetched
    if (product?.supplier_id || product?.Supplier_ID) {
      const supplierId = product.supplier_id || product.Supplier_ID;
      return `Supplier #${supplierId}`;
    }
    
    return 'N/A';
  };

  // Get stock level
  const getStockLevel = () => {
    // Check inventory table first if available
    if (inventory) {
      if (inventory.Stock_Level !== undefined && inventory.Stock_Level !== null) {
        return parseInt(inventory.Stock_Level);
      }
    }
    
    // Fall back to product table data
    if (product) {
      if (product.Stock_Level !== undefined && product.Stock_Level !== null) {
        return parseInt(product.Stock_Level);
      }
      if (product.stock !== undefined && product.stock !== null) {
        return parseInt(product.stock);
      }
    }
    
    // Default to 0 if no stock level found
    return 0;
  };

  // Get reorder level
  const getReorderLevel = () => {
    console.log('Retrieving reorder level from:', {
      product: product?.Reorder_Level || product?.reorder_level,
      inventory: inventory?.Reorder_Level || inventory?.reorder_level
    });
    
    // Define a fixed order of precedence for reorder level values
    const sources = [
      inventory?.reorder_level,
      inventory?.Reorder_Level,
      product?.reorder_level,
      product?.Reorder_Level
    ];
    
    // Find the first valid value
    for (const value of sources) {
      if (value !== undefined && value !== null && !isNaN(parseInt(value))) {
        console.log(`Found valid reorder level value: ${value}`);
        return parseInt(value);
      }
    }
    
    console.log('No valid reorder level found, using fixed default of 20');
    return 20; // Default value if nothing else is found
  };

  // Get optimal level
  const getOptimalLevel = () => {
    console.log('Retrieving optimal level from:', {
      product: product?.Optimal_Level || product?.optimal_level,
      inventory: inventory?.Optimal_Level || inventory?.optimal_level
    });
    
    // Define a fixed order of precedence for optimal level values
    const sources = [
      inventory?.optimal_level,
      inventory?.Optimal_Level,
      product?.optimal_level,
      product?.Optimal_Level
    ];
    
    // Find the first valid value
    for (const value of sources) {
      if (value !== undefined && value !== null && !isNaN(parseInt(value))) {
        console.log(`Found valid optimal level value: ${value}`);
        return parseInt(value);
      }
    }
    
    console.log('No valid optimal level found, using fixed default of 50');
    return 50; // Default value if nothing else is found
  };

  // Update the discontinue product function
  const handleDiscontinueProduct = async () => {
    // Show confirmation dialog instead of window.confirm()
    setConfirmDialog({
      open: true,
      title: 'Discontinue Product',
      message: "Are you sure you want to mark this product as discontinued? This will prevent new sales of this product.",
      onConfirm: async () => {
        try {
          setDiscontinuing(true);
          
          // Use regular update instead of specialized endpoint
          await productService.updateProduct(id, {
            status: 'discontinued',
            // Include these fields to pass validation
            price: product.Price || 0,
            name: product.Name || '',
            sku: product.SKU || ''
          });
          
          // Update the product in the local state
          setProduct(prevProduct => ({
            ...prevProduct,
            status: 'discontinued',
            Status: 'discontinued'
          }));
          
          // Show success message
          alert('Product has been marked as discontinued');
        } catch (error) {
          console.error('Error discontinuing product:', error);
          alert('Failed to discontinue product. Please try again.');
        } finally {
          setDiscontinuing(false);
        }
      }
    });
  };

  // Update the continue selling function
  const handleContinueSellingProduct = async () => {
    // Show confirmation dialog instead of window.confirm()
    setConfirmDialog({
      open: true,
      title: 'Continue Selling Product',
      message: "Are you sure you want to continue selling this product? This will make the product available for purchase again.",
      onConfirm: async () => {
        try {
          setContinuing(true);
          
          // Use regular update instead of specialized endpoint
          await productService.updateProduct(id, {
            status: 'active',
            // Include these fields to pass validation
            price: product.Price || 0,
            name: product.Name || '',
            sku: product.SKU || ''
          });
          
          // Update the product in the local state
          setProduct(prevProduct => ({
            ...prevProduct,
            status: 'active',
            Status: 'active'
          }));
          
          // Show success message
          alert('Product is now available for sale');
        } catch (error) {
          console.error('Error continuing product:', error);
          alert('Failed to continue selling product. Please try again.');
        } finally {
          setContinuing(false);
        }
      }
    });
  };
  
  // Check if the product is discontinued
  const isDiscontinued = product?.status === 'discontinued' || product?.Status === 'discontinued';

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3, backgroundColor: '#f9f9f9' }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
          <Skeleton variant="text" width={120} height={30} />
        </Box>
        <Paper elevation={0} sx={{ p: 0, overflow: 'hidden', borderRadius: 2, bgcolor: 'white', border: '1px solid #e0e0e0' }}>
          <Grid container>
            <Grid item xs={12} md={3}>
              <Skeleton variant="rectangular" height={300} animation="wave" />
            </Grid>
            <Grid item xs={12} md={9} sx={{ p: 3 }}>
              <Skeleton variant="text" height={40} width="50%" animation="wave" />
              <Skeleton variant="text" height={30} width="30%" sx={{ mt: 1 }} animation="wave" />
              <Box sx={{ mt: 3 }}>
                <Skeleton variant="rectangular" height={80} width="100%" animation="wave" />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={180} animation="wave" sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={180} animation="wave" sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 3, backgroundColor: '#f9f9f9' }}>
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>
        <Button 
          component={Link} 
          to="/products" 
          startIcon={<FaArrowLeft />}
          variant="contained"
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 3, backgroundColor: '#f9f9f9' }}>
        <Alert severity="warning" sx={{ mb: 4, borderRadius: 2 }}>Product not found</Alert>
        <Button 
          component={Link} 
          to="/products" 
          startIcon={<FaArrowLeft />}
          variant="contained"
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  // Current stock level
  const stockLevel = getStockLevel();
  const reorderLevel = getReorderLevel();
  const optimalLevel = getOptimalLevel();
  const isLowStock = typeof reorderLevel === 'number' && stockLevel <= reorderLevel;

  // Format price for display (converting cents to dollars if needed)
  const formatDisplayPrice = (price) => {
    if (!price) return '$0.00';
    
    // Check if price seems to be in cents (over 1000)
    if (parseFloat(price) > 1000) {
      // Convert to dollars for display
      return `$${(parseFloat(price) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    return `$${parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Add confirmation dialog */}
      <ConfirmDialog 
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => {
          const onConfirm = confirmDialog.onConfirm;
          setConfirmDialog(prev => ({ ...prev, open: false }));
          onConfirm();
        }}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
      />
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <LinearProgress sx={{ width: '100%' }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 3 }}>{error}</Alert>
      ) : product ? (
        <>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button 
              component={Link} 
              to="/products" 
              startIcon={<FaArrowLeft />}
              sx={{ mb: 2 }}
            >
              Back to Products
            </Button>
            
            <Box>
              {isDiscontinued && (
                <Chip 
                  label="Discontinued" 
                  color="error" 
                  variant="filled" 
                  sx={{ fontWeight: 'bold', mr: 2 }}
                />
              )}
              
              {!isDiscontinued ? (
                <Button 
                  variant="outlined" 
                  color="error" 
                  startIcon={<FaBan />}
                  onClick={handleDiscontinueProduct}
                  disabled={discontinuing}
                  sx={{ fontWeight: 'medium', borderWidth: '2px' }}
                >
                  {discontinuing ? 'Processing...' : 'Mark as Discontinued'}
                </Button>
              ) : (
                <Button 
                  variant="outlined" 
                  color="success" 
                  startIcon={<FaBoxOpen />}
                  onClick={handleContinueSellingProduct}
                  disabled={continuing}
                  sx={{ fontWeight: 'medium', borderWidth: '2px' }}
                >
                  {continuing ? 'Processing...' : 'Continue Selling'}
                </Button>
              )}
            </Box>
          </Box>
          
          {/* Product Header */}
          <Paper elevation={0} sx={{ mb: 3, p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={product.Image_URL || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                    alt={product.Name}
                    sx={{ objectFit: 'contain', bgcolor: '#f5f5f5' }}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                  <CardContent sx={{ p: 2, flexGrow: 1 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mt: 1, 
                      mb: 1, 
                      p: 1,
                      borderRadius: 1,
                      bgcolor: '#f8f9fa' 
                    }}>
                      <Box 
                        component="span"
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          mr: 1,
                          bgcolor: isDiscontinued ? 'error.main' : getStockLevel() > reorderLevel ? 'success.main' : getStockLevel() > 0 ? 'warning.main' : 'error.main'
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {isDiscontinued 
                          ? 'Discontinued' 
                          : getStockLevel() > reorderLevel 
                            ? 'In Stock' 
                            : getStockLevel() > 0 
                              ? 'Low Stock' 
                              : 'Out of Stock'}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      SKU: {getProductSku()}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Category: {product.Category || 'Uncategorized'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  mb: 2 
                }}>
                  <Box>
                    <Typography variant="h4" gutterBottom>
                      {product.Name}
                      {isDiscontinued && (
                        <Typography 
                          component="span" 
                          sx={{ 
                            ml: 2, 
                            color: 'error.main', 
                            fontWeight: 'bold',
                            border: '2px solid',
                            borderColor: 'error.main',
                            borderRadius: 1,
                            px: 1,
                            py: 0.5,
                            fontSize: '0.9rem',
                            verticalAlign: 'middle',
                            display: 'inline-block'
                          }}
                        >
                          DISCONTINUED
                        </Typography>
                      )}
                    </Typography>
                    
                    <Grid container spacing={1} alignItems="center">
                      <Grid item>
                        <Typography variant="body1" color="text.secondary">
                          SKU: {getProductSku()}
                        </Typography>
                      </Grid>
                      
                      {getSupplierName() !== 'N/A' && (
                        <Grid item>
                          <Chip 
                            size="small" 
                            label={`Supplier: ${getSupplierName()}`} 
                            variant="outlined"
                          />
                        </Grid>
                      )}
                      
                      <Grid item>
                        <Chip 
                          size="small" 
                          label={product.Category || 'Uncategorized'} 
                          color="primary" 
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                    
                    <Typography variant="h5" color="primary.main" sx={{ fontWeight: 'bold', mt: 2 }}>
                      ${formatDisplayPrice(product.Price)}
                    </Typography>
                  </Box>
                  
                  <Chip 
                    label={
                      isDiscontinued ? 'Discontinued' :
                      getStockLevel() <= 0 ? 'Out of Stock' :
                      getStockLevel() <= reorderLevel ? `Low Stock: ${getStockLevel()}` :
                      `In Stock: ${getStockLevel()}`
                    }
                    color={getStockLevelColor()}
                    sx={{ 
                      fontWeight: 'medium',
                      fontSize: '0.9rem',
                      py: 2
                    }}
                  />
                </Box>
                
                {/* Product description */}
                <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
                  {product.Description || 'No description available.'}
                </Typography>
                
                {isDiscontinued && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    This product has been discontinued and is no longer available for sale.
                  </Alert>
                )}
              </Grid>
            </Grid>
          </Paper>
          
          <Grid container spacing={3}>
            {/* Inventory status */}
            <Grid item xs={12} md={6}>
              <SectionCard>
                <CardContent sx={{ p: 3 }}>
                  <SectionTitle>
                    <FaBoxOpen size={18} />
                    <Typography variant="h6" fontWeight={500}>
                      Inventory Status
                    </Typography>
                  </SectionTitle>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Current Stock
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {stockLevel} units
                      </Typography>
                      {isLowStock && (
                        <Chip
                          label="Low Stock"
                          color="error"
                          size="small"
                          sx={{ height: 24 }}
                        />
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={calculateStockPercentage()} 
                          color={getStockLevelColor()}
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            backgroundColor: '#e0e0e0' 
                          }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {Math.round(calculateStockPercentage())}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Reorder Level
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      {typeof reorderLevel === 'number' ? (
                        <>
                          {reorderLevel} units
                          {!product.Reorder_Level && !inventory?.Reorder_Level && 
                           !product.reorder_level && !inventory?.reorder_level && (
                            <Chip
                              label="Auto"
                              size="small"
                              variant="outlined" 
                              color="default"
                              sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </>
                      ) : 'Not set'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Optimal Level
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      {(optimalLevel)} units
                    </Typography>
                  </Box>
                  
                  <Button
                    component={Link}
                    to={`/inventory?product=${product.Product_ID}`}
                    variant="outlined"
                    startIcon={<FaWarehouse />}
                    size="medium"
                    sx={{ mt: 1 }}
                    fullWidth
                  >
                    Manage Inventory
                  </Button>
                </CardContent>
              </SectionCard>
            </Grid>
            
            {/* Financial information */}
            <Grid item xs={12} md={6}>
              <SectionCard>
                <CardContent sx={{ p: 3 }}>
                  <SectionTitle>
                    <FaDollarSign size={18} />
                    <Typography variant="h6" fontWeight={500}>
                      Financial Information
                    </Typography>
                  </SectionTitle>
                  
                  <Table size="small" sx={{ mb: 2 }}>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ borderBottom: 'none', pl: 0, py: 1.5, width: '33%' }}>
                          <Typography variant="body2" color="text.secondary">Selling Price</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: 'none', py: 1.5 }}>
                          <Typography variant="body1" fontWeight={500}>{formatDisplayPrice(product.Price || product.price)}</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ borderBottom: 'none', pl: 0, py: 1.5 }}>
                          <Typography variant="body2" color="text.secondary">Cost Price</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: 'none', py: 1.5 }}>
                          <Typography variant="body1" fontWeight={500}>
                            {product.cost_price ? formatDisplayPrice(product.cost_price) : 'N/A'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ borderBottom: 'none', pl: 0, py: 1.5 }}>
                          <Typography variant="body2" color="text.secondary">Profit Margin</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: 'none', py: 1.5 }}>
                          <Typography 
                            variant="body1" 
                            fontWeight={500}
                            color={calculateMargin() !== 'N/A' && parseFloat(calculateMargin()) > 30 ? 'success.main' : 'text.primary'}
                          >
                            {calculateMargin() !== 'N/A' ? `${calculateMargin()}%` : 'N/A'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  
                  <Button
                    component={Link}
                    to={`/products/edit/${product.Product_ID}#pricing`}
                    variant="outlined"
                    color="primary"
                    startIcon={<FaEdit />}
                    size="medium"
                    fullWidth
                  >
                    Update Pricing
                  </Button>
                </CardContent>
              </SectionCard>
            </Grid>
          </Grid>
          
          {/* Technical specifications - only show if data exists */}
          {(product.specifications || 
            product.material_type || 
            product.weight || 
            product.dimensions ||
            product.voltage ||
            product.power_source ||
            product.warranty_period ||
            product.certification_info) && (
            <SectionCard sx={{ mt: 0 }}>
              <CardContent sx={{ p: 3 }}>
                <SectionTitle>
                  <FaClipboardList size={18} />
                  <Typography variant="h6" fontWeight={500}>
                    Technical Specifications
                  </Typography>
                </SectionTitle>
                
                <Grid container spacing={3}>
                  {product.specifications && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Specifications
                      </Typography>
                      <Typography variant="body1" sx={{ backgroundColor: '#f8f9fa', p: 2, borderRadius: 1 }}>
                        {product.specifications}
                      </Typography>
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <Grid container spacing={3}>
                      {product.material_type && (
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Material
                          </Typography>
                          <Typography variant="body1">
                            {product.material_type}
                          </Typography>
                        </Grid>
                      )}
                      
                      {(product.dimensions || product.length || product.width || product.height) && (
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Dimensions
                          </Typography>
                          <Typography variant="body1">
                            {product.dimensions || 
                             ((product.length || product.width || product.height) ? 
                              `${product.length || 0} × ${product.width || 0} × ${product.height || 0} cm` : '')}
                          </Typography>
                        </Grid>
                      )}
                      
                      {product.weight && (
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Weight
                          </Typography>
                          <Typography variant="body1">
                            {product.weight} kg
                          </Typography>
                        </Grid>
                      )}
                      
                      {product.voltage && (
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Voltage
                          </Typography>
                          <Typography variant="body1">
                            {product.voltage}
                          </Typography>
                        </Grid>
                      )}
                      
                      {product.power_source && (
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Power Source
                          </Typography>
                          <Typography variant="body1">
                            {product.power_source}
                          </Typography>
                        </Grid>
                      )}
                      
                      {product.warranty_period && (
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Warranty
                          </Typography>
                          <Typography variant="body1">
                            {product.warranty_period} months
                          </Typography>
                        </Grid>
                      )}
                      
                      {product.certification_info && (
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Certification
                          </Typography>
                          <Typography variant="body1">
                            {product.certification_info}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </SectionCard>
          )}
          
          {/* Add the Edit Product button at the bottom of the page */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button 
              component={Link} 
              to={`/products/edit/${id}`} 
              variant="contained" 
              color="primary" 
              startIcon={<FaEdit />}
              size="large"
              sx={{ 
                minWidth: 200, 
                py: 1.5, 
                fontWeight: 'bold',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                '&:hover': {
                  boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Edit Product
            </Button>
          </Box>
        </>
      ) : (
        <Alert severity="warning">Product not found</Alert>
      )}
    </Container>
  );
};

export default ProductDetail;