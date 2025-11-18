const express = require('express');
const router = express.Router();
const adminView = require('../controllers/adminView');
const isAuthenticatedAdmin = require('../middleware/isAuthenticatedAdmin');
const adminViewController = require('../controllers/adminView');

const upload  = require("../middleware/multerConfig.js");


// Route to handle password change
router.get('/district', adminView.getDistricts);
router.get('/batch', adminView.getBatchData);
router.get('/tables', adminView.getAllTables);   //isAuthenticatedAdmin, add this middleware if you want to restrict access to authenticated admins
router.get('/table/:tableName', adminView.getTheTable);


router.put('/table/:tableName', adminView.updateTableData);


// Add this to your routes file (after the existing table routes)
router.post('/table/:tableName/add', adminView.addTableRecord);
router.delete('/table/:tableName/delete', adminView.deleteTableRecord);


router.post('/save-table/:tableName', adminView.saveTheTable);
router.get('/paid-students', adminView.getPaidStudents);


router.post('/admin_login', adminView.loginadmin);
router.get('/approve', adminView.getAllWaitingStudents);
router.post('/approved_student', adminView.approveStudent);
router.post('/rejected_student', adminView.rejectStudent);
router.get('/student/status-counts', adminView.getStudentStatusCounts);

// router.put('/update', adminView.handleStudentUpdate);

router.get('/update', adminView.handleStudentUpdate);
router.put('/update', adminView.handleStudentUpdate);

// Audio routes
router.get('/audio', adminView.getAudioSubmissions);
router.post('/audio/approve', adminView.approveAudioSubmission);
router.post('/audio/reject', adminView.rejectAudioSubmission);
router.post('/audio/delete', adminView.deleteAudioSubmission);


// Excel upload route
router.post('/upload/excel', upload.single('excelFile'), adminViewController.uploadExcelFile);

// Timer reset route
router.post('/reset-timers', adminView.resetAllStudentTimers);

module.exports = router;
