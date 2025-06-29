require('dotenv').config();
const { executeQuery, executeTransaction } = require('./config/db');

/**
 * Function to seed inventory data for all existing products
 */
async function seedInventoryData() {
  try {
    console.log('Starting inventory seeding process...');
    
    // Get all products from the database
    const products = await executeQuery('SELECT * FROM product');
    
    if (!products || products.length === 0) {
      console.log('No products found in the database. Nothing to seed.');
      return;
    }
    
    console.log(`Found ${products.length} products. Creating inventory records...`);
    
    // Check if inventory table exists and has the required columns
    try {
      await executeQuery('DESCRIBE inventory');
      console.log('Inventory table exists. Proceeding with data seeding.');
    } catch (err) {
      console.error('Inventory table does not exist. Creating it...');
      await createInventoryTable();
    }
    
    // Using a transaction to ensure all inventory records are created or none
    await executeTransaction(async (connection) => {
      // For each product, create an inventory record if it doesn't exist
      for (const product of products) {
        const productId = product.Product_ID || product.product_id;
        
        // Check if inventory record already exists
        const existingInventory = await connection.query(
          'SELECT * FROM inventory WHERE Product_ID = ?',
          [productId]
        );
        
        if (existingInventory[0].length === 0) {
          // Create default inventory values
          const stockLevel = Math.floor(Math.random() * 100) + 10; // Random stock between 10-110
          const reorderLevel = Math.floor(Math.random() * 10) + 5; // Random reorder level between 5-15
          const optimalLevel = stockLevel * 1.5; // Optimal level is 1.5x current stock
          
          // Create the inventory record
          await connection.query(
            `INSERT INTO inventory 
             (Product_ID, Stock_Level, Reorder_Level, Optimal_Level, Last_Updated) 
             VALUES (?, ?, ?, ?, NOW())`,
            [productId, stockLevel, reorderLevel, optimalLevel]
          );
          
          console.log(`Created inventory record for product ID: ${productId}, Name: ${product.Name || product.name}`);
        } else {
          console.log(`Inventory record already exists for product ID: ${productId}, Name: ${product.Name || product.name}`);
        }
      }
    });
    
    // Verify the inventory records were created
    const inventoryCount = await executeQuery('SELECT COUNT(*) as count FROM inventory');
    console.log(`Seeding complete. Total inventory records: ${inventoryCount[0]?.count || 0}`);
    
  } catch (error) {
    console.error('Error seeding inventory data:', error);
    throw error;
  }
}

/**
 * Create inventory table if it doesn't exist
 */
async function createInventoryTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS inventory (
      Inventory_ID INT AUTO_INCREMENT PRIMARY KEY,
      Product_ID INT NOT NULL,
      Stock_Level INT NOT NULL DEFAULT 0,
      Reorder_Level INT NOT NULL DEFAULT 10,
      Optimal_Level INT NOT NULL DEFAULT 50,
      Last_Updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      Warehouse_Zone VARCHAR(50),
      Bin_Location VARCHAR(50),
      Notes TEXT,
      FOREIGN KEY (Product_ID) REFERENCES product(Product_ID) ON DELETE CASCADE
    )
  `;
  
  try {
    await executeQuery(createTableSQL);
    console.log('Inventory table created successfully');
  } catch (err) {
    console.error('Error creating inventory table:', err);
    throw err;
  }
}

/**
 * Check if stock_movement table exists and get its structure
 */
async function checkStockMovementTableStructure() {
  try {
    // First check if the table exists
    const columns = await executeQuery('SHOW COLUMNS FROM stock_movement');
    
    // Map column names for easy access
    const columnMap = {};
    columns.forEach(col => {
      columnMap[col.Field] = true;
    });
    
    console.log('Stock movement table columns:', Object.keys(columnMap).join(', '));
    return columnMap;
  } catch (err) {
    console.log('Stock movement table does not exist, creating it...');
    return await createStockMovementTable();
  }
}

/**
 * Create stock_movement table if it doesn't exist
 */
async function createStockMovementTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS stock_movement (
      movement_id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      quantity_change INT NOT NULL,
      previous_quantity INT NOT NULL,
      new_quantity INT NOT NULL,
      movement_type VARCHAR(20) NOT NULL,
      movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      reason VARCHAR(100),
      reference_id VARCHAR(50),
      created_by VARCHAR(50),
      notes TEXT,
      FOREIGN KEY (product_id) REFERENCES product(Product_ID) ON DELETE CASCADE
    )
  `;
  
  try {
    await executeQuery(createTableSQL);
    console.log('Stock movement table created successfully');
    
    // Return column mapping of the newly created table
    return {
      movement_id: true,
      product_id: true,
      quantity_change: true,
      previous_quantity: true,
      new_quantity: true,
      movement_type: true,
      movement_date: true,
      reason: true,
      reference_id: true,
      created_by: true,
      notes: true
    };
  } catch (err) {
    console.error('Error creating stock movement table:', err);
    return null;
  }
}

// Function to record stock movements for the initial inventory creation
async function recordInitialStockMovements() {
  try {
    // Check stock movement table structure
    const columnMap = await checkStockMovementTableStructure();
    
    if (!columnMap) {
      console.log('Could not determine stock movement table structure. Skipping movement records.');
      return;
    }
    
    const inventoryItems = await executeQuery('SELECT * FROM inventory');
    
    if (!inventoryItems || inventoryItems.length === 0) {
      console.log('No inventory items found. Nothing to record as stock movements.');
      return;
    }
    
    console.log(`Recording initial stock movements for ${inventoryItems.length} inventory items...`);
    
    for (const item of inventoryItems) {
      // Build the SQL query based on available columns
      let fields = ['product_id', 'quantity_change', 'previous_quantity', 'new_quantity', 'movement_type'];
      let values = [item.Product_ID, item.Stock_Level, 0, item.Stock_Level, 'INITIAL'];
      let placeholders = '?, ?, ?, ?, ?';
      
      // Add optional fields if they exist
      if (columnMap.reason) {
        fields.push('reason');
        values.push('Initial inventory setup');
        placeholders += ', ?';
      }
      
      if (columnMap.adjustment_reason) {
        fields.push('adjustment_reason');
        values.push('Initial inventory setup');
        placeholders += ', ?';
      }
      
      if (columnMap.created_by) {
        fields.push('created_by');
        values.push('System');
        placeholders += ', ?';
      }
      
      if (columnMap.notes) {
        fields.push('notes');
        values.push('Automatically created during inventory initialization');
        placeholders += ', ?';
      }
      
      // Insert the stock movement record
      const query = `INSERT INTO stock_movement (${fields.join(', ')}) VALUES (${placeholders})`;
      
      try {
        await executeQuery(query, values);
        console.log(`Recorded initial stock movement for product ID: ${item.Product_ID}`);
      } catch (insertErr) {
        console.error(`Error recording stock movement for product ID: ${item.Product_ID}:`, insertErr.message);
      }
    }
    
    console.log('Initial stock movements recorded successfully');
  } catch (err) {
    console.error('Error recording initial stock movements:', err);
  }
}

// Execute the seeding
async function runSeeding() {
  try {
    await seedInventoryData();
    await recordInitialStockMovements();
    console.log('✅ All seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

// Run the seeding function
runSeeding(); 