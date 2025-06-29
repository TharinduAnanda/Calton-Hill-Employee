import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import inventoryService from '../../services/inventoryService';
import { 
  Box, Typography, Button, TextField, Card, CardContent, 
  CardMedia, CircularProgress, Grid, InputAdornment,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [inventoryData, setInventoryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products...');
      const response = await productService.getAllProducts();
      
      // Debug the response
      console.log('API Response:', response);
      
      // Handle different response structures
      let productsData;
      if (Array.isArray(response)) {
        productsData = response;
      } else if (response.data) {
        productsData = Array.isArray(response.data) ? response.data : [];
      } else {
        productsData = [];
      }
      
      console.log('Processed products data:', productsData);
      setProducts(productsData);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(productsData
        .map(product => product.category || product.Category)
        .filter(Boolean))];
      setCategories(uniqueCategories);
      
      // Fetch inventory data for all products
      fetchInventoryData(productsData);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch inventory data for products
  const fetchInventoryData = async (productsData) => {
    try {
      console.log('Fetching inventory data for all products');
      const response = await inventoryService.getInventoryItems();
      
      // Process inventory data
      let inventoryItems = [];
      if (response?.data?.data && Array.isArray(response.data.data)) {
        inventoryItems = response.data.data;
      } else if (Array.isArray(response?.data)) {
        inventoryItems = response.data;
      } else if (Array.isArray(response)) {
        inventoryItems = response;
      }
      
      console.log('Inventory data:', inventoryItems);
      
      // Create a lookup object by product ID
      const inventoryByProductId = {};
      inventoryItems.forEach(item => {
        const productId = item.Product_ID || item.product_id;
        if (productId) {
          inventoryByProductId[productId] = item;
        }
      });
      
      setInventoryData(inventoryByProductId);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    }
  };

  // Get stock level from inventory
  const getStockLevel = (productId, defaultStock = 0) => {
    const inventory = inventoryData[productId];
    if (inventory && inventory.Stock_Level !== undefined) {
      return parseInt(inventory.Stock_Level);
    }
    return defaultStock;
  };

  // Get reorder level from inventory
  const getReorderLevel = (productId) => {
    const inventory = inventoryData[productId];
    if (inventory && (inventory.Reorder_Level !== undefined || inventory.reorder_level !== undefined)) {
      return parseInt(inventory.Reorder_Level || inventory.reorder_level);
    }
    return 10; // Default reorder level
  };

  const handleAddProduct = () => {
    navigate('/products/add');
  };

  const handleProductClick = (id) => {
    navigate(`/products/${id}`);
  };

  const getFilteredProducts = () => {
    return products.filter(product => {
      const productName = product.name || product.Name || '';
      const productDesc = product.description || product.Description || '';
      const productCat = product.category || product.Category || '';
      
      const matchesSearch = 
        productName.toLowerCase().includes(search.toLowerCase()) || 
        productDesc.toLowerCase().includes(search.toLowerCase());
        
      const matchesCategory = category === 'all' || productCat === category;
      
      return matchesSearch && matchesCategory;
    });
  };

  const filteredProducts = getFilteredProducts();

  // Add this right before the return statement to debug
  console.log({
    productsLength: products.length,
    filteredProductsLength: filteredProducts.length,
    searchTerm: search,
    selectedCategory: category,
    allCategories: categories,
    inventoryDataCount: Object.keys(inventoryData).length
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Products</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddProduct}
        >
          Add Product
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search products..."
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {categories.length > 0 && (
          <FormControl variant="outlined" fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {error && (
        <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 1, mb: 3 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {filteredProducts.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>No products found</Typography>
          <Typography variant="body1" color="textSecondary">
            {products.length === 0 
              ? "Try adding your first product" 
              : "Try adjusting your search or filter criteria"}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProducts.map((product) => {
            const id = product.id || product._id || product.Product_ID;
            const name = product.name || product.Name || 'Unnamed Product';
            const price = product.price || product.Price || 0;
            const category = product.category || product.Category || 'Uncategorized';
            const imageUrl = product.image_url || product.imageUrl || product.Image_URL || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
            const stockQty = getStockLevel(id, product.stock_quantity || product.Stock_Level || 0);
            const reorderLevel = getReorderLevel(id);
            const status = product.status || product.Status || 'active';
            const isDiscontinued = status === 'discontinued';
            
            return (
              <Grid item xs={12} sm={6} md={4} key={id}>
                <Card 
                  sx={{ 
                    width: '100%',
                    height: '450px', // Exact fixed height for all cards
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 6 },
                    position: 'relative',
                    overflow: 'hidden' // Prevent content from overflowing
                  }}
                  onClick={() => handleProductClick(id)}
                >
                  {isDiscontinued && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bgcolor: 'error.main',
                        color: 'white',
                        px: 2,
                        py: 0.5,
                        zIndex: 1,
                        borderBottomLeftRadius: 8
                      }}
                    >
                      Discontinued
                    </Box>
                  )}
                  {/* Fixed-size image container */}
                  <Box 
                    sx={{ 
                      height: '220px', // Exact height for all image containers
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      bgcolor: '#f5f5f5',
                      padding: 2,
                      boxSizing: 'border-box',
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        height: '180px', // Fixed height for image wrapper
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={imageUrl}
                        alt={name}
                        sx={{ 
                          objectFit: 'contain',
                          width: 'auto',
                          height: 'auto',
                          maxHeight: '180px',
                          maxWidth: '100%'
                        }}
                        onError={(e) => {
                          // Replace with a data URI for fallback if the image fails to load
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                    </Box>
                  </Box>
                  
                  {/* Fixed content area */}
                  <CardContent 
                    sx={{ 
                      flexGrow: 1, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      height: '180px', // Fixed height for content area
                      padding: 2,
                      overflow: 'hidden' // Prevent content overflow
                    }}
                  >
                    <Box sx={{ height: '120px', overflow: 'hidden' }}>
                      <Typography 
                        variant="h6" 
                        component="h2" 
                        gutterBottom 
                        noWrap
                        sx={{ fontWeight: 'medium', fontSize: '1.1rem' }}
                      >
                        {name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="textSecondary" 
                        gutterBottom
                        sx={{ mb: 1 }}
                      >
                        {category}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        color="primary" 
                        sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}
                      >
                        ${Number(price).toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Box 
                        component="span"
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          mr: 1,
                          bgcolor: isDiscontinued 
                            ? 'error.main' 
                            : stockQty <= 0 
                              ? 'error.main' 
                              : stockQty <= reorderLevel 
                                ? 'warning.main' 
                                : 'success.main'
                        }}
                      />
                      <Typography variant="body2">
                        {isDiscontinued 
                          ? 'Discontinued' 
                          : stockQty <= 0 
                            ? 'Out of Stock' 
                            : stockQty <= reorderLevel 
                              ? 'Low Stock' 
                              : 'In Stock'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default ProductList;