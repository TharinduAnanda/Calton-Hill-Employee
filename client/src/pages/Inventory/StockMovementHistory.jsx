// src/pages/Inventory/StockMovementHistory.jsx
import React, { useState, useEffect } from 'react';
import {   Box, Paper, Table, TableBody, TableCell, TableContainer,   TableHead, TableRow, TablePagination, Typography, Chip,  FormControl, InputLabel, Select, MenuItem, TextField,  CircularProgress, Alert, Grid, IconButton, Tooltip, Button,  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {   Search as SearchIcon,   FilterList as FilterIcon,   CloudDownload as DownloadIcon,   BarChart as ChartIcon,  PictureAsPdf as PdfIcon,  Print as PrintIcon,  Close as CloseIcon} from '@mui/icons-material';
import inventoryService from '../../services/inventoryService';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';

const StockMovementHistory = () => {  
  const [movements, setMovements] = useState([]);  
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState(null);  
  const [page, setPage] = useState(0);  
  const [rowsPerPage, setRowsPerPage] = useState(10);  
  const [searchTerm, setSearchTerm] = useState('');  
  const [startDate, setStartDate] = useState(null);  
  const [endDate, setEndDate] = useState(null);  
  const [movementType, setMovementType] = useState('');  
  const [showChart, setShowChart] = useState(false);  
  const [chartData, setChartData] = useState([]);  
  const [selectedItem, setSelectedItem] = useState('');  
  const [itemOptions, setItemOptions] = useState([]);  
  const [debugInfo, setDebugInfo] = useState('');    
  // PDF State  
  const [pdfLoading, setPdfLoading] = useState(false);  
  const [pdfUrl, setPdfUrl] = useState(null);  
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  
  const fetchMovements = async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo('Fetching movement data...');
      
      console.log('Fetching stock movement history...');
      const response = await inventoryService.getStockMovementHistory({
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : '',
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : '',
        itemName: searchTerm,
        type: movementType
      });
      
      console.log('Raw response from service:', response);
      setDebugInfo(prev => prev + `\nReceived ${response ? (Array.isArray(response) ? response.length : 'non-array') : 'null'} response`);
      
      if (!response) {
        console.warn('Stock movement response is null or undefined');
        setDebugInfo(prev => prev + '\nResponse was null/undefined');
        setMovements([]);
        return;
      }
      
      if (!Array.isArray(response)) {
        console.warn('Response is not an array:', response);
        setDebugInfo(prev => prev + `\nResponse type: ${typeof response}`);
        
        // Try to extract array from response if it's an object
        if (typeof response === 'object') {
          const possibleArrays = Object.values(response).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            setDebugInfo(prev => prev + `\nFound array with ${possibleArrays[0].length} items in response object`);
            setMovements(formatMovementData(possibleArrays[0]));
            return;
          }
        }
        
        // If we can't find an array, use empty array
        setMovements([]);
        return;
      }
      
      // If we got here, response is an array
      setDebugInfo(prev => prev + `\nProcessing array with ${response.length} items`);
      setMovements(formatMovementData(response));
      
    } catch (err) {
      console.error('Error fetching stock movements:', err);
      setError(err.message || 'Failed to fetch stock movement history');
      setDebugInfo(prev => prev + `\nError: ${err.message}`);
      setMovements([]);
      setItemOptions([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Format movement data to a consistent format
  const formatMovementData = (data) => {
    console.log('Formatting movement data:', data);
    
    if (!Array.isArray(data)) {
      console.warn('formatMovementData received non-array:', data);
      return [];
    }
    
    const formattedMovements = data.map(item => {
      // Extract all possible fields with fallbacks
      const formattedItem = {
        id: item?.id || item?.movement_id || `movement-${Math.random().toString(36).substr(2, 9)}`,
        date: new Date(item?.date || item?.timestamp || item?.created_at || item?.movement_date || new Date()),
        itemName: item?.item?.name || item?.item_name || item?.product_name || item?.name || 'Unknown Item',
        previousQuantity: item?.previous_quantity || 0,
        quantityChange: item?.quantity_change || 0,
        newQuantity: item?.new_quantity || 0,
        type: item?.type || item?.movement_type || 'Unknown',
        reason: item?.reason || item?.adjustment_reason || item?.notes || '',
        username: item?.performedBy || item?.username || item?.user || item?.created_by || 'System',
        notes: item?.notes || ''
      };
      
      console.log('Formatted movement item:', formattedItem);
      return formattedItem;
    });
    
    // Extract unique items for filter dropdown
    const uniqueItems = [...new Set(formattedMovements.map(m => m.itemName))];
    setItemOptions(uniqueItems);
    
    // If chart view is active, prepare chart data
    if (showChart) {
      prepareChartData(formattedMovements);
    }
    
    return formattedMovements;
  };
  
  // Run fetch when component mounts or filters change
  useEffect(() => {
    fetchMovements();
  }, [startDate, endDate, movementType]);
  
  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    fetchMovements();
  };
  
  useEffect(() => {
    if (showChart && movements.length > 0) {
      prepareChartData(movements);
    }
  }, [showChart, selectedItem]);
  
  // Prepare data for the line chart
  const prepareChartData = (data) => {
    let filteredData = data;
    if (selectedItem) {
      filteredData = data.filter(item => item.itemName === selectedItem);
    }
    
    // Sort by date
    filteredData.sort((a, b) => a.date - b.date);
    
    // Group by date for the chart
    const groupedByDate = filteredData.reduce((acc, movement) => {
      const dateStr = format(movement.date, 'yyyy-MM-dd');
      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          quantity: 0
        };
      }
      
      // This logic depends on what you want to show in the chart
      // For showing ending inventory level at each date:
      acc[dateStr].quantity = movement.newQuantity;
      
      return acc;
    }, {});
    
    // Convert to array
    const chartData = Object.values(groupedByDate);
    setChartData(chartData);
  };
  
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
  
  const exportToCsv = () => {
    // Filter movements based on current filters
    let filteredMovements = movements;
    if (searchTerm) {
      filteredMovements = filteredMovements.filter(m => 
        m.itemName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Transform the data into CSV format
    const headers = ['Date', 'Item', 'Previous Qty', 'Change', 'New Qty', 'Type', 'Reason', 'User', 'Notes'];
    const csvRows = [headers.join(',')];
    
    filteredMovements.forEach(movement => {
      const row = [
        format(movement.date, 'yyyy-MM-dd HH:mm'),
        `"${movement.itemName}"`,
        movement.previousQuantity,
        movement.quantityChange,
        movement.newQuantity,
        `"${movement.type}"`,
        `"${movement.reason}"`,
        `"${movement.username}"`,
        `"${movement.notes}"`
      ];
      csvRows.push(row.join(','));
    });
    
    // Create and download the CSV file
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `stock-movements-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Filter movements based on search term
  const filteredMovements = movements.filter(movement => {
    if (!searchTerm) return true;
    return movement.itemName.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Get movement type chip
  const getMovementTypeChip = (type) => {
    switch(type.toLowerCase()) {
      case 'sale':
      case 'order':
      case 'decrease':
        return <Chip label={type} color="error" size="small" />;
      case 'purchase':
      case 'return':
      case 'increase':
        return <Chip label={type} color="success" size="small" />;
      case 'adjustment':
      case 'count':
        return <Chip label={type} color="primary" size="small" />;
      default:
        return <Chip label={type} color="default" size="small" />;
    }
  };
  
  // Generate PDF function
  const generatePdf = async () => {
    try {
      // Set loading state
      setPdfLoading(true);
      setError(null);
      
      // Get the current filter settings
      const options = {
        startDate: startDate,
        endDate: endDate,
        itemName: searchTerm,
        type: movementType,
        limit: 500 // Use a higher limit for PDF reports
      };
      
      // Get the PDF URL from the service
      const pdfUrl = inventoryService.getStockMovementPdfUrl(options);
      console.log('Accessing PDF at:', pdfUrl);
      
      // Method 1: Create an iframe to handle the download (best for CORS issues)
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfUrl;
      document.body.appendChild(iframe);
      
      // Clean up iframe after a moment (it should trigger the download)
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
      
      // Method 2: Also try window.open as a backup approach
      window.open(pdfUrl, '_blank');
      
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Could not generate PDF. Please try again or contact support.');
    } finally {
      setPdfLoading(false);
    }
  };
  
  // Function to download the PDF
  const downloadPdf = () => {
    if (!pdfUrl) return;
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `stock-movements-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Function to close the PDF preview and clean up
  const closePdfPreview = () => {
    setShowPdfPreview(false);
    // Clean up the URL object when dialog is closed
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom component="div">
          Stock Movement History
        </Typography>
      
      {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Search by Item Name"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                endAdornment: (
                  <IconButton size="small" onClick={handleSearch}>
                    <SearchIcon />
                  </IconButton>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
              <Grid item xs={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <Grid container spacing={1}>
              <Grid item>
                <Tooltip title="Toggle Chart View">
                  <Button
                    variant={showChart ? "contained" : "outlined"}
                    color="primary"
                    size="small"
                    startIcon={<ChartIcon />}
                    onClick={() => setShowChart(!showChart)}
                  >
                    Chart
                  </Button>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="Export to CSV">
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={exportToCsv}
                  >
                    Export
                  </Button>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="Generate PDF">
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    startIcon={<PdfIcon />}
                    onClick={generatePdf}
                    disabled={pdfLoading}
                  >
                    PDF
                  </Button>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <FormControl variant="outlined" size="small" fullWidth>
              <InputLabel id="movement-type-label">Filter by Type</InputLabel>
              <Select
                labelId="movement-type-label"
                value={movementType}
                onChange={(e) => setMovementType(e.target.value)}
                label="Filter by Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="sale">Sale</MenuItem>
                <MenuItem value="purchase">Purchase</MenuItem>
                <MenuItem value="return">Return</MenuItem>
                <MenuItem value="adjustment">Adjustment</MenuItem>
                <MenuItem value="count">Inventory Count</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {showChart ? (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <FormControl variant="outlined" size="small" fullWidth>
                  <InputLabel id="chart-item-label">Select Item</InputLabel>
                  <Select
                    labelId="chart-item-label"
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    label="Select Item"
                  >
                    <MenuItem value="">All Items</MenuItem>
                    {itemOptions.map(item => (
                      <MenuItem key={item} value={item}>{item}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          ) : chartData.length > 0 ? (
            <Box sx={{ height: 400, width: '100%' }}>
              <ResponsiveContainer>
                <LineChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="quantity" 
                    name="Stock Level" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
              No data available to display chart
            </Typography>
          )}
        </Paper>
      ) : (
        <Paper>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Table stickyHeader aria-label="stock movements table">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Previous Qty</TableCell>
                    <TableCell align="right">Change</TableCell>
                    <TableCell align="right">New Qty</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>User</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMovements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No stock movement records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMovements
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((movement) => (
                        <TableRow 
                          key={movement.id} 
                          hover
                          sx={{
                            backgroundColor: movement.quantityChange > 0 
                              ? 'rgba(46, 125, 50, 0.08)' 
                              : movement.quantityChange < 0 
                                ? 'rgba(211, 47, 47, 0.08)' 
                                : 'inherit'
                          }}
                        >
                          <TableCell>
                            {format(movement.date, 'yyyy-MM-dd HH:mm')}
                          </TableCell>
                          <TableCell>{movement.itemName}</TableCell>
                          <TableCell align="right">{movement.previousQuantity}</TableCell>
                          <TableCell 
                            align="right"
                            sx={{ 
                              color: movement.quantityChange > 0 
                                ? 'success.main' 
                                : movement.quantityChange < 0 
                                  ? 'error.main' 
                                  : 'text.primary',
                              fontWeight: 'bold'
                            }}
                          >
                            {movement.quantityChange > 0 ? `+${movement.quantityChange}` : movement.quantityChange}
                          </TableCell>
                          <TableCell align="right">{movement.newQuantity}</TableCell>
                          <TableCell>{getMovementTypeChip(movement.type)}</TableCell>
                          <TableCell>{movement.reason}</TableCell>
                          <TableCell>{movement.username}</TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredMovements.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* PDF Preview Dialog */}
      <Dialog
        open={showPdfPreview}
        onClose={closePdfPreview}
        maxWidth="lg"
        fullWidth
        aria-labelledby="pdf-preview-dialog-title"
      >
        <DialogTitle id="pdf-preview-dialog-title">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Stock Movement History PDF Preview</Typography>
            <IconButton edge="end" color="inherit" onClick={closePdfPreview} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {pdfUrl ? (
            <Box sx={{ height: '70vh', width: '100%' }}>
              <iframe
                src={pdfUrl}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Stock Movement PDF Preview"
              />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closePdfPreview}>Close</Button>
          <Button onClick={downloadPdf} variant="contained" color="primary" startIcon={<DownloadIcon />}>
            Download PDF
          </Button>
          <Button onClick={() => { window.open(pdfUrl, '_blank'); }} color="primary" startIcon={<PrintIcon />}>
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StockMovementHistory;