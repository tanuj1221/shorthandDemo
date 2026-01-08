const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database connection details (from db1.js)
const config = {
  host: '103.17.193.168',
  user: 'root',
  password: 'tanuj1221',
  database: 'sh_demo'
};

// Output file with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const backupFile = `backup_student14_${timestamp}.sql`;

console.log('==========================================');
console.log('BACKUP & MIGRATE: Session Tracking');
console.log('==========================================');
console.log(`Host: ${config.host}`);
console.log(`Database: ${config.database}`);
console.log(`Backup File: ${backupFile}`);
console.log('==========================================\n');

async function backupAndMigrate() {
  let connection;
  
  try {
    console.log('📦 Step 1: Connecting to database...');
    connection = await mysql.createConnection(config);
    console.log('✅ Connected!\n');
    
    // ====================================
    // STEP 2: BACKUP student14 table
    // ====================================
    console.log('📦 Step 2: Creating backup of student14 table...');
    
    // Get CREATE TABLE statement
    const [createTable] = await connection.query(`SHOW CREATE TABLE student14`);
    let sqlDump = `-- Backup of student14 table\n`;
    sqlDump += `-- Generated: ${new Date().toISOString()}\n`;
    sqlDump += `-- Database: ${config.database}\n\n`;
    sqlDump += `SET NAMES utf8mb4;\n`;
    sqlDump += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;
    sqlDump += `-- Table structure for student14\n`;
    sqlDump += `DROP TABLE IF EXISTS \`student14_backup_${timestamp.replace(/-/g, '_')}\`;\n`;
    sqlDump += createTable[0]['Create Table'].replace('student14', `student14_backup_${timestamp.replace(/-/g, '_')}`) + ';\n\n';
    
    // Get all data
    const [rows] = await connection.query('SELECT * FROM student14');
    console.log(`   Found ${rows.length} records to backup`);
    
    if (rows.length > 0) {
      sqlDump += `-- Data for student14\n`;
      const columns = Object.keys(rows[0]);
      const columnList = columns.map(col => `\`${col}\``).join(', ');
      
      for (const row of rows) {
        const values = columns.map(col => {
          const value = row[col];
          if (value === null) return 'NULL';
          if (typeof value === 'number') return value;
          if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
          return `'${String(value).replace(/'/g, "''")}'`;
        }).join(', ');
        
        sqlDump += `INSERT INTO \`student14_backup_${timestamp.replace(/-/g, '_')}\` (${columnList}) VALUES (${values});\n`;
      }
    }
    
    sqlDump += `\nSET FOREIGN_KEY_CHECKS = 1;\n`;
    
    // Write backup to file
    fs.writeFileSync(backupFile, sqlDump, 'utf8');
    console.log(`✅ Backup saved to: ${backupFile}\n`);
    
    // ====================================
    // STEP 3: CHECK IF COLUMNS EXIST
    // ====================================
    console.log('📦 Step 3: Checking if migration is needed...');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${config.database}' 
      AND TABLE_NAME = 'student14' 
      AND COLUMN_NAME IN ('session_id', 'last_heartbeat')
    `);
    
    const existingColumns = columns.map(c => c.COLUMN_NAME);
    const needsSessionId = !existingColumns.includes('session_id');
    const needsHeartbeat = !existingColumns.includes('last_heartbeat');
    
    if (!needsSessionId && !needsHeartbeat) {
      console.log('✅ Migration already completed! Columns exist.\n');
      console.log('==========================================');
      console.log('✅ ALL DONE - No migration needed');
      console.log('==========================================');
      return;
    }
    
    console.log(`   session_id column: ${needsSessionId ? '❌ Missing' : '✅ Exists'}`);
    console.log(`   last_heartbeat column: ${needsHeartbeat ? '❌ Missing' : '✅ Exists'}\n`);
    
    // ====================================
    // STEP 4: ADD COLUMNS
    // ====================================
    console.log('📦 Step 4: Adding session tracking columns...');
    
    if (needsSessionId) {
      console.log('   Adding session_id column...');
      await connection.query(`
        ALTER TABLE student14 
        ADD COLUMN session_id VARCHAR(255) DEFAULT NULL
      `);
      console.log('   ✅ session_id column added');
    }
    
    if (needsHeartbeat) {
      console.log('   Adding last_heartbeat column...');
      await connection.query(`
        ALTER TABLE student14 
        ADD COLUMN last_heartbeat DATETIME DEFAULT NULL
      `);
      console.log('   ✅ last_heartbeat column added');
    }
    
    // ====================================
    // STEP 5: ADD INDEXES
    // ====================================
    console.log('\n📦 Step 5: Creating indexes...');
    
    try {
      await connection.query(`CREATE INDEX idx_session_id ON student14(session_id)`);
      console.log('   ✅ Index idx_session_id created');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('   ℹ️  Index idx_session_id already exists');
      } else {
        throw err;
      }
    }
    
    try {
      await connection.query(`CREATE INDEX idx_last_heartbeat ON student14(last_heartbeat)`);
      console.log('   ✅ Index idx_last_heartbeat created');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('   ℹ️  Index idx_last_heartbeat already exists');
      } else {
        throw err;
      }
    }
    
    // ====================================
    // STEP 6: VERIFY
    // ====================================
    console.log('\n📦 Step 6: Verifying migration...');
    const [finalColumns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${config.database}' 
      AND TABLE_NAME = 'student14' 
      AND COLUMN_NAME IN ('session_id', 'last_heartbeat', 'is_logged_in')
    `);
    
    console.log('\n   Current session-related columns:');
    finalColumns.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME}: ${col.DATA_TYPE}, nullable: ${col.IS_NULLABLE}`);
    });
    
    console.log('\n==========================================');
    console.log('✅ MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('==========================================');
    console.log('\nNext steps:');
    console.log('1. Backup saved at: ' + backupFile);
    console.log('2. Restart your backend server');
    console.log('3. Test login again - it should work now!\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nError details:', error);
    console.log('\n⚠️  If migration failed, you can restore from backup:');
    console.log(`   mysql -h ${config.host} -u ${config.user} -p${config.password} ${config.database} < ${backupFile}`);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('📦 Database connection closed.');
    }
  }
}

// Run the backup and migration
backupAndMigrate().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
