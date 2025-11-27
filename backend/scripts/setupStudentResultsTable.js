const connection = require('../config/db1');
const fs = require('fs');
const path = require('path');

async function setupStudentResultsTable() {
  try {
    console.log('Setting up student_results table...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../migrations/create_student_results_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await connection.query(sql);
    
    console.log('✅ student_results table created successfully!');
    
    // Verify the table was created
    const [tables] = await connection.query("SHOW TABLES LIKE 'student_results'");
    if (tables.length > 0) {
      console.log('✅ Table verified in database');
      
      // Show table structure
      const [columns] = await connection.query('DESCRIBE student_results');
      console.log('\nTable structure:');
      console.table(columns);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up table:', error);
    process.exit(1);
  }
}

setupStudentResultsTable();
