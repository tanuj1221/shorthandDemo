const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database connection details
const config = {
  host: '103.17.193.168',
  user: 'root',
  password: 'tanuj1221',
  database: 'sh_demo'
};

// Output file with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const outputFile = `sh_demo_backup_${timestamp}.sql`;

console.log('==========================================');
console.log('MySQL Database Backup Script (Node.js)');
console.log('==========================================');
console.log(`Host: ${config.host}`);
console.log(`Database: ${config.database}`);
console.log(`Output: ${outputFile}`);
console.log('==========================================');

async function backupDatabase() {
  let connection;
  
  try {
    console.log('📦 Connecting to database...');
    connection = await mysql.createConnection(config);
    
    console.log('📦 Fetching table list...');
    const [tables] = await connection.query('SHOW TABLES');
    
    let sqlDump = `-- MySQL dump for database: ${config.database}\n`;
    sqlDump += `-- Generated: ${new Date().toISOString()}\n`;
    sqlDump += `-- Host: ${config.host}\n\n`;
    sqlDump += `SET NAMES utf8mb4;\n`;
    sqlDump += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;
    
    const tableKey = `Tables_in_${config.database}`;
    
    for (const tableRow of tables) {
      const tableName = tableRow[tableKey];
      console.log(`📦 Backing up table: ${tableName}`);
      
      // Get CREATE TABLE statement
      const [createTable] = await connection.query(`SHOW CREATE TABLE \`${tableName}\``);
      sqlDump += `-- Table: ${tableName}\n`;
      sqlDump += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
      sqlDump += `${createTable[0]['Create Table']};\n\n`;
      
      // Get table data
      const [rows] = await connection.query(`SELECT * FROM \`${tableName}\``);
      
      if (rows.length > 0) {
        sqlDump += `-- Data for table: ${tableName}\n`;
        sqlDump += `LOCK TABLES \`${tableName}\` WRITE;\n`;
        
        // Insert data in batches
        const batchSize = 100;
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          const values = batch.map(row => {
            const vals = Object.values(row).map(val => {
              if (val === null) return 'NULL';
              if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
              if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
              if (Buffer.isBuffer(val)) return `'${val.toString('base64')}'`;
              return val;
            });
            return `(${vals.join(',')})`;
          });
          
          const columns = Object.keys(rows[0]).map(col => `\`${col}\``).join(',');
          sqlDump += `INSERT INTO \`${tableName}\` (${columns}) VALUES\n${values.join(',\n')};\n`;
        }
        
        sqlDump += `UNLOCK TABLES;\n\n`;
      }
    }
    
    sqlDump += `SET FOREIGN_KEY_CHECKS = 1;\n`;
    
    // Write to file
    console.log('📦 Writing to file...');
    fs.writeFileSync(outputFile, sqlDump, 'utf8');
    
    const stats = fs.statSync(outputFile);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('✅ Backup completed successfully!');
    console.log(`📁 File: ${outputFile}`);
    console.log(`📊 Size: ${fileSizeMB} MB`);
    console.log('');
    console.log('To restore this backup, use:');
    console.log(`mysql -h HOST -u USER -pPASSWORD ${config.database} < ${outputFile}`);
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

backupDatabase();
