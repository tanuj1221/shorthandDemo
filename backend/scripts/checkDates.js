const connection = require('../config/db1');

async function checkDates() {
  try {
    const [rows] = await connection.query(
      'SELECT student_id, firstName, lastName, batchStartDate, batchEndDate FROM student14 LIMIT 5'
    );
    
    console.log('Sample data from database:');
    console.log('='.repeat(60));
    
    rows.forEach(row => {
      console.log(`ID: ${row.student_id}, Name: ${row.firstName} ${row.lastName}`);
      console.log(`  Start Date: ${row.batchStartDate}`);
      console.log(`  End Date: ${row.batchEndDate}`);
      console.log('-'.repeat(60));
    });
    
    await connection.end();
  } catch(err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkDates();
