const express = require('express');
const router = express.Router();
const studentResultsController = require('../controllers/studentResults');

// Test endpoint
router.get('/test-results', (req, res) => {
  console.log('[DEBUG] Test endpoint hit!');
  res.json({ success: true, message: 'Student results API is working!' });
});

// Submit student test results
router.post('/submit-results', studentResultsController.submitResults);

// Get results by student ID
router.get('/student-results/:student_id', studentResultsController.getStudentResults);

// Get all results for an institute
router.get('/institute-results/:institute_id', studentResultsController.getInstituteResults);

module.exports = router;
