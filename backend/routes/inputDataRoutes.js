const express = require('express');
const multer = require('multer');
const router = express.Router();
const dataInputController = require('../controllers/dataInput');

// Initialize multer with a destination directory for your files
const upload = multer({ dest: 'uploads/' });

router.post('/api/import-excel/:tableName', upload.single('excelFile'), dataInputController.importExcel);

module.exports = router;


