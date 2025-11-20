const connection = require('../config/db1');
const fs = require('fs');
const path = require('path');

const STORAGE_BASE = path.join(__dirname, '../storage');

/**
 * Generate a URL-safe slug from folder name
 */
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '_')      // Replace spaces with underscores
    .replace(/-+/g, '_')       // Replace hyphens with underscores
    .replace(/_+/g, '_');      // Replace multiple underscores with single
};

async function updateFolderSlugs() {
  try {
    console.log('Starting folder slug update...');
    
    // Get all folders without slugs
    const [folders] = await connection.query(
      'SELECT * FROM storage_folders WHERE slug IS NULL OR slug = ""'
    );
    
    console.log(`Found ${folders.length} folders to update`);
    
    for (const folder of folders) {
      const slug = generateSlug(folder.name);
      const oldPath = path.join(STORAGE_BASE, `folder_${folder.id}`);
      const newPath = path.join(STORAGE_BASE, slug);
      
      console.log(`\nProcessing folder: ${folder.name}`);
      console.log(`  Old path: folder_${folder.id}`);
      console.log(`  New slug: ${slug}`);
      
      // Check if slug already exists
      const [existing] = await connection.query(
        'SELECT id FROM storage_folders WHERE slug = ? AND id != ?',
        [slug, folder.id]
      );
      
      let finalSlug = slug;
      if (existing.length > 0) {
        let counter = 1;
        while (true) {
          const testSlug = `${slug}_${counter}`;
          const [test] = await connection.query(
            'SELECT id FROM storage_folders WHERE slug = ? AND id != ?',
            [testSlug, folder.id]
          );
          if (test.length === 0) {
            finalSlug = testSlug;
            break;
          }
          counter++;
        }
        console.log(`  Slug conflict, using: ${finalSlug}`);
      }
      
      // Update database
      await connection.query(
        'UPDATE storage_folders SET slug = ? WHERE id = ?',
        [finalSlug, folder.id]
      );
      
      // Copy physical folder if it exists
      if (fs.existsSync(oldPath)) {
        if (fs.existsSync(newPath)) {
          console.log(`  Warning: New path already exists, skipping copy`);
        } else {
          // Copy folder recursively
          fs.cpSync(oldPath, newPath, { recursive: true });
          console.log(`  Copied folder to new location`);
          console.log(`  Note: Old folder (folder_${folder.id}) can be manually deleted later`);
        }
      } else {
        console.log(`  Old folder doesn't exist on disk, creating new one`);
        fs.mkdirSync(newPath, { recursive: true });
      }
      
      // Update file URLs
      const [files] = await connection.query(
        'SELECT * FROM storage_files WHERE folder_id = ?',
        [folder.id]
      );
      
      for (const file of files) {
        const oldUrl = file.file_url;
        const newUrl = oldUrl.replace(`/storage/folder_${folder.id}/`, `/storage/${finalSlug}/`);
        
        await connection.query(
          'UPDATE storage_files SET file_url = ? WHERE id = ?',
          [newUrl, file.id]
        );
      }
      
      console.log(`  Updated ${files.length} file URLs`);
      console.log(`  ✓ Completed`);
    }
    
    console.log('\n✓ All folders updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating folder slugs:', err);
    process.exit(1);
  }
}

updateFolderSlugs();
