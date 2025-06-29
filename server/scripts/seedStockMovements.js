const { executeQuery } = require('../config/db');

/**
 * Seed script to create sample stock movement records
 */
async function seedStockMovements() {
  try {
    console.log('Starting stock movement seeding process...');

    // Get some products to work with
    const [products] = await executeQuery('SELECT Product_ID, Name FROM product LIMIT 5');
    
    if (!products || products.length === 0) {
      console.error('No products found in database! Aborting seed process.');
      return;
    }
    
    console.log(`Found ${products.length} products to use for stock movements`);
    
    // Delete existing test movements
    console.log('Removing existing TEST movements...');
    await executeQuery("DELETE FROM stock_movement WHERE movement_type = 'TEST'");
    
    // Create various movement types for these products
    const movements = [];
    const movementTypes = ['PURCHASE', 'SALE', 'ADJUSTMENT', 'TEST', 'RETURN'];
    const notes = [
      'Initial stock receipt',
      'Customer order #12345',
      'Inventory adjustment after count',
      'Test movement for debugging',
      'Customer return - damaged item'
    ];
    
    // Create 15 sample movements
    for (let i = 0; i < 15; i++) {
      const productIndex = i % products.length;
      const typeIndex = i % movementTypes.length;
      const product = products[productIndex];
      const movementType = movementTypes[typeIndex];
      
      // Quantity change depends on movement type
      const isPositive = ['PURCHASE', 'RETURN', 'TEST'].includes(movementType);
      const quantityChange = isPositive ? 
        Math.floor(Math.random() * 20) + 5 : 
        -(Math.floor(Math.random() * 10) + 1);
      
      // Mock previous and new quantities
      const previousQuantity = Math.floor(Math.random() * 50) + 10;
      const newQuantity = Math.max(0, previousQuantity + quantityChange);
      
      // Create movement date within last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const movementDate = new Date();
      movementDate.setDate(movementDate.getDate() - daysAgo);
      
      movements.push({
        product_id: product.Product_ID,
        quantity_change: quantityChange,
        previous_quantity: previousQuantity,
        new_quantity: newQuantity,
        movement_type: movementType,
        notes: notes[typeIndex] + ` for ${product.Name}`,
        movement_date: movementDate
      });
      
      console.log(`Created ${movementType} movement for product ${product.Name}`);
    }
    
    // Insert the movements
    for (const movement of movements) {
      await executeQuery(
        `INSERT INTO stock_movement 
         (product_id, quantity_change, previous_quantity, new_quantity, movement_type, notes, movement_date) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          movement.product_id,
          movement.quantity_change,
          movement.previous_quantity,
          movement.new_quantity, 
          movement.movement_type,
          movement.notes,
          movement.movement_date
        ]
      );
    }
    
    console.log(`Successfully created ${movements.length} stock movement records`);
    
    // Verify the movements were created
    const [countResult] = await executeQuery('SELECT COUNT(*) as count FROM stock_movement');
    console.log(`Total stock movements in database: ${countResult[0].count}`);
    
    console.log('Stock movement seeding complete!');
  } catch (error) {
    console.error('Error seeding stock movements:', error);
  }
}

// Run the seed function if this script is executed directly
if (require.main === module) {
  seedStockMovements()
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
} else {
  // Export for use in other scripts
  module.exports = seedStockMovements;
} 