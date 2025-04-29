const { executeQuery } = require('../config/db');
const { inventoryQueries } = require('../models/queries');

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
    const threshold = req.query.threshold || 10; // Default threshold of 10
    const query = `
      SELECT i.*, p.Product_Name 
      FROM inventory i
      JOIN product p ON i.Product_ID = p.Product_ID
      WHERE i.Stock_Level < ?
    `;
    const lowStockItems = await executeQuery(query, [threshold]);
    res.json(lowStockItems);
  } catch (error) {
    console.error('Error fetching low stock items:', error.message);
    res.status(500).json({ 
      message: 'Error fetching low stock items',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single inventory item by ID
const getInventoryById = async (req, res) => {
  try {
    const inventoryId = req.params.id;
    if (!inventoryId || isNaN(inventoryId)) {
      return res.status(400).json({ message: 'Invalid inventory ID' });
    }

    const inventory = await executeQuery(inventoryQueries.getInventoryById, [inventoryId]);
    
    if (inventory.length === 0) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    res.json(inventory[0]);
  } catch (error) {
    console.error('Error fetching inventory item:', error.message);
    res.status(500).json({ 
      message: 'Error fetching inventory item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create new inventory item
const createInventory = async (req, res) => {
  try {
    const { stockLevel, productId, supplierId } = req.body;
    
    // Input validation
    if (!stockLevel || !productId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await executeQuery(
      inventoryQueries.createInventory,
      [stockLevel, productId, supplierId || null]
    );
    
    if (result.affectedRows === 1) {
      // Update product stock level
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

    // Check if inventory exists
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
      // Calculate stock difference and update product
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

    // Check if inventory exists
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
      // Update product stock level
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
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory
};