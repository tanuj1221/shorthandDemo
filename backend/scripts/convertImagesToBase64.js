const connection = require('../config/db1');
const fs = require('fs');
const path = require('path');

/**
 * Script to convert all student images to base64 format
 * This handles images that might be stored as file paths or URLs
 */

async function convertImagesToBase64() {
  console.log('Starting image conversion to base64...\n');
  
  try {
    // Get all students with images
    const [students] = await connection.query(
      'SELECT student_id, image FROM student14 WHERE image IS NOT NULL AND image != ""'
    );
    
    console.log(`Found ${students.length} students with image data\n`);
    
    let converted = 0;
    let alreadyBase64 = 0;
    let errors = 0;
    let nullified = 0;
    
    for (const student of students) {
      const { student_id, image } = student;
      
      try {
        // Check if already in base64 format
        if (image.startsWith('data:image/')) {
          console.log(`✓ Student ${student_id}: Already in base64 format`);
          alreadyBase64++;
          continue;
        }
        
        // Check if it's a file path (local or URL)
        if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/uploads/')) {
          console.log(`⚠ Student ${student_id}: Image is a URL/path: ${image.substring(0, 50)}...`);
          console.log(`  Setting to NULL (cannot convert remote URLs automatically)`);
          
          // Set to NULL for manual handling
          await connection.query(
            'UPDATE student14 SET image = NULL WHERE student_id = ?',
            [student_id]
          );
          nullified++;
          continue;
        }
        
        // Check if it's base64 without the data URI prefix
        if (isBase64(image)) {
          console.log(`→ Student ${student_id}: Converting base64 string to proper format`);
          
          // Determine image type (default to jpeg)
          const imageType = detectImageType(image);
          const properBase64 = `data:image/${imageType};base64,${image}`;
          
          await connection.query(
            'UPDATE student14 SET image = ? WHERE student_id = ?',
            [properBase64, student_id]
          );
          
          console.log(`✓ Student ${student_id}: Converted to proper base64 format`);
          converted++;
        } else {
          console.log(`✗ Student ${student_id}: Unknown format, setting to NULL`);
          await connection.query(
            'UPDATE student14 SET image = NULL WHERE student_id = ?',
            [student_id]
          );
          nullified++;
        }
        
      } catch (err) {
        console.error(`✗ Student ${student_id}: Error - ${err.message}`);
        errors++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('CONVERSION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total students processed: ${students.length}`);
    console.log(`Already in base64 format: ${alreadyBase64}`);
    console.log(`Converted to base64: ${converted}`);
    console.log(`Set to NULL (URLs/invalid): ${nullified}`);
    console.log(`Errors: ${errors}`);
    console.log('='.repeat(60) + '\n');
    
    if (nullified > 0) {
      console.log('⚠ WARNING: Some images were set to NULL because they were URLs or invalid.');
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
 * Check if a string is valid base64
 */
function isBase64(str) {
  if (!str || str.length === 0) return false;
  
  // Remove whitespace and newlines
  str = str.trim().replace(/\s/g, '');
  
  // Check if it matches base64 pattern
  const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
  
  // Base64 strings should be divisible by 4 (with padding)
  if (str.length % 4 !== 0) return false;
  
  return base64Regex.test(str);
}

/**
 * Clean and validate base64 string
 */
function cleanBase64(str) {
  if (!str) return null;
  
  // Remove data URI if present
  if (str.startsWith('data:')) {
    const parts = str.split(',');
    if (parts.length === 2) {
      str = parts[1];
    }
  }
  
  // Remove all whitespace, newlines, and invalid characters
  str = str.replace(/\s/g, '').replace(/[^A-Za-z0-9+/=]/g, '');
  
  // Fix padding - base64 should be divisible by 4
  const paddingNeeded = (4 - (str.length % 4)) % 4;
  if (paddingNeeded > 0) {
    str += '='.repeat(paddingNeeded);
  }
  
  // Remove excess padding (more than 2 '=' at the end)
  str = str.replace(/=+$/, (match) => {
    return match.length > 2 ? '==' : match;
  });
  
  // Validate it's proper base64
  try {
    // Try to decode to verify it's valid
    if (typeof atob !== 'undefined') {
      atob(str);
    }
    return str;
  } catch (e) {
    console.error('Invalid base64 after cleaning:', e.message);
    return null;
  }
}

/**
 * Detect image type from base64 string
 */
function detectImageType(base64String) {
  // Get first few characters to detect image signature
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
  
  // Default to jpeg
  return 'jpeg';
}

// Run the script
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║     Student Image Base64 Conversion Script                ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

convertImagesToBase64()
  .then(() => {
    console.log('Script completed successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Script failed:', err);
    process.exit(1);
  });
