const connection = require('../config/db1');

async function setupNotices() {
  try {
    console.log('Creating notices table...');
    
    // Create table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS notices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_active (is_active),
        INDEX idx_priority (priority),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await connection.query(createTableQuery);
    console.log('✓ Notices table created successfully');
    
    // Check if migration notice already exists
    const [existing] = await connection.query(
      "SELECT id FROM notices WHERE title = 'Website Migration Notice'"
    );
    
    if (existing.length === 0) {
      // Insert migration notice
      const insertQuery = `
        INSERT INTO notices (title, content, priority, is_active) 
        VALUES (?, ?, ?, ?)
      `;
      
      await connection.query(insertQuery, [
        'Website Migration Notice',
        'The website will be closed from 15-11-2025 to 16-11-2025 till 6pm for migration. We apologize for any inconvenience caused.',
        'urgent',
        1
      ]);
      
      console.log('✓ Migration notice inserted successfully');
    } else {
      console.log('✓ Migration notice already exists');
    }
    
    // Fetch and display all notices
    const [notices] = await connection.query('SELECT * FROM notices');
    console.log('\nCurrent notices:');
    console.table(notices);
    
    console.log('\n✓ Setup completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('Error setting up notices:', error);
    process.exit(1);
  }
}

setupNotices();
