const connection = require('../config/db1');

/**
 * Script to fix base64 padding issues
 * Fixes "more than 2 padding characters" errors
 */

async function fixBase64Padding() {
  console.log('Starting base64 padding fix...\n');
  
  try {
    // Get all students with images
    const [students] = await connection.query(
      'SELECT student_id, firstName, lastName, image FROM student14 WHERE image IS NOT NULL AND image != ""'
    );
    
    console.log(`Found ${students.length} students with image data\n`);
    
    let fixed = 0;
    let alreadyValid = 0;
    let setToNull = 0;
    let errors = 0;
    
    for (const student of students) {
      const { student_id, firstName, lastName, image } = student;
      
      try {
        // Skip if already NULL or empty
        if (!image || image === '' || image === 'null') {
          continue;
        }
        
        console.log(`\nProcessing Student ${student_id}: ${firstName} ${lastName}`);
        console.log(`  Original length: ${image.length} characters`);
        
        // Extract base64 data (remove data URI if present)
        let base64Data = image;
        let dataUriPrefix = '';
        
        if (image.startsWith('data:')) {
          const parts = image.split(',');
          if (parts.length === 2) {
            dataUriPrefix = parts[0] + ',';
            base64Data = parts[1];
            console.log(`  ✓ Has data URI prefix`);
          }
        } else {
          console.log(`  ⚠ Missing data URI prefix`);
        }
        
        // Clean the base64 string
        const originalBase64 = base64Data;
        
        // Remove all whitespace and newlines
        base64Data = base64Data.replace(/\s/g, '');
        
        // Remove any invalid characters (keep only A-Z, a-z, 0-9, +, /, =)
        base64Data = base64Data.replace(/[^A-Za-z0-9+/=]/g, '');
        
        // Fix padding issues
        // First, remove ALL existing padding
        base64Data = base64Data.replace(/=+$/, '');
        
        // Calculate correct padding
        const paddingNeeded = (4 - (base64Data.length % 4)) % 4;
        
        // Add correct padding (0, 1, or 2 equals signs)
        if (paddingNeeded > 0) {
          base64Data += '='.repeat(paddingNeeded);
          console.log(`  → Added ${paddingNeeded} padding character(s)`);
        }
        
        console.log(`  Cleaned length: ${base64Data.length} characters`);
        console.log(`  Padding: ${base64Data.match(/=*$/)[0].length} character(s)`);
        
        // Validate the cleaned base64
        if (!isValidBase64(base64Data)) {
          console.log(`  ✗ Invalid base64 after cleaning - setting to NULL`);
          await connection.query(
            'UPDATE student14 SET image = NULL WHERE student_id = ?',
            [student_id]
          );
          setToNull++;
          continue;
        }
        
        // Reconstruct with proper data URI
        let finalImage;
        if (dataUriPrefix) {
          finalImage = dataUriPrefix + base64Data;
        } else {
          // Detect image type from base64 signature
          const imageType = detectImageType(base64Data);
          finalImage = `data:image/${imageType};base64,${base64Data}`;
          console.log(`  → Added data URI prefix (type: ${imageType})`);
        }
        
        // Only update if changed
        if (finalImage !== image) {
          await connection.query(
            'UPDATE student14 SET image = ? WHERE student_id = ?',
            [finalImage, student_id]
          );
          console.log(`  ✓ Fixed and updated`);
          fixed++;
        } else {
          console.log(`  ✓ Already valid`);
          alreadyValid++;
        }
        
      } catch (err) {
        console.error(`  ✗ Error: ${err.message}`);
        // Set to NULL if we can't fix it
        try {
          await connection.query(
            'UPDATE student14 SET image = NULL WHERE student_id = ?',
            [student_id]
          );
          setToNull++;
        } catch (updateErr) {
          errors++;
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('PADDING FIX SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total students processed: ${students.length}`);
    console.log(`Already valid: ${alreadyValid}`);
    console.log(`Fixed: ${fixed}`);
    console.log(`Set to NULL (invalid): ${setToNull}`);
    console.log(`Errors: ${errors}`);
    console.log('='.repeat(60) + '\n');
    
    if (setToNull > 0) {
      console.log('⚠ WARNING: Some images were set to NULL because they were invalid.');
      console.log('  These students will need to re-upload their photos.\n');
    }
    
  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    await connection.end();
    console.log('Database connection closed.');
  }
}

/**
 * Validate base64 string
 */
function isValidBase64(str) {
  if (!str || str.length === 0) return false;
  
  // Check pattern
  const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
  if (!base64Regex.test(str)) return false;
  
  // Check length is divisible by 4
  if (str.length % 4 !== 0) return false;
  
  // Check padding (max 2 equals at the end)
  const padding = str.match(/=*$/)[0];
  if (padding.length > 2) return false;
  
  // Try to decode (basic validation)
  try {
    // Check if it looks like valid base64
    const withoutPadding = str.replace(/=/g, '');
    if (withoutPadding.length === 0) return false;
    
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Detect image type from base64 string
 */
function detectImageType(base64String) {
  const signatures = {
    '/9j/': 'jpeg',
    'iVBORw0KGgo': 'png',
    'R0lGODlh': 'gif',
    'UklGR': 'webp'
  };
  
  for (const [signature, type] of Object.entries(signatures)) {
    if (base64String.startsWith(signature)) {
      return type;
    }
  }
  
  return 'jpeg'; // Default
}

// Run the script
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║        Base64 Padding Fix Script                          ║');
console.log('║  Fixes "more than 2 padding characters" errors            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

fixBase64Padding()
  .then(() => {
    console.log('✓ Script completed successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('✗ Script failed:', err);
    process.exit(1);
  });
