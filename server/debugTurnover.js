/**
 * Debug script for inventory turnover report
 * This script will run the same queries as the turnover report endpoint
 */

const { executeQuery } = require('./config/db');

async function debugTurnoverReport() {
  try {
    console.log('\n===== DEBUGGING INVENTORY TURNOVER REPORT =====\n');
    
    // Use a shorter period for quicker analysis
    const period = 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = new Date().toISOString().split('T')[0];
    
    console.log(`Analyzing period: ${formattedStartDate} to ${formattedEndDate} (${period} days)`);
    
    // Data availability checks
    console.log('\n--- CHECKING DATA AVAILABILITY ---');
    
    // Check for paid orders
    const orderCountQuery = `
      SELECT COUNT(*) as count, Payment_Status FROM customerorder GROUP BY Payment_Status
    `;
    const orderCount = await executeQuery(orderCountQuery);
    console.log('Order counts by payment status:', orderCount);
    
    // Check for order items linked to paid orders
    const orderItemQuery = `
      SELECT COUNT(*) as count 
      FROM order_item oi
      JOIN customerorder co ON oi.Order_ID = co.Order_ID
      WHERE co.Payment_Status = 'paid'
    `;
    const [orderItemCount] = await executeQuery(orderItemQuery);
    console.log('Order items from paid orders:', orderItemCount);
    
    // Check for inventory with cost prices
    const inventoryQuery = `
      SELECT COUNT(*) as count 
      FROM inventory i
      JOIN product p ON i.Product_ID = p.Product_ID
      WHERE p.cost_price IS NOT NULL AND p.cost_price > 0
    `;
    const [inventoryCount] = await executeQuery(inventoryQuery);
    console.log('Products with inventory and valid cost price:', inventoryCount);
    
    // Get sample of actual order data
    const sampleOrdersQuery = `
      SELECT co.Order_ID, co.Order_Date, co.Payment_Status, co.Total_Amount
      FROM customerorder co
      WHERE co.Payment_Status = 'paid'
      ORDER BY co.Order_Date DESC
      LIMIT 5
    `;
    const sampleOrders = await executeQuery(sampleOrdersQuery);
    console.log('\nSample paid orders:', sampleOrders);
    
    // Get sample of order items
    if (sampleOrders && sampleOrders.length > 0) {
      const sampleOrderItemsQuery = `
        SELECT oi.Order_Item_ID, oi.Order_ID, oi.Product_ID, p.Name as ProductName, 
               oi.Quantity, oi.Price, p.cost_price,
               (oi.Quantity * p.cost_price) as COGS
        FROM order_item oi
        JOIN product p ON oi.Product_ID = p.Product_ID
        WHERE oi.Order_ID = ?
      `;
      const sampleOrderItems = await executeQuery(sampleOrderItemsQuery, [sampleOrders[0].Order_ID]);
      console.log(`\nItems for order #${sampleOrders[0].Order_ID}:`, sampleOrderItems);
    }
    
    // Run main query for product turnover data
    console.log('\n--- RUNNING MAIN TURNOVER QUERY ---');
    const productQuery = `
      SELECT 
        p.Product_ID,
        p.Name,
        p.SKU,
        p.Category,
        IFNULL(p.cost_price, 0) as cost_price,
        IFNULL(p.Price, 0) as sell_price,
        IFNULL(i.Stock_Level, 0) as current_stock,
        IFNULL(sales.total_quantity_sold, 0) as units_sold,
        IFNULL(sales.cogs, 0) as cogs,
        IFNULL(i.Stock_Level, 0) as avg_inventory_level,
        CASE 
          WHEN IFNULL(i.Stock_Level, 0) > 0 AND IFNULL(sales.cogs, 0) > 0
          THEN IFNULL(sales.cogs, 0) / (IFNULL(i.Stock_Level, 0) * IFNULL(p.cost_price, 0))
          ELSE 0 
        END as turnover_ratio,
        IFNULL(i.Stock_Level, 0) * IFNULL(p.cost_price, 0) as avg_inventory_value,
        IFNULL(sales.unique_days, 0) as days_with_sales
      FROM 
        product p
      LEFT JOIN 
        inventory i ON p.Product_ID = i.Product_ID
      LEFT JOIN (
        SELECT 
          oi.Product_ID,
          SUM(oi.Quantity) as total_quantity_sold,
          SUM(oi.Quantity * IFNULL(p.cost_price, 0)) as cogs,
          COUNT(DISTINCT DATE(co.Order_Date)) as unique_days
        FROM 
          order_item oi
        JOIN 
          product p ON oi.Product_ID = p.Product_ID
        JOIN 
          customerorder co ON oi.Order_ID = co.Order_ID
        WHERE 
          co.Order_Date BETWEEN ? AND ?
          AND co.Payment_Status = 'paid'
        GROUP BY 
          oi.Product_ID
      ) as sales ON p.Product_ID = sales.Product_ID
      WHERE p.cost_price IS NOT NULL AND p.cost_price > 0
      ORDER BY 
        turnover_ratio DESC
    `;
    
    const productResult = await executeQuery(productQuery, [formattedStartDate, formattedEndDate]);
    console.log(`\nProduct query returned ${productResult.length} products`);
    
    if (productResult.length > 0) {
      console.log('\nTop 3 products by turnover ratio:');
      productResult.slice(0, 3).forEach(p => {
        console.log(`  ${p.Name}: Stock ${p.current_stock}, Cost ${p.cost_price}, Sold ${p.units_sold}, COGS ${p.cogs}, Ratio ${p.turnover_ratio}`);
      });
    } else {
      console.log('No product data returned from query');
      
      // Check if there are null Order_Date values causing issues
      const nullDateQuery = `
        SELECT COUNT(*) as count FROM customerorder 
        WHERE Payment_Status = 'paid' AND Order_Date IS NULL
      `;
      const [nullDateCount] = await executeQuery(nullDateQuery);
      console.log('Orders with NULL dates:', nullDateCount);
      
      // Check if date format might be causing issues
      const dateFormatQuery = `
        SELECT Order_ID, Order_Date, Payment_Status 
        FROM customerorder 
        WHERE Payment_Status = 'paid'
        LIMIT 5
      `;
      const dateFormatSample = await executeQuery(dateFormatQuery);
      console.log('Sample order dates:', dateFormatSample);
    }
    
    console.log('\n===== DEBUG COMPLETE =====');
    
  } catch (error) {
    console.error('Error in debug script:', error);
  }
}

// Run the script
const { connectToDatabase } = require('./config/db');

connectToDatabase()
  .then(() => {
    console.log('Connected to database');
    return debugTurnoverReport();
  })
  .then(() => {
    console.log('Debug complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  }); 