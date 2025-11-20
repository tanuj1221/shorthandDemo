const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folderId = req.body.folderId;
    const uploadPath = path.join(__dirname, '../storage', `folder_${folderId}`);
    
    // Create folder if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Use original filename directly
    // Replace spaces with underscores and remove special characters for URL safety
    const sanitizedName = file.originalname
      .replace(/\s+/g, '_')  // Replace spaces with underscores
      .replace(/[^a-zA-Z0-9._-]/g, ''); // Remove special characters except . _ -
    
    // Check if file already exists
    const folderId = req.body.folderId;
    const uploadPath = path.join(__dirname, '../storage', `folder_${folderId}`);
    const filePath = path.join(uploadPath, sanitizedName);
    
    // If file exists, add a number suffix
    if (fs.existsSync(filePath)) {
      const ext = path.extname(sanitizedName);
      const nameWithoutExt = path.basename(sanitizedName, ext);
      let counter = 1;
      let newName = `${nameWithoutExt}_(${counter})${ext}`;
      
      while (fs.existsSync(path.join(uploadPath, newName))) {
        counter++;
        newName = `${nameWithoutExt}_(${counter})${ext}`;
      }
      
      cb(null, newName);
    } else {
      cb(null, sanitizedName);
    }
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept all file types for now
  // You can add restrictions here if needed
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  }
});

module.exports = upload;
