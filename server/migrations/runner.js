const { addSubcategoryField } = require('./add_subcategory_field');
const { populateCategoriesSubcategories } = require('./populate_categories_subcategories');
const { addPOTrackingFields } = require('./add_po_tracking_fields');
const { addPartialFulfillmentFields } = require('./add_partial_fulfillment_fields');

/**
 * Migration runner script
 * This file is responsible for executing all migrations in the correct order
 */
async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...');
    
    // Add Subcategory field to product table
    console.log('🔄 Adding Subcategory field to product table...');
    await addSubcategoryField();
    
    // Populate categories and subcategories tables
    console.log('🔄 Populating categories and subcategories tables...');
    await populateCategoriesSubcategories();
    
    // Add tracking fields to purchase_orders table
    console.log('🔄 Adding tracking fields to purchase_orders table...');
    await addPOTrackingFields();
    
    // Add partial fulfillment fields to purchase_orders and related tables
    console.log('🔄 Adding partial fulfillment fields to purchase_orders table...');
    await addPartialFulfillmentFields();
    
    console.log('✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations(); 