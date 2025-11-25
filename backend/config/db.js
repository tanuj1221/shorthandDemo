const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'demo',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
});

module.exports = pool