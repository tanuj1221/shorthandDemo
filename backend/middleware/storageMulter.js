const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Simple storage - just use a temp folder, we'll move files in the controller
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempPath = path.join(__dirname, '../storage/temp');
    
    // Create temp folder if it doesn't exist
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
    }
    
    cb(null, tempPath);
  },
  filename: function (req, file, cb) {
    // Use original filename, spaces will be URL encoded as %20
    const uniqueName = file.originalname
      .replace(/[^a-zA-Z0-9._\s-]/g, '');
    
    cb(null, uniqueName);
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
