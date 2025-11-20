const connection = require('../config/db1');

async function updateFileUrls() {
  try {
    console.log('Updating file URLs to use folder slugs...');
    
    // Get all folders with their slugs
    const [folders] = await connection.query(
      'SELECT id, slug FROM storage_folders WHERE slug IS NOT NULL'
    );
    
    console.log(`Found ${folders.length} folders`);
    
    for (const folder of folders) {
      // Get all files in this folder
      const [files] = await connection.query(
        'SELECT id, file_url FROM storage_files WHERE folder_id = ?',
        [folder.id]
      );
      
      console.log(`\nUpdating ${files.length} files in folder: ${folder.slug}`);
      
      for (const file of files) {
        const oldUrl = file.file_url;
        const newUrl = oldUrl.replace(`/storage/folder_${folder.id}/`, `/storage/${folder.slug}/`);
        
        if (oldUrl !== newUrl) {
          await connection.query(
            'UPDATE storage_files SET file_url = ? WHERE id = ?',
            [newUrl, file.id]
          );
          console.log(`  Updated: ${oldUrl} -> ${newUrl}`);
        }
      }
    }
    
    console.log('\n✓ All file URLs updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating file URLs:', err);
    process.exit(1);
  }
}

updateFileUrls();
