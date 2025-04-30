const { executeQuery, executeTransaction } = require('../config/db');
const { validationResult } = require('express-validator');

// Get inventory with batch/lot tracking
exports.getInventoryWithBatches = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Get main inventory information
    const inventoryQuery = `
      SELECT 
        i.*,
        p.Name as product_name,
        p.SKU as product_sku,
        p.Category as category,
        p.Image_URL as image_url,
        s.Name as supplier_name,
        s.Supplier_ID as supplier_id
      FROM inventory i
      JOIN product p ON i.Product_ID = p.Product_ID
      LEFT JOIN supplier s ON i.Supplier_ID = s.Supplier_ID
      WHERE i.Product_ID = ?
    `;
    
    const inventory = await executeQuery(inventoryQuery, [productId]);
    
    if (inventory.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found for this product'
      });
    }
    
    // Get batch/lot information
    const batchesQuery = `
      SELECT * FROM inventory_batch
      WHERE product_id = ?
      ORDER BY expiry_date ASC, received_date DESC
    `;
    
    const batches = await executeQuery(batchesQuery, [productId]);
    
    // Get inventory audit history
    const auditQuery = `
      SELECT 
        ia.*,
        CONCAT(s.first_name, ' ', s.last_name) as adjusted_by_name
      FROM inventory_audit ia
      JOIN staff s ON ia.adjusted_by = s.Staff_ID
      WHERE ia.product_id = ?
      ORDER BY ia.adjusted_at DESC
      LIMIT 10
    `;
    
    const auditHistory = await executeQuery(auditQuery, [productId]);
    
    res.status(200).json({
      success: true,
      data: {
        inventory: inventory[0],
        batches,
        auditHistory
      }
    });
  } catch (error) {
    console.error('Error fetching inventory details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve inventory details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add inventory batch
exports.addInventoryBatch = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const {
      product_id,
      batch_number,
      quantity,
      cost_per_unit,
      manufactured_date,
      expiry_date,
      supplier_id,
      notes
    } = req.body;
    
    if (!product_id || !batch_number || !quantity || !cost_per_unit) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, batch number, quantity, and cost per unit are required'
      });
    }
    
    // Check if product exists
    const productCheck = await executeQuery(
      'SELECT Product_ID FROM product WHERE Product_ID = ?',
      [product_id]
    );
    
    if (productCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Use transaction to update inventory and add batch
    await executeTransaction(async (connection) => {
      // Add the batch
      const [batchResult] = await connection.query(
        `INSERT INTO inventory_batch 
        (product_id, batch_number, quantity, cost_per_unit, manufactured_date, expiry_date, received_date, supplier_id, notes) 
        VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?, ?)`,
        [product_id, batch_number, quantity, cost_per_unit, manufactured_date || null, expiry_date || null, supplier_id || null, notes || null]
      );
      
      // Update the overall inventory stock level
      await connection.query(
        `UPDATE inventory 
        SET Stock_Level = Stock_Level + ?, Last_Updated = NOW() 
        WHERE Product_ID = ?`,
        [quantity, product_id]
      );
      
      // Update the product stock level
      await connection.query(
        `UPDATE product 
        SET Stock_Level = Stock_Level + ? 
        WHERE Product_ID = ?`,
        [quantity, product_id]
      );
      
      // Add audit record
      await connection.query(
        `INSERT INTO inventory_audit 
        (product_id, batch_id, previous_quantity, new_quantity, adjustment_reason, adjusted_by) 
        VALUES (?, ?, 
        (SELECT Stock_Level - ? FROM inventory WHERE Product_ID = ?), 
        (SELECT Stock_Level FROM inventory WHERE Product_ID = ?), 
        ?, ?)`,
        [product_id, batchResult.insertId, quantity, product_id, product_id, 'New batch received', req.user.userId]
      );
      
      return batchResult.insertId;
    });
    
    res.status(201).json({
      success: true,
      message: 'Inventory batch added successfully'
    });
  } catch (error) {
    console.error('Error adding inventory batch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add inventory batch',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Adjust inventory
exports.adjustInventory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const {
      product_id,
      batch_id,
      quantity_change,
      adjustment_reason
    } = req.body;
    
    if (!product_id || !adjustment_reason || quantity_change === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, quantity change, and adjustment reason are required'
      });
    }
    
    await executeTransaction(async (connection) => {
      // Get current quantities
      const [inventoryResult] = await connection.query(
        'SELECT Stock_Level FROM inventory WHERE Product_ID = ?',
        [product_id]
      );
      
      if (inventoryResult.length === 0) {
        throw new Error('Inventory not found for this product');
      }
      
      const currentQuantity = inventoryResult[0].Stock_Level;
      const newQuantity = currentQuantity + quantity_change;
      
      if (newQuantity < 0) {
        throw new Error('Adjustment would result in negative inventory');
      }
      
      // Update batch if specified
      if (batch_id) {
        const [batchResult] = await connection.query(
          'SELECT quantity FROM inventory_batch WHERE batch_id = ?',
          [batch_id]
        );
        
        if (batchResult.length === 0) {
          throw new Error('Batch not found');
        }
        
        const currentBatchQuantity = batchResult[0].quantity;
        const newBatchQuantity = currentBatchQuantity + quantity_change;
        
        if (newBatchQuantity < 0) {
          throw new Error('Adjustment would result in negative batch quantity');
        }
        
        await connection.query(
          'UPDATE inventory_batch SET quantity = ? WHERE batch_id = ?',
          [newBatchQuantity, batch_id]
        );
      }
      
      // Update main inventory
      await connection.query(
        'UPDATE inventory SET Stock_Level = ?, Last_Updated = NOW() WHERE Product_ID = ?',
        [newQuantity, product_id]
      );
      
      // Update product stock level
      await connection.query(
        'UPDATE product SET Stock_Level = ? WHERE Product_ID = ?',
        [newQuantity, product_id]
      );
      
      // Add audit record
      await connection.query(
        `INSERT INTO inventory_audit 
        (product_id, batch_id, previous_quantity, new_quantity, adjustment_reason, adjusted_by) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [product_id, batch_id || null, currentQuantity, newQuantity, adjustment_reason, req.user.userId]
      );
    });
    
    res.status(200).json({
      success: true,
      message: 'Inventory adjusted successfully'
    });
  } catch (error) {
    console.error('Error adjusting inventory:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to adjust inventory',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get low stock items with enhanced details
exports.getEnhancedLowStockItems = async (req, res) => {
  try {
    const threshold = req.query.threshold || 10;
    
    const query = `
      SELECT 
        i.Inventory_ID,
        i.Product_ID,
        i.Stock_Level,
        i.reorder_level,
        i.Last_Updated,
        i.bin_location,
        i.warehouse_zone,
        p.Name,
        p.SKU,
        p.Category,
        p.Manufacturer,
        p.Image_URL,
        p.Price,
        s.Name as supplier_name,
        s.Supplier_ID,
        s.Email as supplier_email,
        s.Phone_Number as supplier_phone,
        (SELECT MAX(received_date) FROM inventory_batch WHERE product_id = i.Product_ID) as last_received_date,
        (SELECT AVG(DATEDIFF(received_date, ordered_date)) 
         FROM purchase_order po 
         JOIN po_item poi ON po.po_id = poi.po_id
         WHERE poi.product_id = i.Product_ID AND po.status = 'RECEIVED') as avg_lead_time_days
      FROM inventory i
      JOIN product p ON i.Product_ID = p.Product_ID
      LEFT JOIN supplier s ON i.Supplier_ID = s.Supplier_ID
      WHERE i.Stock_Level <= i.reorder_level
      ORDER BY (i.reorder_level - i.Stock_Level) DESC
    `;
    
    const lowStockItems = await executeQuery(query);
    
    res.status(200).json({
      success: true,
      data: lowStockItems
    });
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve low stock items',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get inventory audit log
exports.getInventoryAuditLog = async (req, res) => {
  try {
    const { startDate, endDate, productId, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    const queryParams = [];
    
    if (startDate && endDate) {
      whereConditions.push('ia.adjusted_at BETWEEN ? AND ?');
      queryParams.push(startDate, endDate);
    }
    
    if (productId) {
      whereConditions.push('ia.product_id = ?');
      queryParams.push(productId);
    }
    
    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : '';
    
    const query = `
      SELECT 
        ia.*,
        p.Name as product_name,
        p.SKU as product_sku,
        CONCAT(s.first_name, ' ', s.last_name) as adjusted_by_name,
        ib.batch_number
      FROM inventory_audit ia
      JOIN product p ON ia.product_id = p.Product_ID
      JOIN staff s ON ia.adjusted_by = s.Staff_ID
      LEFT JOIN inventory_batch ib ON ia.batch_id = ib.batch_id
      ${whereClause}
      ORDER BY ia.adjusted_at DESC
      LIMIT ? OFFSET ?
    `;
    
    queryParams.push(parseInt(limit), offset);
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM inventory_audit ia
      ${whereClause}
    `;
    
    const [auditLogs, countResult] = await Promise.all([
      executeQuery(query, queryParams),
      executeQuery(countQuery, queryParams.slice(0, -2))
    ]);
    
    const total = countResult[0].total;
    
    res.status(200).json({
      success: true,
      data: auditLogs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching inventory audit log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve inventory audit log',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update inventory settings
exports.updateInventorySettings = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      reorder_level,
      optimal_level,
      bin_location,
      warehouse_zone,
      inventory_value_method
    } = req.body;
    
    // Check if inventory exists
    const inventoryCheck = await executeQuery(
      'SELECT Inventory_ID FROM inventory WHERE Product_ID = ?',
      [productId]
    );
    
    if (inventoryCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found for this product'
      });
    }
    
    const updateFields = [];
    const updateValues = [];
    
    if (reorder_level !== undefined) {
      updateFields.push('reorder_level = ?');
      updateValues.push(reorder_level);
    }
    
    if (optimal_level !== undefined) {
      updateFields.push('optimal_level = ?');
      updateValues.push(optimal_level);
    }
    
    if (bin_location !== undefined) {
      updateFields.push('bin_location = ?');
      updateValues.push(bin_location);
    }
    
    if (warehouse_zone !== undefined) {
      updateFields.push('warehouse_zone = ?');
      updateValues.push(warehouse_zone);
    }
    
    if (inventory_value_method !== undefined) {
      updateFields.push('inventory_value_method = ?');
      updateValues.push(inventory_value_method);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    updateValues.push(productId);
    
    await executeQuery(
      `UPDATE inventory 
       SET ${updateFields.join(', ')}, Last_Updated = NOW() 
       WHERE Product_ID = ?`,
      updateValues
    );
    
    res.status(200).json({
      success: true,
      message: 'Inventory settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating inventory settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inventory settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Generate inventory value report
exports.getInventoryValueReport = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.Category as category,
        SUM(i.Stock_Level * p.Price) as total_retail_value,
        SUM(CASE 
          WHEN i.inventory_value_method = 'FIFO' THEN 
            (SELECT SUM(quantity * cost_per_unit) 
             FROM inventory_batch 
             WHERE product_id = p.Product_ID 
             ORDER BY received_date ASC
             LIMIT 1)
          WHEN i.inventory_value_method = 'LIFO' THEN
            (SELECT SUM(quantity * cost_per_unit) 
             FROM inventory_batch 
             WHERE product_id = p.Product_ID 
             ORDER BY received_date DESC
             LIMIT 1)
          WHEN i.inventory_value_method = 'AVERAGE' OR i.inventory_value_method IS NULL THEN
            (SELECT AVG(cost_per_unit) * i.Stock_Level
             FROM inventory_batch 
             WHERE product_id = p.Product_ID)
        END) as total_cost_value,
        COUNT(p.Product_ID) as product_count
      FROM product p
      JOIN inventory i ON p.Product_ID = i.Product_ID
      GROUP BY p.Category
    `;
    
    const categoryValues = await executeQuery(query);
    
    // Get overall totals
    const totalQuery = `
      SELECT 
        SUM(i.Stock_Level * p.Price) as total_retail_value,
        COUNT(DISTINCT p.Product_ID) as total_products,
        SUM(i.Stock_Level) as total_items
      FROM product p
      JOIN inventory i ON p.Product_ID = i.Product_ID
    `;
    
    const totalResult = await executeQuery(totalQuery);
    
    const total = totalResult[0] || {};
    
    // Calculate carrying costs (approximately 20-30% of inventory value per year)
    const carryingCostRate = 0.25; // 25% annual carrying cost
    const carryingCost = carryingCostRate * total.total_retail_value;
    
    res.status(200).json({
      success: true,
      data: {
        by_category: categoryValues,
        summary: {
          ...total,
          estimated_annual_carrying_cost: carryingCost
        }
      }
    });
  } catch (error) {
    console.error('Error generating inventory value report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate inventory value report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create purchase order
exports.createPurchaseOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const {
      supplier_id,
      expected_delivery_date,
      shipping_address,
      notes,
      items
    } = req.body;
    
    if (!supplier_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Supplier ID and at least one item are required'
      });
    }
    
    // Check if supplier exists
    const supplierCheck = await executeQuery(
      'SELECT Supplier_ID FROM supplier WHERE Supplier_ID = ?',
      [supplier_id]
    );
    
    if (supplierCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    // Create the purchase order
    const result = await executeTransaction(async (connection) => {
      // Calculate total amount
      let totalAmount = 0;
      for (const item of items) {
        if (!item.product_id || !item.quantity || !item.unit_price) {
          throw new Error('Each item must include product_id, quantity, and unit_price');
        }
        
        totalAmount += item.quantity * item.unit_price;
      }
      
      // Insert purchase order
      const [poResult] = await connection.query(
        `INSERT INTO purchase_order 
        (supplier_id, expected_delivery_date, status, total_amount, payment_status, shipping_address, notes, created_by) 
        VALUES (?, ?, 'DRAFT', ?, 'PENDING', ?, ?, ?)`,
        [supplier_id, expected_delivery_date || null, totalAmount, shipping_address, notes || null, req.user.userId]
      );
      
      const poId = poResult.insertId;
      
      // Insert order items
      for (const item of items) {
        await connection.query(
          `INSERT INTO po_item 
          (po_id, product_id, quantity, unit_price, notes) 
          VALUES (?, ?, ?, ?, ?)`,
          [poId, item.product_id, item.quantity, item.unit_price, item.notes || null]
        );
      }
      
      return poId;
    });
    
    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully',
      data: { po_id: result }
    });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create purchase order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};