// student Authentication 
// BACKEND/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/student_data');

router.post('/login', authController.loginStudent);
router.get('/logout', authController.logoutStudent);
router.get('/check-session', authController.checkSession);

module.exports = router;