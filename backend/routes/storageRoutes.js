const express = require('express');
const router = express.Router();
const storageController = require('../controllers/storageController');
const upload = require('../middleware/storageMulter');
const isAuthenticatedAdmin = require('../middleware/isAuthenticatedAdmin');

// Get storage structure
router.get('/structure', isAuthenticatedAdmin, storageController.getStorageStructure);

// Create folder
router.post('/folder', isAuthenticatedAdmin, storageController.createFolder);

// Upload files to folder (accepts any field names for folder uploads)
router.post('/upload', isAuthenticatedAdmin, upload.any(), storageController.uploadFiles);

// Get files in folder
router.get('/folder/:folderId/files', isAuthenticatedAdmin, storageController.getFolderFiles);

// Delete file
router.delete('/file/:fileId', isAuthenticatedAdmin, storageController.deleteFile);

// Delete folder
router.delete('/folder/:folderId', isAuthenticatedAdmin, storageController.deleteFolder);

// Rename folder
router.put('/folder/:folderId/rename', isAuthenticatedAdmin, storageController.renameFolder);

module.exports = router;
