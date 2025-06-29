const fs = require('fs');
const path = require('path');
const { executeQuery } = require('../config/db');

/**
 * Migration to add partial fulfillment fields to purchase orders and related tables
 */
async function addPartialFulfillmentFields() {
  try {
    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'add_partial_fulfillment_fields.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split SQL into individual commands
    const commands = sql
      .split(';')
      .map(command => command.trim())
      .filter(command => command.length > 0);
    
    // Execute each command
    for (const command of commands) {
      await executeQuery(command);
      console.log(`Executed: ${command.substring(0, 60)}...`);
    }
    
    console.log('✅ Successfully added partial fulfillment fields to database tables');
    return true;
  } catch (error) {
    console.error('❌ Error adding partial fulfillment fields:', error);
    throw error;
  }
}

module.exports = { addPartialFulfillmentFields }; 