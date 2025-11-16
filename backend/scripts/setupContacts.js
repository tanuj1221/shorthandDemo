const connection = require('../config/db1');

async function setupContacts() {
  try {
    console.log('Creating contact_submissions table...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        subject VARCHAR(255) DEFAULT 'General Inquiry',
        message TEXT NOT NULL,
        status ENUM('new', 'read', 'replied') DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_created (created_at),
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await connection.query(createTableQuery);
    console.log('✓ Contact submissions table created successfully');
    
    // Fetch and display all contacts
    const [contacts] = await connection.query('SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT 10');
    console.log('\nRecent contact submissions:');
    if (contacts.length > 0) {
      console.table(contacts);
    } else {
      console.log('No contact submissions yet.');
    }
    
    console.log('\n✓ Setup completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('Error setting up contacts:', error);
    process.exit(1);
  }
}

setupContacts();
