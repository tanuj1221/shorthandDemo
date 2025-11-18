const connection = require('../config/db1');

/**
 * Script to validate and report on image formats in the database
 * This helps identify any problematic image entries
 */

async function validateImageFormats() {
  console.log('Validating image formats in database...\n');
  
  try {
    // Get all students
    const [allStudents] = await connection.query(
      'SELECT student_id, firstName, lastName, image FROM student14'
    );
    
    console.log(`Total students in database: ${allStudents.length}\n`);
    
    const stats = {
      total: allStudents.length,
      withImage: 0,
      withoutImage: 0,
      validBase64: 0,
      invalidBase64: 0,
      urlOrPath: 0,
      rawBase64: 0,
      unknown: 0
    };
    
    const issues = [];
    
    for (const student of allStudents) {
      const { student_id, firstName, lastName, image } = student;
      
      if (!image || image === '' || image === 'null') {
        stats.withoutImage++;
        continue;
      }
      
      stats.withImage++;
      
      // Check format
      if (image.startsWith('data:image/')) {
        // Valid base64 with data URI
        stats.validBase64++;
      } else if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/uploads/')) {
        // URL or file path
        stats.urlOrPath++;
        issues.push({
          student_id,
          name: `${firstName} ${lastName}`,
          issue: 'URL/Path',
          preview: image.substring(0, 60)
        });
      } else if (isBase64(image)) {
        // Base64 without data URI prefix
        stats.rawBase64++;
        issues.push({
          student_id,
          name: `${firstName} ${lastName}`,
          issue: 'Raw Base64 (missing data URI)',
          preview: image.substring(0, 40) + '...'
        });
      } else {
        // Unknown format
        stats.unknown++;
        issues.push({
          student_id,
          name: `${firstName} ${lastName}`,
          issue: 'Unknown format',
          preview: image.substring(0, 60)
        });
      }
    }
    
    // Print statistics
    console.log('═'.repeat(70));
    console.log('IMAGE FORMAT STATISTICS');
    console.log('═'.repeat(70));
    console.log(`Total students:              ${stats.total}`);
    console.log(`Students with images:        ${stats.withImage}`);
    console.log(`Students without images:     ${stats.withoutImage}`);
    console.log('─'.repeat(70));
    console.log(`✓ Valid base64 (data URI):   ${stats.validBase64}`);
    console.log(`⚠ Raw base64 (no data URI):  ${stats.rawBase64}`);
    console.log(`⚠ URL/Path format:           ${stats.urlOrPath}`);
    console.log(`✗ Unknown format:            ${stats.unknown}`);
    console.log('═'.repeat(70));
    
    // Calculate health percentage
    const healthPercentage = stats.withImage > 0 
      ? ((stats.validBase64 / stats.withImage) * 100).toFixed(2)
      : 100;
    
    console.log(`\nImage Health: ${healthPercentage}% (${stats.validBase64}/${stats.withImage} correct format)`);
    
    // Print issues
    if (issues.length > 0) {
      console.log('\n' + '═'.repeat(70));
      console.log('ISSUES FOUND');
      console.log('═'.repeat(70));
      
      issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. Student ID: ${issue.student_id}`);
        console.log(`   Name: ${issue.name}`);
        console.log(`   Issue: ${issue.issue}`);
        console.log(`   Preview: ${issue.preview}`);
      });
      
      console.log('\n' + '═'.repeat(70));
      console.log('RECOMMENDATION');
      console.log('═'.repeat(70));
      console.log('Run the conversion script to fix these issues:');
      console.log('  node backend/scripts/convertImagesToBase64.js');
      console.log('═'.repeat(70));
    } else {
      console.log('\n✓ All images are in correct format!');
    }
    
  } catch (err) {
    console.error('Error during validation:', err);
  } finally {
    await connection.end();
    console.log('\nDatabase connection closed.');
  }
}

/**
 * Check if a string is valid base64
 */
function isBase64(str) {
  if (!str || str.length === 0) return false;
  
  str = str.trim();
  const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
  
  if (str.length % 4 !== 0) return false;
  
  return base64Regex.test(str);
}

// Run the script
console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║          Student Image Format Validation Script                   ║');
console.log('╚════════════════════════════════════════════════════════════════════╝\n');

validateImageFormats()
  .then(() => {
    console.log('\nValidation completed!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Validation failed:', err);
    process.exit(1);
  });
