const connection = require('../config/db1');

async function checkStudentStructure() {
  try {
    console.log('Checking student database structure...\n');
    
    // Get sample students
    const [students] = await connection.query(`
      SELECT student_id, firstName, lastName, subjectsId 
      FROM student14 
      LIMIT 10
    `);
    
    console.log('Sample students:');
    console.table(students);
    
    // Check if same student has multiple entries
    const [duplicates] = await connection.query(`
      SELECT firstName, lastName, COUNT(*) as count
      FROM student14
      GROUP BY firstName, lastName
      HAVING COUNT(*) > 1
      LIMIT 5
    `);
    
    console.log('\nStudents with multiple entries (if any):');
    console.table(duplicates);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkStudentStructure();
