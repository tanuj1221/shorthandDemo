const connection = require('../config/db1.js');

async function queryStudent14() {
  try {
    const query = `
      SELECT student_id, password, batch_year, firstName, lastName 
      FROM student14 
      WHERE batch_year LIKE '%2026%'
    `;
    
    const [rows] = await connection.query(query);
    
    console.log('Students with batch_year containing "2026":');
    console.log('='.repeat(60));
    console.table(rows);
    console.log(`\nTotal students found: ${rows.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error querying database:', error);
    process.exit(1);
  }
}

queryStudent14();
