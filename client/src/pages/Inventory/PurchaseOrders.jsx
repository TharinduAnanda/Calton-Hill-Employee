import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import purchaseOrderService from '../../services/purchaseOrderService';
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
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Snackbar,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Breadcrumbs,
  Link as MuiLink,
  styled,
  Card,
  CardContent,
  Divider,
  Badge,
  Avatar,
  Tab,
  Tabs,
  Checkbox,
  FormControlLabel,
  Switch
} from '@mui/material';

import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  Inventory as InventoryIcon,
  Description as DescriptionIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  AssignmentTurnedIn as ConfirmedIcon,
  Cancel as CanceledIcon,
  Drafts as DraftIcon,
  ArrowUpward,
  ArrowDownward,
  AccountCircle as AccountIcon,
  Close as CloseIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Styled components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
  overflow: 'hidden',
  border: '1px solid #eef2f6',
  marginTop: theme.spacing(2)
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  '& .MuiTableCell-head': {
    color: theme.palette.common.white,
    fontWeight: 600,
    padding: theme.spacing(1.5),
    fontSize: '0.875rem',
    borderBottom: 'none'
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: 'rgba(25, 118, 210, 0.08)',
  },
  cursor: 'pointer',
  transition: 'background-color 0.2s',
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  let color, icon;
  switch (status) {
    case 'draft':
      color = theme.palette.grey[600];
      icon = <DraftIcon fontSize="small" />;
      break;
    case 'pending':
      color = theme.palette.warning.main;
      icon = <ShoppingCartIcon fontSize="small" />;
      break;
    case 'sent':
      color = theme.palette.info.main;
      icon = <LocalShippingIcon fontSize="small" />;
      break;
    case 'partially_fulfilled':
      color = theme.palette.warning.dark;
      icon = <LocalShippingIcon fontSize="small" />;
      break;
    case 'confirmed':
      color = theme.palette.success.main;
      icon = <ConfirmedIcon fontSize="small" />;
      break;
    case 'canceled':
      color = theme.palette.error.main;
      icon = <CanceledIcon fontSize="small" />;
      break;
    default:
      color = theme.palette.grey[500];
      icon = <DescriptionIcon fontSize="small" />;
  }
  return {
    backgroundColor: `${color}15`,
    color: color,
    fontWeight: 600,
    borderRadius: '16px',
    border: `1px solid ${color}40`,
    '& .MuiChip-label': {
      padding: '0 8px 0 2px',
    },
    '& .MuiChip-icon': {
      color: color
    }
  };
});

const ActionButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
  transition: 'transform 0.2s, background 0.2s',
  margin: '0 2px',
  padding: '6px',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: theme.palette.primary.lighter || 'rgba(25, 118, 210, 0.08)',
  }
}));

const PageHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2)
  }
}));

const FiltersContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  borderRadius: '12px',
}));

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiLink-root': {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.text.secondary,
    textDecoration: 'none',
    '&:hover': {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
    }
  }
}));

const SummaryCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  height: '100%',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
  }
}));

const PurchaseOrders = () => {
  const navigate = useNavigate();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [orderToEmail, setOrderToEmail] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    dateRange: '',
    supplier: '',
    amountRange: '',
  });
  const [tabValue, setTabValue] = useState(0);
  const [orderDetailsDialogOpen, setOrderDetailsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [sortConfig, setSortConfig] = useState({ field: 'createdAt', direction: 'desc' });
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState('');
  const [confirmNotes, setConfirmNotes] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [orderToConfirm, setOrderToConfirm] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [receivedItems, setReceivedItems] = useState([]);
  const [partialFulfillment, setPartialFulfillment] = useState(false);
  const [fulfillmentDialogOpen, setFulfillmentDialogOpen] = useState(false);
  const [orderToFulfill, setOrderToFulfill] = useState(null);
  // Add a state for allowing quantities to exceed ordered amount
  const [allowExcessQuantity, setAllowExcessQuantity] = useState(false);
  // Add a state for tracking received quantities in the confirm dialog
  const [confirmReceivedItems, setConfirmReceivedItems] = useState([]);
  const [showPartialFulfillment, setShowPartialFulfillment] = useState(false);
  // Add new state for tracking received quantities in the main order details dialog
  const [detailsReceivedItems, setDetailsReceivedItems] = useState([]);

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await purchaseOrderService.getPurchaseOrders();
      
      // Debug log to see the actual data structure
      console.log('Fetched purchase orders:', data);
      
      if (data && data.length > 0) {
        console.log('First purchase order:', data[0]);
      }
      
      setPurchaseOrders(data);
    } catch (err) {
      setError('Failed to fetch purchase orders. Please try again later.');
      console.error('Error fetching purchase orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(0);
  };

  const handleOpenDeleteDialog = (order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setOrderToDelete(null);
  };

  const handleDeleteOrder = async () => {
    try {
      setLoading(true);
      await purchaseOrderService.deletePurchaseOrder(orderToDelete.id);
      
      // Update local state to remove the deleted order
      setPurchaseOrders(prev => 
        prev.filter(order => order.id !== orderToDelete.id)
      );
      
      setSnackbar({
        open: true,
        message: 'Purchase order deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to delete purchase order',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      handleCloseDeleteDialog();
    }
  };

  const handleOpenEmailDialog = (order) => {
    setOrderToEmail(order);
    
    // Extract PO Number, checking both camelCase and snake_case versions
    const poNumber = order.po_number || order.poNumber || 'N/A';
    console.log('Opening email dialog for PO:', poNumber);
    
    // Try to get supplier email from various possible locations in the data structure
    const supplierEmail = 
      order.supplier?.email || 
      order.supplier?.Email || 
      order.supplierEmail || 
      (order.supplier && typeof order.supplier === 'object' ? 
        Object.values(order.supplier).find(val => 
          typeof val === 'string' && 
          val.includes('@') && 
          val.includes('.')
        ) : '') || 
      '';
    
    setRecipientEmail(supplierEmail);
    
    // Set email subject and message with the correct PO number
    setEmailSubject(`Purchase Order #${poNumber}`);
    
    const supplierName = order.supplierName || 
                        (order.supplier && (order.supplier.name || order.supplier.Name)) || 
                        'Supplier';
    
    const createdBy = order.requested_by || 
                      order.requestedBy || 
                      order.created_by_name || 
                      order.createdByName || 
                      'The Team';
    
    setEmailMessage(`Dear ${supplierName},

Please find attached purchase order #${poNumber}.

Let us know if you have any questions.

Thank you,
${createdBy}`);
    
    // Log for debugging
    console.log('Opening email dialog with supplier email:', supplierEmail);
    
    setEmailDialogOpen(true);
  };
  
  // Function to handle opening the confirm dialog and initialize received quantities
  const handleOpenConfirmDialog = (order) => {
    setOrderToConfirm(order);
    setPaymentTerms('Net 30 days');
    setConfirmNotes('');

    // Use quantities already entered if partial fulfillment was enabled in order details
    if (showPartialFulfillment && detailsReceivedItems.length > 0) {
      setConfirmReceivedItems(detailsReceivedItems);
    } else {
      // Standard behavior if partial fulfillment wasn't used in details view
      if (order?.items) {
        const initialReceivedItems = order.items.map(item => ({
          itemId: item.id || '',
          productId: item.productId || item.product_id,
          productName: item.productName || item.product_name,
          orderedQuantity: parseInt(item.quantity, 10) || 0,
          receivedQuantity: showPartialFulfillment ? 0 : (parseInt(item.quantity, 10) || 0)
        }));
        setConfirmReceivedItems(initialReceivedItems);
      }
    }

    setConfirmDialogOpen(true);
  };
  
  // Function to handle received quantity changes
  const handleConfirmReceivedQuantityChange = (itemId, value) => {
    const parsedValue = parseInt(value, 10);
    const receivedQuantity = isNaN(parsedValue) ? 0 : parsedValue;
    
    setConfirmReceivedItems(prevItems => prevItems.map(item => 
      item.itemId === itemId ? { ...item, receivedQuantity } : item
    ));
  };

  const handleConfirmOrder = async () => {
    if (!orderToConfirm) return;
    
    try {
      setLoading(true);
      
      // Extract PO Number for display in messages
      const poNumber = orderToConfirm.po_number || orderToConfirm.poNumber || 'N/A';
      console.log('Confirming order:', poNumber);
      
      // Create confirmation data
      const confirmationData = {
        status: 'confirmed',
        paymentTerms,
        confirmNotes,
        receivedDate: new Date().toISOString(), // Record when items were received
        isPartiallyFulfilled: showPartialFulfillment,
        fulfillmentStatus: showPartialFulfillment ? 'partially_fulfilled' : 'fully_fulfilled'
      };
      
      // Use the full update endpoint with all confirmation related fields
      await purchaseOrderService.updatePurchaseOrder(orderToConfirm.id, confirmationData);
      
      // Update inventory quantities for all items in the order
      try {
        // Check if items array exists and has elements
        if (orderToConfirm.items && orderToConfirm.items.length > 0) {
          // For each item in the purchase order
          for (const item of confirmReceivedItems) {
            const productId = item.productId;
            const actualQuantity = parseInt(item.receivedQuantity, 10) || 0;
            const orderedQuantity = parseInt(item.orderedQuantity, 10) || 0;
            
            if (productId && actualQuantity > 0) {
              console.log(`Updating inventory for product ${productId} with quantity ${actualQuantity} (ordered: ${orderedQuantity})`);
              
              // Call inventory update API with actual quantity, not just ordered quantity
              if (showPartialFulfillment) {
                // Use partial fulfillment endpoint if quantities differ
                await purchaseOrderService.updateInventoryWithReceivedQuantity(productId, actualQuantity, orderedQuantity);
              } else {
                // Use standard endpoint if using full quantities
                await purchaseOrderService.updateInventoryOnReceive(productId, actualQuantity);
              }
            }
          }
          
          console.log('Inventory updated successfully for all items');
        }
      } catch (inventoryError) {
        console.error('Error updating inventory:', inventoryError);
        // Show warning but don't fail the entire operation
        setSnackbar({
          open: true,
          message: 'Purchase order confirmed, but there were issues updating inventory. Please check inventory levels.',
          severity: 'warning'
        });
        return; // Return early as we've already shown a message
      }
      
      // Update local state to reflect the change
      setPurchaseOrders(prev => 
        prev.map(po => 
          po.id === orderToConfirm.id ? {
            ...po, 
            status: 'confirmed',
            paymentTerms,
            confirmNotes,
            confirmedDate: new Date().toISOString(),
            received_date: new Date().toISOString(),
            isPartiallyFulfilled: showPartialFulfillment,
            fulfillmentStatus: showPartialFulfillment ? 'partially_fulfilled' : 'fully_fulfilled'
          } : po
        )
      );
      
      setSnackbar({
        open: true,
        message: `Purchase order #${poNumber} marked as confirmed and inventory updated`,
        severity: 'success'
      });
      
      setConfirmDialogOpen(false);
      handleCloseOrderDetails();
    } catch (err) {
      console.error('Error confirming order:', err);
      
      // Extract the specific error message if available
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        'Failed to confirm purchase order. Please try again.';
        
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle canceling a purchase order
  const handleOpenCancelDialog = (order) => {
    setOrderToCancel(order);
    setCancellationReason('');
    setCancelDialogOpen(true);
  };
  
  const handleCancelOrder = async () => {
    if (!orderToCancel || !cancellationReason.trim()) return;
    
    try {
      setLoading(true);
      
      // Extract PO Number for display in messages
      const poNumber = orderToCancel.po_number || orderToCancel.poNumber || 'N/A';
      
      // Use the full update endpoint to include the cancellation reason
      await purchaseOrderService.updatePurchaseOrder(orderToCancel.id, {
        status: 'canceled',
        cancellationReason
      });
      
      // Update local state to reflect the change
      setPurchaseOrders(prev => 
        prev.map(po => 
          po.id === orderToCancel.id ? {
            ...po, 
            status: 'canceled',
            cancellationReason,
            canceled_at: new Date().toISOString()
          } : po
        )
      );
      
      setSnackbar({
        open: true,
        message: `Purchase order #${poNumber} has been canceled`,
        severity: 'info'
      });
      
      setCancelDialogOpen(false);
      handleCloseOrderDetails();
    } catch (err) {
      console.error('Error canceling order:', err);
      
      // Extract the specific error message if available
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        'Failed to cancel purchase order. Please try again.';
        
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle submitting a draft order (changing status from draft to pending)
  const handleSubmitOrder = async (order) => {
    try {
      setLoading(true);
      
      // Extract PO Number for display in messages
      const poNumber = order.po_number || order.poNumber || 'N/A';
      
      // Use the status-specific endpoint instead of the full update
      await purchaseOrderService.updatePurchaseOrderStatus(order.id, 'pending');
      
      // Update local state to reflect the change
      setPurchaseOrders(prev => 
        prev.map(po => 
          po.id === order.id ? {...po, status: 'pending'} : po
        )
      );
      
      setSnackbar({
        open: true,
        message: `Purchase order #${poNumber} has been submitted and is now pending`,
        severity: 'success'
      });
      
      handleCloseOrderDetails();
    } catch (err) {
      console.error('Error submitting order:', err);
      setSnackbar({
        open: true,
        message: 'Failed to submit purchase order. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseEmailDialog = () => {
    setEmailDialogOpen(false);
    setOrderToEmail(null);
    setRecipientEmail('');
    setEmailSubject('');
    setEmailMessage('');
  };

  const handleSendEmail = async () => {
    try {
      setEmailLoading(true);
      
      // Extract PO Number, checking both camelCase and snake_case versions
      const poNumber = orderToEmail?.po_number || orderToEmail?.poNumber || 'N/A';
      
      await purchaseOrderService.sendPurchaseOrderEmail(orderToEmail.id, {
        recipientEmail,
        subject: emailSubject || `Purchase Order #${poNumber}`,
        message: emailMessage || `Please find attached purchase order #${poNumber}.`
      });
      
      // Update order status to "sent" in local state
      setPurchaseOrders(prev => 
        prev.map(order => 
          order.id === orderToEmail.id 
            ? { ...order, status: 'sent', sentDate: new Date().toISOString() }
            : order
        )
      );
      
      setSnackbar({
        open: true,
        message: 'Purchase order sent successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to send purchase order',
        severity: 'error'
      });
    } finally {
      setEmailLoading(false);
      handleCloseEmailDialog();
    }
  };

  const handleActionMenuOpen = (event, order) => {
    setActionMenuAnchor(event.currentTarget);
    setCurrentOrder(order);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setCurrentOrder(null);
  };

  const handleDownloadPdf = async (order) => {
    try {
      await purchaseOrderService.generatePDF(order.id);
      
      setSnackbar({
        open: true,
        message: 'PDF download initiated successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to download PDF',
        severity: 'error'
      });
    }
  };

  const handleRowClick = (order) => {
    setSelectedOrder(order);
    
    // Initialize received items with order's items
    if (order?.items) {
      const initialReceivedItems = order.items.map(item => ({
        itemId: item.id || '',
        productId: item.productId || item.product_id,
        productName: item.productName || item.product_name || item.name || 'Product',
        orderedQuantity: parseInt(item.quantity, 10) || 0,
        receivedQuantity: parseInt(item.quantity, 10) || 0
      }));
      setDetailsReceivedItems(initialReceivedItems);
    } else {
      setDetailsReceivedItems([]);
    }
    
    setOrderDetailsDialogOpen(true);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Filter orders based on tab
    if (newValue === 0) { // All orders
      setFilters(prev => ({...prev, status: ''}));
    } else if (newValue === 1) { // Draft orders
      setFilters(prev => ({...prev, status: 'draft'}));
    } else if (newValue === 2) { // Pending orders
      setFilters(prev => ({...prev, status: 'pending'}));
    } else if (newValue === 3) { // Sent orders
      setFilters(prev => ({...prev, status: 'sent'}));
    } else if (newValue === 4) { // Confirmed orders
      setFilters(prev => ({...prev, status: 'confirmed'}));
    } else if (newValue === 5) { // Canceled orders
      setFilters(prev => ({...prev, status: 'canceled'}));
    }
    
    setPage(0);
  };

  const handleCloseOrderDetails = () => {
    setOrderDetailsDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleBackToInventory = () => {
    navigate('/owner/inventory');
  };

  const handleRequestSort = (field) => {
    const direction = sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ field, direction });
  };

  const handleBulkAction = (action) => {
    if (action === 'delete') {
      setBulkDeleteDialogOpen(true);
    } else if (action === 'download') {
      // Implement bulk download logic
      setSnackbar({
        open: true,
        message: `Downloading ${selectedOrders.length} purchase orders`,
        severity: 'info'
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      setLoading(true);
      
      // Delete each selected order
      for (const orderId of selectedOrders) {
        await purchaseOrderService.deletePurchaseOrder(orderId);
      }
      
      // Update local state to remove the deleted orders
      setPurchaseOrders(prev => 
        prev.filter(order => !selectedOrders.includes(order.id || order._id))
      );
      
      setSnackbar({
        open: true,
        message: `Successfully deleted ${selectedOrders.length} purchase orders`,
        severity: 'success'
      });
      
      // Clear selected orders
      setSelectedOrders([]);
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to delete purchase orders',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setBulkDeleteDialogOpen(false);
    }
  };

  const filteredOrders = purchaseOrders
    .filter(order => {
      // Normalize the search fields to account for different property names
      const poNumber = order.po_number || order.poNumber || '';
      const supplierName = order.supplierName || 
                         (order.supplier && (order.supplier.name || order.supplier.Name)) || '';
      const createdBy = order.created_by_name || order.createdByName || '';
      const description = order.description || order.notes || '';
      
      const searchFields = `${poNumber} ${supplierName} ${createdBy} ${description}`.toLowerCase();
      const matchesSearch = searchTerm ? searchFields.includes(searchTerm.toLowerCase()) : true;
      
      // Match status, handling both camelCase and snake_case
      const orderStatus = order.status || 'draft';
      const matchesStatus = filters.status ? orderStatus === filters.status : true;
      
      // Match supplier filter
      const matchesSupplier = filters.supplier ? 
        supplierName.toLowerCase() === filters.supplier.toLowerCase() : 
        true;
      
      // Match date range filter
      let matchesDateRange = true;
      const orderDate = new Date(order.created_at || order.createdAt || order.order_date || Date.now());
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (filters.dateRange) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - today.getDay());
        
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const quarterStart = new Date(today);
        quarterStart.setMonth(Math.floor(today.getMonth() / 3) * 3, 1);
        
        const yearStart = new Date(today.getFullYear(), 0, 1);
        
        switch (filters.dateRange) {
          case 'today':
            matchesDateRange = orderDate >= today;
            break;
          case 'yesterday':
            matchesDateRange = orderDate >= yesterday && orderDate < today;
            break;
          case 'week':
            matchesDateRange = orderDate >= weekStart;
            break;
          case 'month':
            matchesDateRange = orderDate >= monthStart;
            break;
          case 'quarter':
            matchesDateRange = orderDate >= quarterStart;
            break;
          case 'year':
            matchesDateRange = orderDate >= yearStart;
            break;
          default:
            matchesDateRange = true;
        }
      }
      
      // Match amount range filter
      let matchesAmountRange = true;
      const orderAmount = parseFloat(order.total_amount || order.totalAmount || 0);
      
      if (filters.amountRange) {
        switch (filters.amountRange) {
          case 'small':
            matchesAmountRange = orderAmount < 1000;
            break;
          case 'medium':
            matchesAmountRange = orderAmount >= 1000 && orderAmount < 5000;
            break;
          case 'large':
            matchesAmountRange = orderAmount >= 5000 && orderAmount < 10000;
            break;
          case 'xlarge':
            matchesAmountRange = orderAmount >= 10000;
            break;
          default:
            matchesAmountRange = true;
        }
      }
      
      return matchesSearch && matchesStatus && matchesSupplier && matchesDateRange && matchesAmountRange;
    })
    .sort((a, b) => {
      // Extract the values to compare based on the sort field
      let aValue, bValue;
      
      switch (sortConfig.field) {
        case 'poNumber':
          aValue = a.po_number || a.poNumber || '';
          bValue = b.po_number || b.poNumber || '';
          break;
        case 'supplier':
          aValue = a.supplierName || 
                  (a.supplier && (a.supplier.name || a.supplier.Name)) || '';
          bValue = b.supplierName || 
                  (b.supplier && (b.supplier.name || b.supplier.Name)) || '';
          break;
        case 'totalAmount':
          aValue = parseFloat(a.total_amount || a.totalAmount || 0);
          bValue = parseFloat(b.total_amount || b.totalAmount || 0);
          break;
        case 'status':
          aValue = a.status || 'draft';
          bValue = b.status || 'draft';
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.created_at || a.createdAt || 0);
          bValue = new Date(b.created_at || b.createdAt || 0);
      }
      
      // Compare the values based on the sort direction
      if (sortConfig.direction === 'asc') {
        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
        return 0;
      } else {
        if (aValue > bValue) return -1;
        if (aValue < bValue) return 1;
        return 0;
      }
    });

  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'pending':
        return 'Pending';
      case 'sent':
        return 'Sent';
      case 'partially_fulfilled':
        return 'Partially Fulfilled';
      case 'confirmed':
        return 'Confirmed';
      case 'canceled':
        return 'Canceled';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return "#9e9e9e"; // Grey
      case 'pending':
        return "#ff9800"; // Orange/warning
      case 'sent':
        return "#2196f3"; // Blue/info
      case 'partially_fulfilled':
        return "#ed6c02"; // Dark orange
      case 'confirmed':
        return "#4caf50"; // Green/success
      case 'canceled':
        return "#f44336"; // Red/error
      default:
        return "#9e9e9e"; // Grey for unknown status
    }
  };

  // Function to handle opening the fulfillment dialog
  const handleOpenFulfillmentDialog = (order) => {
    setOrderToFulfill(order);
    
    // Initialize received items with the order's items
    if (order?.items) {
      const initialReceivedItems = order.items.map(item => ({
        itemId: item.id,
        productId: item.productId || item.product_id,
        productName: item.productName || item.product_name,
        orderedQuantity: parseInt(item.quantity, 10) || 0,
        receivedQuantity: 0 // Default to 0 for new receipts
      }));
      setReceivedItems(initialReceivedItems);
    }
    
    setFulfillmentDialogOpen(true);
  };

  // Function to handle closing the fulfillment dialog
  const handleCloseFulfillmentDialog = () => {
    setFulfillmentDialogOpen(false);
    setOrderToFulfill(null);
    setReceivedItems([]);
    setPartialFulfillment(false);
  };

  // Function to handle changes to received quantities
  const handleReceivedQuantityChange = (itemId, value) => {
    const parsedValue = parseInt(value, 10);
    // Default to 0 if NaN
    let receivedQuantity = isNaN(parsedValue) ? 0 : parsedValue;
    
    // Get the item to validate against ordered quantity
    const item = receivedItems.find(item => item.itemId === itemId);
    
    // Validate received quantity does not exceed ordered quantity unless allowed
    if (!allowExcessQuantity && item && receivedQuantity > item.orderedQuantity) {
      receivedQuantity = item.orderedQuantity;
      
      // Show warning snackbar
      setSnackbar({
        open: true,
        message: 'Received quantity cannot exceed ordered quantity. Enable "Allow Excess Quantity" if needed.',
        severity: 'warning'
      });
    }
    
    // Update the received items state
    setReceivedItems(prevItems => prevItems.map(item => 
      item.itemId === itemId ? { ...item, receivedQuantity: receivedQuantity } : item
    ));
  };

  // Function to handle submitting the received quantities
  const handleSubmitReceivedItems = async () => {
    if (!orderToFulfill) return;
    
    try {
      setLoading(true);
      
      // Format the items for the API
      const itemsToSubmit = receivedItems
        .filter(item => item.receivedQuantity > 0) // Only include items with quantities > 0
        .map(item => ({
          itemId: item.itemId,
          productId: item.productId,
          receivedQuantity: item.receivedQuantity,
          orderedQuantity: item.orderedQuantity
        }));
      
      if (itemsToSubmit.length === 0) {
        setSnackbar({
          open: true,
          message: 'No items with received quantities to submit',
          severity: 'warning'
        });
        setLoading(false);
        return;
      }
      
      // Call the API with the received items
      const result = await purchaseOrderService.receiveItems(orderToFulfill.id, itemsToSubmit);
      console.log('Items received successfully:', result);
      
      // Update inventory for each received item
      for (const item of itemsToSubmit) {
        try {
          // Update inventory with actual received quantity
          await purchaseOrderService.updateInventoryWithReceivedQuantity(
            item.productId, 
            item.receivedQuantity,
            item.orderedQuantity
          );
          console.log(`Inventory updated for product ${item.productId} with quantity ${item.receivedQuantity}`);
        } catch (inventoryError) {
          console.error(`Error updating inventory for product ${item.productId}:`, inventoryError);
        }
      }
      
      // Determine if all items are fulfilled completely
      const allItemsFulfilled = receivedItems.every(
        item => item.receivedQuantity >= item.orderedQuantity
      );
      
      // If all items are fulfilled, update the PO status to confirmed
      if (allItemsFulfilled && orderToFulfill.status !== 'confirmed') {
        await purchaseOrderService.updatePurchaseOrderStatus(orderToFulfill.id, 'confirmed');
      } 
      // If partial fulfillment, update status to partially_fulfilled if not already confirmed
      else if (orderToFulfill.status !== 'confirmed') {
        await purchaseOrderService.updatePurchaseOrderStatus(orderToFulfill.id, 'partially_fulfilled');
      }
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Items received and inventory updated successfully',
        severity: 'success'
      });
      
      // Update the local state to reflect the changes
      const updatedPO = result.data;
      setPurchaseOrders(prevOrders => prevOrders.map(po => 
        po.id === updatedPO.id ? updatedPO : po
      ));
      
      // Close the dialog
      handleCloseFulfillmentDialog();
      
      // Refresh the purchase orders
      fetchPurchaseOrders();
      
    } catch (error) {
      console.error('Error receiving items:', error);
      setSnackbar({
        open: true,
        message: 'Error receiving items: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to handle quick fulfill (mark all items as fully received)
  const handleQuickFulfill = () => {
    // Set all items to their ordered quantity
    setReceivedItems(prevItems => prevItems.map(item => ({
      ...item,
      receivedQuantity: item.orderedQuantity
    })));
  };

  // Add handler for changes to received quantities in the details dialog
  const handleDetailsReceivedQuantityChange = (itemId, value) => {
    const parsedValue = parseInt(value, 10);
    const receivedQuantity = isNaN(parsedValue) ? 0 : parsedValue;
    
    setDetailsReceivedItems(prevItems => prevItems.map(item => 
      item.itemId === itemId ? { ...item, receivedQuantity } : item
    ));
  };

  return (
    <Box sx={{ padding: 3, maxWidth: '100%' }}>
      {/* Breadcrumb navigation */}
      <StyledBreadcrumbs>
        <MuiLink component={Link} to="/dashboard">
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Dashboard
        </MuiLink>
        <MuiLink component={Link} to="/owner/inventory">
          <InventoryIcon sx={{ mr: 0.5 }} fontSize="small" />
          Inventory
        </MuiLink>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <ShoppingCartIcon sx={{ mr: 0.5 }} fontSize="small" />
          Purchase Orders
        </Typography>
      </StyledBreadcrumbs>

      {/* Page header */}
      <PageHeader>
        <Box>
          <Button
            variant="text"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToInventory}
            sx={{ mb: 1 }}
          >
            Back to Inventory
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Purchase Orders
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage and track all your purchase orders
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/owner/inventory/purchase-orders/create"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ 
            borderRadius: '8px',
            textTransform: 'none',
            px: 3,
            py: 1,
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            fontSize: '1rem'
          }}
        >
          Create Purchase Order
        </Button>
      </PageHeader>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Orders */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <SummaryCard>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Orders
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 600 }}>
                {loading ? <CircularProgress size={24} /> : purchaseOrders.length}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <DescriptionIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  All purchase orders
                </Typography>
              </Box>
            </CardContent>
          </SummaryCard>
        </Grid>
        
        {/* Draft Orders */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <SummaryCard onClick={() => handleTabChange(null, 1)} sx={{ cursor: 'pointer' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Draft
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 600 }}>
                {loading ? <CircularProgress size={24} /> : 
                 purchaseOrders.filter(order => order.status === 'draft').length}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <DraftIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  Not yet sent
                </Typography>
              </Box>
            </CardContent>
          </SummaryCard>
        </Grid>
        
        {/* Pending Orders */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <SummaryCard onClick={() => handleTabChange(null, 2)} sx={{ cursor: 'pointer' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Pending
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 600, color: 'warning.main' }}>
                {loading ? <CircularProgress size={24} /> : 
                 purchaseOrders.filter(order => order.status === 'pending').length}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <ShoppingCartIcon fontSize="small" color="warning" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  Awaiting processing
                </Typography>
              </Box>
            </CardContent>
          </SummaryCard>
        </Grid>
        
        {/* Sent Orders */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <SummaryCard onClick={() => handleTabChange(null, 3)} sx={{ cursor: 'pointer' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Sent
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 600, color: 'info.main' }}>
                {loading ? <CircularProgress size={24} /> : 
                 purchaseOrders.filter(order => order.status === 'sent').length}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <LocalShippingIcon fontSize="small" color="info" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  Sent to supplier
                </Typography>
              </Box>
            </CardContent>
          </SummaryCard>
        </Grid>
        
        {/* Confirmed Orders */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <SummaryCard onClick={() => handleTabChange(null, 4)} sx={{ cursor: 'pointer' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Confirmed
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 600, color: 'success.main' }}>
                {loading ? <CircularProgress size={24} /> : 
                 purchaseOrders.filter(order => order.status === 'confirmed').length}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <ConfirmedIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  Processing complete
                </Typography>
              </Box>
            </CardContent>
          </SummaryCard>
        </Grid>
        
        {/* Canceled Orders */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <SummaryCard onClick={() => handleTabChange(null, 5)} sx={{ cursor: 'pointer' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Canceled
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 600, color: 'error.main' }}>
                {loading ? <CircularProgress size={24} /> : 
                 purchaseOrders.filter(order => order.status === 'canceled').length}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <CanceledIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  Order canceled
                </Typography>
              </Box>
            </CardContent>
          </SummaryCard>
        </Grid>
      </Grid>

      {/* Filters */}
      <FiltersContainer>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search by PO #, supplier, or description..."
              value={searchTerm}
              onChange={handleSearch}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={9}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                <InputLabel id="supplier-filter-label">Supplier</InputLabel>
                <Select
                  labelId="supplier-filter-label"
                  name="supplier"
                  value={filters.supplier}
                  onChange={handleFilterChange}
                  label="Supplier"
                >
                  <MenuItem value="">All Suppliers</MenuItem>
                  {/* Get unique suppliers, handling different property naming */}
                  {Array.from(new Set(purchaseOrders.map(order => {
                    return order.supplierName || 
                      (order.supplier && (order.supplier.name || order.supplier.Name));
                  })))
                    .filter(Boolean)
                    .sort()
                    .map(name => (
                      <MenuItem key={name} value={name}>{name}</MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
              
              <FormControl variant="outlined" sx={{ minWidth: 180 }}>
                <InputLabel id="date-range-filter-label">Date Range</InputLabel>
                <Select
                  labelId="date-range-filter-label"
                  name="dateRange"
                  value={filters.dateRange}
                  onChange={handleFilterChange}
                  label="Date Range"
                >
                  <MenuItem value="">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="yesterday">Yesterday</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                  <MenuItem value="quarter">This Quarter</MenuItem>
                  <MenuItem value="year">This Year</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl variant="outlined" sx={{ minWidth: 180 }}>
                <InputLabel id="amount-range-filter-label">Amount Range</InputLabel>
                <Select
                  labelId="amount-range-filter-label"
                  name="amountRange"
                  value={filters.amountRange}
                  onChange={handleFilterChange}
                  label="Amount Range"
                >
                  <MenuItem value="">All Amounts</MenuItem>
                  <MenuItem value="small">Under $1,000</MenuItem>
                  <MenuItem value="medium">$1,000 - $5,000</MenuItem>
                  <MenuItem value="large">$5,000 - $10,000</MenuItem>
                  <MenuItem value="xlarge">Over $10,000</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchPurchaseOrders}
                sx={{ 
                  borderRadius: '8px', 
                  textTransform: 'none',
                  height: '56px'
                }}
              >
                Refresh
              </Button>
            </Box>
          </Grid>
        </Grid>
      </FiltersContainer>

      {/* Status filter tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable" 
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ '& .MuiTab-root': { textTransform: 'none' } }}
        >
          <Tab 
            label="All Orders" 
            icon={<DescriptionIcon />} 
            iconPosition="start" 
          />
          <Tab 
            label="Draft" 
            icon={<DraftIcon />} 
            iconPosition="start" 
          />
          <Tab 
            label="Pending" 
            icon={<ShoppingCartIcon />} 
            iconPosition="start"
            sx={{ color: 'warning.main' }} 
          />
          <Tab 
            label="Sent" 
            icon={<LocalShippingIcon />} 
            iconPosition="start"
            sx={{ color: 'info.main' }} 
          />
          <Tab 
            label="Confirmed" 
            icon={<ConfirmedIcon />} 
            iconPosition="start"
            sx={{ color: 'success.main' }} 
          />
          <Tab 
            label="Canceled" 
            icon={<CanceledIcon />} 
            iconPosition="start"
            sx={{ color: 'error.main' }} 
          />
        </Tabs>
      </Box>

      {/* Bulk actions toolbar */}
      {selectedOrders.length > 0 && (
        <Paper 
          sx={{ 
            mb: 2, 
            p: 2, 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: '8px',
            bgcolor: 'primary.lighter',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          <Typography variant="subtitle1" component="div">
            {selectedOrders.length} {selectedOrders.length === 1 ? 'order' : 'orders'} selected
          </Typography>
          <Box>
            <Button 
              variant="outlined" 
              color="primary"
              startIcon={<DownloadIcon />}
              sx={{ mr: 1 }}
              onClick={() => handleBulkAction('download')}
            >
              Download
            </Button>
            <Button 
              variant="outlined" 
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => handleBulkAction('delete')}
            >
              Delete
            </Button>
          </Box>
        </Paper>
      )}

      {/* Purchase Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <StyledTableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox 
                  color="primary"
                  onChange={(e) => {
                    // Select/deselect all visible orders
                    const newSelected = e.target.checked 
                      ? paginatedOrders.map(order => order.id || order._id) 
                      : [];
                    setSelectedOrders(newSelected);
                  }}
                  indeterminate={selectedOrders.length > 0 && selectedOrders.length < paginatedOrders.length}
                  checked={paginatedOrders.length > 0 && selectedOrders.length === paginatedOrders.length}
                />
              </TableCell>
              <TableCell 
                sortDirection={sortConfig.field === 'poNumber' ? sortConfig.direction : false}
                onClick={() => handleRequestSort('poNumber')}
                sx={{ cursor: 'pointer' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  PO Number
                  {sortConfig.field === 'poNumber' && (
                    sortConfig.direction === 'asc' ? 
                      <ArrowUpward fontSize="small" sx={{ ml: 0.5 }} /> : 
                      <ArrowDownward fontSize="small" sx={{ ml: 0.5 }} />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                sortDirection={sortConfig.field === 'supplier' ? sortConfig.direction : false}
                onClick={() => handleRequestSort('supplier')}
                sx={{ cursor: 'pointer' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Supplier
                  {sortConfig.field === 'supplier' && (
                    sortConfig.direction === 'asc' ? 
                      <ArrowUpward fontSize="small" sx={{ ml: 0.5 }} /> : 
                      <ArrowDownward fontSize="small" sx={{ ml: 0.5 }} />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                sortDirection={sortConfig.field === 'createdAt' ? sortConfig.direction : false}
                onClick={() => handleRequestSort('createdAt')}
                sx={{ cursor: 'pointer' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Date Created
                  {sortConfig.field === 'createdAt' && (
                    sortConfig.direction === 'asc' ? 
                      <ArrowUpward fontSize="small" sx={{ ml: 0.5 }} /> : 
                      <ArrowDownward fontSize="small" sx={{ ml: 0.5 }} />
                  )}
                </Box>
              </TableCell>
              <TableCell>Expected Delivery</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center">Items</TableCell>
              <TableCell 
                align="right"
                sortDirection={sortConfig.field === 'totalAmount' ? sortConfig.direction : false}
                onClick={() => handleRequestSort('totalAmount')}
                sx={{ cursor: 'pointer' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  Total Amount
                  {sortConfig.field === 'totalAmount' && (
                    sortConfig.direction === 'asc' ? 
                      <ArrowUpward fontSize="small" sx={{ ml: 0.5 }} /> : 
                      <ArrowDownward fontSize="small" sx={{ ml: 0.5 }} />
                  )}
                </Box>
              </TableCell>
              <TableCell
                sortDirection={sortConfig.field === 'status' ? sortConfig.direction : false}
                onClick={() => handleRequestSort('status')}
                sx={{ cursor: 'pointer' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Status
                  {sortConfig.field === 'status' && (
                    sortConfig.direction === 'asc' ? 
                      <ArrowUpward fontSize="small" sx={{ ml: 0.5 }} /> : 
                      <ArrowDownward fontSize="small" sx={{ ml: 0.5 }} />
                  )}
                </Box>
              </TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={30} />
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    Loading purchase orders...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1">
                    No purchase orders found.
                  </Typography>
                  <Button 
                    variant="contained" 
                    component={Link} 
                    to="/owner/inventory/purchase-orders/create"
                    startIcon={<AddIcon />}
                    sx={{ mt: 2 }}
                  >
                    Create purchase order
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => (
                <StyledTableRow
                  key={order.id || order._id}
                  onClick={() => handleRowClick(order)}
                  selected={selectedOrders.includes(order.id || order._id)}
                >
                  <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      color="primary"
                      checked={selectedOrders.includes(order.id || order._id)}
                      onChange={(e) => {
                        const selectedId = order.id || order._id;
                        const newSelectedOrders = [...selectedOrders];
                        if (e.target.checked) {
                          newSelectedOrders.push(selectedId);
                        } else {
                          const index = newSelectedOrders.indexOf(selectedId);
                          if (index !== -1) {
                            newSelectedOrders.splice(index, 1);
                          }
                        }
                        setSelectedOrders(newSelectedOrders);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {order.po_number || order.poNumber || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {order.supplierName || 
                     (order.supplier && (order.supplier.name || order.supplier.Name)) || 
                     "N/A"}
                  </TableCell>
                  <TableCell>
                    {order.created_at || order.createdAt
                      ? new Date(order.created_at || order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        })
                      : order.order_date
                        ? new Date(order.order_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })
                        : "Not specified"}
                  </TableCell>
                  <TableCell>
                    {order.expected_delivery_date || order.expectedDeliveryDate
                      ? new Date(order.expected_delivery_date || order.expectedDeliveryDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        })
                      : "Not specified"}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                      {order.description || order.notes || "No description"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={order.items?.length || 0} 
                      size="small" 
                      sx={{ minWidth: 30 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    ${Number(order.total_amount || order.totalAmount || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(order.status || 'draft')}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(order.status || "draft"),
                        color: "#fff",
                        fontWeight: "bold"
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Tooltip title="View Details">
                        <ActionButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(order);
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </ActionButton>
                      </Tooltip>
                      
                      {order.status !== 'confirmed' && (
                        <Tooltip title="Edit">
                          <ActionButton
                            component={Link}
                            to={`/owner/inventory/purchase-orders/${order.id || order._id}`}
                            size="small"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <EditIcon fontSize="small" />
                          </ActionButton>
                        </Tooltip>
                      )}
                      
                      <Tooltip title="Download PDF">
                        <ActionButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadPdf(order);
                          }}
                        >
                          <DownloadIcon fontSize="small" />
                        </ActionButton>
                      </Tooltip>
                      
                      {order.status !== 'confirmed' && (
                        <Tooltip title="Delete">
                          <ActionButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDeleteDialog(order);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </ActionButton>
                        </Tooltip>
                      )}
                      
                      <Tooltip title="More Actions">
                        <ActionButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionMenuOpen(e, order);
                          }}
                        >
                          <MoreIcon fontSize="small" />
                        </ActionButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add back the pagination component */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredOrders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Orders per page:"
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        PaperProps={{
          sx: { borderRadius: '12px' }
        }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ pb: 1 }}>
          <Typography variant="h6" color="error">
            Delete Purchase Order
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <DeleteIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
            <DialogContentText>
              Are you sure you want to delete purchase order <strong>{orderToDelete?.poNumber}</strong>? This action cannot be undone.
            </DialogContentText>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDeleteDialog} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteOrder} 
            color="error" 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} /> : null}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onClose={handleCloseEmailDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Send Purchase Order</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Send this purchase order via email to the supplier or other recipients.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="recipient"
            label="Recipient Email"
            type="email"
            fullWidth
            variant="outlined"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="subject"
            label="Email Subject"
            type="text"
            fullWidth
            variant="outlined"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="message"
            label="Email Message"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={emailMessage}
            onChange={(e) => setEmailMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEmailDialog}>Cancel</Button>
          <Button 
            onClick={handleSendEmail} 
            variant="contained" 
            color="primary"
            disabled={emailLoading || !recipientEmail}
            startIcon={emailLoading ? <CircularProgress size={18} /> : null}
          >
            {emailLoading ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Order Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {showPartialFulfillment ? "Confirm Partial Fulfillment" : "Confirm Purchase Order"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {showPartialFulfillment ? 
              "You're confirming this purchase order with different quantities than what was ordered. Please verify the received quantities below." :
              "Confirming this purchase order will mark it as received and update inventory levels. This action will add stock quantities to your inventory and cannot be easily reversed."
            }
          </DialogContentText>
          
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showPartialFulfillment}
                  onChange={(e) => setShowPartialFulfillment(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={{ mr: 1 }}>Received Different Quantities Than Ordered</Typography>
                  <Tooltip title="Toggle this if the supplier sent different quantities than ordered">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              }
            />
            {showPartialFulfillment && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Please specify the actual quantities received for each item below.
              </Typography>
            )}
          </Box>
          
          {showPartialFulfillment && (
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Ordered</TableCell>
                    <TableCell align="right">Received</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {confirmReceivedItems.map((item) => (
                    <TableRow key={item.itemId || item.productId}>
                      <TableCell>
                        <Typography variant="body2">{item.productName}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {item.productId}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{item.orderedQuantity}</TableCell>
                      <TableCell align="right">
          <TextField
                          type="number"
                          size="small"
                          value={item.receivedQuantity}
                          onChange={(e) => handleConfirmReceivedQuantityChange(item.itemId, e.target.value)}
                          inputProps={{ min: 0 }}
                          sx={{ width: 80 }}
                          autoFocus={confirmReceivedItems.indexOf(item) === 0}
                        />
                      </TableCell>
                      <TableCell>
                        {item.receivedQuantity === 0 ? (
                          <Chip size="small" label="Not Received" color="error" />
                        ) : item.receivedQuantity < item.orderedQuantity ? (
                          <Chip size="small" label="Partial" color="warning" />
                        ) : item.receivedQuantity === item.orderedQuantity ? (
                          <Chip size="small" label="Complete" color="success" />
                        ) : (
                          <Chip size="small" label="Excess" color="info" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          <TextField
            autoFocus={!showPartialFulfillment}
            margin="dense"
            id="paymentTerms"
            label="Payment Terms"
            type="text"
            fullWidth
            variant="outlined"
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            sx={{ mb: 2 }}
            required
            error={!paymentTerms.trim()}
            helperText={!paymentTerms.trim() ? "Payment terms are required" : "e.g. Net 30 days, Due on receipt, etc."}
          />
          <TextField
            margin="dense"
            id="confirmNotes"
            label="Confirmation Notes (Optional)"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={confirmNotes}
            onChange={(e) => setConfirmNotes(e.target.value)}
            helperText="Add any notes about this confirmation"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmOrder} 
            variant="contained" 
            color="success"
            disabled={loading || !paymentTerms || (showPartialFulfillment && confirmReceivedItems.every(item => item.receivedQuantity === 0))}
            startIcon={loading ? <CircularProgress size={18} /> : null}
          >
            {loading ? 'Confirming...' : (showPartialFulfillment ? 'Confirm Partial Fulfillment' : 'Confirm Order')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Purchase Order</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please provide a reason for cancelling this purchase order.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="cancellationReason"
            label="Cancellation Reason"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            required
            error={!cancellationReason.trim()}
            helperText={!cancellationReason.trim() ? "A reason is required" : ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Back</Button>
          <Button 
            onClick={handleCancelOrder} 
            variant="contained" 
            color="error"
            disabled={loading || !cancellationReason.trim()}
            startIcon={loading ? <CircularProgress size={18} /> : null}
          >
            {loading ? 'Cancelling...' : 'Cancel Order'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        <MenuItem 
          component={Link} 
          to={`/owner/inventory/purchase-orders/${currentOrder?.id}`}
          onClick={handleActionMenuClose}
        >
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        
        {currentOrder?.status !== 'confirmed' && (
          <MenuItem 
            component={Link} 
            to={`/owner/inventory/purchase-orders/${currentOrder?.id}`}
            onClick={handleActionMenuClose}
          >
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
        )}
        
        {currentOrder?.status !== 'draft' && (
          <MenuItem onClick={() => {
            handleActionMenuClose();
            handleOpenEmailDialog(currentOrder);
          }}>
            <EmailIcon fontSize="small" sx={{ mr: 1 }} />
            Send Email
          </MenuItem>
        )}
        
        <MenuItem onClick={() => {
          handleActionMenuClose();
          handleDownloadPdf(currentOrder);
        }}>
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
          Download PDF
        </MenuItem>
        
        {currentOrder?.status !== 'confirmed' && (
          <MenuItem onClick={() => {
            handleActionMenuClose();
            handleOpenDeleteDialog(currentOrder);
          }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} color="error" />
            <Typography color="error">Delete</Typography>
          </MenuItem>
        )}
      </Menu>

      {/* Order Details Dialog */}
      <Dialog
        open={orderDetailsDialogOpen}
        onClose={handleCloseOrderDetails}
        maxWidth="lg"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Purchase Order #{selectedOrder.po_number || selectedOrder.poNumber || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created on {(selectedOrder.created_at || selectedOrder.createdAt) 
                      ? new Date(selectedOrder.created_at || selectedOrder.createdAt).toLocaleDateString() 
                      : 'N/A'}
                  </Typography>
                </Box>
                <StatusChip
                  label={getStatusLabel(selectedOrder.status)}
                  status={selectedOrder.status}
                  size="small"
                  icon={
                    selectedOrder.status === 'draft' ? <DraftIcon fontSize="small" /> :
                    selectedOrder.status === 'pending' ? <ShoppingCartIcon fontSize="small" /> :
                    selectedOrder.status === 'sent' ? <LocalShippingIcon fontSize="small" /> :
                    selectedOrder.status === 'confirmed' ? <ConfirmedIcon fontSize="small" /> :
                    selectedOrder.status === 'canceled' ? <CanceledIcon fontSize="small" /> :
                    <DescriptionIcon fontSize="small" />
                  }
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
              {/* Summary Card - Mobile friendly overview */}
              <Box sx={{ 
                p: 3, 
                bgcolor: 'background.paper', 
                borderBottom: '1px solid #eee',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                gap: 2
              }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 1 }}>
                    <Chip
                      label={`PO #${selectedOrder.po_number || selectedOrder.poNumber || 'N/A'}`}
                      color="primary"
                      sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}
                    />
                    <Chip
                      label={getStatusLabel(selectedOrder.status || 'draft')}
                      size="medium"
                      icon={
                        selectedOrder.status === 'draft' ? <DraftIcon fontSize="small" /> :
                        selectedOrder.status === 'pending' ? <ShoppingCartIcon fontSize="small" /> :
                        selectedOrder.status === 'sent' ? <LocalShippingIcon fontSize="small" /> :
                        selectedOrder.status === 'confirmed' ? <ConfirmedIcon fontSize="small" /> :
                        selectedOrder.status === 'canceled' ? <CanceledIcon fontSize="small" /> :
                        <DescriptionIcon fontSize="small" />
                      }
                      sx={{
                        backgroundColor: getStatusColor(selectedOrder.status || "draft"),
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: '0.875rem'
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 3, md: 4 }, my: 1 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Creation Date
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {(selectedOrder.created_at || selectedOrder.createdAt) 
                          ? new Date(selectedOrder.created_at || selectedOrder.createdAt).toLocaleDateString() 
                          : 'N/A'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Expected Delivery
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {(selectedOrder.expected_delivery_date || selectedOrder.expectedDeliveryDate)
                          ? new Date(selectedOrder.expected_delivery_date || selectedOrder.expectedDeliveryDate).toLocaleDateString()
                          : "Not specified"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Payment Status
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedOrder.payment_status || selectedOrder.paymentStatus || 'Unpaid'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: { xs: 'flex-start', md: 'flex-end' },
                  ml: 'auto',
                  mr: { xs: 0, md: 2 }
                }}>
                  <Typography variant="caption" color="text.secondary">TOTAL AMOUNT</Typography>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    ${Number(selectedOrder.total_amount || selectedOrder.totalAmount || 0).toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{selectedOrder.currency || 'USD'}</Typography>
                </Box>
              </Box>
              
              {/* Main content with tabs for organization */}
              <Box sx={{ p: 3 }}>
                <Grid container spacing={4}>
                  {/* Left column - Order Information */}
                  <Grid item xs={12} md={6} lg={5}>
                    <Box sx={{ mb: 4 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2, 
                        pb: 1, 
                        borderBottom: '2px solid', 
                        borderColor: 'primary.main' 
                      }}>
                        <AccountIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight="medium">
                          Supplier Information
                        </Typography>
                      </Box>
                      
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {selectedOrder.supplierName || 
                           (selectedOrder.supplier && (selectedOrder.supplier.name || selectedOrder.supplier.Name)) || 
                           'N/A'}
                        </Typography>
                        
                        <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Contact Person
                            </Typography>
                            <Typography variant="body2">
                              {selectedOrder.supplier_contact || 
                               (selectedOrder.supplier && selectedOrder.supplier.contact_person) || 
                               'N/A'}
                            </Typography>
                          </Box>
                          

                          
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Address
                            </Typography>
                            <Typography variant="body2">
                              {(() => {
                                // Log the entire selected order for debugging
                                console.log('Selected order data:', selectedOrder);
                                
                                // Try to get address fields directly from the PO (most reliable)
                                const poAddressParts = [
                                  selectedOrder.street,
                                  selectedOrder.city,
                                  selectedOrder.state,
                                  selectedOrder.zipCode || selectedOrder.zip_code,
                                  selectedOrder.country
                                ].filter(Boolean);
                                
                                if (poAddressParts.length > 0) {
                                  return poAddressParts.join(', ');
                                }
                                
                                // If no address on PO, try supplier object if available
                                const supplier = selectedOrder.supplier;
                                if (supplier) {
                                  // Try direct fields on supplier
                                  const supplierParts = [
                                    supplier.street,
                                    supplier.city,
                                    supplier.state,
                                    supplier.zipCode || supplier.zip_code,
                                    supplier.country
                                  ].filter(Boolean);
                                  
                                  if (supplierParts.length > 0) {
                                    return supplierParts.join(', ');
                                  }
                                  
                                  // Try formatted address
                                  if (supplier.formattedAddress) {
                                    return supplier.formattedAddress;
                                  }
                                  
                                  // Try nested address object
                                  if (supplier.address && typeof supplier.address === 'object') {
                                    const nestedParts = [
                                      supplier.address.street,
                                      supplier.address.city,
                                      supplier.address.state,
                                      supplier.address.zipCode || supplier.address.zip_code,
                                      supplier.address.country
                                    ].filter(Boolean);
                                    
                                    if (nestedParts.length > 0) {
                                      return nestedParts.join(', ');
                                    }
                                  }
                                  
                                  // Last resort for supplier
                                  if (supplier.Address) return supplier.Address;
                                }
                                
                                // Try supplier address as a string
                                if (selectedOrder.supplier_address) return selectedOrder.supplier_address;
                                if (selectedOrder.supplierAddress) return selectedOrder.supplierAddress;
                                
                                return 'N/A';
                              })()}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Email
                            </Typography>
                            <Typography variant="body2" 
                              sx={{ 
                                whiteSpace: 'nowrap', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                maxWidth: '100%'
                              }}
                            >
                              {selectedOrder.supplierEmail || 
                               (selectedOrder.supplier && selectedOrder.supplier.email) || 
                               'N/A'}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Phone
                            </Typography>
                            <Typography variant="body2">
                              {selectedOrder.supplierPhone || 
                               (selectedOrder.supplier && selectedOrder.supplier.phone) || 
                               'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Box>
                    
                    <Box sx={{ mb: 4 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2, 
                        pb: 1, 
                        borderBottom: '2px solid', 
                        borderColor: 'primary.main' 
                      }}>
                        <LocalShippingIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight="medium">
                          Shipping Details
                        </Typography>
                      </Box>
                      
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {selectedOrder.warehouse_location || selectedOrder.warehouseLocation || 'Main Warehouse'}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {selectedOrder.shipping_address || selectedOrder.shippingAddress || 'Default Warehouse Address'}
                        </Typography>
                        
                        <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Receiving Contact
                            </Typography>
                            <Typography variant="body2">
                              {selectedOrder.receiving_contact || selectedOrder.receivingContact || 'N/A'}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Tracking Number
                            </Typography>
                            <Typography variant="body2">
                              {selectedOrder.tracking_number || selectedOrder.trackingNumber || 'Not available'}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {selectedOrder.delivery_instructions && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Delivery Instructions
                            </Typography>
                            <Typography variant="body2">
                              {selectedOrder.delivery_instructions || selectedOrder.deliveryInstructions}
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    </Box>
                    
                    {selectedOrder.notes && (
                      <Box sx={{ mb: 4 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 2, 
                          pb: 1, 
                          borderBottom: '2px solid', 
                          borderColor: 'primary.main' 
                        }}>
                          <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="h6" fontWeight="medium">
                            Notes
                          </Typography>
                        </Box>
                        
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#fafafa' }}>
                          <Typography variant="body2">
                            {selectedOrder.notes}
                          </Typography>
                        </Paper>
                      </Box>
                    )}
                  </Grid>
                  
                  {/* Right column - Order Items and Summary */}
                  <Grid item xs={12} md={6} lg={7}>
                    <Box sx={{ mb: 4 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        mb: 2, 
                        pb: 1, 
                        borderBottom: '2px solid', 
                        borderColor: 'primary.main' 
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ShoppingCartIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="h6" fontWeight="medium">
                            Order Items
                          </Typography>
                        </Box>
                        <Chip 
                          label={`${selectedOrder.items?.length || 0} ${selectedOrder.items?.length === 1 ? 'item' : 'items'}`} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                                            </Box>
                      
                      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
                        <Table size="small">
                          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                              <TableCell>SKU/Product</TableCell>
                              <TableCell align="right">Qty Ordered</TableCell>
                              {(selectedOrder.status === 'confirmed' || selectedOrder.status === 'partially_fulfilled') && (
                                <TableCell align="right">Qty Received</TableCell>
                              )}
                              <TableCell align="right">Unit Price</TableCell>
                              <TableCell align="right">Total</TableCell>
                              <TableCell align="center">Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedOrder.items?.length > 0 ? (
                              selectedOrder.items.map((item, index) => (
                                <TableRow key={index} hover>
                                  <TableCell>
                                    <Box>
                                      <Typography variant="body2" fontWeight="medium">
                                        {item.product_name || item.productName || item.name || 'Product'}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        SKU: {item.sku || item.product_sku || 'N/A'}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell align="right">
                                    {item.quantity || 0} {item.unit_of_measure || item.unitOfMeasure || 'Each'}
                                  </TableCell>
                                  {(selectedOrder.status === 'confirmed' || selectedOrder.status === 'partially_fulfilled') && (
                                    <TableCell align="right">
                                      <Typography 
                                        variant="body2" 
                                        color={
                                          item.received_quantity === undefined ? 'text.primary' : 
                                          parseInt(item.received_quantity) < parseInt(item.quantity) ? 'warning.main' : 
                                          parseInt(item.received_quantity) > parseInt(item.quantity) ? 'info.main' : 
                                          'success.main'
                                        }
                                        fontWeight="medium"
                                      >
                                        {item.received_quantity !== undefined ? item.received_quantity : item.quantity} {item.unit_of_measure || item.unitOfMeasure || 'Each'}
                                      </Typography>
                                    </TableCell>
                                  )}
                                  <TableCell align="right">
                                    ${Number(item.unit_price || item.unitPrice || 0).toFixed(2)}
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography variant="body2" fontWeight="medium">
                                      ${Number(item.total || ((item.quantity || 0) * Number(item.unit_price || item.unitPrice || 0)) || 0).toFixed(2)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip 
                                      label={
                                        item.received_quantity === 0 ? "Not Received" :
                                        item.received_quantity < item.quantity ? "Partial" :
                                        item.received_quantity > item.quantity ? "Excess" :
                                        item.status || "Pending"
                                      } 
                                      size="small"
                                      sx={{ 
                                        fontSize: '0.625rem',
                                        backgroundColor: 
                                          item.received_quantity === 0 ? '#f44336' :
                                          item.received_quantity < item.quantity ? '#ff9800' :
                                          item.received_quantity > item.quantity ? '#2196f3' :
                                          item.status === 'received' ? '#4caf50' : 
                                          item.status === 'partial' ? '#ff9800' : '#2196f3',
                                        color: 'white'
                                      }}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={selectedOrder.status === 'confirmed' ? 6 : 5} align="center">
                                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                    No items in this purchase order
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      {/* Add fulfillment status summary if the order is confirmed or partially fulfilled */}
                      {(selectedOrder.status === 'confirmed' || selectedOrder.status === 'partially_fulfilled') && (
                        <Box sx={{ mb: 2, p: 2, bgcolor: '#f9f9f9', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              Fulfillment Summary
                            </Typography>
                            <Chip 
                              label={selectedOrder.fulfillmentStatus === 'partially_fulfilled' ? 'Partially Fulfilled' : 'Fully Fulfilled'} 
                              color={selectedOrder.fulfillmentStatus === 'partially_fulfilled' ? 'warning' : 'success'}
                              size="small"
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 1 }}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Confirmed Date
                              </Typography>
                              <Typography variant="body2">
                                {selectedOrder.confirmed_date 
                                  ? new Date(selectedOrder.confirmed_date).toLocaleDateString() 
                                  : 'Not available'}
                              </Typography>
                            </Box>
                            
                            {selectedOrder.partial_fulfillment_date && (
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Partial Fulfillment Date
                                </Typography>
                                <Typography variant="body2">
                                  {new Date(selectedOrder.partial_fulfillment_date).toLocaleDateString()}
                                </Typography>
                              </Box>
                            )}
                            
                            {selectedOrder.partial_fulfillment_notes && (
                              <Box sx={{ flexBasis: '100%', mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Partial Fulfillment Notes
                                </Typography>
                                <Typography variant="body2">
                                  {selectedOrder.partial_fulfillment_notes}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      )}
                    </Box>
                      
                      {/* Order Summary */}
                      <Box sx={{ mb: 4 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 2, 
                          pb: 1, 
                          borderBottom: '2px solid', 
                          borderColor: 'primary.main' 
                        }}>
                          <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="h6" fontWeight="medium">
                            Order Summary
                          </Typography>
                        </Box>
                        
                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: '#f8f9fa' }}>
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                          }}>
                            <Grid container spacing={1} sx={{ mb: 1 }}>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
                              </Grid>
                              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                <Typography variant="body1">
                                  ${Number(selectedOrder.subtotal || 
                                    (selectedOrder.items?.reduce((sum, item) => 
                                      sum + (Number(item.unit_price || item.unitPrice || 0) * (item.quantity || 0)), 0)
                                    ) || 0).toFixed(2)}
                                </Typography>
                              </Grid>
                            </Grid>
                            
                            <Grid container spacing={1} sx={{ mb: 1 }}>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                  Tax ({selectedOrder.tax_rate || selectedOrder.taxRate || 0}%):
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                <Typography variant="body1">
                                  ${Number(selectedOrder.tax_amount || selectedOrder.taxAmount || 0).toFixed(2)}
                                </Typography>
                              </Grid>
                            </Grid>
                            
                            <Grid container spacing={1} sx={{ mb: 1 }}>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Shipping:</Typography>
                              </Grid>
                              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                <Typography variant="body1">
                                  ${Number(selectedOrder.shipping_cost || selectedOrder.shippingCost || 0).toFixed(2)}
                                </Typography>
                              </Grid>
                            </Grid>
                            
                            {(selectedOrder.discount_amount || selectedOrder.discountAmount) ? (
                              <Grid container spacing={1} sx={{ mb: 1 }}>
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="text.secondary">Discount:</Typography>
                                </Grid>
                                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                  <Typography variant="body1" color="error.main">
                                    -${Number(selectedOrder.discount_amount || selectedOrder.discountAmount).toFixed(2)}
                                  </Typography>
                                </Grid>
                              </Grid>
                            ) : null}
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Typography variant="subtitle1" fontWeight="bold">Total Amount:</Typography>
                              </Grid>
                              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                <Typography variant="h5" color="primary.main" fontWeight="bold">
                                  ${Number(selectedOrder.total_amount || selectedOrder.totalAmount || 0).toFixed(2)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Currency: {selectedOrder.currency || 'USD'}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        </Paper>
                      </Box>
                      
                      {/* Approval Information */}
                      <Box sx={{ mb: 4 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 2, 
                          pb: 1, 
                          borderBottom: '2px solid', 
                          borderColor: 'primary.main' 
                        }}>
                          <ConfirmedIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="h6" fontWeight="medium">
                            Approval Information
                          </Typography>
                        </Box>
                        
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Requested By
                                </Typography>
                                <Typography variant="body2">
                                  {selectedOrder.requested_by || selectedOrder.requestedBy || 
                                   selectedOrder.created_by_name || selectedOrder.createdByName || 'N/A'}
                                </Typography>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={4}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Approved By
                                </Typography>
                                <Typography variant="body2">
                                  {selectedOrder.approved_by || selectedOrder.approvedBy || 'Pending approval'}
                                </Typography>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={4}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Approval Date
                                </Typography>
                                <Typography variant="body2">
                                  {selectedOrder.approval_date 
                                    ? new Date(selectedOrder.approval_date).toLocaleDateString() 
                                    : 'Pending'}
                                </Typography>
                              </Box>
                            </Grid>
                            
                            {selectedOrder.documents?.length > 0 && (
                              <Grid item xs={12}>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Attached Documents
                                  </Typography>
                                  <Typography variant="body2">
                                    {selectedOrder.documents.map(doc => doc.name).join(', ')}
                                  </Typography>
                                </Box>
                              </Grid>
                            )}
                          </Grid>
                        </Paper>
                    </Box>
                  </Grid>
                </Grid>
                
                {/* Add partial fulfillment section at the bottom */}
                {showPartialFulfillment && (
                  <Box sx={{ mt: 4, mb: 2 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      mb: 2, 
                      pb: 1, 
                      borderBottom: '2px solid', 
                      borderColor: 'warning.main' 
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocalShippingIcon sx={{ mr: 1, color: 'warning.main' }} />
                        <Typography variant="h6" fontWeight="medium" color="warning.main">
                          Partial Fulfillment
                        </Typography>
                      </Box>
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={allowExcessQuantity}
                            onChange={(e) => setAllowExcessQuantity(e.target.checked)}
                            color="warning"
                            size="small"
                          />
                        }
                        label="Allow Excess Quantities"
                      />
                    </Box>
                    
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: '#fffaf3' }}>
                      <Typography variant="body2" sx={{ mb: 3 }}>
                        Enter the actual quantities received for each product. These values will be used when confirming the order.
                      </Typography>
                      
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead sx={{ bgcolor: '#fff3e0' }}>
                            <TableRow>
                              <TableCell>Product</TableCell>
                              <TableCell align="center">Ordered</TableCell>
                              <TableCell align="center">Received</TableCell>
                              <TableCell align="center">Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {detailsReceivedItems.map((item) => (
                              <TableRow key={item.itemId || item.productId}>
                                <TableCell>
                                  <Typography variant="body2" fontWeight="medium">{item.productName}</Typography>
                                </TableCell>
                                <TableCell align="center">{item.orderedQuantity}</TableCell>
                                <TableCell align="center">
                                  <TextField
                                    type="number"
                                    size="small"
                                    value={item.receivedQuantity}
                                    onChange={(e) => handleDetailsReceivedQuantityChange(item.itemId || item.productId, e.target.value)}
                                    inputProps={{ min: 0 }}
                                    sx={{ width: '80px' }}
                                    error={parseInt(item.receivedQuantity) > parseInt(item.orderedQuantity) && !allowExcessQuantity}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  {item.receivedQuantity === 0 ? (
                                    <Chip size="small" label="Not Received" color="error" />
                                  ) : parseInt(item.receivedQuantity) < parseInt(item.orderedQuantity) ? (
                                    <Chip size="small" label="Partial" color="warning" />
                                  ) : parseInt(item.receivedQuantity) === parseInt(item.orderedQuantity) ? (
                                    <Chip size="small" label="Complete" color="success" />
                                  ) : (
                                    <Chip size="small" label="Excess" color="info" />
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        <Button 
                          variant="outlined" 
                          color="primary"
                          onClick={() => {
                            // Reset quantities to ordered amounts
                            setDetailsReceivedItems(prev => prev.map(item => ({
                              ...item,
                              receivedQuantity: item.orderedQuantity
                            })));
                          }}
                          startIcon={<CheckCircleOutlineIcon />}
                        >
                          Reset All to Ordered Quantities
                        </Button>
                      </Box>
                    </Paper>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions 
              sx={{ 
                p: 3, 
                borderTop: '1px solid #eee', 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                gap: 2
              }}
            >
              {/* Status Actions */}
              {selectedOrder.status !== 'confirmed' && selectedOrder.status !== 'canceled' && (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  width: { xs: '100%', sm: 'auto' },
                  mr: { xs: 0, sm: 'auto' }
                }}>
                  {/* Add partial fulfillment checkbox directly in the dialog */}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showPartialFulfillment}
                        onChange={(e) => setShowPartialFulfillment(e.target.checked)}
                        color="warning"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>Enable Partial Fulfillment</Typography>
                        <Tooltip title="Select this if the supplier sent different quantities than ordered">
                          <InfoIcon fontSize="small" color="action" />
                        </Tooltip>
                      </Box>
                    }
                    sx={{ mb: 2, ml: 0 }}
                  />
                  
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 1,
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                }}>
                  {selectedOrder.status === 'draft' && (
                    <Button 
                      variant="contained"
                      color="warning"
                      startIcon={<LocalShippingIcon />}
                      onClick={() => handleSubmitOrder(selectedOrder)}
                      sx={{ 
                        borderRadius: '20px',
                        px: 2
                      }}
                    >
                      Submit Order
                    </Button>
                  )}
                  
                  <Button 
                    variant="contained"
                    color="success" 
                    startIcon={<ConfirmedIcon />}
                    onClick={() => handleOpenConfirmDialog(selectedOrder)}
                    sx={{ 
                      borderRadius: '20px',
                      px: 2
                    }}
                  >
                      Confirm Order {showPartialFulfillment ? "(Partial)" : ""}
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    color="error"
                    startIcon={<CanceledIcon />}
                    onClick={() => handleOpenCancelDialog(selectedOrder)}
                    sx={{ 
                      borderRadius: '20px',
                      px: 2
                    }}
                  >
                    Cancel Order
                  </Button>
                  </Box>
                </Box>
              )}
              
              {/* Receive Items for confirmed orders */}
              {selectedOrder.status === 'confirmed' && (
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  gap: 1,
                  width: { xs: '100%', sm: 'auto' },
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                  mr: { xs: 0, sm: 'auto' }
                }}>
                  <Button 
                    variant="contained"
                    color="primary" 
                    startIcon={<InventoryIcon />}
                    onClick={() => {
                      handleCloseOrderDetails();
                      handleOpenFulfillmentDialog(selectedOrder);
                    }}
                    sx={{ 
                      borderRadius: '20px',
                      px: 2
                    }}
                  >
                    Receive Items
                  </Button>
                </Box>
              )}
              
              {/* Document Actions */}
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                gap: 1,
                width: { xs: '100%', sm: 'auto' },
                justifyContent: { xs: 'center', sm: 'flex-end' }
              }}>
                <Button 
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownloadPdf(selectedOrder)}
                  sx={{ 
                    borderRadius: '20px',
                    px: 2
                  }}
                >
                  Download
                </Button>
                
                <Button 
                  variant="outlined"
                  color="primary"
                  startIcon={<EmailIcon />}
                  onClick={() => {
                    handleCloseOrderDetails();
                    handleOpenEmailDialog(selectedOrder);
                  }}
                  sx={{ 
                    borderRadius: '20px',
                    px: 2
                  }}
                >
                  Email
                </Button>
                
                <Button
                  variant="contained"
                  onClick={handleCloseOrderDetails}
                  sx={{ 
                    borderRadius: '20px',
                    px: 3
                  }}
                >
                  Close
                </Button>
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={bulkDeleteDialogOpen}
        onClose={() => setBulkDeleteDialogOpen(false)}
        aria-labelledby="bulk-delete-dialog-title"
        PaperProps={{
          sx: { borderRadius: '12px' }
        }}
      >
        <DialogTitle id="bulk-delete-dialog-title" sx={{ pb: 1 }}>
          <Typography variant="h6" color="error">
            Delete Multiple Purchase Orders
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <DeleteIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
            <DialogContentText>
              Are you sure you want to delete {selectedOrders.length} selected purchase orders? This action cannot be undone.
            </DialogContentText>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setBulkDeleteDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleBulkDelete} 
            color="error" 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} /> : null}
          >
            {loading ? 'Deleting...' : 'Delete All Selected'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Alert */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', boxShadow: 4 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Partial Fulfillment Dialog */}
      <Dialog
        open={fulfillmentDialogOpen}
        onClose={handleCloseFulfillmentDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ pb: 1 }}>
          Receive Items - PO #{orderToFulfill?.poNumber || orderToFulfill?.po_number}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" paragraph>
            Enter the quantities received for each item. Leave as 0 if an item was not received.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={partialFulfillment}
                  onChange={(e) => setPartialFulfillment(e.target.checked)}
                />
              }
              label="Partial Fulfillment"
            />
              <Tooltip title="Allow entering quantities that exceed what was originally ordered">
                <FormControlLabel
                  control={
                    <Switch
                      checked={allowExcessQuantity}
                      onChange={(e) => setAllowExcessQuantity(e.target.checked)}
                      color="warning"
                    />
                  }
                  label="Allow Excess Quantity"
                />
              </Tooltip>
            </Box>
            
            <Button 
              variant="outlined" 
              color="primary"
              onClick={handleQuickFulfill}
              startIcon={<CheckCircleOutlineIcon />}
            >
              Mark All as Received
            </Button>
          </Box>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell align="right">Ordered</TableCell>
                  <TableCell align="right">Received</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {receivedItems.map((item) => (
                  <TableRow key={item.itemId}>
                    <TableCell>
                      <Typography variant="body2">{item.productName}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        ID: {item.productId}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{item.orderedQuantity}</TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        size="small"
                        value={item.receivedQuantity}
                        onChange={(e) => handleReceivedQuantityChange(item.itemId, e.target.value)}
                        inputProps={{ 
                          min: 0, 
                          max: allowExcessQuantity ? undefined : item.orderedQuantity 
                        }}
                        sx={{ width: 80 }}
                        error={item.receivedQuantity > item.orderedQuantity && !allowExcessQuantity}
                      />
                    </TableCell>
                    <TableCell>
                      {item.receivedQuantity === 0 ? (
                        <Chip size="small" label="Not Received" color="error" />
                      ) : item.receivedQuantity < item.orderedQuantity ? (
                        <Chip size="small" label="Partial" color="warning" />
                      ) : item.receivedQuantity === item.orderedQuantity ? (
                        <Chip size="small" label="Complete" color="success" />
                      ) : (
                        <Chip size="small" label="Excess" color="info" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {receivedItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="textSecondary">
                        No items in this purchase order
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseFulfillmentDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmitReceivedItems}
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            Submit Received Items
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PurchaseOrders; 