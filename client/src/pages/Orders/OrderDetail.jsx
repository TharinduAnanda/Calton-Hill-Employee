// src/pages/Orders/OrderDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Card, CardContent, Typography, Grid, Divider, 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Button, Chip
} from '@mui/material';
import { toast } from 'react-toastify';
import { getOrderById, updateOrderStatus } from '../../services/orderService';
import Loading from '../../components/common/Loading';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await getOrderById(id);
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
      setOrder({ ...order, status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'warning';
      case 'Processing':
        return 'info';
      case 'Shipped':
        return 'primary';
      case 'Delivered':
        return 'success';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const calculateTotal = () => {
    if (!order || !order.items) return 0;
    return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  if (loading) {
    return <Loading />;
  }

  if (!order) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error">Order not found</Typography>
        <Button variant="contained" onClick={() => navigate('/orders')} sx={{ mt: 2 }}>
          Back to Orders
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Order #{order.orderNumber}</Typography>
        <Button variant="outlined" onClick={() => navigate('/orders')}>
          Back to Orders
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Order Details</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1">
                  <strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}
                </Typography>
                <Chip 
                  label={order.status} 
                  color={getStatusColor(order.status)} 
                  size="small" 
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>Customer Information</Typography>
              <Typography variant="body2">
                <strong>Name:</strong> {order.customer.name}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {order.customer.email}
              </Typography>
              <Typography variant="body2">
                <strong>Phone:</strong> {order.customer.phone}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>Shipping Address</Typography>
              <Typography variant="body2">{order.shippingAddress.street}</Typography>
              <Typography variant="body2">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </Typography>
              <Typography variant="body2">{order.shippingAddress.country}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Order Status</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  color="primary"
                  disabled={order.status === 'Processing'}
                  onClick={() => handleStatusChange('Processing')}
                >
                  Mark as Processing
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary"
                  disabled={order.status === 'Shipped'}
                  onClick={() => handleStatusChange('Shipped')}
                >
                  Mark as Shipped
                </Button>
                <Button 
                  variant="outlined" 
                  color="success"
                  disabled={order.status === 'Delivered'}
                  onClick={() => handleStatusChange('Delivered')}
                >
                  Mark as Delivered
                </Button>
                <Button 
                  variant="outlined" 
                  color="error"
                  disabled={order.status === 'Cancelled'}
                  onClick={() => handleStatusChange('Cancelled')}
                >
                  Cancel Order
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Order Items</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>SKU</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          ${(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} />
                      <TableCell align="right">
                        <Typography variant="subtitle1">Subtotal:</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle1">${calculateTotal().toFixed(2)}</Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} />
                      <TableCell align="right">
                        <Typography variant="subtitle1">Shipping:</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle1">${order.shippingCost?.toFixed(2) || '0.00'}</Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} />
                      <TableCell align="right">
                        <Typography variant="subtitle1"><strong>Total:</strong></Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle1">
                          <strong>${(calculateTotal() + (order.shippingCost || 0)).toFixed(2)}</strong>
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderDetail;