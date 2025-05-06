// src/pages/Suppliers/SupplierList.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import supplierService from '../../services/supplierService';

const SupplierList = ({ refresh, onRefresh }) => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSuppliers();
  }, [refresh]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await supplierService.getSuppliers();
      
      console.log('Raw API response:', response); // Log the entire response
      
      // Better handling of various response formats
      let suppliersData = [];
      
      // Handling direct array response
      if (Array.isArray(response)) {
        suppliersData = response;
      } 
      // Handling { data: [...] } format
      else if (response && response.data && Array.isArray(response.data)) {
        suppliersData = response.data;
      } 
      // Handling { success: true, data: [...] } format
      else if (response && response.success && Array.isArray(response.data)) {
        suppliersData = response.data;
      }
      // Handling { success: true, count: n, data: [...] } format (your controller returns this)
      else if (response && response.success && response.count && Array.isArray(response.data)) {
        suppliersData = response.data;
      }
      
      console.log('Processed suppliers data:', suppliersData);
      
      setSuppliers(suppliersData || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError('Failed to load suppliers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSupplier = (id) => {
    navigate(`/suppliers/${id}`);
  };

  const handleEditSupplier = (id) => {
    navigate(`/suppliers/edit/${id}`);
  };

  const handleDeleteSupplier = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await supplierService.deleteSupplier(id);
        fetchSuppliers(); // Refresh the list
      } catch (err) {
        console.error('Error deleting supplier:', err);
        setError('Failed to delete supplier. Please try again later.');
      }
    }
  };

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(supplier => {
    const searchFields = [
      supplier.name || supplier.Name || '',
      supplier.contactPerson || supplier.Contact_Person || '',
      supplier.email || supplier.Email || '',
      supplier.phone || supplier.Phone_Number || ''
    ].map(field => field.toString().toLowerCase());
    
    return searchFields.some(field => field.includes(searchTerm.toLowerCase()));
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        margin="normal"
        placeholder="Search suppliers..."
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell>Name</TableCell>
              <TableCell>Contact Person</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Address</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((supplier) => (
                <TableRow key={supplier._id || supplier.Supplier_ID} hover>
                  <TableCell>{supplier.name || supplier.Name}</TableCell>
                  <TableCell>{supplier.contactPerson || supplier.Contact_Person || 'N/A'}</TableCell>
                  <TableCell>{supplier.email || supplier.Email}</TableCell>
                  <TableCell>{supplier.phone || supplier.Phone_Number}</TableCell>
                  <TableCell>
                    {(() => {
                      // First try formattedAddress if it exists
                      if (supplier.formattedAddress) {
                        return supplier.formattedAddress;
                      }
                      
                      // If we have address as an object with street, city, etc.
                      if (supplier.address && typeof supplier.address === 'object') {
                        const parts = [
                          supplier.address.street,
                          supplier.address.city,
                          supplier.address.state,
                          supplier.address.zipCode,
                          supplier.address.country
                        ].filter(Boolean);
                        
                        return parts.length > 0 ? parts.join(', ') : 'No address provided';
                      }
                      
                      // Try individual fields directly on the supplier
                      const directParts = [
                        supplier.street,
                        supplier.city,
                        supplier.state,
                        supplier.zipCode,
                        supplier.country
                      ].filter(Boolean);
                      
                      if (directParts.length > 0) {
                        return directParts.join(', ');
                      }
                      
                      // As a last resort, check for Address field
                      return supplier.Address || 'No address provided';
                    })()}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewSupplier(supplier._id || supplier.Supplier_ID)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditSupplier(supplier._id || supplier.Supplier_ID)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteSupplier(supplier._id || supplier.Supplier_ID)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" py={3}>
                    {searchTerm ? 'No suppliers match your search criteria.' : 'No suppliers found in the system. Add your first supplier!'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SupplierList;