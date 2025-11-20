const fs = require('fs');
const path = require('path');
const connection = require('../config/db1');

// Base storage directory
const STORAGE_BASE = path.join(__dirname, '../storage');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_BASE)) {
  fs.mkdirSync(STORAGE_BASE, { recursive: true });
}

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

/**
 * Get all folders and files structure
 */
exports.getStorageStructure = async (req, res) => {
  try {
    const [folders] = await connection.query(
      'SELECT * FROM storage_folders ORDER BY created_at DESC'
    );
    
    const [files] = await connection.query(
      'SELECT * FROM storage_files ORDER BY uploaded_at DESC'
    );
    
    // Group files by folder
    const structure = folders.map(folder => ({
      ...folder,
      files: files.filter(file => file.folder_id === folder.id)
    }));
    
    res.json({
      success: true,
      data: structure
    });
  } catch (err) {
    console.error('Error fetching storage structure:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch storage structure',
      error: err.message
    });
  }
};

/**
 * Create a new folder
 */
exports.createFolder = async (req, res) => {
  const { folderName, description } = req.body;
  
  if (!folderName || folderName.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Folder name is required'
    });
  }
  
  try {
    const slug = generateSlug(folderName);
    
    // Check if slug already exists
    const [existing] = await connection.query(
      'SELECT id FROM storage_folders WHERE slug = ?',
      [slug]
    );
    
    // If slug exists, append a number
    let finalSlug = slug;
    if (existing.length > 0) {
      let counter = 1;
      while (true) {
        const testSlug = `${slug}_${counter}`;
        const [test] = await connection.query(
          'SELECT id FROM storage_folders WHERE slug = ?',
          [testSlug]
        );
        if (test.length === 0) {
          finalSlug = testSlug;
          break;
        }
        counter++;
      }
    }
    
    // Create folder in database
    const [result] = await connection.query(
      'INSERT INTO storage_folders (name, slug, description, created_at) VALUES (?, ?, ?, NOW())',
      [folderName.trim(), finalSlug, description || '']
    );
    
    // Create physical folder using slug
    const folderPath = path.join(STORAGE_BASE, finalSlug);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    res.json({
      success: true,
      message: 'Folder created successfully',
      folderId: result.insertId
    });
  } catch (err) {
    console.error('Error creating folder:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create folder',
      error: err.message
    });
  }
};

/**
 * Upload files to a folder (supports nested folder structure)
 */
exports.uploadFiles = async (req, res) => {
  const { folderId } = req.body;
  const files = req.files;
  
  if (!folderId) {
    return res.status(400).json({
      success: false,
      message: 'Folder ID is required'
    });
  }
  
  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded'
    });
  }
  
  try {
    // Check if folder exists
    const [folders] = await connection.query(
      'SELECT * FROM storage_folders WHERE id = ?',
      [folderId]
    );
    
    if (folders.length === 0) {
      // Clean up temp files
      files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }
    
    const folder = folders[0];
    
    // If folder doesn't have a slug, generate one
    if (!folder.slug) {
      const slug = generateSlug(folder.name);
      await connection.query(
        'UPDATE storage_folders SET slug = ? WHERE id = ?',
        [slug, folder.id]
      );
      folder.slug = slug;
    }
    
    const uploadedFiles = [];
    
    for (const file of files) {
      // Get the relative path from fieldname
      const relativePath = file.fieldname === 'files' ? '' : file.fieldname.replace('files-', '');
      
      // Sanitize original filename
      const sanitizedName = file.originalname
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9._-]/g, '');
      
      // Determine final file path
      const targetDir = relativePath 
        ? path.join(STORAGE_BASE, folder.slug, relativePath)
        : path.join(STORAGE_BASE, folder.slug);
      
      // Create directory if needed
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Check if file exists and add counter if needed
      let finalFileName = sanitizedName;
      let targetPath = path.join(targetDir, finalFileName);
      
      if (fs.existsSync(targetPath)) {
        const ext = path.extname(sanitizedName);
        const nameWithoutExt = path.basename(sanitizedName, ext);
        let counter = 1;
        
        do {
          finalFileName = `${nameWithoutExt}_(${counter})${ext}`;
          targetPath = path.join(targetDir, finalFileName);
          counter++;
        } while (fs.existsSync(targetPath));
      }
      
      // Move file from temp to target location
      fs.renameSync(file.path, targetPath);
      
      // Construct file path for URL
      const filePath = relativePath ? `${relativePath}/${finalFileName}` : finalFileName;
      
      // Generate file URL using folder slug
      const fileUrl = `${req.protocol}://${req.get('host')}/storage/${folder.slug}/${filePath}`;
      
      // Save file info to database
      const [result] = await connection.query(
        `INSERT INTO storage_files 
        (folder_id, original_name, stored_name, file_path, file_size, mime_type, file_url, uploaded_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [folderId, file.originalname, finalFileName, relativePath || null, file.size, file.mimetype, fileUrl]
      );
      
      uploadedFiles.push({
        id: result.insertId,
        originalName: file.originalname,
        url: fileUrl,
        size: file.size,
        path: relativePath
      });
    }
    
    res.json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      files: uploadedFiles
    });
  } catch (err) {
    console.error('Error uploading files:', err);
    
    // Clean up temp files on error
    files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload files',
      error: err.message
    });
  }
};

/**
 * Get files in a folder
 */
exports.getFolderFiles = async (req, res) => {
  const { folderId } = req.params;
  
  try {
    const [files] = await connection.query(
      'SELECT * FROM storage_files WHERE folder_id = ? ORDER BY uploaded_at DESC',
      [folderId]
    );
    
    res.json({
      success: true,
      data: files
    });
  } catch (err) {
    console.error('Error fetching folder files:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch files',
      error: err.message
    });
  }
};

/**
 * Delete a file
 */
exports.deleteFile = async (req, res) => {
  const { fileId } = req.params;
  
  try {
    // Get file info with folder slug
    const [files] = await connection.query(
      `SELECT sf.*, fo.slug 
       FROM storage_files sf 
       JOIN storage_folders fo ON sf.folder_id = fo.id 
       WHERE sf.id = ?`,
      [fileId]
    );
    
    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    const file = files[0];
    
    // Delete physical file using slug
    const filePath = path.join(STORAGE_BASE, file.slug, file.stored_name);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete from database
    await connection.query('DELETE FROM storage_files WHERE id = ?', [fileId]);
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting file:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: err.message
    });
  }
};

/**
 * Delete a folder and all its files
 */
exports.deleteFolder = async (req, res) => {
  const { folderId } = req.params;
  
  try {
    // Get folder info
    const [folders] = await connection.query(
      'SELECT slug FROM storage_folders WHERE id = ?',
      [folderId]
    );
    
    if (folders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }
    
    const folder = folders[0];
    
    // Delete physical folder using slug
    const folderPath = path.join(STORAGE_BASE, folder.slug);
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
    }
    
    // Delete files from database
    await connection.query('DELETE FROM storage_files WHERE folder_id = ?', [folderId]);
    
    // Delete folder from database
    await connection.query('DELETE FROM storage_folders WHERE id = ?', [folderId]);
    
    res.json({
      success: true,
      message: 'Folder and all files deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting folder:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete folder',
      error: err.message
    });
  }
};

/**
 * Rename folder
 */
exports.renameFolder = async (req, res) => {
  const { folderId } = req.params;
  const { newName } = req.body;
  
  if (!newName || newName.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'New folder name is required'
    });
  }
  
  try {
    await connection.query(
      'UPDATE storage_folders SET name = ? WHERE id = ?',
      [newName.trim(), folderId]
    );
    
    res.json({
      success: true,
      message: 'Folder renamed successfully'
    });
  } catch (err) {
    console.error('Error renaming folder:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to rename folder',
      error: err.message
    });
  }
};
