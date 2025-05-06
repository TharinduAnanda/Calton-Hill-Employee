const { executeQuery } = require('../config/db');
const { validationResult } = require('express-validator');

/**
 * Get all inventory items with pagination, search, filtering and sorting
 */
exports.getAllInventory = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      category = '', 
      sortBy = 'name', 
      sortOrder = 'asc' 
    } = req.query;
    
    const offset = (page - 1) * parseInt(limit);
    
    // Build the query with all columns that now exist
    let query = `
      SELECT 
        p.Product_ID,
        p.Name,
        p.SKU,
        p.Description,
        p.Category,
        p.Price,
        p.Image_URL,
        p.image_public_id,
        i.Stock_Level,
        i.Reorder_Level,
        i.Inventory_ID
      FROM 
        product p
      LEFT JOIN 
        inventory i ON p.Product_ID = i.Product_ID
    `;
    
    // Add where clause
    const params = [];
    let whereClause = '';
    
    if (search) {
      whereClause = 'WHERE (p.Name LIKE ? OR p.SKU LIKE ? OR p.Description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (category) {
      if (whereClause) {
        whereClause += ' AND p.Category = ?';
      } else {
        whereClause = 'WHERE p.Category = ?';
      }
      params.push(category);
    }
    
    query += whereClause;
    
    // Add order by clause
    let orderByField;
    switch(sortBy.toLowerCase()) {
      case 'name': orderByField = 'p.Name'; break;
      case 'sku': orderByField = 'p.SKU'; break;
      case 'price': orderByField = 'p.Price'; break;
      case 'stock_level': orderByField = 'i.Stock_Level'; break;
      case 'category': orderByField = 'p.Category'; break;
      default: orderByField = 'p.Name';
    }
    
    query += ` ORDER BY ${orderByField} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
    
    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    // Execute query
    const [items] = await executeQuery(query, params);
    
    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM product p ${whereClause}`;
    const [countResult] = await executeQuery(countQuery, params.slice(0, params.length - 2));
    const total = countResult[0]?.total || 0;
    
    return res.status(200).json({
      success: true,
      data: items,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error in getAllInventory:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve inventory items',
      error: error.message
    });
  }
};

/**
 * Get inventory summary statistics
 */
exports.getInventorySummary = async (req, res) => {
  try {
    // Get total items count
    const [totalItems] = await executeQuery('SELECT COUNT(*) as count FROM inventory');
    
    // Get total inventory value
    const [totalValue] = await executeQuery(`
      SELECT SUM(p.Price * i.Stock_Level) as total_value 
      FROM inventory i
      JOIN product p ON i.Product_ID = p.Product_ID
    `);
    
    // Get low stock items count
    const [lowStockItems] = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM inventory 
      WHERE Stock_Level <= Reorder_Level
    `);
    
    // Return the data
    res.status(200).json({
      success: true,
      data: {
        totalItems: totalItems[0]?.count || 0,
        totalValue: totalValue[0]?.total_value || 0,
        lowStockItems: lowStockItems[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Error fetching inventory summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve inventory summary',
      error: error.message
    });
  }
};

/**
 * Get low stock inventory items
 */
exports.getLowStockItems = async (req, res) => {
  try {
    const { page = 1, limit = 10, threshold } = req.query;
    const offset = (page - 1) * limit;
    
    let thresholdCondition = 'i.Stock_Level <= i.Reorder_Level';
    if (threshold) {
      thresholdCondition = `i.Stock_Level <= ${parseInt(threshold)}`;
    }
    
    const query = `
      SELECT 
        p.Product_ID,
        p.Name,
        p.SKU,
        p.Category,
        i.Stock_Level,
        i.Reorder_Level,
        (i.Reorder_Level - i.Stock_Level) as needed
      FROM inventory i
      JOIN product p ON i.Product_ID = p.Product_ID
      WHERE ${thresholdCondition}
      ORDER BY needed DESC
      LIMIT ? OFFSET ?
    `;
    
    const [items] = await executeQuery(query, [parseInt(limit), offset]);
    
    const [countResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM inventory i WHERE ${thresholdCondition}`
    );
    
    const total = countResult[0]?.total || 0;
    
    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching low stock items:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve low stock items',
      error: error.message
    });
  }
};

/**
 * Get single inventory item by ID
 */
exports.getInventoryById = async (req, res) => {
  try {
    const inventoryId = req.params.id;
    
    if (!inventoryId) {
      return res.status(400).json({ 
        success: false,
        message: 'Inventory ID is required' 
      });
    }

    const query = `
      SELECT 
        i.*,
        p.Name as product_name,
        p.SKU,
        p.Description,
        p.Category,
        p.Price,
        p.Image_URL
      FROM inventory i
      JOIN product p ON i.Product_ID = p.Product_ID
      WHERE i.Inventory_ID = ?
    `;
    
    const [inventory] = await executeQuery(query, [inventoryId]);
    
    if (!inventory || inventory.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Inventory item not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: inventory[0]
    });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching inventory item',
      error: error.message
    });
  }
};

/**
 * Create new inventory item
 */
exports.createInventory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { product_id, stock_level, supplier_id, reorder_level = 5 } = req.body;
    
    const query = `
      INSERT INTO inventory 
        (Product_ID, Stock_Level, Supplier_ID, Reorder_Level, Last_Updated) 
      VALUES 
        (?, ?, ?, ?, NOW())
    `;
    
    const [result] = await executeQuery(query, [
      product_id, 
      stock_level, 
      supplier_id || null, 
      reorder_level
    ]);
    
    // Update product stock level
    await executeQuery(
      'UPDATE product SET Stock_Level = ? WHERE Product_ID = ?',
      [stock_level, product_id]
    );
    
    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create inventory item',
      error: error.message
    });
  }
};

/**
 * Update inventory item
 */
exports.updateInventory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { stock_level, supplier_id, reorder_level } = req.body;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid inventory ID is required'
      });
    }
    
    // Check if inventory exists
    const [inventory] = await executeQuery(
      'SELECT * FROM inventory WHERE Inventory_ID = ?', 
      [id]
    );
    
    if (inventory.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    // Build update query
    let updateQuery = 'UPDATE inventory SET ';
    const params = [];
    const updates = [];
    
    if (stock_level !== undefined) {
      updates.push('Stock_Level = ?');
      params.push(stock_level);
    }
    
    if (supplier_id !== undefined) {
      updates.push('Supplier_ID = ?');
      params.push(supplier_id);
    }
    
    if (reorder_level !== undefined) {
      updates.push('Reorder_Level = ?');
      params.push(reorder_level);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update'
      });
    }
    
    updateQuery += updates.join(', ') + ', Last_Updated = NOW() WHERE Inventory_ID = ?';
    params.push(id);
    
    await executeQuery(updateQuery, params);
    
    // If stock level was updated, update product table too
    if (stock_level !== undefined) {
      await executeQuery(
        'UPDATE product SET Stock_Level = ? WHERE Product_ID = ?',
        [stock_level, inventory[0].Product_ID]
      );
    }
    
    res.status(200).json({
      success: true,
      message: 'Inventory item updated successfully'
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inventory item',
      error: error.message
    });
  }
};

/**
 * Delete inventory item
 */
exports.deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid inventory ID is required'
      });
    }
    
    // Check if inventory exists
    const [inventory] = await executeQuery(
      'SELECT * FROM inventory WHERE Inventory_ID = ?', 
      [id]
    );
    
    if (inventory.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    // Delete the inventory item
    await executeQuery(
      'DELETE FROM inventory WHERE Inventory_ID = ?', 
      [id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete inventory item',
      error: error.message
    });
  }
};

/**
 * Adjust inventory quantity
 */
exports.adjustQuantity = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { quantity_change, adjustment_reason } = req.body;
    
    // Check if inventory exists
    const [inventory] = await executeQuery(`
      SELECT i.*, p.Name as product_name 
      FROM inventory i
      JOIN product p ON i.Product_ID = p.Product_ID
      WHERE i.Inventory_ID = ?
    `, [id]);
    
    if (inventory.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    const currentQuantity = inventory[0].Stock_Level;
    const newQuantity = currentQuantity + parseInt(quantity_change);
    
    // Prevent negative inventory
    if (newQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Adjustment would result in negative inventory'
      });
    }
    
    // Update inventory
    await executeQuery(
      'UPDATE inventory SET Stock_Level = ?, Last_Updated = NOW() WHERE Inventory_ID = ?',
      [newQuantity, id]
    );
    
    // Update product stock level
    await executeQuery(
      'UPDATE product SET Stock_Level = ? WHERE Product_ID = ?',
      [newQuantity, inventory[0].Product_ID]
    );
    
    // Record stock movement
    try {
      await executeQuery(
        `INSERT INTO stock_movement 
          (product_id, quantity_change, movement_type, reference_id, notes, created_by, movement_date)
        VALUES
          (?, ?, ?, ?, ?, ?, NOW())`,
        [
          inventory[0].Product_ID, 
          quantity_change, 
          'ADJUSTMENT', 
          null, 
          adjustment_reason,
          req.user?.userId || null
        ]
      );
    } catch (error) {
      console.warn('Could not record stock movement:', error.message);
    }
    
    res.status(200).json({
      success: true,
      message: `Inventory for ${inventory[0].product_name} adjusted successfully`,
      data: {
        previous_quantity: currentQuantity,
        new_quantity: newQuantity,
        difference: parseInt(quantity_change)
      }
    });
  } catch (error) {
    console.error('Error adjusting inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to adjust inventory quantity',
      error: error.message
    });
  }
};

/**
 * Get inventory item batches
 */
exports.getItemBatches = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, includeExpired = 'false' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Check if inventory exists
    const [inventory] = await executeQuery(
      'SELECT * FROM inventory WHERE Inventory_ID = ?', 
      [id]
    );
    
    if (inventory.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    const showExpired = includeExpired === 'true';
    let whereClause = 'WHERE product_id = ?';
    if (!showExpired) {
      whereClause += ' AND (expiry_date IS NULL OR expiry_date > CURDATE())';
    }
    
    const query = `
      SELECT 
        b.*,
        s.Name as supplier_name
      FROM 
        inventory_batch b
      LEFT JOIN 
        supplier s ON b.supplier_id = s.Supplier_ID
      ${whereClause}
      ORDER BY 
        CASE WHEN expiry_date IS NULL THEN 1 ELSE 0 END,
        expiry_date ASC,
        received_date DESC
      LIMIT ? OFFSET ?
    `;
    
    const [batches] = await executeQuery(query, [
      inventory[0].Product_ID, 
      parseInt(limit), 
      offset
    ]);
    
    // Get total count
    const [countResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM inventory_batch ${whereClause}`,
      [inventory[0].Product_ID]
    );
    
    const total = countResult[0]?.total || 0;
    
    res.status(200).json({
      success: true,
      data: batches,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching item batches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve item batches',
      error: error.message
    });
  }
};

/**
 * Add a batch for an inventory item
 */
exports.addItemBatch = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { 
      batch_number, 
      quantity, 
      cost_per_unit, 
      manufactured_date, 
      expiry_date, 
      supplier_id, 
      notes 
    } = req.body;
    
    // Check if inventory exists
    const [inventory] = await executeQuery(
      'SELECT * FROM inventory WHERE Inventory_ID = ?', 
      [id]
    );
    
    if (inventory.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    // Insert the batch
    const [batchResult] = await executeQuery(
      `INSERT INTO inventory_batch 
        (product_id, batch_number, quantity, cost_per_unit, 
         manufactured_date, expiry_date, received_date, supplier_id, notes)
      VALUES
        (?, ?, ?, ?, ?, ?, CURDATE(), ?, ?)`,
      [
        inventory[0].Product_ID,
        batch_number,
        quantity,
        cost_per_unit,
        manufactured_date || null,
        expiry_date || null,
        supplier_id || null,
        notes || null
      ]
    );
    
    // Update inventory stock level
    await executeQuery(
      'UPDATE inventory SET Stock_Level = Stock_Level + ?, Last_Updated = NOW() WHERE Inventory_ID = ?',
      [quantity, id]
    );
    
    // Update product stock level
    await executeQuery(
      'UPDATE product SET Stock_Level = Stock_Level + ? WHERE Product_ID = ?',
      [quantity, inventory[0].Product_ID]
    );
    
    // Record stock movement
    try {
      await executeQuery(
        `INSERT INTO stock_movement 
          (product_id, quantity_change, movement_type, reference_id, notes, created_by, movement_date)
        VALUES
          (?, ?, ?, ?, ?, ?, NOW())`,
        [
          inventory[0].Product_ID,
          quantity,
          'PURCHASE',
          batchResult.insertId,
          `New batch #${batch_number} received`,
          req.user?.userId || null
        ]
      );
    } catch (error) {
      console.warn('Could not record stock movement:', error.message);
    }
    
    res.status(201).json({
      success: true,
      message: 'Batch added successfully',
      data: { 
        batch_id: batchResult.insertId,
        inventory_id: id,
        product_id: inventory[0].Product_ID
      }
    });
  } catch (error) {
    console.error('Error adding item batch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item batch',
      error: error.message
    });
  }
};

/**
 * Get stock movement history
 */
exports.getStockMovementHistory = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      startDate, 
      endDate, 
      itemId, 
      itemName, 
      type 
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let conditions = [];
    const params = [];
    
    // Build query conditions - don't require any specific condition
    if (startDate) {
      conditions.push('sm.movement_date >= ?');
      params.push(new Date(startDate));
    }
    
    if (endDate) {
      conditions.push('sm.movement_date <= ?');
      params.push(new Date(endDate));
    }
    
    if (itemId) {
      conditions.push('sm.product_id = ?');
      params.push(itemId);
    }
    
    if (itemName) {
      conditions.push('p.Name LIKE ?');
      params.push(`%${itemName}%`);
    }
    
    if (type && type !== 'all') {
      conditions.push('sm.movement_type = ?');
      params.push(type.toUpperCase());
    }
    
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    
    const query = `
      SELECT 
        sm.movement_id,
        sm.product_id,
        sm.quantity_change,
        sm.movement_type,
        sm.reference_id,
        sm.notes,
        sm.created_by,
        sm.movement_date,
        p.Name as product_name,
        p.SKU as product_sku,
        CONCAT(s.First_Name, ' ', s.Last_Name) as user_name
      FROM 
        stock_movement sm
      JOIN 
        product p ON sm.product_id = p.Product_ID
      LEFT JOIN 
        staff s ON sm.created_by = s.Staff_ID
      ${whereClause}
      ORDER BY 
        sm.movement_date DESC
      LIMIT ? OFFSET ?
    `;
    
    params.push(parseInt(limit), offset);
    
    // Get count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM stock_movement sm
      JOIN product p ON sm.product_id = p.Product_ID
      LEFT JOIN staff s ON sm.created_by = s.Staff_ID
      ${whereClause}
    `;
    
    const [movements] = await executeQuery(query, params);
    const [countResult] = await executeQuery(countQuery, params.slice(0, -2));
    
    const totalCount = countResult[0]?.total || 0;
    
    // Format the data to match the frontend expectations
    const formattedMovements = movements.map(movement => ({
      id: movement.movement_id,
      timestamp: movement.movement_date,
      type: mapMovementType(movement.movement_type),
      quantity: Math.abs(movement.quantity_change),
      notes: movement.notes,
      reference: movement.reference_id,
      item: {
        id: movement.product_id,
        name: movement.product_name,
        sku: movement.product_sku
      },
      performedBy: movement.user_name || 'System'
    }));
    
    res.status(200).json({
      success: true,
      data: formattedMovements,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching stock movement history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve stock movement history',
      error: error.message
    });
  }
};

/**
 * Maps database movement types to frontend types
 */
function mapMovementType(dbType) {
  switch (dbType) {
    case 'SALE':
      return 'out';
    case 'PURCHASE':
      return 'in';
    case 'ADJUSTMENT':
      return 'adjustment';
    case 'RETURN':
      return 'returned';
    default:
      return dbType.toLowerCase();
  }
}

/**
 * Record a stock movement (internal use)
 */
exports.recordStockMovement = async (connection, {
  product_id,
  quantity_change,
  movement_type,
  reference_id = null,
  notes = null,
  created_by = null
}) => {
  try {
    if (!product_id || quantity_change === undefined || !movement_type) {
      throw new Error('Missing required fields for stock movement');
    }
    
    const query = `
      INSERT INTO stock_movement 
        (product_id, quantity_change, movement_type, reference_id, notes, created_by, movement_date)
      VALUES
        (?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const params = [product_id, quantity_change, movement_type, reference_id, notes, created_by];
    
    if (connection) {
      await connection.query(query, params);
    } else {
      await executeQuery(query, params);
    }
    
    return true;
  } catch (error) {
    console.error('Error recording stock movement:', error);
    throw error;
  }
};

/**
 * Get inventory forecast
 */
exports.getInventoryForecast = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    // Calculate average daily consumption for each product
    const query = `
      SELECT 
        p.Product_ID,
        p.Name,
        p.SKU,
        i.Stock_Level,
        i.Reorder_Level,
        COALESCE(SUM(ABS(sm.quantity_change)) / NULLIF(COUNT(DISTINCT DATE(sm.movement_date)), 0), 0) as avg_daily_consumption
      FROM 
        inventory i
      JOIN 
        product p ON i.Product_ID = p.Product_ID
      LEFT JOIN 
        stock_movement sm ON p.Product_ID = sm.product_id AND sm.movement_type = 'SALE'
        AND sm.movement_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
      GROUP BY 
        p.Product_ID, p.Name, p.SKU, i.Stock_Level, i.Reorder_Level
    `;
    
    const [rows] = await executeQuery(query);
    
    // Make sure we have valid data before mapping
    if (!rows || !Array.isArray(rows)) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    // Calculate days until reorder needed
    const forecasts = rows.map(item => ({
      ...item,
      days_until_reorder: item.avg_daily_consumption > 0 ? 
        Math.floor((item.Stock_Level - item.Reorder_Level) / item.avg_daily_consumption) : 
        null,
      projected_stock: item.avg_daily_consumption > 0 ?
        Math.max(0, item.Stock_Level - (item.avg_daily_consumption * parseInt(days))) :
        item.Stock_Level
    }));
    
    res.status(200).json({
      success: true,
      data: forecasts
    });
  } catch (error) {
    console.error('Error generating inventory forecast:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate inventory forecast',
      error: error.message
    });
  }
};

/**
 * Generate purchase orders for low stock items
 */
exports.generatePurchaseOrders = async (req, res) => {
  try {
    // Find items needing reorder
    const [lowStockItems] = await executeQuery(`
      SELECT 
        p.Product_ID, p.Name, p.SKU, i.Stock_Level, i.Reorder_Level,
        (i.Reorder_Level - i.Stock_Level) as needed,
        s.Supplier_ID, s.Name as supplier_name
      FROM 
        inventory i
      JOIN 
        product p ON i.Product_ID = p.Product_ID
      LEFT JOIN 
        supplier s ON i.Supplier_ID = s.Supplier_ID
      WHERE 
        i.Stock_Level <= i.Reorder_Level AND i.Supplier_ID IS NOT NULL
      ORDER BY 
        s.Supplier_ID, needed DESC
    `);
    
    if (lowStockItems.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No items need reordering at this time',
        data: []
      });
    }
    
    // Group by supplier
    const supplierGroups = {};
    lowStockItems.forEach(item => {
      if (!supplierGroups[item.Supplier_ID]) {
        supplierGroups[item.Supplier_ID] = {
          supplier_id: item.Supplier_ID,
          supplier_name: item.supplier_name,
          items: []
        };
      }
      supplierGroups[item.Supplier_ID].items.push({
        product_id: item.Product_ID,
        name: item.Name,
        sku: item.SKU,
        quantity_to_order: item.needed * 2, // Order 2x the deficit as a buffer
        current_level: item.Stock_Level
      });
    });
    
    res.status(200).json({
      success: true,
      data: Object.values(supplierGroups)
    });
  } catch (error) {
    console.error('Error generating purchase orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate purchase orders',
      error: error.message
    });
  }
};

/**
 * Get inventory categories
 */
exports.getInventoryCategories = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.Category,
        COUNT(*) as item_count,
        SUM(i.Stock_Level) as total_items,
        SUM(i.Stock_Level * p.Price) as total_value
      FROM 
        inventory i
      JOIN 
        product p ON i.Product_ID = p.Product_ID
      GROUP BY 
        p.Category
      ORDER BY 
        total_value DESC
    `;
    
    const [categories] = await executeQuery(query);
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching inventory categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve inventory categories',
      error: error.message
    });
  }
};

/**
 * Calculate inventory value
 */
exports.calculateInventoryValue = async (req, res) => {
  try {
    const { method = 'fifo' } = req.query;
    
    let valueQuery;
    
    switch (method.toLowerCase()) {
      case 'fifo':
        valueQuery = `
          SELECT 
            p.Product_ID, 
            p.Name, 
            p.SKU,
            i.Stock_Level,
            (SELECT COALESCE(SUM(ib.quantity * ib.cost_per_unit), 0)
             FROM inventory_batch ib
             WHERE ib.product_id = p.Product_ID
             ORDER BY ib.received_date ASC
             LIMIT 1) as inventory_value
          FROM 
            inventory i
          JOIN 
            product p ON i.Product_ID = p.Product_ID
        `;
        break;
        
      case 'lifo':
        valueQuery = `
          SELECT 
            p.Product_ID, 
            p.Name, 
            p.SKU,
            i.Stock_Level,
            (SELECT COALESCE(SUM(ib.quantity * ib.cost_per_unit), 0)
             FROM inventory_batch ib
             WHERE ib.product_id = p.Product_ID
             ORDER BY ib.received_date DESC
             LIMIT 1) as inventory_value
          FROM 
            inventory i
          JOIN 
            product p ON i.Product_ID = p.Product_ID
        `;
        break;
        
      default: // Average cost
        valueQuery = `
          SELECT 
            p.Product_ID, 
            p.Name, 
            p.SKU,
            i.Stock_Level,
            i.Stock_Level * (
              SELECT COALESCE(AVG(cost_per_unit), 0)
              FROM inventory_batch ib
              WHERE ib.product_id = p.Product_ID
            ) as inventory_value
          FROM 
            inventory i
          JOIN 
            product p ON i.Product_ID = p.Product_ID
        `;
    }
    
    const [inventoryValues] = await executeQuery(valueQuery);
    
    res.status(200).json({
      success: true,
      method,
      data: inventoryValues
    });
  } catch (error) {
    console.error('Error calculating inventory value:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate inventory value',
      error: error.message
    });
  }
};

/**
 * Record stock count
 */
exports.recordStockCount = async (req, res) => {
  try {
    const { counts } = req.body;
    
    if (!Array.isArray(counts) || counts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid count data is required'
      });
    }
    
    const results = [];
    
    for (const item of counts) {
      const { product_id, counted_quantity, notes } = item;
      
      // Get current quantity
      const [currentStock] = await executeQuery(
        'SELECT Stock_Level FROM inventory WHERE Product_ID = ?', 
        [product_id]
      );
      
      if (currentStock.length === 0) {
        results.push({
          product_id,
          status: 'error',
          message: 'Product not found'
        });
        continue;
      }
      
      const previousQuantity = currentStock[0].Stock_Level;
      const discrepancy = counted_quantity - previousQuantity;
      
      // Update inventory
      await executeQuery(
        'UPDATE inventory SET Stock_Level = ?, Last_Updated = NOW() WHERE Product_ID = ?',
        [counted_quantity, product_id]
      );
      
      // Update product stock level
      await executeQuery(
        'UPDATE product SET Stock_Level = ? WHERE Product_ID = ?',
        [counted_quantity, product_id]
      );
      
      // Record adjustment
      await executeQuery(
        `INSERT INTO stock_movement 
          (product_id, quantity_change, movement_type, notes, created_by, movement_date)
        VALUES
          (?, ?, ?, ?, ?, NOW())`,
        [
          product_id,
          discrepancy,
          'STOCKCOUNT',
          notes || `Stock count adjustment: ${discrepancy > 0 ? '+' : ''}${discrepancy}`,
          req.user?.userId || null
        ]
      );
      
      results.push({
        product_id,
        previous_quantity: previousQuantity,
        counted_quantity,
        discrepancy,
        status: 'success'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Stock count recorded successfully',
      data: results
    });
  } catch (error) {
    console.error('Error recording stock count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record stock count',
      error: error.message
    });
  }
};

/**
 * Get inventory audit log
 */
exports.getInventoryAuditLog = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      productId, 
      username,
      movementType,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let conditions = [];
    const params = [];
    
    if (startDate && endDate) {
      conditions.push('sm.movement_date BETWEEN ? AND ?');
      params.push(startDate, endDate);
    }
    
    if (productId) {
      conditions.push('sm.product_id = ?');
      params.push(productId);
    }
    
    if (username) {
      conditions.push('(CONCAT(s.first_name, " ", s.last_name) LIKE ?)');
      params.push(`%${username}%`);
    }
    
    if (movementType) {
      conditions.push('sm.movement_type = ?');
      params.push(movementType);
    }
    
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    
    const query = `
      SELECT 
        sm.*,
        p.Name as product_name,
        p.SKU as product_sku,
        CONCAT(s.first_name, ' ', s.last_name) as user_name
      FROM 
        stock_movement sm
      JOIN 
        product p ON sm.product_id = p.Product_ID
      LEFT JOIN 
        staff s ON sm.created_by = s.Staff_ID
      ${whereClause}
      ORDER BY 
        sm.movement_date DESC
      LIMIT ? OFFSET ?
    `;
    
    params.push(parseInt(limit), offset);
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM stock_movement sm
      LEFT JOIN staff s ON sm.created_by = s.Staff_ID
      ${whereClause}
    `;
    
    const [movements] = await executeQuery(query, params);
    const [countResult] = await executeQuery(countQuery, params.slice(0, -2));
    
    const totalCount = countResult[0]?.total || 0;
    
    res.status(200).json({
      success: true,
      data: movements,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching inventory audit log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve inventory audit log',
      error: error.message
    });
  }
};

/**
 * Get inventory turnover report
 */
exports.getInventoryTurnoverReport = async (req, res) => {
  try {
    const { period = 90 } = req.query; // Days to analyze
    
    const query = `
      SELECT 
        p.Product_ID,
        p.Name,
        p.SKU,
        i.Stock_Level as current_stock,
        IFNULL(SUM(ABS(sm.quantity_change)), 0) as units_sold,
        AVG(i.Stock_Level) as avg_inventory_level,
        IFNULL(SUM(ABS(sm.quantity_change)), 0) / GREATEST(AVG(i.Stock_Level), 1) as turnover_rate,
        COUNT(DISTINCT CASE WHEN sm.quantity_change < 0 THEN DATE(sm.movement_date) END) as days_with_sales
      FROM 
        inventory i
      JOIN 
        product p ON i.Product_ID = p.Product_ID
      LEFT JOIN 
        stock_movement sm ON p.Product_ID = sm.product_id 
        AND sm.movement_type = 'SALE'
        AND sm.movement_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY 
        p.Product_ID, p.Name, p.SKU, i.Stock_Level
      ORDER BY 
        turnover_rate DESC
    `;
    
    const [turnoverData] = await executeQuery(query, [parseInt(period)]);
    
    // Calculate avg days to sell
    const enrichedData = turnoverData.map(item => ({
      ...item,
      avg_days_to_sell: item.days_with_sales > 0 ? 
        Math.round(parseInt(period) / item.days_with_sales) : null,
      inventory_health: calculateInventoryHealth(item.turnover_rate, item.current_stock, item.units_sold)
    }));
    
    res.status(200).json({
      success: true,
      period_days: parseInt(period),
      data: enrichedData
    });
  } catch (error) {
    console.error('Error generating inventory turnover report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate inventory turnover report',
      error: error.message
    });
  }
};

function calculateInventoryHealth(turnoverRate, currentStock, unitsSold) {
  if (turnoverRate === 0) return 'Stagnant';
  if (turnoverRate < 0.5) return 'Slow-moving';
  if (turnoverRate > 3) return 'Fast-moving';
  return 'Healthy';
}