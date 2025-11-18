# Student Image Management Scripts

This directory contains scripts to manage and fix student images in the database.

## Overview

Student images should be stored in **base64 format** with the proper data URI prefix:
```
data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...
```

## Available Scripts

### 1. Validate Image Formats
**File:** `validateImageFormats.js`

This script checks all student images in the database and reports their format status.

**Usage:**
```bash
node backend/scripts/validateImageFormats.js
```

**What it does:**
- Scans all students in the database
- Identifies image format issues:
  - ✓ Valid base64 with data URI prefix
  - ⚠ Raw base64 without data URI prefix
  - ⚠ URL or file path format
  - ✗ Unknown/invalid format
- Provides statistics and health percentage
- Lists all problematic entries

**When to use:**
- Before running the conversion script
- To check database health after migration
- Regular maintenance checks

---

### 2. Convert Images to Base64
**File:** `convertImagesToBase64.js`

This script automatically converts all non-standard image formats to proper base64 format.

**Usage:**
```bash
node backend/scripts/convertImagesToBase64.js
```

**What it does:**
- Finds all students with image data
- Converts images to proper base64 format:
  - Adds `data:image/jpeg;base64,` prefix to raw base64 strings
  - Detects image type (JPEG, PNG, GIF, WebP) from base64 signature
  - Sets URL/path images to NULL (requires manual re-upload)
- Provides detailed conversion report

**When to use:**
- After database migration
- When images are not displaying correctly
- To fix "glitchy" image display issues

---

## Workflow

### Step 1: Check Current Status
```bash
node backend/scripts/validateImageFormats.js
```

Review the output to see how many images need fixing.

### Step 2: Run Conversion
```bash
node backend/scripts/convertImagesToBase64.js
```

This will automatically fix most issues.

### Step 3: Verify Results
```bash
node backend/scripts/validateImageFormats.js
```

Check that all images are now in correct format.

---

## Image Format Details

### ✅ Correct Format
```javascript
"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
```

### ⚠ Needs Conversion
```javascript
// Raw base64 (missing data URI)
"/9j/4AAQSkZJRgABAQAAAQABAAD..."

// File path
"/uploads/images/student123.jpg"

// URL
"http://localhost:8080/uploads/images/student123.jpg"
```

---

## Frontend Compatibility

The React frontend is designed to handle both formats gracefully:

```javascript
// Automatically adds prefix if missing
const imageSrc = student.image.startsWith('data:') 
  ? student.image 
  : `data:image/jpeg;base64,${student.image}`;
```

**Components with image handling:**
- `StudentTableData.jsx` - Student list table
- `StudentTableStructure.jsx` - Table structure component
- `StudentsRow.jsx` - Individual student rows
- `EditStudentDialog.jsx` - Edit student dialog
- `PhotoUploadStep.jsx` - Registration photo upload

---

## Troubleshooting

### Images not displaying
1. Run validation script to identify issues
2. Run conversion script to fix
3. Check browser console for errors
4. Verify database column type supports large text (LONGTEXT recommended)

### "Invalid Image" placeholders
- Image data is corrupted or invalid
- Student needs to re-upload photo
- Check if image exceeds size limits

### Script errors
- Verify database connection in `config/db1.js`
- Ensure MySQL is running
- Check database credentials

---

## Database Schema

The `student14` table should have:
```sql
image LONGTEXT NULL
```

This allows storing large base64 strings (typically 50-100KB per image).

---

## Best Practices

1. **Always validate before converting** - Know what you're fixing
2. **Backup database** - Before running conversion scripts
3. **Test on staging** - Before production deployment
4. **Monitor size** - Base64 images are ~33% larger than binary
5. **Set upload limits** - Frontend enforces 50KB max file size

---

## Support

If images are still not displaying after running these scripts:
1. Check that new registrations are saving images correctly
2. Verify the registration form is converting images to base64
3. Check network tab for API responses
4. Ensure database column can store large text values
