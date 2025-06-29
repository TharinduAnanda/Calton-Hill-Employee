const { executeQuery, pool } = require('../config/db');
const fs = require('fs');
const path = require('path');

async function createTables() {
  try {
    console.log('Creating purchase order tables...');
    
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split statements by semicolon
    const statements = schemaSql
      .split(';')
      .filter(stmt => stmt.trim() !== '');
    
    // Execute each statement
    for (const statement of statements) {
      await executeQuery(statement);
      console.log('Executed SQL statement successfully');
    }
    
    console.log('Purchase order tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    // Close the database connection pool
    await pool.end();
  }
}

// Run the function
createTables(); 