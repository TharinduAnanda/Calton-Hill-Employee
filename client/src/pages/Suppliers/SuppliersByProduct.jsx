import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Grid,
  TextField,
  InputAdornment,
  Divider,
  Container,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getSuppliers } from '../../services/supplierService';
import productService from '../../services/productService';

const SuppliersByProduct = ({ refresh, onRefresh }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [suppliersByProduct, setSuppliersByProduct] = useState({});
  const [productCategories, setProductCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [refresh]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch products
      const productsResponse = await productService.getAllProducts();
      const products = Array.isArray(productsResponse) 
        ? productsResponse 
        : (productsResponse.data || []);
      
      setProducts(products);
      
      // Fetch suppliers
      const suppliersResponse = await getSuppliers();
      const suppliers = suppliersResponse.data || [];
      setSuppliers(suppliers);
      
      // Group products by category
      const categories = {};
      products.forEach(product => {
        if (product && product.Category) {
          if (!categories[product.Category]) {
            categories[product.Category] = [];
          }
          categories[product.Category].push(product);
        }
      });
      setProductCategories(Object.keys(categories).sort());
      
      // Now create a mapping of products to suppliers using existing data
      // This avoids unnecessary API calls that might fail
      const supplierMapping = {};
      
      suppliers.forEach(supplier => {
        if (supplier.products && Array.isArray(supplier.products)) {
          supplier.products.forEach(product => {
            // Find the product category
            const fullProduct = products.find(p => p.Product_ID === product.Product_ID);
            if (fullProduct) {
              const category = fullProduct.Category;
              const productName = fullProduct.Name;
              
              if (!supplierMapping[category]) {
                supplierMapping[category] = {};
              }
              
              if (!supplierMapping[category][productName]) {
                supplierMapping[category][productName] = [];
              }
              
              // Add the supplier if it's not already there
              const alreadyExists = supplierMapping[category][productName].some(
                s => s.Supplier_ID === supplier.Supplier_ID
              );
              
              if (!alreadyExists) {
                supplierMapping[category][productName].push(supplier);
              }
            }
          });
        }
      });
      
      setSuppliersByProduct(supplierMapping);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Error fetching data: ${error.message}`);
      toast.error('Failed to load supplier data');
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleSupplierView = (supplierId) => {
    navigate(`/suppliers/${supplierId}`);
  };

  const handleSupplierEdit = (supplierId) => {
    navigate(`/suppliers/edit/${supplierId}`);
  };

  const filteredCategories = search
    ? productCategories.filter(category => 
        category.toLowerCase().includes(search.toLowerCase()) ||
        Object.keys(suppliersByProduct[category] || {}).some(product => 
          product.toLowerCase().includes(search.toLowerCase()) ||
          (suppliersByProduct[category][product] || []).some(supplier => 
            supplier.name.toLowerCase().includes(search.toLowerCase())
          )
        )
      )
    : productCategories;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by category, product, or supplier..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {filteredCategories.length === 0 ? (
        <Box p={3} textAlign="center">
          <Typography variant="h6" color="textSecondary">
            No products or suppliers found matching your search
          </Typography>
        </Box>
      ) : (
        filteredCategories.map((category) => (
          <Accordion 
            key={category} 
            expanded={expanded === category} 
            onChange={handleExpand(category)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                backgroundColor: 'primary.light',
                '&.Mui-expanded': {
                  minHeight: 64,
                },
              }}
            >
              <Typography variant="h6">{category}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 2 }}>
              {Object.keys(suppliersByProduct[category] || {}).length === 0 ? (
                <Typography color="textSecondary">No products in this category</Typography>
              ) : (
                Object.entries(suppliersByProduct[category] || {}).map(([productName, suppliers]) => (
                  <Box key={productName} mb={3}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}
                    >
                      <span 
                        style={{ 
                          display: 'inline-block', 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          backgroundColor: '#3f51b5', 
                          marginRight: 8 
                        }}
                      />
                      {productName}
                    </Typography>
                    
                    {suppliers.length === 0 ? (
                      <Typography color="textSecondary" sx={{ ml: 3 }}>No suppliers for this product</Typography>
                    ) : (
                      <Grid container spacing={2} sx={{ ml: 1 }}>
                        {suppliers.map((supplier) => (
                          <Grid item xs={12} sm={6} md={4} key={supplier._id || supplier.Supplier_ID}>
                            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                              <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" gutterBottom>
                                  {supplier.name}
                                </Typography>
                                {supplier.contactPerson && (
                                  <Typography variant="body2" color="textSecondary">
                                    Contact: {supplier.contactPerson}
                                  </Typography>
                                )}
                                <Typography variant="body2">
                                  {supplier.email}
                                </Typography>
                                <Typography variant="body2">
                                  {supplier.phone || supplier.Phone_Number}
                                </Typography>
                                {supplier.address && (supplier.address.city || supplier.city) && (
                                  <Chip 
                                    size="small" 
                                    label={supplier.address.city || supplier.city} 
                                    sx={{ mt: 1 }}
                                  />
                                )}
                              </CardContent>
                              <Divider />
                              <CardActions>
                                <Button 
                                  size="small" 
                                  startIcon={<VisibilityIcon />}
                                  onClick={() => handleSupplierView(supplier._id || supplier.Supplier_ID)}
                                >
                                  View
                                </Button>
                                <Button 
                                  size="small" 
                                  startIcon={<EditIcon />}
                                  onClick={() => handleSupplierEdit(supplier._id || supplier.Supplier_ID)}
                                >
                                  Edit
                                </Button>
                              </CardActions>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                ))
              )}
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
};

export default SuppliersByProduct;