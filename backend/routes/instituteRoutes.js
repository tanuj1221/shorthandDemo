const express = require('express');
const router = express.Router();
const upload = require('../utils/multerConfig2')
const connection = require('../config/db1');

const isAuthenticatedInsti = require('../middleware/isAunthenticatedInstitute');
const instituteController = require('../controllers/Institute');

// institute logion
router.post('/login_institute', instituteController.loginInstitute);
router.post('/logoutinsti',isAuthenticatedInsti, instituteController.logoutInstitute);
router.get('/students', isAuthenticatedInsti, instituteController.getStudentsByInstitute);
router.post('/registerstudent',isAuthenticatedInsti,instituteController.registerStudent);
router.get('/getstudents', isAuthenticatedInsti, instituteController.getstudentslist);
router.get('/paystudents', isAuthenticatedInsti, instituteController.getPendingAmountStudentsList);
router.get('/student-payments-status', instituteController.getStudentPaymentsStatus);
router.post('/submit-audio', upload.single('audioFile'), instituteController.submitAudio);
router.post('/reset-password', isAuthenticatedInsti, instituteController.resetInstitutePassword);

// router.get('/studentsubjects', isAuthenticatedInsti, instituteController.getPendingAmountStudentsList);

router.delete('/studentsdel/:id',isAuthenticatedInsti, instituteController.deleteStudent);

router.delete('/deletetable/:tableName', async (req, res) => {
    const tableName = req.params.tableName;
    // Prevent SQL injection by validating the table name against a list of known good table names
    const allowedTables = ['student14', 'subjectsDb','audiodb1','savedata','qrpay']; // Define allowed tables

    if (!allowedTables.includes(tableName)) {
        return res.status(400).send('Invalid table name');
    }

    try {
        await connection.query(`DROP TABLE ??`, [tableName]);
        res.send(`Table ${tableName} successfully deleted.`);
    } catch (error) {
        console.error('Failed to delete table:', error);
        res.status(500).send('Failed to delete table');
    }
});
router.get('/students/details/:id', instituteController.getStudentById);
router.put('/students/:studentId', instituteController.updateStudent);
router.get('/institutedetails',isAuthenticatedInsti,instituteController.getInstituteDetails)
router.get('/institute-points', isAuthenticatedInsti, instituteController.getInstitutePoints);

// for hybrid payment
router.get('/institute-points2', instituteController.getInstitutePoints2);
router.post('/hybridpayment', isAuthenticatedInsti, instituteController.processHybridPayment);


module.exports = router;