const db = require('../config/db');

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const [suppliers] = await db.query('SELECT * FROM supplier');
    res.status(200).json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ message: 'Failed to retrieve suppliers' });
  }
};

// Get supplier by ID
exports.getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const [supplier] = await db.query('SELECT * FROM supplier WHERE Supplier_ID = ?', [id]);
    
    if (supplier.length === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    res.status(200).json(supplier[0]);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ message: 'Failed to retrieve supplier' });
  }
};

// Create new supplier
exports.createSupplier = async (req, res) => {
  try {
    const { name, email, phone_number } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Supplier name is required' });
    }
    
    const [result] = await db.query(
      'INSERT INTO supplier (Name, Email, Phone_Number) VALUES (?, ?, ?)',
      [name, email, phone_number]
    );
    
    res.status(201).json({ 
      message: 'Supplier created successfully',
      supplierId: result.insertId
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ message: 'Failed to create supplier' });
  }
};

// Update supplier
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone_number } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Supplier name is required' });
    }
    
    const [result] = await db.query(
      'UPDATE supplier SET Name = ?, Email = ?, Phone_Number = ? WHERE Supplier_ID = ?',
      [name, email, phone_number, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    res.status(200).json({ message: 'Supplier updated successfully' });
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ message: 'Failed to update supplier' });
  }
};

// Delete supplier
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM supplier WHERE Supplier_ID = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    res.status(200).json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ message: 'Failed to delete supplier' });
  }
};

// Get supplier's inventory
exports.getSupplierInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const [inventory] = await db.query(
      `SELECT si.*, p.Name as ProductName 
       FROM supplier_inventory si
       JOIN product p ON si.Product_ID = p.Product_ID
       WHERE si.Supplier_ID = ?`,
      [id]
    );
    
    res.status(200).json(inventory);
  } catch (error) {
    console.error('Error fetching supplier inventory:', error);
    res.status(500).json({ message: 'Failed to retrieve supplier inventory' });
  }
};