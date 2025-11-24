const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: '103.17.193.168',
  user: 'root',
  password: 'tanuj1221',
  database: 'sh_demo',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
});

module.exports = pool