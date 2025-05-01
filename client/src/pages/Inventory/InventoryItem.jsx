import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import inventoryService from '../../services/inventoryService';
import productService from '../../services/productService';
import { getSupplierById } from '../../services/supplierService';
import { Box, Button, Card, CardContent, CircularProgress, Container, Grid, TextField, Typography, Alert, Breadcrumbs, Link } from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const InventoryItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [inventoryItem, setInventoryItem] = useState(null);
  const [product, setProduct] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedItem, setUpdatedItem] = useState({
    stock_level: 0
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchInventoryItem = async () => {
      try {
        setLoading(true);
        const data = await inventoryService.getInventoryItemById(id);
        setInventoryItem(data);
        setUpdatedItem({
          stock_level: data.stock_level
        });
        
        if (data.product_id) {
          const productData = await productService.getProductById(data.product_id);
          setProduct(productData);
        }
        
        if (data.supplier_id) {
          const supplierData = await getSupplierById(data.supplier_id);
          setSupplier(supplierData);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch inventory item. Please try again later.');
        setLoading(false);
        console.error('Error fetching inventory item:', err);
      }
    };
    
    fetchInventoryItem();
  }, [id]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setUpdatedItem({
        stock_level: inventoryItem.stock_level
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedItem(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await inventoryService.updateInventoryItem(id, {
        stock_level: parseInt(updatedItem.stock_level),
        product_id: inventoryItem.product_id,
        supplier_id: inventoryItem.supplier_id
      });
      
      setInventoryItem(prev => ({
        ...prev,
        stock_level: parseInt(updatedItem.stock_level)
      }));
      
      setIsEditing(false);
      setSuccessMessage('Inventory item updated successfully!');
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Failed to update inventory item. Please try again.');
      console.error('Error updating inventory item:', err);
    }
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/inventory')}
          sx={{ mt: 2 }}
        >
          Back to Inventory
        </Button>
      </Container>
    );
  }

  if (!inventoryItem) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 2 }}>Inventory item not found.</Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/inventory')}
          sx={{ mt: 2 }}
        >
          Back to Inventory
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link color="inherit" onClick={() => navigate('/')}>Dashboard</Link>
        <Link color="inherit" onClick={() => navigate('/inventory')}>Inventory</Link>
        <Typography color="text.primary">Item #{id}</Typography>
      </Breadcrumbs>
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
      )}
      
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Inventory Item Details
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/inventory')}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Button 
            variant="contained" 
            color={isEditing ? "success" : "primary"}
            startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
            onClick={isEditing ? handleSubmit : handleEditToggle}
          >
            {isEditing ? "Save Changes" : "Edit Item"}
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Inventory Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Inventory ID
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {inventoryItem.inventory_id}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Stock Level
                </Typography>
                {isEditing ? (
                  <TextField
                    name="stock_level"
                    label="Stock Level"
                    type="number"
                    value={updatedItem.stock_level}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                  />
                ) : (
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {inventoryItem.stock_level}
                  </Typography>
                )}
                
                <Typography variant="subtitle2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {new Date(inventoryItem.last_updated).toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Related Product
              </Typography>
              {product ? (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Product Name
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {product.name}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {product.category}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">
                    Price
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    ${(product.price / 100).toFixed(2)}
                  </Typography>
                  
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate(`/products/${product.product_id}`)}
                    sx={{ mt: 1 }}
                  >
                    View Product Details
                  </Button>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No product information available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Supplier Information
              </Typography>
              {supplier ? (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Supplier Name
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {supplier.name}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">
                    Contact Email
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {supplier.email || 'N/A'}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">
                    Phone Number
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {supplier.phone_number || 'N/A'}
                  </Typography>
                  
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate(`/suppliers/${supplier.supplier_id}`)}
                    sx={{ mt: 1 }}
                  >
                    View Supplier Details
                  </Button>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No supplier information available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default InventoryItem;