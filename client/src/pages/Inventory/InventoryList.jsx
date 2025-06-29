import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import inventoryService from '../../services/inventoryService';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Snackbar,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ArrowDropUp as UpIcon,
  ArrowDropDown as DownIcon,
  VerticalAlignTop as StockUpIcon,
  VerticalAlignBottom as StockDownIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

// Stock Adjustment Dialog component
const StockAdjustmentDialog = ({ open, handleClose, item, onSubmit }) => {
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isIncrease, setIsIncrease] = useState(true);

  useEffect(() => {
    if (open) {
      setQuantity(0);
      setReason('');
      setNotes('');
      setError('');
      setIsIncrease(true);
    }
  }, [open]);

  const handleSubmit = () => {
    if (!quantity || quantity <= 0) {
      setError('Please enter a valid quantity');
      return;
    }
    
    if (!reason) {
      setError('Please provide a reason for adjustment');
      return;
    }
    
    // Calculate the actual change value (positive for increase, negative for decrease)
    const actualChange = isIncrease ? quantity : -quantity;
    
    onSubmit({
      quantity_change: actualChange,
      adjustment_reason: reason,
      notes: notes
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Adjust Stock Level: {item?.name}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 1 }}>
          <Typography variant="body1" sx={{ mr: 2 }}>
            Current Stock: {item?.stock_level || 0} 
            {item?.unit_of_measure ? ` ${item?.unit_of_measure}` : ''}
          </Typography>
          <Chip 
            label={isIncrease ? "Increase Stock" : "Decrease Stock"}
            color={isIncrease ? "success" : "error"}
            sx={{ ml: 2 }}
          />
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="adjustment-type-label">Adjustment Type</InputLabel>
              <Select
                labelId="adjustment-type-label"
                value={isIncrease}
                label="Adjustment Type"
                onChange={(e) => setIsIncrease(e.target.value)}
              >
                <MenuItem value={true}>Increase Stock</MenuItem>
                <MenuItem value={false}>Decrease Stock</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              autoFocus
              label="Quantity to Adjust"
              type="number"
              fullWidth
              value={quantity}
              onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {isIncrease ? <UpIcon /> : <DownIcon />}
                  </InputAdornment>
                ),
                endAdornment: item?.unit_of_measure ? (
                  <InputAdornment position="end">
                    {item.unit_of_measure}
                  </InputAdornment>
                ) : null
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Current Reorder Level"
              type="number"
              fullWidth
              value={item?.reorder_level || 0}
              disabled
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <RefreshIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="reason-label">Reason</InputLabel>
          <Select
            labelId="reason-label"
            value={reason}
            label="Reason"
            onChange={(e) => setReason(e.target.value)}
          >
            <MenuItem value="New Delivery">New Delivery</MenuItem>
            <MenuItem value="Returns">Returns</MenuItem>
            <MenuItem value="Damaged">Damaged/Defective</MenuItem>
            <MenuItem value="Manual Count">Manual Count Adjustment</MenuItem>
            <MenuItem value="Internal Use">Internal Use</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          label="Notes (Optional)"
          multiline
          rows={3}
          fullWidth
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        
        <Box sx={{ mt: 2, bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {isIncrease 
              ? `New stock level will be ${(item?.stock_level || 0) + quantity}` 
              : `New stock level will be ${Math.max(0, (item?.stock_level || 0) - quantity)}`}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color={isIncrease ? "success" : "error"}
        >
          {isIncrease ? "Add Stock" : "Remove Stock"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const InventoryList = ({ searchQuery = '', categoryData = [] }) => {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [categorySummary, setCategorySummary] = useState([]);

  // Fetch inventory data with optional parameters
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, fetch all categories from the dedicated categories table
      try {
        const categoriesResponse = await inventoryService.getAllCategories();
        console.log('Categories from database:', categoriesResponse);
        
        if (categoriesResponse?.data?.data && Array.isArray(categoriesResponse.data.data)) {
          const dbCategories = categoriesResponse.data.data;
          // Use the name field from the categories table
          const uniqueCategories = Array.from(
            new Set(
              dbCategories
                .map(cat => cat.name || '')
                .filter(Boolean)
            )
          ).sort();
          
          setCategories(uniqueCategories);
          console.log('Categories set from database:', uniqueCategories);
        }
      } catch (catErr) {
        console.error('Error fetching categories from database:', catErr);
      }
      
      // Process categories from props if available
      if (categoryData && Array.isArray(categoryData) && categoryData.length > 0) {
        // Extract unique categories from category data
        const uniqueCategories = Array.from(
          new Set(
            categoryData
              .map(cat => cat?.Category || cat?.category || '')
              .filter(Boolean)
          )
        ).sort();
        
        // Merge with any categories we already have
        setCategories(prevCats => {
          const mergedCategories = [...new Set([...prevCats, ...uniqueCategories])].sort();
          return mergedCategories;
        });
        
        // Create category summary from data
        const summary = categoryData.map(cat => ({
          category: cat.Category || cat.category || 'Uncategorized',
          itemCount: Number(cat.item_count || 0),
          totalItems: Number(cat.total_items || 0),
          totalValue: Number(cat.total_value || 0)
        }));
        
        setCategorySummary(summary);
      } else {
        // Fallback: Get categories from API if not provided in props
        try {
          const categoriesResponse = await inventoryService.getInventoryCategories();
          const categoriesData = categoriesResponse?.data?.data || [];
          
          if (Array.isArray(categoriesData) && categoriesData.length > 0) {
            // Extract unique categories and merge with any we already have
            const uniqueCategories = Array.from(
              new Set(
                categoriesData
                  .map(cat => cat?.Category || cat?.category || '')
                  .filter(Boolean)
              )
            ).sort();
            
            setCategories(prevCats => {
              const mergedCategories = [...new Set([...prevCats, ...uniqueCategories])].sort();
              return mergedCategories;
            });
            
            setCategorySummary(categoriesData.map(cat => ({
              category: cat.Category || cat.category || 'Uncategorized',
              itemCount: Number(cat.item_count || 0),
              totalItems: Number(cat.total_items || 0),
              totalValue: Number(cat.total_value || 0)
            })));
          }
        } catch (catErr) {
          console.error('Error fetching categories:', catErr);
        }
      }
      
      // Get inventory items with current filters
      const response = await inventoryService.getInventoryItems({
        search: searchTerm,
        category: categoryFilter,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        page: page + 1,
        limit: rowsPerPage
      });
      
      // Get the raw inventory data
      console.log('Response received:', response);
      
      // Safely extract data, ensuring it's an array
      let inventoryData = [];
      if (response?.data?.data && Array.isArray(response.data.data)) {
        inventoryData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        inventoryData = response.data;
      }
      
      console.log('Processing inventory data:', inventoryData);
      
      // The data is already formatted by the service, just use it directly
      setInventory(inventoryData);
      setFilteredInventory(inventoryData);
    } catch (err) {
      console.error('Error fetching inventory items:', err);
      setError(err.message || 'Failed to fetch inventory items');
      setInventory([]);
      setFilteredInventory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [page, rowsPerPage, sortConfig, categoryFilter]);

  useEffect(() => {
    // Update search term when searchQuery prop changes
    if (searchQuery !== searchTerm) {
      setSearchTerm(searchQuery);
    }
  }, [searchQuery]);

  // Update categories when categoryData prop changes
  useEffect(() => {
    if (categoryData && Array.isArray(categoryData) && categoryData.length > 0) {
      // Extract unique categories from category data
      const uniqueCategories = Array.from(
        new Set(
          categoryData
            .map(cat => cat?.Category || cat?.category || '')
            .filter(Boolean)
        )
      ).sort();
      
      setCategories(uniqueCategories);
      
      // Create category summary from data
      const summary = categoryData.map(cat => ({
        category: cat.Category || cat.category || 'Uncategorized',
        itemCount: Number(cat.item_count || 0),
        totalItems: Number(cat.total_items || 0),
        totalValue: Number(cat.total_value || 0)
      }));
      
      setCategorySummary(summary);
    }
  }, [categoryData]);

  useEffect(() => {
    // Apply local filtering for search term changes without refetching
    if (searchTerm && Array.isArray(inventory)) {
      const filtered = inventory.filter(
        (item) =>
          (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.Name && item.Name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.SKU && item.SKU && item.SKU.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.Category && item.Category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredInventory(filtered);
    } else {
      setFilteredInventory(inventory);
    }
    setPage(0);
  }, [searchTerm, inventory]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const openDeleteDialog = (item) => {
    const normalizedItem = {
      id: item.id || item.product_id || item.Product_ID,
      name: item.name || item.Name || 'Unknown Item'
    };
    setItemToDelete(normalizedItem);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      await inventoryService.deleteInventoryItem(itemToDelete.id);
      setSnackbar({
        open: true,
        message: `Item "${itemToDelete.name}" deleted successfully`,
        severity: 'success'
      });
      fetchInventory();
      closeDeleteDialog();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to delete inventory item',
        severity: 'error'
      });
      closeDeleteDialog();
    }
  };

  const openAdjustDialog = (item) => {
    // Normalize the item data to ensure consistent structure
    const normalizedItem = {
      id: item.id || item.product_id || item.Product_ID,
      name: item.name || item.Name || 'Unknown Item',
      stock_level: item.stock_level || item.Stock_Level || 0,
      reorder_level: item.reorder_level || item.Reorder_Level || 0,
      unit_of_measure: item.unit_of_measure || item.Unit_of_measure,
      price: item.price || item.Price
    };
    setSelectedItem(normalizedItem);
    setAdjustDialogOpen(true);
  };

  const closeAdjustDialog = () => {
    setAdjustDialogOpen(false);
    setSelectedItem(null);
  };

  const handleAdjustStock = async (adjustmentData) => {
    if (!selectedItem) return;
    
    try {
      await inventoryService.adjustInventoryQuantity(selectedItem.id, adjustmentData);
      setSnackbar({
        open: true,
        message: `Stock for "${selectedItem.name}" adjusted successfully`,
        severity: 'success'
      });
      fetchInventory();
      closeAdjustDialog();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      setSnackbar({
        open: true,
        message: `Failed to adjust stock: ${error.message}`,
        severity: 'error'
      });
    } finally {
      closeAdjustDialog();
    }
  };

  const handleFixInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.fixInventoryData();
      console.log('Fix inventory response:', response);
      
      setSnackbar({
        open: true,
        message: 'Inventory data fixed successfully!',
        severity: 'success'
      });
      
      // Reload inventory data to see the changes
      await fetchInventory();
    } catch (error) {
      console.error('Error fixing inventory data:', error);
      setSnackbar({
        open: true,
        message: `Failed to fix inventory data: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSortRequest = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const getStockLevelChip = (quantity, threshold) => {
    if (quantity <= 0) {
      return <Chip label="Out of Stock" color="error" size="small" />;
    } else if (quantity <= threshold) {
      return <Chip label="Low Stock" color="warning" size="small" />;
    } else {
      return <Chip label="In Stock" color="success" size="small" />;
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Get category summary data for currently selected category
  const getSelectedCategorySummary = () => {
    if (!categoryFilter || !categorySummary.length) return null;
    return categorySummary.find(cat => 
      cat.category.toLowerCase() === categoryFilter.toLowerCase()
    );
  };

  const selectedCategory = getSelectedCategorySummary();

  // Modify table rendering to show additional database fields
  const renderTableContent = () => (
    <Table stickyHeader aria-label="inventory table">
      <TableHead>
        <TableRow>
          <TableCell 
            onClick={() => handleSortRequest('sku')}
            sx={{ cursor: 'pointer' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              SKU
              {sortConfig.key === 'sku' && (
                sortConfig.direction === 'asc' ? <UpIcon /> : <DownIcon />
              )}
            </Box>
          </TableCell>
          <TableCell 
            onClick={() => handleSortRequest('name')}
            sx={{ cursor: 'pointer' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              Name
              {sortConfig.key === 'name' && (
                sortConfig.direction === 'asc' ? <UpIcon /> : <DownIcon />
              )}
            </Box>
          </TableCell>
          <TableCell 
            onClick={() => handleSortRequest('category')}
            sx={{ cursor: 'pointer' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              Category
              {sortConfig.key === 'category' && (
                sortConfig.direction === 'asc' ? <UpIcon /> : <DownIcon />
              )}
            </Box>
          </TableCell>
          <TableCell 
            align="right"
            onClick={() => handleSortRequest('stock_level')}
            sx={{ cursor: 'pointer' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              Quantity
              {sortConfig.key === 'stock_level' && (
                sortConfig.direction === 'asc' ? <UpIcon /> : <DownIcon />
              )}
            </Box>
          </TableCell>
          <TableCell align="right">Reorder Level</TableCell>
          <TableCell 
            align="right"
            onClick={() => handleSortRequest('price')}
            sx={{ cursor: 'pointer' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              Price
              {sortConfig.key === 'price' && (
                sortConfig.direction === 'asc' ? <UpIcon /> : <DownIcon />
              )}
            </Box>
          </TableCell>
          <TableCell align="right">Status</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {filteredInventory.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} align="center">
              No inventory items found
            </TableCell>
          </TableRow>
        ) : (
          filteredInventory.map((item) => (
            <TableRow key={item.id || item.product_id || item.Product_ID || `item-${Math.random()}`} hover>
              <TableCell>{item.sku || item.SKU}</TableCell>
              <TableCell>{item.name || item.Name}</TableCell>
              <TableCell>{item.category || item.Category}</TableCell>
              <TableCell align="right">
                {item.stock_level || item.Stock_Level || 0}
                {(item.unit_of_measure || item.Unit_of_measure) && ` ${item.unit_of_measure || item.Unit_of_measure}`}
              </TableCell>
              <TableCell align="right">{item.reorder_level || item.Reorder_Level || 0}</TableCell>
              <TableCell align="right">
                ${isNaN(Number(item.price || item.Price)) ? '0.00' : Number(item.price || item.Price).toFixed(2)}
              </TableCell>
              <TableCell align="right">
                {getStockLevelChip(item.stock_level || item.Stock_Level || 0, item.reorder_level || item.Reorder_Level || 0)}
              </TableCell>
              <TableCell align="right">
                <Tooltip title="View Details">
                  <IconButton 
                    size="small" 
                    onClick={() => navigate(`/inventory/${item.id || item.product_id || item.Product_ID}`)}
                  >
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit Item">
                  <IconButton 
                    size="small"
                    component={Link}
                    to={`/inventory/edit/${item.id || item.product_id || item.Product_ID}`}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Adjust Stock">
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => openAdjustDialog(item)}
                  >
                    {(item.stock_level || item.Stock_Level || 0) <= (item.reorder_level || item.Reorder_Level || 0) ? <StockUpIcon /> : <StockDownIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Item">
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => openDeleteDialog(item)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Search inventory..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ width: '260px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 250 }}>
            <InputLabel id="category-filter-label">Category</InputLabel>
            <Select
              labelId="category-filter-label"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              label="Category"
            >
              <MenuItem value="">
                <em>All Categories</em>
              </MenuItem>
              
              {categories.length > 0 && (
                categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))
              )}
              
              {categories.length === 0 && (
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">
                    No categories found
                  </Typography>
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </Box>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchInventory}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleFixInventory}
            sx={{ mr: 1 }}
          >
            Fix Inventory Data
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            to="/inventory/add"
          >
            Add Item
          </Button>
        </Box>
      </Box>

      {/* Category Summary Card - Show when a category is selected */}
      {selectedCategory && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Category: {selectedCategory.category}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="body2" color="text.secondary">Items</Typography>
                <Typography variant="h5">{selectedCategory.itemCount.toLocaleString()}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="body2" color="text.secondary">Total Stock</Typography>
                <Typography variant="h5">{selectedCategory.totalItems.toLocaleString()}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="body2" color="text.secondary">Total Value</Typography>
                <Typography variant="h5">
                  ${selectedCategory.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : renderTableContent()}
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredInventory.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <StockAdjustmentDialog
        open={adjustDialogOpen}
        handleClose={closeAdjustDialog}
        item={selectedItem}
        onSubmit={handleAdjustStock}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InventoryList;