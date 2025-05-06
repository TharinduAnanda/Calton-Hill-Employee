const { executeQuery, executeTransaction } = require('../config/db');

/**
 * Helper function to get supplier with associated products
 */
const getSupplierWithProducts = async (id) => {
  // Get supplier basic info
  const suppliers = await executeQuery('SELECT * FROM supplier WHERE Supplier_ID = ?', [id]);
  
  if (!suppliers || suppliers.length === 0) {
    return null;
  }
  
  // Get associated products
  const associatedProducts = await executeQuery(
    `SELECT p.* FROM product p
     JOIN supplier_product sp ON p.Product_ID = sp.product_id
     WHERE sp.supplier_id = ?`,
    [id]
  );
  
  // Format the supplier object
  const supplier = suppliers[0];
  
  // Add address formatting
  const addressParts = [
    supplier.street,
    supplier.city,
    supplier.state,
    supplier.zipCode,
    supplier.country
  ].filter(Boolean);
  
  const formattedAddress = addressParts.length > 0 ? addressParts.join(', ') : null;
  
  return {
    ...supplier,
    address: {
      street: supplier.street || '',
      city: supplier.city || '',
      state: supplier.state || '',
      zipCode: supplier.zipCode || '',
      country: supplier.country || ''
    },
    formattedAddress,
    products: associatedProducts || []
  };
};

/**
 * Get all suppliers with their products
 */
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await executeQuery('SELECT * FROM supplier');
    
    // Get products for each supplier
    const suppliersWithProducts = await Promise.all(
      suppliers.map(async (supplier) => {
        const products = await executeQuery(
          `SELECT p.* FROM product p
           JOIN supplier_product sp ON p.Product_ID = sp.product_id
           WHERE sp.supplier_id = ?`,
          [supplier.Supplier_ID]
        );
        
        // Format address
        const addressParts = [
          supplier.street,
          supplier.city,
          supplier.state,
          supplier.zipCode,
          supplier.country
        ].filter(Boolean);
        
        const formattedAddress = addressParts.length > 0 ? addressParts.join(', ') : null;
        
        return {
          ...supplier,
          address: {
            street: supplier.street || '',
            city: supplier.city || '',
            state: supplier.state || '',
            zipCode: supplier.zipCode || '',
            country: supplier.country || ''
          },
          formattedAddress,
          products: products || []
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: suppliersWithProducts.length,
      data: suppliersWithProducts
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve suppliers',
      error: error.message
    });
  }
};

/**
 * Get supplier by ID
 */
exports.getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await getSupplierWithProducts(id);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve supplier',
      error: error.message
    });
  }
};

/**
 * Create a new supplier
 */
exports.createSupplier = async (req, res) => {
  try {
    const { 
      name, 
      contactPerson, 
      email, 
      phone,
      // Extract individual address fields
      street,
      city,
      state,
      zipCode,
      country,
      // New field for products supplied
      products
    } = req.body;
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required fields'
      });
    }
    
    // Use a transaction to ensure both supplier and product associations are created
    let newSupplierId;
    
    await executeTransaction(async (connection) => {
      // Insert supplier with separate address fields
      const [supplierResult] = await connection.query(
        `INSERT INTO supplier 
         (Name, Contact_Person, Email, Phone_Number, street, city, state, zipCode, country) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name, 
          contactPerson || null, 
          email, 
          phone || null,
          street || null,
          city || null,
          state || null,
          zipCode || null,
          country || null
        ]
      );
      
      newSupplierId = supplierResult.insertId;
      
      // If products were provided, create associations
      if (Array.isArray(products) && products.length > 0) {
        for (const productId of products) {
          await connection.query(
            `INSERT INTO supplier_product (supplier_id, product_id) VALUES (?, ?)`,
            [newSupplierId, productId]
          );
        }
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: {
        Supplier_ID: newSupplierId,
        Name: name,
        Contact_Person: contactPerson,
        Email: email,
        Phone_Number: phone,
        street,
        city,
        state,
        zipCode,
        country,
        products
      }
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create supplier',
      error: error.message
    });
  }
};

/**
 * Update a supplier - SIMPLIFIED VERSION
 */
exports.updateSupplier = async (req, res) => {
  // const connection = await require('mysql2/promise').createConnection({
  //   host: process.env.DB_HOST || 'localhost',
  //   user: process.env.DB_USER || 'root',
  //   password: process.env.DB_PASSWORD || '',
  //   database: process.env.DB_DATABASE || 'inventory_management'
  // });
  
  try {
    const { id } = req.params;
    const { 
      name, 
      contactPerson, 
      email, 
      phone,
      street,
      city,
      state,
      zipCode,
      country,
      products
    } = req.body;

    console.log(`Simplified update for supplier #${id}`);
    
    // Basic validation
    if (!name || !email) {
      await connection.end();
      return res.status(400).json({
        success: false,
        message: 'Name and email are required fields'
      });
    }

    // 1. Update basic supplier info
    await connection.query(
      `UPDATE supplier SET 
        Name = ?, 
        Contact_Person = ?, 
        Email = ?, 
        Phone_Number = ?,
        street = ?,
        city = ?,
        state = ?,
        zipCode = ?,
        country = ?
      WHERE Supplier_ID = ?`,
      [
        name, 
        contactPerson || null, 
        email, 
        phone || null,
        street || null,
        city || null,
        state || null,
        zipCode || null,
        country || null,
        id
      ]
    );
    
    console.log('Basic supplier info updated');
    
    // 2. Get updated supplier
    const [updatedSupplier] = await connection.query(
      'SELECT * FROM supplier WHERE Supplier_ID = ?',
      [id]
    );
    
    if (!updatedSupplier || updatedSupplier.length === 0) {
      await connection.end();
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    console.log('Successfully fetched updated supplier');
    
    // Return response without product data for now
    const supplier = updatedSupplier[0];
    
    await connection.end();
    
    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });
  } catch (error) {
    console.error('Error updating supplier (simplified):', error);
    await connection.end();
    res.status(500).json({
      success: false,
      message: 'Failed to update supplier',
      error: error.message
    });
  }
};

/**
 * Delete a supplier
 */
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await executeQuery('DELETE FROM supplier WHERE Supplier_ID = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete supplier',
      error: error.message
    });
  }
};

/**
 * Get supplier's inventory
 */
exports.getSupplierInventory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if supplier exists first
    const [supplierCheck] = await executeQuery('SELECT 1 FROM supplier WHERE Supplier_ID = ?', [id]);
    if (!supplierCheck || supplierCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    const [inventory] = await executeQuery(
      `SELECT si.*, p.Name as ProductName 
       FROM supplier_inventory si
       JOIN product p ON si.Product_ID = p.Product_ID
       WHERE si.Supplier_ID = ?`,
      [id]
    );
    
    res.status(200).json({
      success: true,
      data: inventory || []
    });
  } catch (error) {
    console.error('Error fetching supplier inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve supplier inventory',
      error: error.message
    });
  }
};