const mysql = require('mysql2/promise');
const connection = mysql.createPool({
  host: '103.17.193.168',
  user: 'root',
  password: 'tanuj1221',
  database: 'sh_demo',
  waitForConnections: true,
  connectionLimit: 1000000,
  queueLimit: 0 // Added database name
});

module.exports = connection