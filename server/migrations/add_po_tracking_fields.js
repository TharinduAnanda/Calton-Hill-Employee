const { executeQuery } = require('../config/db');

/**
 * Migration to add tracking fields to the purchase_orders table
 * 
 * This migration:
 * - Adds cancellation_reason field to track why a PO was cancelled
 * - Adds confirm_notes field for notes when confirming a PO
 * - Adds updated_by field to track who made changes
 * - Adds canceled_at field to record when a PO was cancelled
 * - Ensures payment_terms field exists
 */
async function addPOTrackingFields() {
  try {
    console.log('Adding tracking fields to purchase_orders table...');
    
    // Add cancellation_reason column
    await executeQuery(`
      ALTER TABLE purchase_orders 
      ADD COLUMN IF NOT EXISTS cancellation_reason TEXT NULL 
      AFTER canceled_by
    `);
    console.log('✅ Added cancellation_reason field');
    
    // Add confirm_notes column
    await executeQuery(`
      ALTER TABLE purchase_orders 
      ADD COLUMN IF NOT EXISTS confirm_notes TEXT NULL 
      AFTER confirmed_by
    `);
    console.log('✅ Added confirm_notes field');
    
    // Add updated_by column
    await executeQuery(`
      ALTER TABLE purchase_orders 
      ADD COLUMN IF NOT EXISTS updated_by INT NULL 
      AFTER updated_at
    `);
    console.log('✅ Added updated_by field');
    
    // Add canceled_at column
    await executeQuery(`
      ALTER TABLE purchase_orders 
      ADD COLUMN IF NOT EXISTS canceled_at DATETIME NULL 
      AFTER canceled_by
    `);
    console.log('✅ Added canceled_at field');
    
    // Ensure payment_terms column exists
    await executeQuery(`
      ALTER TABLE purchase_orders 
      ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(100) NULL
    `);
    console.log('✅ Ensured payment_terms field exists');
    
    console.log('✅ Purchase order tracking fields migration completed successfully');
  } catch (error) {
    console.error('❌ Error in purchase order tracking fields migration:', error);
    throw error;
  }
}

// Export the migration function
module.exports = { addPOTrackingFields };