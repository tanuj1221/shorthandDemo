// backend\utils\multerConfig2.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Define upload directory paths
const UPLOADS_DIR = path.resolve(__dirname, '../uploads');
const AUDIO_UPLOAD_DIR = path.join(UPLOADS_DIR, 'audio');

// 2. Create upload directories with error handling
const createUploadDirs = () => {
  try {
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { 
        recursive: true,
        mode: 0o755 // rwxr-xr-x permissions
      });
      console.log(`✅ Created uploads directory: ${UPLOADS_DIR}`);
    }

    // Create audio subdirectory if it doesn't exist
    if (!fs.existsSync(AUDIO_UPLOAD_DIR)) {
      fs.mkdirSync(AUDIO_UPLOAD_DIR, {
        recursive: true,
        mode: 0o755
      });
      console.log(`🎧 Created audio upload directory: ${AUDIO_UPLOAD_DIR}`);
    }

    // Verify write permissions by creating a test file
    const testFile = path.join(AUDIO_UPLOAD_DIR, `test-${Date.now()}.tmp`);
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);

  } catch (err) {
    console.error('❌ Failed to initialize upload directories:', {
      error: err.message,
      paths: {
        uploadsDir: UPLOADS_DIR,
        audioDir: AUDIO_UPLOAD_DIR
      }
    });
    process.exit(1); // Exit if directories can't be created
  }
};
createUploadDirs(); // Initialize directories immediately

// 3. Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Double-check directory exists for each upload
    if (!fs.existsSync(AUDIO_UPLOAD_DIR)) {
      return cb(new Error('Upload directory is not available'));
    }
    cb(null, AUDIO_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname).toLowerCase();
    const baseName = file.originalname
      .replace(path.extname(file.originalname), '')
      .replace(/[^\w.-]/g, '_') // Replace special characters
      .substring(0, 50); // Limit filename length
    
    cb(null, `audio-${Date.now()}-${baseName}${fileExt}`);
  }
});

// 4. Enhanced file type validation
const fileFilter = (req, file, cb) => {
  const ALLOWED_MIME_TYPES = [
    'audio/mpeg', // MP3
    'audio/wav',  // WAV
    'audio/ogg',  // OGG
    'audio/x-m4a', // M4A
    'audio/aac'   // AAC
  ];

  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(
      `Unsupported file type. Only ${ALLOWED_MIME_TYPES.map(t => t.split('/')[1]).join(', ')} files are allowed`
    ), false);
  }
};

// 5. Configure multer with additional security
module.exports = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
    files: 1, // Allow only 1 file per upload
    parts: 10 // Limit form parts
  },
  fileFilter,
  preservePath: false // Prevent path traversal attacks
});