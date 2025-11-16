const connection = require('../config/db1');

async function addLoginTracking() {
  try {
    console.log('Adding login tracking to student14 table...');
    
    // Check if column already exists
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM student14 LIKE 'is_logged_in'"
    );
    
    if (columns.length === 0) {
      // Add the is_logged_in column
      await connection.query(`
        ALTER TABLE student14 
        ADD COLUMN is_logged_in TINYINT(1) DEFAULT 0
      `);
      console.log('✓ is_logged_in column added successfully');
      
      // Set all existing students to logged out state
      await connection.query('UPDATE student14 SET is_logged_in = 0');
      console.log('✓ All students set to logged out state');
      
      // Add index for better query performance
      await connection.query(`
        CREATE INDEX idx_is_logged_in ON student14(is_logged_in)
      `);
      console.log('✓ Index created for better performance');
    } else {
      console.log('✓ is_logged_in column already exists');
    }
    
    console.log('\n✓ Login tracking setup completed successfully!');
    console.log('Students can now only login from one device/browser at a time.');
    process.exit(0);
    
  } catch (error) {
    console.error('Error setting up login tracking:', error);
    process.exit(1);
  }
}

addLoginTracking();
