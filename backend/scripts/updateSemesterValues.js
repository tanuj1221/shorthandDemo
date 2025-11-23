// backend/scripts/updateSemesterValues.js
// Script to update semester values from numeric (1, 2) to month names (June, December)

const connection = require('../config/db1');

async function updateSemesterValues() {
  console.log('Starting semester value migration...');
  
  try {
    // Update semester value '1' to 'June'
    const [result1] = await connection.query(
      "UPDATE student14 SET sem = 'June' WHERE sem = '1'"
    );
    console.log(`Updated ${result1.affectedRows} records from '1' to 'June'`);
    
    // Update semester value '2' to 'December'
    const [result2] = await connection.query(
      "UPDATE student14 SET sem = 'December' WHERE sem = '2'"
    );
    console.log(`Updated ${result2.affectedRows} records from '2' to 'December'`);
    
    // Verify the changes
    const [verification] = await connection.query(
      "SELECT sem, COUNT(*) as count FROM student14 GROUP BY sem"
    );
    
    console.log('\nCurrent semester distribution:');
    verification.forEach(row => {
      console.log(`  ${row.sem || 'NULL'}: ${row.count} students`);
    });
    
    console.log('\n✓ Semester migration completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('Error updating semester values:', error);
    process.exit(1);
  }
}

// Run the migration
updateSemesterValues();
