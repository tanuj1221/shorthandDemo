const connection = require('../config/db1');
const { BASE_URL } = require('../config/serverConfig');

async function updateAllFileUrls() {
  try {
    console.log('Updating all file URLs to use:', BASE_URL);
    
    // Get all files
    const [files] = await connection.query('SELECT * FROM storage_files');
    
    console.log(`Found ${files.length} files to update`);
    
    let updatedCount = 0;
    
    for (const file of files) {
      const oldUrl = file.file_url;
      
      // Extract the path part after /storage/
      const match = oldUrl.match(/\/storage\/(.+)$/);
      
      if (match) {
        const storagePath = match[1];
        const newUrl = `${BASE_URL}/storage/${storagePath}`;
        
        if (oldUrl !== newUrl) {
          await connection.query(
            'UPDATE storage_files SET file_url = ? WHERE id = ?',
            [newUrl, file.id]
          );
          
          console.log(`Updated: ${oldUrl} -> ${newUrl}`);
          updatedCount++;
        }
      }
    }
    
    console.log(`\n✓ Updated ${updatedCount} file URLs successfully!`);
    process.exit(0);
  } catch (err) {
    console.error('Error updating file URLs:', err);
    process.exit(1);
  }
}

updateAllFileUrls();
