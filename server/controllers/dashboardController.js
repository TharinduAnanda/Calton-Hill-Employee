const { executeQuery } = require('../config/db');

/**
 * Get summary dashboard data for staff or owner dashboards
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDashboardSummary = async (req, res) => {
  try {
    // Get user info from auth middleware
    const { userId, role } = req.user || {};

    // Base summary data
    let summary = {
      totalProducts: 0,
      totalInventoryItems: 0,
      lowStockItems: 0,
      totalValue: 0,
      activeOrders: 0,
      productChange: 5.2, // Sample data
      inventoryChange: 2.8, // Sample data
      orderChange: -3.1, // Sample data
      valueChange: 4.5 // Sample data
    };

    // Get total products
    const [products] = await executeQuery(
      'SELECT COUNT(*) as count FROM product'
    );
    summary.totalProducts = products[0]?.count || 0;

    // Get inventory summary
    const [inventory] = await executeQuery(`
      SELECT 
        COUNT(*) as totalItems,
        SUM(CASE WHEN Quantity <= Reorder_Level THEN 1 ELSE 0 END) as lowStockCount,
        SUM(Quantity * Cost_Per_Unit) as totalValue
      FROM inventory
    `);
    
    summary.totalInventoryItems = inventory[0]?.totalItems || 0;
    summary.lowStockItems = inventory[0]?.lowStockCount || 0;
    summary.totalValue = inventory[0]?.totalValue || 0;

    // Get active orders count
    const [orders] = await executeQuery(`
      SELECT COUNT(*) as activeCount
      FROM customerorder
      WHERE Delivery_Status IN ('processing', 'shipped')
    `);
    summary.activeOrders = orders[0]?.activeCount || 0;

    // Get recent orders
    const [recentOrders] = await executeQuery(`
      SELECT 
        co.Order_ID as id,
        co.Order_ID as orderNumber,
        co.Order_Date as date,
        co.Total_Amount as total,
        co.Delivery_Status as status,
        CONCAT(c.First_Name, ' ', c.Last_Name) as customer
      FROM customerorder co
      LEFT JOIN customer c ON co.Customer_ID = c.Customer_ID
      ORDER BY co.Order_Date DESC
      LIMIT 5
    `);

    // Get low stock items
    const [lowStockItems] = await executeQuery(`
      SELECT 
        i.Inventory_ID as id,
        p.Name as name,
        p.SKU as sku,
        i.Quantity as quantity,
        i.Reorder_Level as reorderThreshold,
        s.Name as supplier
      FROM inventory i
      JOIN product p ON i.Product_ID = p.Product_ID
      LEFT JOIN supplier s ON p.Supplier_ID = s.Supplier_ID
      WHERE i.Quantity <= i.Reorder_Level
      ORDER BY (i.Reorder_Level - i.Quantity) DESC
      LIMIT 5
    `);

    // Sample sales data for charts
    const salesData = [
      { month: 'Jan', sales: 4000, orders: 24 },
      { month: 'Feb', sales: 3000, orders: 13 },
      { month: 'Mar', sales: 2000, orders: 18 },
      { month: 'Apr', sales: 2780, orders: 22 },
      { month: 'May', sales: 1890, orders: 17 },
      { month: 'Jun', sales: 2390, orders: 20 },
      { month: 'Jul', sales: 3490, orders: 28 }
    ];

    // Sample inventory value data for charts
    const inventoryValue = [
      { category: 'Electronics', value: 4000 },
      { category: 'Clothing', value: 3000 },
      { category: 'Food', value: 2000 },
      { category: 'Books', value: 2780 },
      { category: 'Tools', value: 1890 }
    ];

    // Return dashboard data
    res.json({
      success: true,
      data: {
        summary,
        recentOrders,
        lowStockItems,
        salesData,
        inventoryValue
      }
    });
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard summary'
    });
  }
};

/**
 * Get recent activity data
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRecentActivity = async (req, res) => {
  try {
    // Get user info from auth middleware
    const { userId, role } = req.user || {};
    
    // Sample activity data (implement real data fetching from your database)
    const activities = [
      {
        id: 1,
        type: 'order',
        message: 'New order #12345 was placed',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        meta: { orderId: 12345 }
      },
      {
        id: 2,
        type: 'inventory',
        message: 'Product "Wireless Headphones" is running low on stock',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        meta: { productId: 78, currentStock: 2 }
      },
      {
        id: 3,
        type: 'user',
        message: 'Staff member Jane Smith logged in',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        meta: { staffId: 5 }
      }
    ];
    
    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error getting recent activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent activity'
    });
  }
};