/**
 * Script to check if inventory turnover data exists in the database
 * This will query the database to verify our seed data for the inventory turnover report
 */

const { executeQuery } = require('../config/db');

async function checkTurnoverData() {
  try {
    console.log('===== CHECKING INVENTORY TURNOVER DATA =====');

    // 1. Check products with cost prices
    console.log('\n--- PRODUCTS WITH COST PRICES ---');
    const products = await executeQuery(`
      SELECT Product_ID, Name, cost_price, Price 
      FROM product 
      WHERE cost_price IS NOT NULL AND cost_price > 0
    `);
    
    console.log(`Found ${products.length} products with cost prices:`);
    products.forEach(p => {
      console.log(`  ID: ${p.Product_ID}, Name: ${p.Name}, Cost: ${p.cost_price}, Price: ${p.Price}`);
    });

    // 2. Check inventory records for products
    console.log('\n--- INVENTORY RECORDS ---');
    const inventory = await executeQuery(`
      SELECT i.Inventory_ID, i.Product_ID, p.Name, i.Stock_Level, i.reorder_level
      FROM inventory i
      JOIN product p ON i.Product_ID = p.Product_ID
      WHERE p.cost_price IS NOT NULL AND p.cost_price > 0
    `);
    
    console.log(`Found ${inventory.length} inventory records for products with cost prices:`);
    inventory.forEach(i => {
      console.log(`  Product ID: ${i.Product_ID}, Name: ${i.Name}, Stock: ${i.Stock_Level}`);
    });

    // 3. Check paid orders
    console.log('\n--- PAID ORDERS ---');
    const orders = await executeQuery(`
      SELECT Order_ID, Order_Date, Total_Amount, Payment_Status, Customer_ID
      FROM customerorder
      WHERE Payment_Status = 'paid'
    `);
    
    console.log(`Found ${orders.length} paid orders:`);
    orders.forEach(o => {
      console.log(`  Order ID: ${o.Order_ID}, Date: ${o.Order_Date}, Amount: ${o.Total_Amount}`);
    });

    // 4. Check order items linked to paid orders
    console.log('\n--- ORDER ITEMS FOR PAID ORDERS ---');
    const orderItems = await executeQuery(`
      SELECT oi.Order_Item_ID, oi.Order_ID, oi.Product_ID, p.Name as ProductName, 
             oi.Quantity, oi.Price, p.cost_price,
             (oi.Quantity * p.cost_price) as COGS
      FROM order_item oi
      JOIN customerorder co ON oi.Order_ID = co.Order_ID
      JOIN product p ON oi.Product_ID = p.Product_ID
      WHERE co.Payment_Status = 'paid'
    `);
    
    console.log(`Found ${orderItems.length} order items for paid orders:`);
    orderItems.forEach(item => {
      console.log(`  Order: ${item.Order_ID}, Product: ${item.ProductName}, Qty: ${item.Quantity}, COGS: ${item.COGS}`);
    });

    // 5. Check stock movements for these products
    console.log('\n--- STOCK MOVEMENTS ---');
    const movements = await executeQuery(`
      SELECT sm.movement_id, sm.product_id, p.Name, 
             sm.quantity_change, sm.movement_type, sm.movement_date
      FROM stock_movement sm
      JOIN product p ON sm.product_id = p.Product_ID
      ORDER BY sm.movement_date DESC
      LIMIT 20
    `);
    
    console.log(`Found ${movements.length} recent stock movements:`);
    movements.forEach(m => {
      console.log(`  ID: ${m.movement_id}, Product: ${m.Name}, Change: ${m.quantity_change}, Type: ${m.movement_type}, Date: ${m.movement_date}`);
    });

    // 6. Check for issues with the turnover calculation
    console.log('\n--- TURNOVER CALCULATION CHECK ---');
    const turnoverCheck = await executeQuery(`
      SELECT 
        p.Product_ID,
        p.Name,
        p.cost_price,
        i.Stock_Level,
        i.Stock_Level * p.cost_price as inventory_value,
        (
          SELECT SUM(oi.Quantity * p.cost_price)
          FROM order_item oi
          JOIN customerorder co ON oi.Order_ID = co.Order_ID
          WHERE oi.Product_ID = p.Product_ID
          AND co.Payment_Status = 'paid'
        ) as cogs,
        CASE 
          WHEN i.Stock_Level * p.cost_price > 0 AND 
              (SELECT SUM(oi.Quantity * p.cost_price)
               FROM order_item oi
               JOIN customerorder co ON oi.Order_ID = co.Order_ID
               WHERE oi.Product_ID = p.Product_ID
               AND co.Payment_Status = 'paid') > 0
          THEN (
              SELECT SUM(oi.Quantity * p.cost_price)
              FROM order_item oi
              JOIN customerorder co ON oi.Order_ID = co.Order_ID
              WHERE oi.Product_ID = p.Product_ID
              AND co.Payment_Status = 'paid'
          ) / (i.Stock_Level * p.cost_price)
          ELSE 0
        END as turnover_ratio
      FROM product p
      LEFT JOIN inventory i ON p.Product_ID = i.Product_ID
      WHERE p.cost_price IS NOT NULL AND p.cost_price > 0
    `);
    
    console.log(`Turnover calculation results for ${turnoverCheck.length} products:`);
    turnoverCheck.forEach(t => {
      console.log(`  Product: ${t.Name}, Cost: ${t.cost_price}, Stock: ${t.Stock_Level}`);
      console.log(`    Inventory Value: ${t.inventory_value}, COGS: ${t.cogs}, Turnover Ratio: ${t.turnover_ratio}`);
    });

    console.log('\n===== DATA CHECK COMPLETE =====');
    
    return {
      success: true,
      products: products.length,
      inventory: inventory.length,
      orders: orders.length,
      orderItems: orderItems.length,
      movements: movements.length,
      turnoverProducts: turnoverCheck.length
    };
  } catch (error) {
    console.error('Error checking inventory turnover data:', error);
    return { success: false, error: error.message };
  }
}

// Export the function for CLI use
module.exports = checkTurnoverData;

// If script is run directly, execute the check function
if (require.main === module) {
  checkTurnoverData()
    .then(result => {
      console.log('\nSummary:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Unhandled error:', err);
      process.exit(1);
    });
} 