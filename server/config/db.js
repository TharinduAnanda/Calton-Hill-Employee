const mysql = require('mysql2/promise');

// Create connection pool with XAMPP defaults
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root', // XAMPP default username
  password: process.env.DB_PASSWORD || '', // XAMPP often has empty password
  database: process.env.DB_NAME || 'chrms',
  port: process.env.DB_PORT || 3306, // Explicit port for Windows
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // Added timeout for Windows
  multipleStatements: true // Helpful for some Windows configurations
});

// Enhanced connection test with Windows-specific checks
const testConnection = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.ping();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Windows-specific troubleshooting tips
    if (error.code === 'ECONNREFUSED') {
      console.log('\nWindows Troubleshooting Tips:');
      console.log('1. Make sure XAMPP MySQL is running (green "Run" indicator)');
      console.log('2. In XAMPP, click MySQL "Config" -> "my.ini"');
      console.log('3. Verify port=3306 under [client] and [mysqld] sections');
      console.log('4. Try "net start mysql" in Command Prompt as Administrator');
    }
    
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

// Robust query execution with Windows optimizations
const executeQuery = async (query, params = []) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(query, params);
    return rows;
  } catch (error) {
    console.error('❌ Query execution error:', {
      message: error.message,
      sql: query,
      params: params
    });
    
    // Handle common Windows MySQL errors
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('Connection lost - attempting to reconnect...');
      return executeQuery(query, params); // Retry once
    }
    
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  pool,
  executeQuery,
  execute: executeQuery,
  testConnection,
  // Added for Windows service management
  endPool: async () => {
    try {
      await pool.end();
      console.log('MySQL connection pool closed');
    } catch (error) {
      console.error('Error closing pool:', error.message);
    }
  }
};