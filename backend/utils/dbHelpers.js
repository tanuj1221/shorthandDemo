const pool = require('../config/db');

/**
 * Execute a transaction with automatic connection management
 * @param {Function} callback - Async function that receives connection
 * @returns {Promise<any>} Result from callback
 */
async function withTransaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Execute query with automatic connection management (for complex scenarios)
 * @param {Function} callback - Async function that receives connection
 * @returns {Promise<any>} Result from callback
 */
async function withConnection(callback) {
  const connection = await pool.getConnection();
  try {
    return await callback(connection);
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  withTransaction,
  withConnection
};
