const db = require('../config/db');

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT co.*, c.NAME as CustomerName, 
        COUNT(oi.Order_Item_ID) as ItemCount,
        SUM(oi.Quantity) as TotalQuantity
      FROM customerorder co
      JOIN customer c ON co.Customer_ID = c.ID
      LEFT JOIN order_item oi ON co.Order_ID = oi.Order_ID
      GROUP BY co.Order_ID
      ORDER BY co.Order_Date DESC
    `);
    
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to retrieve orders' });
  }
};

// Get order by ID with items
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get order details
    const [orders] = await db.query(
      `SELECT co.*, c.NAME as CustomerName 
       FROM customerorder co
       JOIN customer c ON co.Customer_ID = c.ID
       WHERE co.Order_ID = ?`, 
      [id]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const order = orders[0];
    
    // Get order items with product details
    const [items] = await db.query(
      `SELECT oi.*, p.Name as ProductName, p.Price, p.Image_URL 
       FROM order_item oi
       JOIN product p ON oi.Product_ID = p.Product_ID
       WHERE oi.Order_ID = ?`,
      [id]
    );
    
    order.items = items;
    
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Failed to retrieve order' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, deliveryStatus } = req.body;
    
    const updateFields = [];
    const updateValues = [];
    
    if (paymentStatus) {
      updateFields.push('Payment_Status = ?');
      updateValues.push(paymentStatus);
    }
    
    if (deliveryStatus) {
      updateFields.push('Delivery_Status = ?');
      updateValues.push(deliveryStatus);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No update fields provided' });
    }
    
    updateValues.push(id);
    
    const [result] = await db.query(
      `UPDATE customerorder SET ${updateFields.join(', ')} WHERE Order_ID = ?`,
      updateValues
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

// Create a new order (for testing purposes)
exports.createOrder = async (req, res) => {
  try {
    const { customerId, items, totalAmount } = req.body;
    
    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid order data' });
    }
    
    // Start transaction
    await db.query('START TRANSACTION');
    
    // Create order
    const [orderResult] = await db.query(
      `INSERT INTO customerorder (Order_Date, Total_Amount, Payment_Status, Delivery_Status, Customer_ID) 
       VALUES (CURDATE(), ?, 'pending', 'processing', ?)`,
      [totalAmount, customerId]
    );
    
    const orderId = orderResult.insertId;
    
    // Create order items
    for (const item of items) {
      await db.query(
        'INSERT INTO order_item (Order_ID, Product_ID, Quantity) VALUES (?, ?, ?)',
        [orderId, item.productId, item.quantity]
      );
    }
    
    // Commit transaction
    await db.query('COMMIT');
    
    res.status(201).json({ 
      message: 'Order created successfully',
      orderId
    });
  } catch (error) {
    // Rollback on error
    await db.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

// Get order statistics
exports.getOrderStats = async (req, res) => {
  try {
    // Get total orders count
    const [totalOrders] = await db.query('SELECT COUNT(*) as count FROM customerorder');
    
    // Get orders by status
    const [statusCounts] = await db.query(`
      SELECT 
        SUM(CASE WHEN Delivery_Status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN Delivery_Status = 'processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN Delivery_Status = 'shipped' THEN 1 ELSE 0 END) as shipped
      FROM customerorder
    `);
    
    // Get total revenue (from paid orders)
    const [revenue] = await db.query(`
      SELECT SUM(Total_Amount) as totalRevenue
      FROM customerorder
      WHERE Payment_Status = 'paid'
    `);
    
    res.status(200).json({
      totalOrders: totalOrders[0].count,
      statusCounts: statusCounts[0],
      totalRevenue: revenue[0].totalRevenue || 0
    });
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    res.status(500).json({ message: 'Failed to retrieve order statistics' });
  }
};