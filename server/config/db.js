const mysql = require('mysql2/promise');
const config = require('./config');

// Create the connection pool
const pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Execute a SQL query
 * @param {string} sql - SQL query to execute
 * @param {Array} params - Parameters for the SQL query
 * @returns {Promise<Array>} - Query results
 */
function executeQuery(sql, params = []) {
  return pool.query(sql, params)
    .then(([rows]) => rows)
    .catch(error => {
      console.error('Database error:', error);
      throw error;
    });
}

/**
 * Execute a transaction with multiple queries
 * @param {Function} callback - Function that performs queries within the transaction
 * @returns {Promise<any>} - Transaction result
 */
function executeTransaction(callback) {
  let connection;
  
  return pool.getConnection()
    .then(conn => {
      connection = conn;
      return connection.beginTransaction();
    })
    .then(() => {
      return callback(connection);
    })
    .then(result => {
      return connection.commit()
        .then(() => {
          connection.release();
          return result;
        });
    })
    .catch(error => {
      if (connection) {
        return connection.rollback()
          .then(() => {
            connection.release();
            throw error;
          });
      }
      throw error;
    });
}

/**
 * Check database connection
 * @returns {Promise<boolean>} - Connection status
 */
function checkConnection() {
  return pool.query('SELECT 1')
    .then(() => true)
    .catch(error => {
      console.error('Database connection error:', error);
      return false;
    });
}

module.exports = {
  executeQuery,
  executeTransaction,
  checkConnection
};