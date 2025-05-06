import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import { 
  Box, Typography, Button, TextField, Card, CardContent, 
  CardMedia, CircularProgress, Grid, InputAdornment,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';

const ProductList = () => {
  const [products, setProducts] = useState([]);
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
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
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
    allCategories: categories
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
      <Typography variant="h4" gutterBottom>Products ({products.length})</Typography>
      
      {/* Debug information */}
      <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="subtitle1">Debug Info:</Typography>
        <Typography variant="body2">Total Products: {products.length}</Typography>
        <Typography variant="body2">Filtered Products: {filteredProducts.length}</Typography>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={fetchProducts} 
          sx={{ mt: 1 }}
        >
          Refresh Data
        </Button>
      </Box>
      
      {/* Simple list display */}
      <Box sx={{ mb: 3 }}>
        {products.length === 0 ? (
          <Typography>No products available</Typography>
        ) : (
          <ul>
            {products.map(product => (
              <li key={product.id || product._id || product.Product_ID}>
                {product.name || product.Name || 'Unnamed Product'} - 
                ${product.price || product.Price || 0}
              </li>
            ))}
          </ul>
        )}
      </Box>
      
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
            const imageUrl = product.image_url || product.imageUrl || product.image || 'https://via.placeholder.com/150';
            const stockQty = product.stock_quantity || product.quantity || 0;
            
            return (
              <Grid item xs={12} sm={6} md={4} key={id}>
                <Card 
                  sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 6 }
                  }}
                  onClick={() => handleProductClick(id)}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={imageUrl}
                    alt={name}
                    sx={{ objectFit: 'contain', bgcolor: '#f5f5f5' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom noWrap>
                      {name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {category}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                      ${Number(price).toFixed(2)}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                      <Box 
                        component="span"
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          mr: 1,
                          bgcolor: stockQty > 10 ? 'success.main' : stockQty > 0 ? 'warning.main' : 'error.main'
                        }}
                      />
                      <Typography variant="body2">
                        {stockQty > 10 
                          ? `In Stock (${stockQty})`
                          : stockQty > 0
                            ? `Low Stock (${stockQty})`
                            : 'Out of Stock'
                        }
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