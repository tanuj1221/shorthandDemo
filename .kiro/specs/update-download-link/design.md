# Design Document

## Overview

This design document outlines the implementation approach for two independent features:
1. Updating the navbar download link from an external S3 URL to an internal dashboard route
2. Implementing URL encoding for file and folder names to preserve spaces

Both features are straightforward updates that improve user experience and maintain web standards.

## Architecture

### Feature 1: Download Link Update

**Component Affected:**
- `frontend/src/components/NavbarComponent/Navbar.jsx`

**Change Type:** Simple link replacement

**Approach:**
- Replace three `<a>` tags with React Router `<Link>` components
- Update href from `https://www.shorthandexam.in/storage/publish/publish.htm` to `/dashboard/overview`
- Maintain existing styling and behavior

### Feature 2: File Naming with URL Encoding

**Components Affected:**
- `backend/middleware/storageMulter.js` - File upload handling
- `backend/controllers/storageController.js` - File URL generation and folder slug creation

**Change Type:** Sanitization logic update

**Approach:**
- Replace underscore-based sanitization with URL encoding
- Use `encodeURIComponent()` for proper URL encoding
- Maintain special character handling for file system safety

## Components and Interfaces

### 1. Navbar Component Update

**Current Implementation:**
```jsx
<a
  href="https://www.shorthandexam.in/storage/publish/publish.htm"
  target="_blank"
  rel="noopener noreferrer"
  className="..."
>
  Download
</a>
```

**New Implementation:**
```jsx
<Link
  to="/dashboard/overview"
  className="..."
>
  Download
</Link>
```

**Changes Required:**
- Import `Link` from `react-router-dom` (if not already imported)
- Replace three instances (desktop, tablet, mobile menus)
- Remove `target="_blank"` and `rel="noopener noreferrer"` attributes
- Keep all existing className and styling

### 2. Storage Multer Middleware Update

**Current Sanitization:**
```javascript
const uniqueName = Date.now() + '_' + file.originalname
  .replace(/\s+/g, '_')
  .replace(/[^a-zA-Z0-9._-]/g, '');
```

**New Sanitization:**
```javascript
// Keep only safe characters for file system, but preserve spaces for URL encoding
const sanitizedBase = file.originalname
  .replace(/[<>:"|?*]/g, '') // Remove file system unsafe characters
  .trim();

const uniqueName = Date.now() + '_' + sanitizedBase;
```

**Rationale:**
- Remove only truly unsafe file system characters: `< > : " | ? *`
- Preserve spaces and other characters for URL encoding
- Keep timestamp prefix to avoid conflicts

### 3. Storage Controller Updates

**A. File Upload - Filename Handling**

**Current:**
```javascript
const sanitizedName = file.originalname
  .replace(/\s+/g, '_')
  .replace(/[^a-zA-Z0-9._-]/g, '');
```

**New:**
```javascript
const sanitizedName = file.originalname
  .replace(/[<>:"|?*]/g, '') // Remove file system unsafe characters only
  .trim();
```

**B. File URL Generation**

**Current:**
```javascript
const fileUrl = `${BASE_URL}/storage/${folderFullPath}/${filePath}`;
```

**New:**
```javascript
// Encode each path component separately
const encodedFolderPath = folderFullPath.split('/').map(encodeURIComponent).join('/');
const encodedFilePath = filePath.split('/').map(encodeURIComponent).join('/');
const fileUrl = `${BASE_URL}/storage/${encodedFolderPath}/${encodedFilePath}`;
```

**C. Folder Slug Generation**

**Current:**
```javascript
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/-+/g, '_')
    .replace(/_+/g, '_');
};
```

**New:**
```javascript
const generateSlug = (name) => {
  // Keep the name readable, just remove truly unsafe characters
  return name
    .trim()
    .replace(/[<>:"|?*\/\\]/g, ''); // Remove file system and path unsafe characters
};
```

## Data Models

No database schema changes required. The existing tables already store:
- `original_name` - Preserves the original filename with spaces
- `stored_name` - The sanitized filename used on disk
- `file_url` - The full URL (will now include %20 for spaces)
- `slug` - Folder slug (will now preserve spaces)

## Error Handling

### Navbar Link Update
- No special error handling needed
- React Router handles invalid routes automatically
- Existing navigation error boundaries apply

### File Naming Updates

**Potential Issues:**
1. **File system compatibility**: Some characters may still cause issues on certain file systems
   - **Solution**: Remove only truly unsafe characters (`< > : " | ? *`)
   - **Fallback**: If file creation fails, log error and return 500 with descriptive message

2. **URL encoding edge cases**: Very long filenames or special Unicode characters
   - **Solution**: `encodeURIComponent()` handles all Unicode properly
   - **Limit**: Existing 50MB file size limit and filename length limits apply

3. **Backward compatibility**: Existing files with underscores should still work
   - **Solution**: No changes to existing files; only affects new uploads
   - **Database**: Existing `file_url` values remain unchanged

4. **Path traversal attacks**: Malicious filenames with `../` or similar
   - **Solution**: Remove `/` and `\` characters from folder slugs
   - **Existing**: Multer already prevents path traversal with `preservePath: false`

## Testing Strategy

### Manual Testing

**Navbar Link Update:**
1. Test desktop menu download link navigates to `/dashboard/overview`
2. Test tablet dropdown download link navigates to `/dashboard/overview`
3. Test mobile dropdown download link navigates to `/dashboard/overview`
4. Verify styling remains consistent with other nav items
5. Verify mobile menu closes after clicking download link

**File Naming with Spaces:**
1. Upload a file with spaces in the name (e.g., "My Document.pdf")
   - Verify file uploads successfully
   - Verify file URL contains %20 instead of underscores
   - Verify file can be downloaded via the generated URL
   
2. Create a folder with spaces in the name (e.g., "My Folder")
   - Verify folder is created successfully
   - Verify folder slug preserves spaces
   - Upload a file to this folder and verify URL is correct

3. Upload a folder structure with spaces in names
   - Verify nested folders preserve spaces
   - Verify all files are accessible via their URLs

4. Test special characters in filenames
   - Test: "File (1).pdf", "File & Document.txt", "File's Name.doc"
   - Verify safe characters are preserved
   - Verify unsafe characters are removed

5. Test backward compatibility
   - Verify existing files with underscores still work
   - Verify old URLs remain functional

### Edge Cases to Test

1. **Very long filenames** (>255 characters)
2. **Unicode characters** (e.g., "文档.pdf", "Документ.txt")
3. **Multiple consecutive spaces** (e.g., "File    Name.pdf")
4. **Leading/trailing spaces** (e.g., " File.pdf ")
5. **Files with only special characters** (e.g., "!!!.pdf")

## Implementation Notes

### Order of Implementation

1. **Navbar Link Update** (Independent, can be done first)
   - Simple find-and-replace operation
   - Low risk, immediate benefit
   - No dependencies

2. **File Naming Updates** (Requires careful testing)
   - Update multer middleware first
   - Update storage controller second
   - Test thoroughly before deploying

### Deployment Considerations

- **No database migration needed**
- **No breaking changes** to existing functionality
- **Backward compatible** with existing files
- **Can be deployed independently** (navbar update separate from file naming)

### Performance Impact

- **Navbar**: No performance impact (internal routing is faster than external links)
- **File naming**: Minimal impact
  - `encodeURIComponent()` is a fast native function
  - No additional database queries
  - File system operations remain the same

## Security Considerations

1. **Path Traversal Prevention**
   - Remove `/` and `\` from folder slugs
   - Multer's `preservePath: false` provides additional protection

2. **File System Safety**
   - Remove characters that are unsafe on Windows/Linux: `< > : " | ? *`
   - Maintain existing file size limits (50MB)

3. **XSS Prevention**
   - URL encoding prevents injection attacks via filenames
   - File URLs are properly encoded before being sent to client

4. **Internal Route Security**
   - Dashboard overview route should maintain existing authentication
   - No new security concerns introduced by link change
