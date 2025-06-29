const { executeQuery } = require('../config/db');
const { validationResult } = require('express-validator');
const { createStockMovementPdf, createInventoryTurnoverPdf } = require('../utils/pdfGenerator');
const { formatDate } = require('../utils/validation');

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
      sortOrder = 'asc',
      product_id = null
    } = req.query;
    
    // If a specific product_id is provided, return just that inventory record
    if (product_id) {
      console.log(`Getting inventory for specific product ID: ${product_id}`);
      const query = `
        SELECT 
          i.*,
          p.Name,
          p.SKU,
          p.Description,
          p.Category,
          p.Price
        FROM 
          inventory i
        LEFT JOIN 
          product p ON i.Product_ID = p.Product_ID
        WHERE 
          i.Product_ID = ?
      `;
      
      const inventoryItems = await executeQuery(query, [product_id]);
      console.log(`Found ${inventoryItems.length} inventory records for product #${product_id}`);
      
      if (inventoryItems.length > 0) {
        console.log('Inventory data:', inventoryItems[0]);
        return res.status(200).json(inventoryItems);
      } else {
        // If no inventory record exists yet, look up the product and return product data
        const productQuery = `SELECT * FROM product WHERE Product_ID = ?`;
        const productData = await executeQuery(productQuery, [product_id]);
        
        if (productData.length > 0) {
          console.log('No inventory record, returning product data:', productData[0]);
          // Create a placeholder inventory record based on product data
          const placeholderInventory = {
            Product_ID: productData[0].Product_ID,
            Stock_Level: productData[0].Stock_Level || 0,
            Reorder_Level: productData[0].Reorder_Level || 20,
            Name: productData[0].Name,
            SKU: productData[0].SKU,
            Price: productData[0].Price
          };
          
          return res.status(200).json([placeholderInventory]);
        }
        
        return res.status(200).json([]);
      }
    }
    
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
        i.reorder_level,
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
    console.log('Fetching inventory summary with corrected column cases');
    
    // Count products as inventory items
    const [totalItemsResult] = await executeQuery('SELECT COUNT(*) as count FROM product');
    const totalItems = totalItemsResult[0]?.count || 0;
    
    // Get total inventory value based on product prices
    const [totalValueResult] = await executeQuery(`
      SELECT SUM(p.Price * COALESCE(i.Stock_Level, 0)) as total_value 
      FROM product p
      LEFT JOIN inventory i ON i.Product_ID = p.Product_ID
      WHERE COALESCE(i.Stock_Level, 0) > 0
    `);
    const totalValue = totalValueResult[0]?.total_value || 0;
    
    // Get low stock items count - items where stock is below reorder level but above zero
    const [lowStockResult] = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM product p
      LEFT JOIN inventory i ON p.Product_ID = i.Product_ID
      WHERE COALESCE(i.Stock_Level, 0) <= COALESCE(i.reorder_level, 10)
      AND COALESCE(i.Stock_Level, 0) > 0
    `);
    const lowStockItems = lowStockResult[0]?.count || 0;
    
    // Get out of stock items count
    const [outOfStockResult] = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM product p
      LEFT JOIN inventory i ON p.Product_ID = i.Product_ID
      WHERE COALESCE(i.Stock_Level, 0) = 0
    `);
    const outOfStockItems = outOfStockResult[0]?.count || 0;
    
    // Get new items this month
    const currentMonth = new Date().getMonth() + 1; // JS months are 0-indexed
    const currentYear = new Date().getFullYear();
    const [newItemsResult] = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM product p
      LEFT JOIN inventory i ON p.Product_ID = i.Product_ID
      WHERE (MONTH(i.Last_Updated) = ? AND YEAR(i.Last_Updated) = ?)
    `, [currentMonth, currentYear]);
    const newItemsThisMonth = newItemsResult[0]?.count || 0;
    
    // Calculate items needing attention (need to reorder within 7 days)
    const [attentionResult] = await executeQuery(`
      SELECT COUNT(*) as count
      FROM product p
      LEFT JOIN inventory i ON p.Product_ID = i.Product_ID
      WHERE COALESCE(i.Stock_Level, 0) <= COALESCE(i.reorder_level, 10) + 10 
      AND COALESCE(i.Stock_Level, 0) > COALESCE(i.reorder_level, 10)
    `);
    const itemsNeedingAttention = attentionResult[0]?.count || 0;
    
    // Get recent stock movements
    const [recentMovements] = await executeQuery(`
      SELECT 
        sm.movement_id,
        sm.product_id,
        p.Name as product_name,
        sm.quantity_change,
        sm.movement_type,
        sm.movement_date,
        sm.reference_id
      FROM stock_movement sm
      JOIN product p ON sm.product_id = p.Product_ID
      ORDER BY sm.movement_date DESC
      LIMIT 5
    `);
    
    // Get category distribution
    const [categoryDistribution] = await executeQuery(`
      SELECT 
        p.Category as category,
        COUNT(*) as count,
        SUM(COALESCE(i.Stock_Level, 0)) as total_stock
      FROM product p
      LEFT JOIN inventory i ON p.Product_ID = i.Product_ID
      GROUP BY p.Category
      ORDER BY count DESC
    `);
    
    // Log before returning
    console.log('Inventory summary results:', {
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
      newItemsThisMonth,
      itemsNeedingAttention,
      recentMovementsCount: recentMovements?.length || 0,
      categoryDistributionCount: categoryDistribution?.length || 0
    });
    
    // Return the data
    res.status(200).json({
      success: true,
      data: {
        totalItems,
        totalValue,
        lowStockItems,
        outOfStockItems,
        newItemsThisMonth,
        itemsNeedingAttention,
        recentMovements: recentMovements || [],
        categoryDistribution: categoryDistribution || []
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
    const { page = 1, limit = 100, threshold } = req.query; // Increased default limit
    const offset = (page - 1) * limit;
    
    // Simplified and fixed condition to correctly include both out-of-stock and low stock items
    let thresholdCondition = '(i.Stock_Level <= i.reorder_level OR i.Stock_Level = 0)';
    if (threshold) {
      thresholdCondition = `(i.Stock_Level <= ${parseInt(threshold)} OR i.Stock_Level = 0)`;
    }
    
    console.log('Low stock threshold condition:', thresholdCondition);
    
    // Run a separate debugging query to list ALL inventory items with their stock and reorder levels
    const debugQuery = `
      SELECT 
        p.Product_ID,
        p.Name,
        i.Stock_Level,
        i.reorder_level
      FROM inventory i
      JOIN product p ON i.Product_ID = p.Product_ID
    `;
    
    try {
      const [debugResult] = await executeQuery(debugQuery);
      console.log('==== ALL INVENTORY ITEMS ====');
      debugResult.forEach(item => {
        console.log(`Item: ${item.Name} (ID: ${item.Product_ID}) - Stock: ${item.Stock_Level}, Reorder: ${item.reorder_level}, Is Low: ${item.Stock_Level <= item.reorder_level}`);
      });
    } catch (debugError) {
      console.error('Error executing debug query:', debugError);
    }
    
    // First, run a separate query to check all potential low stock items without pagination
    const checkQuery = `
      SELECT 
        p.Product_ID,
        p.Name,
        i.Stock_Level,
        i.reorder_level
      FROM inventory i
      JOIN product p ON i.Product_ID = p.Product_ID
      WHERE ${thresholdCondition}
    `;
    
    console.log('Running check query:', checkQuery);
    
    try {
      const [checkResult] = await executeQuery(checkQuery, []);
      console.log('Check query found', checkResult.length, 'potential low stock items');
      checkResult.forEach(item => {
        console.log(`Potential low stock item: ${item.Name} (ID: ${item.Product_ID}) - Stock: ${item.Stock_Level}, Reorder: ${item.reorder_level}`);
      });
    } catch (checkError) {
      console.error('Error executing check query:', checkError);
    }
    
    const query = `
      SELECT 
        p.Product_ID,
        p.Name,
        p.SKU,
        p.Category,
        p.cost_price,
        i.Stock_Level,
        i.reorder_level,
        i.optimal_level,
        i.Supplier_ID,
        (i.reorder_level - i.Stock_Level) as needed,
        CASE 
          WHEN i.Stock_Level <= 0 THEN 'out_of_stock'
          WHEN i.Stock_Level <= i.reorder_level THEN 'low_stock'
          ELSE 'sufficient'
        END as stock_status
      FROM inventory i
      JOIN product p ON i.Product_ID = p.Product_ID
      WHERE ${thresholdCondition}
      ORDER BY i.Stock_Level ASC, needed DESC
      LIMIT ? OFFSET ?
    `;
    
    console.log('Executing SQL query for low stock items:', query);
    console.log('Query params:', [parseInt(limit), offset]);
    
    let items = [];
    try {
      const result = await executeQuery(query, [parseInt(limit), offset]);
      
      console.log('Raw query result:', result);
      
      // Ensure items is always an array
      items = Array.isArray(result) && result[0] ? 
              (Array.isArray(result[0]) ? result[0] : [result[0]]) : 
              [];
              
      console.log('Low stock items query result:', { 
        resultType: typeof result, 
        isArray: Array.isArray(result),
        firstItemType: result && result[0] ? typeof result[0] : 'undefined',
        isFirstItemArray: result && result[0] ? Array.isArray(result[0]) : false,
        length: items.length
      });
      
      // Debug: Count stock status types
      const outOfStockCount = items.filter(item => item.Stock_Level <= 0).length;
      const lowStockCount = items.filter(item => item.Stock_Level > 0 && item.Stock_Level <= item.reorder_level).length;
      console.log('Items breakdown after query:');
      console.log('- Total items:', items.length);
      console.log('- Out of stock items:', outOfStockCount);
      console.log('- Low stock items:', lowStockCount);
      
      // Debug: Log each item with its stock level and reorder level
      items.forEach(item => {
        console.log(`Item ${item.Name} (ID: ${item.Product_ID}) - Stock: ${item.Stock_Level}, Reorder: ${item.reorder_level}, Status: ${item.stock_status}`);
      });
    } catch (queryError) {
      console.error('Error executing low stock query:', queryError);
      items = [];
    }
    
    // Calculate total out of stock value and low stock value
    const outOfStockItems = items.filter(item => item.Stock_Level <= 0);
    const lowStockItems = items.filter(item => item.Stock_Level > 0 && item.Stock_Level <= item.reorder_level);
    
    // Calculate out of stock value: optimal_level * cost_price for each out of stock item
    const outOfStockValue = outOfStockItems.reduce((total, item) => {
      const optimal = parseInt(item.optimal_level) || 0;
      const costPrice = parseFloat(item.cost_price) || 0;
      const itemValue = optimal * costPrice;
      console.log(`Out of stock: ${item.Name}, optimal_level: ${optimal}, cost_price: ${costPrice}, value: ${itemValue}`);
      return total + itemValue;
    }, 0);
    
    // Calculate low stock value: (optimal_level - stock_level) * cost_price for each low stock item
    const lowStockValue = lowStockItems.reduce((total, item) => {
      const optimal = parseInt(item.optimal_level) || 0;
      const stock = parseInt(item.Stock_Level) || 0;
      const costPrice = parseFloat(item.cost_price) || 0;
      const orderQty = Math.max(0, optimal - stock);
      const itemValue = orderQty * costPrice;
      console.log(`Low stock: ${item.Name}, optimal_level: ${optimal}, stock_level: ${stock}, order_qty: ${orderQty}, cost_price: ${costPrice}, value: ${itemValue}`);
      return total + itemValue;
    }, 0);
    
    // Calculate total estimated order value
    const totalEstimatedOrderValue = outOfStockValue + lowStockValue;
    
    const [countResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM inventory i WHERE ${thresholdCondition}`
    );
    
    const total = countResult[0]?.total || 0;
    
    res.status(200).json({
      success: true,
      data: items,
      summary: {
        outOfStockValue,
        lowStockValue,
        totalEstimatedOrderValue
      },
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching low stock items:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve low stock items',
      error: error.message,
      data: [] // Always include empty data array on error
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
 * Create initial inventory record for a product
 */
exports.createInitialInventory = async (req, res) => {
  try {
    console.log('createInitialInventory called with body:', req.body);
    console.log('User in request:', req.user);
    console.log('Auth header:', req.headers.authorization);
    
    const { product_id, stock_level, supplier_id, reorder_level, optimal_level, notes } = req.body;
    
    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    // Check if product exists
    const product = await executeQuery('SELECT * FROM product WHERE Product_ID = ?', [product_id]);
    
    if (!product || product.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if inventory record already exists
    const existingInventory = await executeQuery(
      'SELECT * FROM inventory WHERE Product_ID = ?', 
      [product_id]
    );
    
    if (existingInventory && existingInventory.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Inventory record already exists for this product'
      });
    }
    
    // Create inventory record - using correct column names matching database
    await executeQuery(
      `INSERT INTO inventory 
        (Product_ID, Stock_Level, reorder_level, optimal_level, Last_Updated, Supplier_ID, Notes) 
      VALUES 
        (?, ?, ?, ?, NOW(), ?, ?)`,
      [product_id, stock_level || 0, reorder_level || 10, optimal_level || 50, supplier_id || null, notes || '']
    );
    
    // Update product stock level
    await executeQuery(
      'UPDATE product SET Stock_Level = ? WHERE Product_ID = ?',
      [stock_level || 0, product_id]
    );
    
    // Record stock movement - ensure we have a user ID, even if authentication failed
    const userId = req.user?.userId || 1; // Default to owner ID 1 if no user in request
    
    console.log('Creating stock movement record with userID:', userId);
    
    try {
      // Try to record stock movement, but don't fail if it doesn't work
      await executeQuery(
        `INSERT INTO stock_movement 
          (product_id, quantity_change, previous_quantity, new_quantity, movement_type, reason, movement_date) 
        VALUES 
          (?, ?, 0, ?, 'INITIAL', 'Initial inventory setup', NOW())`,
        [product_id, stock_level || 0, stock_level || 0]
      );
    } catch (movementError) {
      console.error('Failed to record stock movement:', movementError);
      // Continue anyway since inventory was created
    }
    
    return res.status(201).json({
      success: true,
      message: 'Initial inventory created successfully',
      data: {
        product_id,
        stock_level: stock_level || 0,
        reorder_level: reorder_level || 10
      }
    });
  } catch (error) {
    console.error('Error creating initial inventory:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create initial inventory',
      error: error.message
    });
  }
};

/**
 * Create or update initial inventory
 */
exports.setupInitialInventory = async (req, res) => {
  try {
    const { 
      product_id, 
      stock_level, 
      reorder_level, 
      supplier_id, 
      notes,
      reorder_quantity,
      storage_location,
      unit_of_measure,
      optimal_level,
      bin_location,
      warehouse_zone,
      inventory_value_method
    } = req.body;
    
    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    // Check if product exists
    const [productCheck] = await executeQuery(
      'SELECT Product_ID FROM product WHERE Product_ID = ?', 
      [product_id]
    );
    
    if (!productCheck || productCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if inventory record already exists
    const [inventoryCheck] = await executeQuery(
      'SELECT Inventory_ID FROM inventory WHERE Product_ID = ?', 
      [product_id]
    );
    
    if (inventoryCheck && inventoryCheck.length > 0) {
      // Update existing record
      await executeQuery(
        `UPDATE inventory SET 
          Stock_Level = ?, 
          Reorder_Level = ?, 
          Supplier_ID = ?,
          reorder_quantity = ?,
          storage_location = ?,
          unit_of_measure = ?,
          optimal_level = ?,
          bin_location = ?,
          warehouse_zone = ?,
          inventory_value_method = ?,
          Last_Updated = NOW() 
        WHERE Product_ID = ?`,
        [
          stock_level || 0,
          reorder_level || 10, // Default to 10 if not provided
          supplier_id || null,
          reorder_quantity || 0,
          storage_location || null,
          unit_of_measure || null,
          optimal_level || 50, // Default to 50 if not provided
          bin_location || null,
          warehouse_zone || null,
          inventory_value_method || 'FIFO',
          product_id
        ]
      );
      
      return res.status(200).json({
        success: true,
        message: 'Inventory updated successfully',
        inventory_id: inventoryCheck[0].Inventory_ID
      });
    }
    
    // Create new inventory record - Fixed VALUES placeholders to match parameters
    const [result] = await executeQuery(
      `INSERT INTO inventory (
        Product_ID, 
        Stock_Level, 
        Reorder_Level, 
        Supplier_ID,
        reorder_quantity,
        storage_location,
        unit_of_measure,
        optimal_level,
        bin_location,
        warehouse_zone,
        inventory_value_method,
        Last_Updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        product_id,
        stock_level || 0,
        reorder_level || 10, // Default to 10 if not provided
        supplier_id || null,
        reorder_quantity || 0,
        storage_location || null,
        unit_of_measure || null,
        optimal_level || 50, // Default to 50 if not provided
        bin_location || null,
        warehouse_zone || null,
        inventory_value_method || 'FIFO'
      ]
    );
    
    // Update product stock level to match
    await executeQuery(
      'UPDATE product SET Stock_Level = ? WHERE Product_ID = ?',
      [stock_level || 0, product_id]
    );
    
    // Add a log entry for the initial inventory setup
    try {
      await executeQuery(
        `INSERT INTO stock_movement (
          product_id, 
          quantity_change, 
          previous_quantity, 
          new_quantity, 
          movement_type, 
          notes, 
          movement_date
        ) VALUES (?, ?, 0, ?, 'INITIAL', ?, NOW())`,
        [
          product_id,
          stock_level || 0,
          stock_level || 0,
          notes || 'Initial inventory setup from product creation'
        ]
      );
    } catch (logError) {
      console.warn('Warning: Failed to create stock movement log:', logError);
      // Continue even if logging fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Inventory created successfully',
      inventory_id: result.insertId
    });
  } catch (error) {
    console.error('Error setting up inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to setup inventory',
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
    
    console.log(`Fetching stock movement history with params:`, req.query);
    console.log(`Route path: ${req.path}, ID param: ${req.params.id}`);
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let conditions = [];
    const params = [];
    
    // Check if a specific item ID was provided either in query or route param
    const specificProductId = itemId || req.params.id;
    if (specificProductId) {
      conditions.push('sm.product_id = ?');
      params.push(specificProductId);
      console.log(`Filtering by product ID: ${specificProductId}`);
    }
    
    // Build query conditions - don't require any specific condition
    if (startDate) {
      conditions.push('sm.movement_date >= ?');
      params.push(new Date(startDate));
    }
    
    if (endDate) {
      conditions.push('sm.movement_date <= ?');
      params.push(new Date(endDate));
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
    
    console.log(`Stock movement query conditions: ${whereClause}`);
    
    const query = `
      SELECT 
        sm.movement_id,
        sm.product_id,
        sm.quantity_change,
        sm.previous_quantity,
        sm.new_quantity,
        sm.movement_type,
        sm.reference_id,
        sm.notes,
        sm.created_by,
        sm.movement_date,
        p.Name as product_name,
        p.SKU as product_sku,
        CONCAT(IFNULL(s.First_Name, ''), ' ', IFNULL(s.Last_Name, '')) as user_name
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
    
    console.log(`Executing stock movement query with ${params.length} parameters`);
    
    // Get count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM stock_movement sm
      JOIN product p ON sm.product_id = p.Product_ID
      LEFT JOIN staff s ON sm.created_by = s.Staff_ID
      ${whereClause}
    `;
    
    const movements = await executeQuery(query, params);
    const countResult = await executeQuery(countQuery, params.slice(0, -2));
    
    // Log the query results
    console.log(`Stock movement query returned ${movements.length} results`);
    
    // Ensure movements is an array (handle nested array case)
    const movementsArray = Array.isArray(movements[0]) ? movements[0] : movements;
    
    // Format the data to match the frontend expectations
    // Check if movements is defined and is an array before mapping
    const formattedMovements = Array.isArray(movementsArray) ? movementsArray.map(movement => ({
      id: movement.movement_id,
      timestamp: movement.movement_date,
      type: mapMovementType(movement.movement_type),
      quantity: Math.abs(movement.quantity_change),
      previous_quantity: movement.previous_quantity || 0,
      new_quantity: movement.new_quantity || 0,
      notes: movement.notes,
      reference: movement.reference_id,
      item: {
        id: movement.product_id,
        name: movement.product_name,
        sku: movement.product_sku
      },
      performedBy: movement.user_name || 'System'
    })) : [];
    
    const totalCount = countResult[0]?.total || 0;
    
    console.log(`Returning ${formattedMovements.length} formatted stock movements`);
    
    return res.status(200).json({
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
    return res.status(500).json({
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
        i.reorder_level,
        COALESCE(SUM(ABS(sm.quantity_change)) / NULLIF(COUNT(DISTINCT DATE(sm.movement_date)), 0), 0) as avg_daily_consumption
      FROM 
        inventory i
      JOIN 
        product p ON i.Product_ID = p.Product_ID
      LEFT JOIN 
        stock_movement sm ON p.Product_ID = sm.product_id AND sm.movement_type = 'SALE'
        AND sm.movement_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
      GROUP BY 
        p.Product_ID, p.Name, p.SKU, i.Stock_Level, i.reorder_level
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
    const result = await executeQuery(`
      SELECT 
        p.Product_ID, p.Name, p.SKU, i.Stock_Level, i.reorder_level,
        (i.reorder_level - i.Stock_Level) as needed,
        s.Supplier_ID, s.Name as supplier_name
      FROM 
        inventory i
      JOIN 
        product p ON i.Product_ID = p.Product_ID
      LEFT JOIN 
        supplier s ON i.Supplier_ID = s.Supplier_ID
      WHERE 
        i.Stock_Level <= i.reorder_level AND i.Supplier_ID IS NOT NULL
      ORDER BY 
        s.Supplier_ID, needed DESC
    `);
    
    // Ensure we have an array of low stock items
    const lowStockItems = Array.isArray(result) ? result : (result && result[0] ? result[0] : []);
    
    if (!Array.isArray(lowStockItems) || lowStockItems.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No items need reordering at this time',
        data: []
      });
    }
    
    // Group by supplier
    const supplierGroups = {};
    lowStockItems.forEach(item => {
      if (!item || !item.Supplier_ID) return; // Skip invalid items
      
      if (!supplierGroups[item.Supplier_ID]) {
        supplierGroups[item.Supplier_ID] = {
          supplier_id: item.Supplier_ID,
          supplier_name: item.supplier_name || 'Unknown Supplier',
          items: []
        };
      }
      supplierGroups[item.Supplier_ID].items.push({
        product_id: item.Product_ID,
        name: item.Name || 'Unknown Product',
        sku: item.SKU || '',
        quantity_to_order: Math.max(1, (item.needed || 1) * 2), // Order 2x the deficit as a buffer, at least 1
        current_level: item.Stock_Level || 0
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
    console.log('Fetching inventory categories');
    
    // First query to get categories with inventory data
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
      WHERE 
        p.Category IS NOT NULL AND p.Category != ''
      GROUP BY 
        p.Category
      ORDER BY 
        total_value DESC
    `;
    
    // Execute the main query
    const [categories] = await executeQuery(query);
    
    // Log what we found
    console.log(`Found ${categories ? categories.length : 0} categories from main query`);
    
    // If we don't have categories from the main query, try a broader query
    if (!categories || categories.length === 0) {
      console.log('No categories found with inventory data, fetching all product categories');
      
      // Second query to get all product categories even if they don't have inventory
      const productCategoryQuery = `
        SELECT DISTINCT 
          Category,
          COUNT(*) as item_count,
          0 as total_items,
          0 as total_value
        FROM 
          product
        WHERE 
          Category IS NOT NULL AND Category != ''
        GROUP BY 
          Category
      `;
      
      const [productCategories] = await executeQuery(productCategoryQuery);
      console.log(`Found ${productCategories ? productCategories.length : 0} categories from product table`);
      
      if (productCategories && productCategories.length > 0) {
        // Send product categories if available
        return res.status(200).json({
          success: true,
          source: 'product_table',
          count: productCategories.length,
          data: productCategories
        });
      }
      
      // If we still don't have categories, return a meaningful empty response
      return res.status(200).json({
        success: true,
        source: 'none',
        count: 0,
        message: 'No categories found in database',
        data: []
      });
    }
    
    // Return the categories from the main query
    return res.status(200).json({
      success: true,
      source: 'inventory_join',
      count: categories.length,
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
    const { 
      valuationType = 'cost', 
      valuationMethod = 'FIFO', 
      includeZeroStock = false, 
      category = '' 
    } = req.query;
    
    console.log('Calculating inventory value with options:', {
      valuationType, valuationMethod, includeZeroStock, category
    });
    
    // Common query parts for all valuation methods
    let commonQuery = `
      SELECT 
        p.Product_ID, 
        p.Name, 
        p.SKU,
        p.Category,
        p.Subcategory,
        p.Brand,
        p.Manufacturer,
        p.cost_price,
        p.Price as retail_price,
        i.Stock_Level,
        i.unit_of_measure,
        i.inventory_value_method,
        i.Supplier_ID,
        i.bin_location,
        i.warehouse_zone
    `;
    
    let fromJoinClause = `
      FROM inventory i
      JOIN product p ON i.Product_ID = p.Product_ID
      WHERE 1=1
    `;
    
    // Apply filters
    if (!includeZeroStock) {
      fromJoinClause += ' AND i.Stock_Level > 0';
    }
    
    if (category) {
      fromJoinClause += ' AND p.Category = ?';
    }
    
    // Determine value field and sort order
    let valueField = valuationType === 'retail' ? 'p.Price' : 'p.cost_price';
    
    // If batch data exists, use it for more accurate valuation
    const batchDataExists = await checkIfBatchDataExists();
    
    // Determine base query based on valuation method and data availability
    let query;
    
    if (batchDataExists) {
      // Detailed batch-based valuation
      switch (valuationMethod.toUpperCase()) {
        case 'FIFO':
          query = generateFifoBatchQuery(commonQuery, fromJoinClause, valueField);
          break;
          
        case 'WEIGHTED_AVERAGE':
          query = generateWeightedAverageQuery(commonQuery, fromJoinClause, valueField);
          break;
          
        case 'SPECIFIC_IDENTIFICATION':
          query = generateSpecificIdentificationQuery(commonQuery, fromJoinClause, valueField);
          break;
          
        default:
          query = generateFifoBatchQuery(commonQuery, fromJoinClause, valueField);
      }
    } else {
      // Simple valuation using available product data
      query = `
        ${commonQuery},
        i.Stock_Level * ${valueField} as total_value,
        ${valueField} as unit_value
        ${fromJoinClause}
        ORDER BY p.Category, p.Name
      `;
    }
    
    // Execute the query with appropriate parameters
    const params = category ? [category] : [];
    const inventoryItems = await executeQuery(query, params);
    
    // Calculate summary data
    let totalValue = 0;
    const categoryBreakdown = {};
    const locationBreakdown = {};
    const valueDistribution = {
      "high_value": 0,      // Items with value > $5000
      "medium_value": 0,    // Items with value between $1000-$5000
      "standard_value": 0,  // Items with value between $100-$1000
      "low_value": 0        // Items with value < $100
    };
    
    // Process item data
    const processedItems = inventoryItems.map(item => {
      const unitValue = parseFloat(item.unit_value) || 0;
      const totalItemValue = parseFloat(item.total_value) || 0;
      
      // Add to overall total
      totalValue += totalItemValue;
      
      // Add to category breakdown
      const category = item.Category || 'Uncategorized';
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = 0;
      }
      categoryBreakdown[category] += totalItemValue;
      
      // Add to location breakdown
      const location = item.warehouse_zone || 'Main Warehouse';
      if (!locationBreakdown[location]) {
        locationBreakdown[location] = 0;
      }
      locationBreakdown[location] += totalItemValue;
      
      // Add to value distribution
      if (totalItemValue > 5000) {
        valueDistribution.high_value += totalItemValue;
      } else if (totalItemValue >= 1000) {
        valueDistribution.medium_value += totalItemValue;
      } else if (totalItemValue >= 100) {
        valueDistribution.standard_value += totalItemValue;
      } else {
        valueDistribution.low_value += totalItemValue;
      }
      
      return {
        product_id: item.Product_ID,
        name: item.Name,
        sku: item.SKU,
        category: item.Category,
        subcategory: item.Subcategory,
        brand: item.Brand,
        manufacturer: item.Manufacturer,
        stock_level: item.Stock_Level,
        unit_of_measure: item.unit_of_measure,
        unit_value: unitValue, 
        total_value: totalItemValue,
        preferred_valuation_method: item.inventory_value_method,
        location: item.warehouse_zone || item.bin_location
      };
    });
    
    res.status(200).json({
      success: true,
      valuationType,
      valuationMethod,
      totalValue: totalValue,
      itemCount: processedItems.length,
      categoryBreakdown: categoryBreakdown,
      locationBreakdown: locationBreakdown,
      valueDistribution: valueDistribution,
      items: processedItems,
      batchDataUsed: batchDataExists
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

// Helper functions for inventory valuation

async function checkIfBatchDataExists() {
  try {
    const result = await executeQuery(
      'SELECT COUNT(*) as count FROM inventory_batch LIMIT 1'
    );
    return result[0]?.count > 0;
  } catch (error) {
    console.error('Error checking batch data:', error);
    return false;
  }
}

function generateFifoBatchQuery(commonQuery, fromJoinClause, valueField) {
  return `
    ${commonQuery},
    (
      SELECT COALESCE(SUM(LEAST(ib.quantity, i.Stock_Level) * ib.cost_per_unit), 0) 
      FROM inventory_batch ib
      WHERE ib.product_id = p.Product_ID
      ORDER BY ib.received_date ASC
      LIMIT i.Stock_Level
    ) as total_value,
    (
      SELECT COALESCE(AVG(ib.cost_per_unit), ${valueField})
      FROM inventory_batch ib
      WHERE ib.product_id = p.Product_ID
      ORDER BY ib.received_date ASC
      LIMIT i.Stock_Level
    ) as unit_value
    ${fromJoinClause}
    ORDER BY p.Category, p.Name
  `;
}

function generateWeightedAverageQuery(commonQuery, fromJoinClause, valueField) {
  return `
    ${commonQuery},
    i.Stock_Level * (
      SELECT COALESCE(
        SUM(ib.quantity * ib.cost_per_unit) / NULLIF(SUM(ib.quantity), 0), 
        ${valueField}
      )
      FROM inventory_batch ib
      WHERE ib.product_id = p.Product_ID
    ) as total_value,
    (
      SELECT COALESCE(
        SUM(ib.quantity * ib.cost_per_unit) / NULLIF(SUM(ib.quantity), 0), 
        ${valueField}
      )
      FROM inventory_batch ib
      WHERE ib.product_id = p.Product_ID
    ) as unit_value
    ${fromJoinClause}
    ORDER BY p.Category, p.Name
  `;
}

function generateSpecificIdentificationQuery(commonQuery, fromJoinClause, valueField) {
  return `
    ${commonQuery},
    (
      SELECT COALESCE(SUM(ib.quantity * ib.cost_per_unit), i.Stock_Level * ${valueField})
      FROM inventory_batch ib
      WHERE ib.product_id = p.Product_ID AND ib.quantity > 0
    ) as total_value,
    (
      SELECT COALESCE(SUM(ib.quantity * ib.cost_per_unit) / i.Stock_Level, ${valueField})
      FROM inventory_batch ib
      WHERE ib.product_id = p.Product_ID AND ib.quantity > 0
    ) as unit_value
    ${fromJoinClause}
    ORDER BY p.Category, p.Name
  `;
}

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
          (?, ?, ?, ?, ?, ?, NOW())`,
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
    const { period = 90, category = '' } = req.query; // Days to analyze and optional category filter
    
    // Calculate start date for the analysis period
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = new Date().toISOString().split('T')[0];
    
    console.log(`[Turnover Report] Analyzing period from ${formattedStartDate} to ${formattedEndDate} (${period} days)`);
    
    // Check for null dates in orders
    const [nullDateCount] = await executeQuery('SELECT COUNT(*) as count FROM customerorder WHERE Payment_Status = "paid" AND Order_Date IS NULL');
    console.log('[Turnover Report] Orders with NULL dates:', nullDateCount);
    
    // Fix any NULL dates to ensure our queries work
    if (nullDateCount && nullDateCount.count > 0) {
      console.log('[Turnover Report] Fixing NULL dates in orders...');
      await executeQuery('UPDATE customerorder SET Order_Date = NOW() WHERE Order_Date IS NULL AND Payment_Status = "paid"');
    }

    // SIMPLIFIED QUERIES: We'll get just the basic data we need for each product
    
    // 1. Get all products with cost prices
    const productsQuery = `
      SELECT 
        p.Product_ID,
        p.Name,
        p.SKU,
        p.Category,
        p.cost_price,
        p.Price as sell_price,
        IFNULL(i.Stock_Level, 0) as current_stock,
        IFNULL(i.Stock_Level * p.cost_price, 0) as inventory_value
      FROM 
        product p
      LEFT JOIN
        inventory i ON p.Product_ID = i.Product_ID
      WHERE 
        p.cost_price IS NOT NULL 
        AND p.cost_price > 0
    `;
    
    const products = await executeQuery(productsQuery);
    console.log(`[Turnover Report] Found ${products.length} products with cost prices`);
    
    // 2. Get total quantity sold and COGS for each product
    const salesQuery = `
      SELECT 
        oi.Product_ID,
        SUM(oi.Quantity) as quantity_sold,
        SUM(oi.Quantity * p.cost_price) as cogs
      FROM 
        order_item oi
      JOIN 
        product p ON oi.Product_ID = p.Product_ID
      JOIN 
        customerorder co ON oi.Order_ID = co.Order_ID
      WHERE 
        co.Payment_Status = 'paid'
        AND co.Order_Date >= ? AND co.Order_Date <= ?
      GROUP BY 
        oi.Product_ID
    `;
    
    const sales = await executeQuery(salesQuery, [formattedStartDate, formattedEndDate]);
    const salesMap = {};
    sales.forEach(item => {
      salesMap[item.Product_ID] = {
        quantity_sold: item.quantity_sold || 0,
        cogs: item.cogs || 0
      };
    });
    
    console.log(`[Turnover Report] Found sales data for ${sales.length} products`);
    
    // 3. Get inventory categories for grouping
    const categoriesQuery = `
      SELECT DISTINCT Category FROM product WHERE Category IS NOT NULL AND Category != ''
    `;
    const categoryResults = await executeQuery(categoriesQuery);
    const categories = categoryResults.map(c => c.Category);
    
    console.log(`[Turnover Report] Found ${categories.length} product categories`);
    
    // 4. Build the product turnover data by combining the data
    const productTurnoverData = products.map(product => {
      const salesData = salesMap[product.Product_ID] || { quantity_sold: 0, cogs: 0 };
      const inventoryValue = parseFloat(product.inventory_value) || 0;
      const cogs = parseFloat(salesData.cogs) || 0;
      const turnoverRatio = inventoryValue > 0 ? cogs / inventoryValue : 0;
      const dsi = cogs > 0 ? Math.round((inventoryValue / cogs) * parseInt(period)) : null;
      
      return {
        Product_ID: product.Product_ID,
        Name: product.Name,
        SKU: product.SKU,
        Category: product.Category,
        cost_price: parseFloat(product.cost_price).toFixed(2),
        sell_price: parseFloat(product.sell_price).toFixed(2),
        current_stock: parseInt(product.current_stock),
        units_sold: parseInt(salesData.quantity_sold),
        cogs: cogs.toFixed(2),
        inventory_value: inventoryValue.toFixed(2),
        turnover_ratio: turnoverRatio.toFixed(2),
        dsi: dsi,
        inventory_health: calculateInventoryHealth(turnoverRatio, product.current_stock, salesData.quantity_sold),
        action_recommendation: generateActionRecommendation(turnoverRatio, product.current_stock, salesData.quantity_sold)
      };
    });
    
    // 5. Calculate category data by grouping products
    const categoryMap = {};
    productTurnoverData.forEach(product => {
      if (!product.Category) return;
      
      if (!categoryMap[product.Category]) {
        categoryMap[product.Category] = {
          Category: product.Category,
          product_count: 0,
          total_stock: 0,
          total_inventory_value: 0,
          total_units_sold: 0,
          total_cogs: 0
        };
      }
      
      categoryMap[product.Category].product_count++;
      categoryMap[product.Category].total_stock += product.current_stock;
      categoryMap[product.Category].total_inventory_value += parseFloat(product.inventory_value);
      categoryMap[product.Category].total_units_sold += product.units_sold;
      categoryMap[product.Category].total_cogs += parseFloat(product.cogs);
    });
    
    // Calculate category turnover ratios
    const categoryTurnoverData = Object.values(categoryMap).map(cat => {
      const ratio = cat.total_inventory_value > 0 ? cat.total_cogs / cat.total_inventory_value : 0;
      const dsi = cat.total_cogs > 0 ? Math.round((cat.total_inventory_value / cat.total_cogs) * parseInt(period)) : null;
      
      return {
        ...cat,
        category_turnover_ratio: ratio.toFixed(2),
        total_inventory_value: cat.total_inventory_value.toFixed(2),
        total_cogs: cat.total_cogs.toFixed(2),
        dsi: dsi,
        category_health: calculateInventoryHealth(ratio, cat.total_stock, cat.total_units_sold)
      };
    });
    
    // Sort by turnover ratio descending
    productTurnoverData.sort((a, b) => parseFloat(b.turnover_ratio) - parseFloat(a.turnover_ratio));
    categoryTurnoverData.sort((a, b) => parseFloat(b.category_turnover_ratio) - parseFloat(a.category_turnover_ratio));
    
    // Calculate overall metrics
    const totalInventoryValue = productTurnoverData.reduce((sum, item) => sum + parseFloat(item.inventory_value), 0);
    const totalCOGS = productTurnoverData.reduce((sum, item) => sum + parseFloat(item.cogs), 0);
    const overallTurnoverRatio = totalInventoryValue > 0 ? totalCOGS / totalInventoryValue : 0;
    const overallDSI = totalCOGS > 0 ? Math.round((totalInventoryValue / totalCOGS) * parseInt(period)) : 0;
    
    // Summary data
    const summary = {
      total_inventory_value: totalInventoryValue.toFixed(2),
      total_cogs: totalCOGS.toFixed(2),
      overall_turnover_ratio: overallTurnoverRatio.toFixed(2),
      overall_dsi: Math.round(overallDSI),
      product_count: productTurnoverData.length,
      category_count: categoryTurnoverData.length,
      days_in_period: parseInt(period),
      start_date: formattedStartDate,
      end_date: formattedEndDate
    };
    
    console.log('[Turnover Report] Sending response with summary:', summary);
    console.log(`[Turnover Report] Returning ${productTurnoverData.length} products and ${categoryTurnoverData.length} categories`);
    
    res.status(200).json({
      success: true,
      period_days: parseInt(period),
      summary: summary,
      products: productTurnoverData,
      categories: categoryTurnoverData
    });
  } catch (error) {
    console.error('[Turnover Report] Error generating inventory turnover report:', error);
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
  if (turnoverRate >= 0.5 && turnoverRate <= 3) return 'Healthy';
  if (turnoverRate > 3) return 'Fast-moving';
  return 'Unknown';
}

function generateActionRecommendation(turnoverRate, currentStock, unitsSold) {
  if (turnoverRate === 0) {
    return 'Consider clearance sale or discontinuing';
  } else if (turnoverRate < 0.5) {
    return 'Reduce stock levels; consider promotions';
  } else if (turnoverRate > 3 && currentStock < 10) {
    return 'Increase order quantity; popular item';
  } else if (turnoverRate > 3) {
    return 'Good performer; maintain stock levels';
  } else {
    return 'Stock levels appropriate for current sales';
  }
}

/**
 * Update inventory when items are received from a purchase order
 * Route: POST /api/inventory/receive
 */
exports.receiveInventoryFromPurchaseOrder = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    
    // Validate request data
    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid positive quantity is required'
      });
    }
    
    console.log(`Receiving ${quantity} units of product ID: ${product_id} from purchase order`);
    
    // Get current inventory for this product
    const currentInventory = await executeQuery(
      'SELECT * FROM inventory WHERE Product_ID = ?',
      [product_id]
    );
    
    let inventoryId;
    let previousQuantity = 0;
    
    if (currentInventory && currentInventory.length > 0) {
      // Inventory record exists, update it
      inventoryId = currentInventory[0].Inventory_ID;
      previousQuantity = currentInventory[0].Stock_Level || 0;
      
      // Update the inventory
      await executeQuery(
        'UPDATE inventory SET Stock_Level = Stock_Level + ?, Last_Updated = NOW() WHERE Product_ID = ?',
        [quantity, product_id]
      );
    } else {
      // No inventory record exists yet, check if product exists
      const product = await executeQuery(
        'SELECT * FROM product WHERE Product_ID = ?',
        [product_id]
      );
      
      if (!product || product.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      // Create new inventory record
      const result = await executeQuery(
        'INSERT INTO inventory (Product_ID, Stock_Level, Reorder_Level, Last_Updated) VALUES (?, ?, ?, NOW())',
        [product_id, quantity, 10] // Default reorder level is 10
      );
      
      inventoryId = result.insertId;
    }
    
    // Record this stock movement
    await executeQuery(
      `INSERT INTO stock_movement (
        product_id, 
        quantity_change, 
        movement_type, 
        reference_id, 
        notes, 
        created_by,
        previous_quantity, 
        new_quantity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product_id,
        quantity,
        'PURCHASE_ORDER_RECEIVE',
        null,
        `Received from purchase order`,
        null, // Set to NULL to avoid foreign key constraint issues
        previousQuantity,
        previousQuantity + parseInt(quantity)
      ]
    );
    
    // Get the updated inventory
    const updatedInventory = await executeQuery(
      'SELECT * FROM inventory WHERE Product_ID = ?',
      [product_id]
    );
    
    return res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      data: {
        product_id: parseInt(product_id),
        previous_quantity: previousQuantity,
        received_quantity: parseInt(quantity),
        new_quantity: (previousQuantity + parseInt(quantity)),
        inventory: updatedInventory[0]
      }
    });
    
  } catch (error) {
    console.error('Error receiving inventory from purchase order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update inventory from purchase order',
      error: error.message
    });
  }
};

/**
 * Update inventory with partial fulfillment from a purchase order
 * Route: POST /api/inventory/receive-partial
 */
exports.receivePartialInventory = async (req, res) => {
  try {
    const { product_id, actual_quantity, ordered_quantity } = req.body;
    
    if (!product_id || actual_quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and actual quantity are required'
      });
    }
    
    // Convert to integers to ensure we're working with numbers
    const productId = parseInt(product_id);
    const actualQuantity = parseInt(actual_quantity);
    const orderedQuantity = parseInt(ordered_quantity || 0);
    
    if (actualQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Actual quantity cannot be negative'
      });
    }
    
    // Check if product exists
    const productResult = await executeQuery(
      'SELECT * FROM product WHERE Product_ID = ?',
      [productId]
    );
    
    if (!productResult || productResult.length === 0 || productResult[0].length === 0) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${productId} not found`
      });
    }
    
    // Get current inventory for this product
    const inventoryResult = await executeQuery(
      'SELECT * FROM inventory WHERE Product_ID = ?',
      [productId]
    );
    
    let previousQuantity = 0;
    
    // Check if inventory records exist (considering correct result structure)
    if (!inventoryResult || 
        inventoryResult.length === 0 || 
        !inventoryResult[0] || 
        inventoryResult[0].length === 0) {
      // Create new inventory record with actual received quantity
      await executeQuery(
        'INSERT INTO inventory (Product_ID, Stock_Level, Reorder_Level, Last_Updated) VALUES (?, ?, 10, NOW())',
        [productId, actualQuantity]
      );
    } else {
      // Get previous quantity before update, safely access the nested result
      const inventoryItem = inventoryResult[0][0];
      if (inventoryItem && typeof inventoryItem === 'object') {
        previousQuantity = inventoryItem.Stock_Level || 0;
      }
      
      // Update existing inventory record with actual received quantity
      await executeQuery(
        'UPDATE inventory SET Stock_Level = Stock_Level + ? WHERE Product_ID = ?',
        [actualQuantity, productId]
      );
    }
    
    // Determine if this is a partial fulfillment (less than ordered)
    const fulfillmentType = actualQuantity < orderedQuantity ? 'PARTIAL' : 
                          actualQuantity > orderedQuantity ? 'EXCESS' : 'COMPLETE';
    
    // Record stock movement instead of inventory transaction
    await executeQuery(
      `INSERT INTO stock_movement (
        product_id, 
        quantity_change, 
        movement_type, 
        reference_id, 
        notes, 
        created_by,
        previous_quantity, 
        new_quantity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productId,
        actualQuantity,
        'PURCHASE_ORDER_PARTIAL',
        req.body.po_id || null,
        `${fulfillmentType} fulfillment: Received ${actualQuantity} of ${orderedQuantity} ordered units`,
        null, // Set to NULL to avoid foreign key constraint issues
        previousQuantity,
        previousQuantity + actualQuantity
      ]
    );
    
    return res.status(200).json({
      success: true,
      message: `Added ${actualQuantity} units to product ID ${productId} (${fulfillmentType} fulfillment)`,
      received_quantity: actualQuantity,
      ordered_quantity: orderedQuantity,
      fulfillment_type: fulfillmentType,
      product_id: productId,
      previous_quantity: previousQuantity,
      new_quantity: previousQuantity + actualQuantity
    });
  } catch (error) {
    console.error('Error receiving partial inventory:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update inventory with partial fulfillment',
      error: error.message
    });
  }
};

/**
 * Get combined product and inventory data
 */
exports.getCombinedInventory = async (req, res) => {
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
    
    // Improved query to handle zero stock and multiple inventory records correctly
    let query = `
      SELECT 
        p.Product_ID,
        p.Name,
        p.SKU,
        p.Description,
        p.Category,
        p.Price,
        p.cost_price,
        p.Image_URL,
        p.image_public_id,
        p.Status,
        COALESCE(MAX(i.Inventory_ID), 0) as Inventory_ID,
        COALESCE(SUM(i.Stock_Level), 0) as Stock_Level,
        COALESCE(MAX(i.reorder_level), 10) as reorder_level,
        COALESCE(MAX(i.optimal_level), 50) as optimal_level,
        COALESCE(MAX(i.bin_location), '') as bin_location,
        COALESCE(MAX(i.warehouse_zone), '') as warehouse_zone,
        COALESCE(MAX(i.inventory_value_method), 'FIFO') as inventory_value_method,
        COALESCE(MAX(i.unit_of_measure), '') as unit_of_measure,
        COALESCE(MAX(i.Supplier_ID), NULL) as Supplier_ID
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
    
    // Always group by product ID to ensure one row per product
    query += ' GROUP BY p.Product_ID';
    
    // Add order by clause
    let orderByField;
    switch(sortBy.toLowerCase()) {
      case 'name': orderByField = 'p.Name'; break;
      case 'sku': orderByField = 'p.SKU'; break;
      case 'price': orderByField = 'p.Price'; break;
      case 'stock_level': orderByField = 'Stock_Level'; break;
      case 'category': orderByField = 'p.Category'; break;
      default: orderByField = 'p.Name';
    }
    
    query += ` ORDER BY ${orderByField} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
    
    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    console.log('Running combined inventory query with params:', params);
    
    // Execute query
    const result = await executeQuery(query, params);
    
    // Ensure we have an array in the right format
    const items = Array.isArray(result) && result[0] ? 
                  (Array.isArray(result[0]) ? result[0] : result) : 
                  [];
    
    // Log each product for debugging
    console.log(`Query returned ${items.length} items:`);
    items.forEach(item => {
      console.log(`Product ID: ${item.Product_ID}, Name: ${item.Name}, Stock Level: ${item.Stock_Level}`);
    });
    
    // Get total count for pagination - count all products, not just those with inventory
    let countQuery = `SELECT COUNT(DISTINCT p.Product_ID) as total FROM product p ${whereClause}`;
    const countResult = await executeQuery(countQuery, params.slice(0, params.length - 2));
    const totalResult = Array.isArray(countResult) ? countResult[0] : countResult;
    const total = totalResult[0]?.total || 0;
    
    console.log(`Combined inventory query returned ${items.length} items out of ${total} total products`);
    
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
    console.error('Error in getCombinedInventory:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve combined inventory data',
      error: error.message
    });
  }
};

/**
 * Fix inventory data issues
 * This special function finds and fixes common inventory data issues:
 * 1. Products without inventory records
 * 2. Inventory column name discrepancies
 */
exports.fixInventoryDataIssues = async (req, res) => {
  try {
    console.log('Starting inventory data fix process');
    const results = {
      productsWithoutInventory: [],
      productsWithInventory: [],
      newlyCreatedInventory: [],
      errors: []
    };
    
    // 1. Find products without inventory records
    const productsQuery = await executeQuery(`
      SELECT p.* 
      FROM product p 
      LEFT JOIN inventory i ON p.Product_ID = i.Product_ID 
      WHERE i.Product_ID IS NULL
    `);
    
    // Make sure productsQuery is properly handled (it might be an array or [array])
    const productsWithoutInventory = Array.isArray(productsQuery) ? 
      (productsQuery[0] ? (Array.isArray(productsQuery[0]) ? productsQuery[0] : productsQuery) : []) : 
      [];
    
    // Store results
    results.productsWithoutInventory = productsWithoutInventory;
    console.log(`Found ${productsWithoutInventory.length} products without inventory records`);
    
    // 2. Create inventory records for products that lack them
    for (const product of productsWithoutInventory) {
      try {
        // Create a random stock level between 10-150
        const stockLevel = Math.floor(Math.random() * 140) + 10;
        const reorderLevel = Math.floor(Math.random() * 15) + 5;
        const optimalLevel = Math.floor(stockLevel * 1.5);
        
        await executeQuery(
          `INSERT INTO inventory 
           (Product_ID, Stock_Level, reorder_level, optimal_level, Last_Updated) 
           VALUES 
           (?, ?, ?, ?, NOW())`,
          [product.Product_ID, stockLevel, reorderLevel, optimalLevel]
        );
        
        console.log(`Created inventory record for product ${product.Product_ID}: ${product.Name}`);
        results.newlyCreatedInventory.push({
          product_id: product.Product_ID,
          name: product.Name,
          stock_level: stockLevel,
          reorder_level: reorderLevel,
          optimal_level: optimalLevel
        });
        
      } catch (err) {
        console.error(`Error creating inventory for product ${product.Product_ID}:`, err);
        results.errors.push({
          product_id: product.Product_ID,
          name: product.Name,
          error: err.message
        });
      }
    }
    
    // 3. Check products with inventory records
    const productsWithInventoryQuery = await executeQuery(`
      SELECT p.*, i.*
      FROM product p 
      INNER JOIN inventory i ON p.Product_ID = i.Product_ID
    `);
    
    // Handle potentially nested array result
    const productsWithInventory = Array.isArray(productsWithInventoryQuery) ?
      (productsWithInventoryQuery[0] ? (Array.isArray(productsWithInventoryQuery[0]) ? productsWithInventoryQuery[0] : productsWithInventoryQuery) : []) :
      [];
    
    results.productsWithInventory = productsWithInventory;
    console.log(`Found ${productsWithInventory.length} products with inventory records`);
    
    // Return the detailed results
    res.status(200).json({
      success: true,
      message: 'Inventory data fix completed',
      results
    });
    
  } catch (error) {
    console.error('Error fixing inventory data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fix inventory data',
      error: error.message
    });
  }
};

/**
 * Generate PDF for stock movement history
 * @route GET /api/inventory/stock-movements/pdf
 */
exports.getStockMovementPdf = async (req, res) => {
  try {
    console.log('Generating stock movement history PDF');
    const { startDate, endDate, itemName, type, limit = 500 } = req.query;
    
    // Set explicit CORS headers for the PDF response
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    res.header('Access-Control-Expose-Headers', 'Content-Type, Content-Disposition, Content-Length');
    
    // Build query conditions
    const conditions = [];
    const params = [];
    
    let query = `
      SELECT 
        sm.movement_id,
        sm.movement_date,
        sm.quantity_change,
        sm.movement_type,
        sm.reference_id,
        sm.notes,
        sm.previous_quantity,
        sm.new_quantity,
        p.Name as item_name,
        p.SKU as item_sku,
        IFNULL(s.First_Name, 'System') as created_by_first_name,
        IFNULL(s.Last_Name, '') as created_by_last_name
      FROM 
        stock_movement sm
      LEFT JOIN 
        product p ON sm.product_id = p.Product_ID
      LEFT JOIN 
        staff s ON sm.created_by = s.Staff_ID
      WHERE 1=1
    `;
    
    if (startDate) {
      conditions.push('sm.movement_date >= ?');
      params.push(startDate);
    }
    
    if (endDate) {
      conditions.push('sm.movement_date <= ?');
      params.push(endDate);
    }
    
    if (itemName) {
      conditions.push('p.Name LIKE ?');
      params.push(`%${itemName}%`);
    }
    
    if (type) {
      conditions.push('sm.movement_type = ?');
      params.push(type);
    }
    
    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY sm.movement_date DESC';
    
    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }
    
    console.log('Executing query:', query);
    console.log('With params:', params);
    
    const movements = await executeQuery(query, params);
    console.log(`Found ${movements.length} stock movements`);
    
    // Format the data for PDF generation
    const formattedMovements = movements.map(item => ({
      id: item.movement_id,
      date: new Date(item.movement_date),
      itemName: item.item_name || 'Unknown Item',
      previousQuantity: item.previous_quantity || 0,
      quantityChange: item.quantity_change || 0,
      newQuantity: item.new_quantity || 0,
      type: item.movement_type || 'Unknown',
      reason: item.notes || '',
      username: item.created_by_first_name ? `${item.created_by_first_name} ${item.created_by_last_name}`.trim() : 'System',
      notes: item.notes || ''
    }));
    
    // Generate PDF
    const options = {
      startDate: startDate ? formatDate(new Date(startDate)) : undefined,
      endDate: endDate ? formatDate(new Date(endDate)) : undefined,
      title: 'Stock Movement History'
    };
    
    const pdfBuffer = await createStockMovementPdf(formattedMovements, options);
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=stock-movements-${new Date().toISOString().split('T')[0]}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send PDF buffer
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating stock movement PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate stock movement PDF',
      error: error.message
    });
  }
};

/**
 * Generate PDF for the inventory turnover report
 */
exports.getInventoryTurnoverPdf = async (req, res) => {
  try {
    console.log('Generating inventory turnover PDF report');
    const { period = 90, category = '' } = req.query;
    
    // Set CORS headers first thing - before any processing
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Expose-Headers', 'Content-Type, Content-Disposition, Content-Length');
    
    // Handle OPTIONS requests immediately
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    
    console.log(`PDF request with period: ${period} days, category: ${category || 'All'}`);
    
    try {
      // First get the turnover data using the existing function logic
      // Get turnover metrics for individual products and overall metrics
      const productQuery = `
        SELECT
          p.Product_ID,
          p.Name,
          p.SKU,
          p.Category,
          COALESCE(i.Stock_Level, 0) as current_stock,
          COALESCE(SUM(oi.Quantity), 0) as units_sold,
          COALESCE(SUM(oi.Quantity * p.cost_price), 0) as cogs,
          p.cost_price as unit_cost
        FROM product p
        LEFT JOIN inventory i ON p.Product_ID = i.Product_ID
        LEFT JOIN order_item oi ON p.Product_ID = oi.Product_ID
        LEFT JOIN customerorder co ON oi.Order_ID = co.Order_ID
        WHERE 
          (co.Order_Date >= DATE_SUB(CURDATE(), INTERVAL ? DAY) OR co.Order_Date IS NULL)
          ${category ? 'AND p.Category = ?' : ''}
        GROUP BY 
          p.Product_ID,
          p.Name,
          p.SKU,
          p.Category,
          i.Stock_Level,
          p.cost_price;
      `;
    
      const params = [period];
      if (category) params.push(category);
      
      // Execute query with proper error handling
      let result;
      try {
        result = await executeQuery(productQuery, params);
        console.log(`Products query executed successfully, result type: ${typeof result}`);
      } catch (queryError) {
        console.error('Error executing products query:', queryError);
        throw new Error(`Database query failed: ${queryError.message}`);
      }
      
      // Handle array structure - executeQuery can return nested arrays
      // Make sure we're accessing the actual array of products
      let products = [];
      if (Array.isArray(result)) {
        if (result.length > 0 && Array.isArray(result[0])) {
          products = result[0]; // Handle nested array case
        } else {
          products = result; // Handle flat array case
        }
      }
      
      console.log(`Retrieved ${products.length} products for PDF generation`);
      
      // Calculate additional metrics for each product
      const processedProducts = products.map(product => {
        const currentStock = parseInt(product.current_stock) || 0;
        const unitsSold = parseInt(product.units_sold) || 0;
        const cogs = parseFloat(product.cogs) || 0;
        const unitCost = parseFloat(product.unit_cost) || 0;
        
        // Calculate inventory value (current stock * unit cost)
        const inventoryValue = currentStock * unitCost;
        
        // Calculate average inventory value (assuming current inventory is representative)
        // In a real system, you'd average inventory levels over the period
        const avgInventoryValue = inventoryValue;
        
        // Calculate turnover ratio (COGS / average inventory value)
        // Avoid division by zero
        const turnoverRatio = avgInventoryValue > 0 ? cogs / avgInventoryValue : 0;
        
        // Calculate Days Sales of Inventory (DSI)
        // Using the formula: DSI = (Avg. Inventory Value ÷ COGS) × Days in Period
        const dsi = cogs > 0 ? (avgInventoryValue / cogs) * parseInt(period) : 0;
        
        // Determine inventory health based on turnover ratio and DSI
        let inventoryHealth = 'Unknown';
        if (turnoverRatio >= 4) {
          inventoryHealth = 'Fast-moving';
        } else if (turnoverRatio >= 2) {
          inventoryHealth = 'Healthy';
        } else if (turnoverRatio >= 1) {
          inventoryHealth = 'Slow-moving';
        } else {
          inventoryHealth = 'Stagnant';
        }
        
        return {
          ...product,
          inventory_value: inventoryValue,
          avg_inventory_value: avgInventoryValue,
          turnover_ratio: turnoverRatio,
          dsi: dsi,
          inventory_health: inventoryHealth
        };
      });
      
      // Get turnover metrics by category
      const categoryQuery = `
        SELECT
          p.Category,
          COUNT(DISTINCT p.Product_ID) as product_count,
          SUM(COALESCE(i.Stock_Level, 0) * p.cost_price) as total_inventory_value,
          SUM(COALESCE(oi.Quantity, 0)) as total_units_sold,
          SUM(COALESCE(oi.Quantity * p.cost_price, 0)) as total_cogs
        FROM
          product p
        LEFT JOIN
          inventory i ON p.Product_ID = i.Product_ID
        LEFT JOIN
          order_item oi ON p.Product_ID = oi.Product_ID
        LEFT JOIN
          customerorder co ON oi.Order_ID = co.Order_ID
        WHERE
          (co.Order_Date >= DATE_SUB(CURDATE(), INTERVAL ? DAY) OR co.Order_Date IS NULL)
          ${category ? 'AND p.Category = ?' : ''}
        GROUP BY
          p.Category;
      `;
      
      // Execute category query with proper error handling
      let catResult;
      try {
        catResult = await executeQuery(categoryQuery, params);
        console.log(`Categories query executed successfully, result type: ${typeof catResult}`);
      } catch (queryError) {
        console.error('Error executing categories query:', queryError);
        throw new Error(`Database query failed: ${queryError.message}`);
      }
      
      // Handle array structure - similar to the products query
      let categories = [];
      if (Array.isArray(catResult)) {
        if (catResult.length > 0 && Array.isArray(catResult[0])) {
          categories = catResult[0]; // Handle nested array case
        } else {
          categories = catResult; // Handle flat array case
        }
      }
      
      console.log(`Retrieved ${categories.length} categories for PDF generation`);
      
      // Calculate turnover ratio and DSI for each category
      const processedCategories = categories.map(cat => {
        const totalInventoryValue = parseFloat(cat.total_inventory_value) || 0;
        const totalCogs = parseFloat(cat.total_cogs) || 0;
        
        // Avoid division by zero
        const categoryTurnoverRatio = totalInventoryValue > 0 ? totalCogs / totalInventoryValue : 0;
        
        // Calculate DSI using the formula: DSI = (Avg. Inventory Value ÷ COGS) × Days in Period
        const dsi = totalCogs > 0 ? (totalInventoryValue / totalCogs) * parseInt(period) : 0;
        
        return {
          ...cat,
          category_turnover_ratio: categoryTurnoverRatio,
          total_inventory_value: parseFloat(cat.total_inventory_value || 0).toFixed(2),
          total_cogs: parseFloat(cat.total_cogs || 0).toFixed(2),
          dsi: dsi,
          category_health: calculateInventoryHealth(categoryTurnoverRatio, cat.total_stock, cat.total_units_sold)
        };
      });
      
      // Calculate summary metrics
      const summaryStats = {
        total_inventory_value: products.reduce((sum, product) => 
          sum + (parseInt(product.current_stock) || 0) * (parseFloat(product.unit_cost) || 0), 0),
        total_cogs: products.reduce((sum, product) => 
          sum + (parseFloat(product.cogs) || 0), 0),
        product_count: products.length,
        category_count: new Set(products.map(p => p.Category)).size,
        start_date: new Date(Date.now() - period * 24 * 60 * 60 * 1000).toLocaleDateString(),
        end_date: new Date().toLocaleDateString()
      };
      
      // Calculate overall turnover ratio
      summaryStats.overall_turnover_ratio = summaryStats.total_inventory_value > 0 ? 
        summaryStats.total_cogs / summaryStats.total_inventory_value : 0;
      
      // Calculate overall DSI
      // Use the formula: DSI = (Avg. Inventory Value ÷ COGS) × Days in Period
      summaryStats.overall_dsi = summaryStats.total_cogs > 0 ? 
        (summaryStats.total_inventory_value / summaryStats.total_cogs) * parseInt(period) : 0;
      
      // Prepare the data object for the PDF generator
      const turnoverData = {
        summary: summaryStats,
        products: processedProducts,
        categories: processedCategories
      };
      
      // Generate PDF buffer
      console.log('Generating PDF with turnover data...');
      
      try {
        const pdfBuffer = await createInventoryTurnoverPdf(turnoverData, { period });
        console.log(`Generated PDF with size: ${pdfBuffer.length} bytes`);
        
        // Create a more consistent filename
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const filename = `inventory-turnover-report-${today}.pdf`;
        
        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        
        // Send the PDF buffer
        return res.send(pdfBuffer);
      } catch (pdfError) {
        console.error('Error generating PDF:', pdfError);
        throw new Error(`PDF generation error: ${pdfError.message}`);
      }
    } catch (dbError) {
      console.error('Error processing data for PDF:', dbError);
      return res.status(500).json({ 
        success: false,
        error: 'Error generating turnover data', 
        details: dbError.message 
      });
    }
  } catch (error) {
    console.error('Error generating turnover PDF:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error generating turnover PDF', 
      details: error.message 
    });
  }
};

// Helper function for category health assessment
function calculateCategoryHealth(turnoverRatio) {
  if (turnoverRatio > 4) return 'Fast-moving';
  if (turnoverRatio > 2) return 'Healthy';
  if (turnoverRatio > 0.5) return 'Slow-moving';
  return 'Stagnant';
}