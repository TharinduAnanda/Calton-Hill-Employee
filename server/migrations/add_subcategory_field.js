const { executeQuery } = require('../config/db');

/**
 * Migration to add a subcategory field to the product table
 * 
 * This migration:
 * 1. Checks if the subcategory column already exists
 * 2. If not, adds it to the product table
 */
async function addSubcategoryField() {
  try {
    // Check if the column already exists
    const columns = await executeQuery(`
      SHOW COLUMNS FROM product 
      WHERE Field = 'Subcategory'
    `);
    
    if (columns.length === 0) {
      // Add the subcategory column
      await executeQuery(`
        ALTER TABLE product 
        ADD COLUMN Subcategory VARCHAR(100) DEFAULT NULL
      `);
      console.log('Successfully added Subcategory column to product table.');
    } else {
      console.log('Subcategory column already exists in product table.');
    }
  } catch (error) {
    console.error('Error in migration:', error);
    throw error;
  }
}

// Export the migration function
module.exports = {
  addSubcategoryField
}; 