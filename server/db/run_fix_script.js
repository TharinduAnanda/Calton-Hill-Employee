const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runFixScript() {
  // Create a connection to the database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chrms',
    multipleStatements: true // Allow multiple statements in queries
  });

  try {
    console.log('Connected to the database');
    
    // Read and execute the SQL file
    const sqlPath = path.join(__dirname, 'fix_po_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing SQL fix script...');
    const [results] = await connection.query(sql);
    
    console.log('SQL script executed successfully!');
    console.log('Results:', results);
    
  } catch (error) {
    console.error('Error executing SQL script:', error);
  } finally {
    // Close the connection
    await connection.end();
    console.log('Database connection closed');
  }
}

// Run the script
runFixScript().catch(console.error); 