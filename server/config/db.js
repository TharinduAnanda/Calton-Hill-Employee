const mysql = require('mysql2/promise');

// Create a connection pool with reasonable settings
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'chrms',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

/**
 * Execute a SQL query
 * @param {string} sql - SQL query to execute
 * @param {Array} params - Parameters for the SQL query
 * @returns {Promise<Array>} - Query results
 */
async function executeQuery(sql, params = []) {
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

/**
 * Test database connection
 * @returns {Promise<boolean>} - Connection status
 */
async function testConnection() {
  try {
    await pool.query('SELECT 1 as test');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    throw error;
  }
}

module.exports = {
  executeQuery,
  testConnection
};