import React, { useState, useEffect, useCallback } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Grid, 
  Divider, 
  Button, 
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Phone as PhoneIcon, 
  LocationOn as LocationIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getSupplierById } from '../../services/supplierService';
import productService from '../../services/productService';

const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSupplierData = useCallback(async () => {
    setLoading(true);
    try {
      const supplierResponse = await getSupplierById(id);
      setSupplier(supplierResponse.data);
      
      // Get related products
      const productsResponse = await productService.getProductsBySupplier(id);
      setRelatedProducts(productsResponse.data);
    } catch (error) {
      console.error('Error fetching supplier details:', error);
      toast.error('Failed to load supplier details');
      navigate('/suppliers');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchSupplierData();
  }, [fetchSupplierData]);

  const handleEdit = () => {
    navigate(`/suppliers/edit/${id}`);
  };

  const handleBack = () => {
    navigate('/suppliers');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (!supplier) {
    return (
      <Paper elevation={2}>
        <Box p={3} textAlign="center">
          <Typography variant="h6" color="error">
            Supplier not found
          </Typography>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            Back to Suppliers
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2}>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
            Back to Suppliers
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<EditIcon />} 
            onClick={handleEdit}
          >
            Edit Supplier
          </Button>
        </Box>
        
        <Typography variant="h4" gutterBottom>
          {supplier.name}
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              <Box display="flex" alignItems="center" my={1}>
                <EmailIcon color="action" sx={{ mr: 1 }} />
                <Typography>{supplier.email || 'No email provided'}</Typography>
              </Box>
              <Box display="flex" alignItems="center" my={1}>
                <PhoneIcon color="action" sx={{ mr: 1 }} />
                <Typography>{supplier.phone || 'No phone provided'}</Typography>
              </Box>
              {supplier.contactPerson && (
                <Box my={1}>
                  <Typography variant="body1">
                    <strong>Contact Person:</strong> {supplier.contactPerson}
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Address
              </Typography>
              {supplier.address && (Object.values(supplier.address).some(val => val)) ? (
                <Box display="flex" alignItems="flex-start" my={1}>
                  <LocationIcon color="action" sx={{ mr: 1, mt: 0.5 }} />
                  <Typography>
                    {supplier.address.street && `${supplier.address.street}, `}
                    {supplier.address.city && `${supplier.address.city}, `}
                    {supplier.address.state && `${supplier.address.state}, `}
                    {supplier.address.zipCode && `${supplier.address.zipCode}, `}
                    {supplier.address.country && supplier.address.country}
                  </Typography>
                </Box>
              ) : (
                <Typography color="textSecondary">No address information provided</Typography>
              )}
            </Box>
            
            {supplier.paymentTerms && (
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Payment Terms
                </Typography>
                <Chip label={supplier.paymentTerms} />
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Products Supplied
              </Typography>
              {relatedProducts.length > 0 ? (
                <List>
                  {relatedProducts.map(product => (
                    <ListItem 
                      key={product._id} 
                      button 
                      onClick={() => navigate(`/products/${product._id}`)}
                      divider
                    >
                      <ListItemText 
                        primary={product.name} 
                        secondary={`SKU: ${product.sku || 'N/A'}`} 
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="textSecondary">No products associated with this supplier</Typography>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            {supplier.notes ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Notes
                </Typography>
                <Typography variant="body1" paragraph>
                  {supplier.notes}
                </Typography>
              </Box>
            ) : null}
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default SupplierDetail;