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

// Get advanced order statistics for managers
exports.getManagerOrderStats = async (req, res) => {
  try {
    // Get orders by payment status
    const [paymentStatusCounts] = await db.query(`
      SELECT 
        Payment_Status as status,
        COUNT(*) as count,
        SUM(Total_Amount) as total
      FROM customerorder
      GROUP BY Payment_Status
    `);
    
    // Get orders by payment method
    const [paymentMethodCounts] = await db.query(`
      SELECT 
        payment_method as method,
        COUNT(*) as count,
        SUM(Total_Amount) as total
      FROM customerorder
      WHERE payment_method IS NOT NULL
      GROUP BY payment_method
    `);
    
    // Get orders by source
    const [sourceCounts] = await db.query(`
      SELECT 
        source,
        COUNT(*) as count,
        SUM(Total_Amount) as total
      FROM customerorder
      WHERE source IS NOT NULL
      GROUP BY source
    `);
    
    // Get daily sales for the past 30 days
    const [dailySales] = await db.query(`
      SELECT 
        DATE(Order_Date) as date,
        COUNT(*) as orderCount,
        SUM(Total_Amount) as total
      FROM customerorder
      WHERE Order_Date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(Order_Date)
      ORDER BY date
    `);
    
    res.status(200).json({
      paymentStatusCounts,
      paymentMethodCounts,
      sourceCounts,
      dailySales
    });
  } catch (error) {
    console.error('Error fetching manager order statistics:', error);
    res.status(500).json({ message: 'Failed to retrieve manager order statistics' });
  }
};

// Update order payment details
exports.updateOrderPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentReference, paymentMethod } = req.body;
    
    const updateFields = [];
    const updateValues = [];
    
    if (paymentStatus) {
      updateFields.push('Payment_Status = ?');
      updateValues.push(paymentStatus);
    }
    
    if (paymentReference) {
      updateFields.push('payment_reference = ?');
      updateValues.push(paymentReference);
    }
    
    if (paymentMethod) {
      updateFields.push('payment_method = ?');
      updateValues.push(paymentMethod);
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
    
    res.status(200).json({ message: 'Order payment details updated successfully' });
  } catch (error) {
    console.error('Error updating order payment details:', error);
    res.status(500).json({ message: 'Failed to update order payment details' });
  }
};

// Assign staff to order
exports.assignStaffToOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { staffId } = req.body;
    
    if (!staffId) {
      return res.status(400).json({ message: 'Staff ID is required' });
    }
    
    const [result] = await db.query(
      `UPDATE customerorder SET Staff_ID = ? WHERE Order_ID = ?`,
      [staffId, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json({ message: 'Staff assigned to order successfully' });
  } catch (error) {
    console.error('Error assigning staff to order:', error);
    res.status(500).json({ message: 'Failed to assign staff to order' });
  }
};

// Get orders with filters for managers
exports.getFilteredOrders = async (req, res) => {
  try {
    const {
      paymentStatus,
      deliveryStatus,
      startDate,
      endDate,
      customerId,
      staffId,
      source,
      sort = 'Order_Date',
      order = 'DESC',
      limit = 100,
      offset = 0
    } = req.query;
    
    // Build WHERE clause
    const whereConditions = [];
    const queryParams = [];
    
    if (paymentStatus) {
      whereConditions.push('co.Payment_Status = ?');
      queryParams.push(paymentStatus);
    }
    
    if (deliveryStatus) {
      whereConditions.push('co.Delivery_Status = ?');
      queryParams.push(deliveryStatus);
    }
    
    if (startDate) {
      whereConditions.push('co.Order_Date >= ?');
      queryParams.push(startDate);
    }
    
    if (endDate) {
      whereConditions.push('co.Order_Date <= ?');
      queryParams.push(endDate);
    }
    
    if (customerId) {
      whereConditions.push('co.Customer_ID = ?');
      queryParams.push(customerId);
    }
    
    if (staffId) {
      whereConditions.push('co.Staff_ID = ?');
      queryParams.push(staffId);
    }
    
    if (source) {
      whereConditions.push('co.source = ?');
      queryParams.push(source);
    }
    
    // Build WHERE clause string
    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : '';
    
    // Validate sort column to prevent SQL injection
    const allowedSortColumns = [
      'Order_ID', 'Order_Date', 'Total_Amount', 
      'Payment_Status', 'Delivery_Status', 'CustomerName'
    ];
    
    const sortColumn = allowedSortColumns.includes(sort) ? sort : 'Order_Date';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    // Add pagination params
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const [orders] = await db.query(
      `SELECT 
        co.*, 
        c.NAME as CustomerName, 
        s.NAME as StaffName,
        COUNT(oi.Order_Item_ID) as ItemCount,
        SUM(oi.Quantity) as TotalQuantity 
      FROM customerorder co
      JOIN customer c ON co.Customer_ID = c.ID
      LEFT JOIN staff s ON co.Staff_ID = s.Staff_ID
      LEFT JOIN order_item oi ON co.Order_ID = oi.Order_ID
      ${whereClause}
      GROUP BY co.Order_ID
      ORDER BY ${sortColumn} ${sortOrder}
      LIMIT ? OFFSET ?`,
      queryParams
    );
    
    // Get total count for pagination
    const [totalResult] = await db.query(
      `SELECT COUNT(DISTINCT co.Order_ID) as total 
       FROM customerorder co
       ${whereClause}`,
      whereConditions.length > 0 ? queryParams.slice(0, -2) : []
    );
    
    res.status(200).json({
      orders,
      total: totalResult[0].total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching filtered orders:', error);
    res.status(500).json({ message: 'Failed to retrieve orders' });
  }
};