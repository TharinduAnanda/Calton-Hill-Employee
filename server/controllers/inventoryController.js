const { executeQuery } = require('../config/db');
const { inventoryQueries } = require('../models/queries');
const { validationResult } = require('express-validator');

// Get all inventory items
const getAllInventory = async (req, res) => {
  try {
    const inventory = await executeQuery(inventoryQueries.getAllInventory);
    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error.message);
    res.status(500).json({ 
      message: 'Error fetching inventory',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get low stock inventory items
const getLowStockItems = async (req, res) => {
  try {
    const { page = 1, limit = 10, threshold } = req.query;
    const offset = (page - 1) * limit;
    
    let thresholdCondition = 'quantity <= reorder_level';
    if (threshold) {
      thresholdCondition = `quantity <= ${parseInt(threshold)}`;
    }
    
    const query = `
      SELECT * FROM inventory_item
      WHERE ${thresholdCondition}
      ORDER BY (reorder_level - quantity) DESC
      LIMIT ? OFFSET ?
    `;
    
    const [items] = await executeQuery(query, [parseInt(limit), offset]);
    
    const [countResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM inventory_item WHERE ${thresholdCondition}`
    );
    
    const total = countResult[0].total;
    
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

// Get inventory summary statistics
const getInventorySummary = async (req, res) => {
  try {
    console.log('Inventory summary endpoint called');
    
    // Get total items count - no ID validation needed
    const [totalItems] = await executeQuery('SELECT COUNT(*) as count FROM inventory_item');
    
    // Get total inventory value
    const [totalValue] = await executeQuery(`
      SELECT SUM(price * quantity) as total_value 
      FROM inventory_item
    `);
    
    // Get low stock items count
    const [lowStockItems] = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM inventory_item 
      WHERE quantity <= reorder_level
    `);
    
    // Get categories count
    const [categoriesCount] = await executeQuery(`
      SELECT COUNT(DISTINCT category) as count 
      FROM inventory_item
    `);
    
    // Get items added in the last 30 days
    const [recentItems] = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM inventory_item 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    
    // Return the data without validating any ID
    res.status(200).json({
      success: true,
      data: {
        totalItems: totalItems[0].count,
        totalValue: totalValue[0].total_value || 0,
        lowStockItems: lowStockItems[0].count,
        categoriesCount: categoriesCount[0].count,
        newItemsThisMonth: recentItems[0].count
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

// Get single inventory item by ID
const getInventoryById = async (req, res) => {
  try {
    const inventoryId = req.params.id;
    
    // Validate ID separately in this function, not in the summary function
    if (!inventoryId) {
      return res.status(400).json({ message: 'Invalid inventory ID' });
    }

    const [inventory] = await executeQuery(
      'SELECT * FROM inventory_item WHERE id = ?', 
      [inventoryId]
    );
    
    if (inventory.length === 0) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    res.status(200).json({
      success: true,
      data: inventory[0]
    });
  } catch (error) {
    console.error(`Error fetching inventory item #${req.params.id}:`, error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching inventory item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create new inventory item
const createInventory = async (req, res) => {
  try {
    const { stockLevel, productId, supplierId } = req.body;
    
    if (!stockLevel || !productId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await executeQuery(
      inventoryQueries.createInventory,
      [stockLevel, productId, supplierId || null]
    );
    
    if (result.affectedRows === 1) {
      await executeQuery(
        'UPDATE product SET Stock_Level = Stock_Level + ? WHERE Product_ID = ?',
        [stockLevel, productId]
      );
      
      const newInventory = await executeQuery(
        inventoryQueries.getInventoryById,
        [result.insertId]
      );
      
      res.status(201).json({
        message: 'Inventory item created successfully',
        inventory: newInventory[0]
      });
    } else {
      res.status(400).json({ message: 'Failed to create inventory item' });
    }
  } catch (error) {
    console.error('Error creating inventory item:', error.message);
    res.status(500).json({ 
      message: 'Error creating inventory item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update inventory item
const updateInventory = async (req, res) => {
  try {
    const inventoryId = req.params.id;
    const { stockLevel, supplierId } = req.body;
    
    if (!inventoryId || isNaN(inventoryId)) {
      return res.status(400).json({ message: 'Invalid inventory ID' });
    }

    const inventory = await executeQuery(
      inventoryQueries.getInventoryById,
      [inventoryId]
    );
    
    if (inventory.length === 0) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    const result = await executeQuery(
      inventoryQueries.updateInventory,
      [stockLevel, supplierId || null, inventoryId]
    );
    
    if (result.affectedRows === 1) {
      const stockDifference = stockLevel - inventory[0].Stock_Level;
      await executeQuery(
        'UPDATE product SET Stock_Level = Stock_Level + ? WHERE Product_ID = ?',
        [stockDifference, inventory[0].Product_ID]
      );
      
      const updatedInventory = await executeQuery(
        inventoryQueries.getInventoryById,
        [inventoryId]
      );
      
      res.json({
        message: 'Inventory item updated successfully',
        inventory: updatedInventory[0]
      });
    } else {
      res.status(400).json({ message: 'Failed to update inventory item' });
    }
  } catch (error) {
    console.error('Error updating inventory item:', error.message);
    res.status(500).json({ 
      message: 'Error updating inventory item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete inventory item
const deleteInventory = async (req, res) => {
  try {
    const inventoryId = req.params.id;
    
    if (!inventoryId || isNaN(inventoryId)) {
      return res.status(400).json({ message: 'Invalid inventory ID' });
    }

    const inventory = await executeQuery(
      inventoryQueries.getInventoryById,
      [inventoryId]
    );
    
    if (inventory.length === 0) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    const result = await executeQuery(
      inventoryQueries.deleteInventory,
      [inventoryId]
    );
    
    if (result.affectedRows === 1) {
      await executeQuery(
        'UPDATE product SET Stock_Level = Stock_Level - ? WHERE Product_ID = ?',
        [inventory[0].Stock_Level, inventory[0].Product_ID]
      );
      
      res.json({ message: 'Inventory item deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete inventory item' });
    }
  } catch (error) {
    console.error('Error deleting inventory item:', error.message);
    res.status(500).json({ 
      message: 'Error deleting inventory item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllInventory,
  getLowStockItems,
  getInventorySummary,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory
};