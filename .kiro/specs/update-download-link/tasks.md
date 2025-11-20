# Implementation Plan

- [x] 1. Update navbar download links to use internal routing








  - Replace three `<a>` tags with React Router `<Link>` components in Navbar.jsx
  - Change href from `https://www.shorthandexam.in/storage/publish/publish.htm` to `/dashboard/overview`
  - Update desktop menu download link
  - Update tablet dropdown download link
  - Update mobile dropdown download link
  - Remove `target="_blank"` and `rel="noopener noreferrer"` attributes
  - Verify `Link` is imported from `react-router-dom`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4_
-

- [x] 2. Update storage multer middleware to preserve spaces in filenames




  - Modify filename sanitization in `backend/middleware/storageMulter.js`
  - Remove the logic that replaces spaces with underscores
  - Keep only file system unsafe character removal (`< > : " | ? *`)
  - Preserve spaces and other safe characters for URL encoding
  - Maintain timestamp prefix for uniqueness
  - _Requirements: 3.1, 3.3, 4.1, 4.4, 4.5_
-

- [x] 3. Update storage controller file upload handling




  - Modify filename sanitization in `uploadFiles` function in `backend/controllers/storageController.js`
  - Remove underscore replacement logic
  - Keep only file system unsafe character removal
  - Update file URL generation to use `encodeURIComponent()` for each path segment
  - Encode folder path components separately
  - Encode file path components separately
  - _Requirements: 3.1, 3.2, 3.4, 3.5, 4.2, 4.4, 4.5_

- [ ] 4. Update folder slug generation to preserve spaces
  - Modify `generateSlug` function in `backend/controllers/storageController.js`
  - Remove underscore replacement logic
  - Remove lowercase conversion to maintain readability
  - Keep only file system and path unsafe character removal (`< > : " | ? * / \`)
  - Preserve spaces in folder names
  - _Requirements: 3.2, 3.3, 4.3, 4.4_

- [ ]* 5. Test navbar link functionality
  - Verify desktop menu download link navigates to `/dashboard/overview`
  - Verify tablet dropdown download link navigates to `/dashboard/overview`
  - Verify mobile dropdown download link navigates to `/dashboard/overview`
  - Verify styling remains consistent with other navigation items
  - Verify mobile menu closes after clicking download link
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4_

- [ ]* 6. Test file upload with spaces in filename
  - Upload a file with spaces (e.g., "My Document.pdf")
  - Verify file uploads successfully
  - Verify file URL contains %20 instead of underscores
  - Verify file can be downloaded via the generated URL
  - Verify original filename is preserved in database
  - _Requirements: 3.1, 3.4, 3.5_

- [ ]* 7. Test folder creation with spaces in name
  - Create a folder with spaces (e.g., "My Folder")
  - Verify folder is created successfully
  - Verify folder slug preserves spaces
  - Upload a file to this folder
  - Verify file URL is correctly generated with encoded folder path
  - _Requirements: 3.2, 3.3_

- [ ]* 8. Test special characters and edge cases
  - Test files with special characters: "File (1).pdf", "File & Document.txt"
  - Test Unicode filenames: "文档.pdf", "Документ.txt"
  - Test multiple consecutive spaces: "File    Name.pdf"
  - Test leading/trailing spaces: " File.pdf "
  - Verify safe characters are preserved
  - Verify unsafe characters are removed
  - Verify files are accessible via generated URLs
  - _Requirements: 4.5_

- [ ]* 9. Test backward compatibility
  - Verify existing files with underscores still work
  - Verify old file URLs remain functional
  - Verify no breaking changes to existing storage functionality
  - _Requirements: 4.4_
