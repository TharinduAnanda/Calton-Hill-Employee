const { pool } = require('./db');
const fs = require('fs');
const path = require('path');

/**
 * Updates the database triggers to properly handle inventory management
 */
const updateTriggers = async () => {
  try {
    console.log('Updating database triggers...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '../models/update_trigger.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split the script by delimiter to handle multiple statements
    // This simple approach works for our specific case,
    // but a more robust SQL parser would be needed for complex scripts
    const statements = sqlScript
      .replace(/DELIMITER \$\$/g, '')
      .replace(/DELIMITER ;/g, '')
      .split('$$')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.length > 0) {
        await pool.query(statement);
        console.log('Executed SQL statement');
      }
    }
    
    console.log('Database triggers updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating database triggers:', error);
    return false;
  }
};

module.exports = {
  updateTriggers
}; 