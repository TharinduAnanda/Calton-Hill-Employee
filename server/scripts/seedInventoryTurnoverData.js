/**
 * Script to seed test data for the inventory turnover report
 * This will ensure we have the necessary data to calculate inventory turnover metrics
 */

const { executeQuery } = require('../config/db');

async function seedInventoryTurnoverData() {
  try {
    console.log('Starting inventory turnover data seeding...');

    // Step 1: Update products with cost prices
    console.log('Updating products with cost prices...');
    const products = [
      { id: 2, cost: 1800.00, name: 'Claw Hammer' },
      { id: 3, cost: 1200.00, name: 'Adjustable Wrench' },
      { id: 4, cost: 15000.00, name: 'Circular Saw' },
      { id: 5, cost: 600.00, name: 'Safety Gloves' },
      { id: 7, cost: 20000.00, name: 'Steel Ladder' },
      { id: 8, cost: 2100.00, name: 'Voltage Tester' },
      { id: 10, cost: 6000.00, name: 'Work Boots' }
    ];

    for (const product of products) {
      await executeQuery(
        'UPDATE product SET cost_price = ? WHERE Product_ID = ?',
        [product.cost, product.id]
      );
      console.log(`Updated cost price for ${product.name} to ${product.cost}`);
    }

    // Step 2: Ensure inventory records exist for these products
    console.log('Ensuring inventory records exist...');
    for (const product of products) {
      // Check if inventory record exists
      const existingInventory = await executeQuery(
        'SELECT * FROM inventory WHERE Product_ID = ?',
        [product.id]
      );

      if (existingInventory.length === 0) {
        // Create inventory record if it doesn't exist
        await executeQuery(
          'INSERT INTO inventory (Product_ID, Stock_Level, reorder_level, optimal_level) VALUES (?, ?, ?, ?)',
          [product.id, 50, 10, 100]
        );
        console.log(`Created inventory record for ${product.name}`);
      } else {
        // Update existing inventory record
        await executeQuery(
          'UPDATE inventory SET Stock_Level = ? WHERE Product_ID = ?',
          [50, product.id]
        );
        console.log(`Updated inventory record for ${product.name}`);
      }
    }

    // Step 3: Create sample customer order entries for paid orders
    console.log('Creating sample customer orders...');
    
    // First, clear any existing order items for our test orders if they exist
    const orderIds = [2001, 2002, 2003, 2004];
    for (const orderId of orderIds) {
      await executeQuery('DELETE FROM order_item WHERE Order_ID = ?', [orderId]);
    }
    
    // Then delete the test orders if they exist
    await executeQuery('DELETE FROM customerorder WHERE Order_ID IN (?, ?, ?, ?)', orderIds);
    
    // Create several paid orders in the past to demonstrate turnover
    const orders = [
      { id: 2001, date: '2025-04-01', total: 12000.00 },
      { id: 2002, date: '2025-04-15', total: 18500.00 },
      { id: 2003, date: '2025-05-01', total: 25000.00 },
      { id: 2004, date: '2025-05-10', total: 9800.00 }
    ];

    for (const order of orders) {
      await executeQuery(
        'INSERT INTO customerorder (Order_ID, Order_Date, Total_Amount, Payment_Status, Delivery_Status, Customer_ID) VALUES (?, ?, ?, ?, ?, ?)',
        [order.id, order.date, order.total, 'paid', 'delivered', 7]
      );
      console.log(`Created order #${order.id}`);
    }

    // Step 4: Create order items for these orders
    console.log('Creating order items...');
    const orderItems = [
      // Order 2001
      { orderId: 2001, productId: 2, quantity: 2, price: 2499.00 },
      { orderId: 2001, productId: 3, quantity: 1, price: 1799.00 },
      { orderId: 2001, productId: 5, quantity: 6, price: 899.00 },
      
      // Order 2002
      { orderId: 2002, productId: 4, quantity: 1, price: 18999.00 },
      
      // Order 2003
      { orderId: 2003, productId: 7, quantity: 1, price: 24999.00 },
      
      // Order 2004
      { orderId: 2004, productId: 8, quantity: 2, price: 2999.00 },
      { orderId: 2004, productId: 10, quantity: 1, price: 7999.00 }
    ];

    let orderItemId = 2000; // Starting ID for our test order items
    for (const item of orderItems) {
      await executeQuery(
        'INSERT INTO order_item (Order_Item_ID, Order_ID, Product_ID, Quantity, Price) VALUES (?, ?, ?, ?, ?)',
        [orderItemId++, item.orderId, item.productId, item.quantity, item.price]
      );
      console.log(`Created order item for product #${item.productId} on order #${item.orderId}`);
    }

    // Step 5: Create stock movements to reflect these orders
    console.log('Creating stock movements...');
    let movementId = 2000; // Starting ID for stock movements
    for (const item of orderItems) {
      // Get current stock level
      const inventoryResult = await executeQuery(
        'SELECT Stock_Level FROM inventory WHERE Product_ID = ?',
        [item.productId]
      );
      
      const currentStock = inventoryResult[0]?.Stock_Level || 50;
      const newStock = currentStock - item.quantity;
      
      // Record stock movement for this order item
      await executeQuery(
        `INSERT INTO stock_movement 
         (movement_id, product_id, quantity_change, movement_type, notes, movement_date, previous_quantity, new_quantity) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          movementId++, 
          item.productId, 
          -item.quantity, 
          'SALE', 
          `Sale for Order #${item.orderId}`, 
          new Date(), 
          currentStock, 
          newStock
        ]
      );
      
      // Update inventory stock level
      await executeQuery(
        'UPDATE inventory SET Stock_Level = ? WHERE Product_ID = ?',
        [newStock, item.productId]
      );
      
      console.log(`Created stock movement for product #${item.productId}, quantity: ${item.quantity}`);
    }

    console.log('Inventory turnover data seeding completed successfully!');
    return { success: true, message: 'Inventory turnover data seeded successfully' };
  } catch (error) {
    console.error('Error seeding inventory turnover data:', error);
    return { success: false, error: error.message };
  }
}

// Export the function for CLI use
module.exports = seedInventoryTurnoverData;

// If script is run directly, execute the seed function
if (require.main === module) {
  seedInventoryTurnoverData()
    .then(result => {
      console.log(result.message);
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Unhandled error:', err);
      process.exit(1);
    });
} 