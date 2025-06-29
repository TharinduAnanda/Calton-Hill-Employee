require('dotenv').config();
const { executeQuery } = require('./config/db');
const fs = require('fs');
const path = require('path');

/**
 * Script to fix the case sensitivity issues in inventory queries
 */
async function checkInventoryAndSummary() {
  try {
    console.log('Checking inventory data and fixing summary query...');
    
    // 1. First, get actual inventory count to verify data exists
    const inventoryCount = await executeQuery('SELECT COUNT(*) as count FROM inventory');
    console.log(`Found ${inventoryCount[0]?.count || 0} inventory records in database`);
    
    // 2. Check if we have product data
    const productCount = await executeQuery('SELECT COUNT(*) as count FROM product');
    console.log(`Found ${productCount[0]?.count || 0} product records in database`);
    
    // 3. Test the inventory summary query directly with correct column case
    const summaryQuery = `
      SELECT COUNT(*) as totalItems, 
             SUM(CASE WHEN i.Stock_Level <= i.reorder_level THEN 1 ELSE 0 END) as lowStockItems,
             SUM(CASE WHEN i.Stock_Level = 0 THEN 1 ELSE 0 END) as outOfStockItems,
             SUM(p.cost_price * i.Stock_Level) as totalValue
      FROM inventory i
      JOIN product p ON i.Product_ID = p.Product_ID
    `;
    
    const summaryResult = await executeQuery(summaryQuery);
    console.log('Summary query result:', summaryResult[0]);
    
    // 4. Create a temporary modified version of the inventory controller
    const controllerPath = path.join(__dirname, 'controllers', 'inventoryController.js');
    const backupPath = path.join(__dirname, 'controllers', 'inventoryController.js.backup');
    
    // Create backup
    fs.copyFileSync(controllerPath, backupPath);
    console.log('Created backup of inventoryController.js');
    
    // Read the file content
    let content = fs.readFileSync(controllerPath, 'utf8');
    
    // Fix the case of column names in SQL queries
    content = content
      // Fix reorder_level capitalization
      .replace(/i\.Reorder_Level/g, 'i.reorder_level')
      .replace(/i\.reorder_Level/g, 'i.reorder_level')
      .replace(/i\.REORDER_LEVEL/g, 'i.reorder_level')
      
      // Fix optimal_level capitalization
      .replace(/i\.Optimal_Level/g, 'i.optimal_level')
      .replace(/i\.optimal_Level/g, 'i.optimal_level')
      .replace(/i\.OPTIMAL_LEVEL/g, 'i.optimal_level')
      
      // Fix Stock_Level capitalization - this one is actually correct in the DB as Stock_Level
      .replace(/i\.stock_level/g, 'i.Stock_Level')
      .replace(/i\.STOCK_LEVEL/g, 'i.Stock_Level')
      
      // Fix other common columns
      .replace(/i\.Last_Updated/g, 'i.Last_Updated') // this one is correct in DB
      .replace(/i\.Warehouse_Zone/g, 'i.warehouse_zone')
      .replace(/i\.Bin_Location/g, 'i.bin_location')
      .replace(/i\.Supplier_ID/g, 'i.Supplier_ID') // this one is correct in DB
      .replace(/i\.Product_ID/g, 'i.Product_ID'); // this one is correct in DB
      
    // Write the modified content back
    fs.writeFileSync(controllerPath, content);
    console.log('Updated inventory controller with corrected column names');
    
    // 5. Also fix the inventory service on the client side
    console.log('Note: You may also need to update client/src/services/inventoryService.js if there are case mismatches there');
    
    console.log('✅ All checks completed. Please restart the server to apply changes.');
    
  } catch (error) {
    console.error('Error checking inventory data:', error);
    process.exit(1);
  }
}

// Run the check
checkInventoryAndSummary(); 