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
    // Create folder in database
    const [result] = await connection.query(
      'INSERT INTO storage_folders (name, description, created_at) VALUES (?, ?, NOW())',
      [folderName.trim(), description || '']
    );
    
    // Create physical folder
    const folderPath = path.join(STORAGE_BASE, `folder_${result.insertId}`);
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
 * Upload files to a folder
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
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }
    
    const uploadedFiles = [];
    
    for (const file of files) {
      // Generate file URL
      const fileUrl = `${req.protocol}://${req.get('host')}/storage/folder_${folderId}/${file.filename}`;
      
      // Save file info to database
      const [result] = await connection.query(
        `INSERT INTO storage_files 
        (folder_id, original_name, stored_name, file_size, mime_type, file_url, uploaded_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [folderId, file.originalname, file.filename, file.size, file.mimetype, fileUrl]
      );
      
      uploadedFiles.push({
        id: result.insertId,
        originalName: file.originalname,
        url: fileUrl,
        size: file.size
      });
    }
    
    res.json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      files: uploadedFiles
    });
  } catch (err) {
    console.error('Error uploading files:', err);
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
    // Get file info
    const [files] = await connection.query(
      'SELECT * FROM storage_files WHERE id = ?',
      [fileId]
    );
    
    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    const file = files[0];
    
    // Delete physical file
    const filePath = path.join(STORAGE_BASE, `folder_${file.folder_id}`, file.stored_name);
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
    // Get all files in folder
    const [files] = await connection.query(
      'SELECT * FROM storage_files WHERE folder_id = ?',
      [folderId]
    );
    
    // Delete physical files
    const folderPath = path.join(STORAGE_BASE, `folder_${folderId}`);
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
