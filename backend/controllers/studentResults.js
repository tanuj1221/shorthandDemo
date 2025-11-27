const connection = require('../config/db1');

/**
 * Submit student test results
 * POST /api/submit-results
 */
exports.submitResults = async (req, res) => {
  console.log('='.repeat(50));
  console.log('[DEBUG] Submitting student results');
  console.log('[DEBUG] Request body:', JSON.stringify(req.body, null, 2));
  console.log('='.repeat(50));
  
  const {
    student_id,
    passage_name,
    marks,
    total_mistakes,
    grammar_mistakes,
    spelling_mistakes,
    added_words,
    missed_words
  } = req.body;

  // Validate required fields
  if (!student_id || !passage_name || marks === undefined) {
    return res.status(400).json({
      success: false,
      message: 'student_id, passage_name, and marks are required'
    });
  }

  try {
    // Get institute_id from student_id
    const [studentData] = await connection.query(
      'SELECT instituteId FROM student14 WHERE student_id = ? LIMIT 1',
      [student_id]
    );

    if (studentData.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${student_id} not found`
      });
    }

    const institute_id = studentData[0].instituteId;

    // Get current date and time in Asia/Kolkata timezone
    const now = new Date();
    const kolkataTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    
    // Format date as DD/MM/YYYY for display, but store as YYYY-MM-DD for MySQL
    const day = String(kolkataTime.getDate()).padStart(2, '0');
    const month = String(kolkataTime.getMonth() + 1).padStart(2, '0');
    const year = kolkataTime.getFullYear();
    const mysqlDate = `${year}-${month}-${day}`;
    
    // Format time as HH:MM:SS
    const hours = String(kolkataTime.getHours()).padStart(2, '0');
    const minutes = String(kolkataTime.getMinutes()).padStart(2, '0');
    const seconds = String(kolkataTime.getSeconds()).padStart(2, '0');
    const mysqlTime = `${hours}:${minutes}:${seconds}`;

    console.log('[DEBUG] Student ID:', student_id);
    console.log('[DEBUG] Institute ID:', institute_id);
    console.log('[DEBUG] Date (Kolkata):', `${day}/${month}/${year}`);
    console.log('[DEBUG] Time (Kolkata):', mysqlTime);

    // Insert result into database
    const insertQuery = `
      INSERT INTO student_results 
      (student_id, institute_id, passage_name, marks, total_mistakes, grammar_mistakes, 
       spelling_mistakes, added_words, missed_words, test_date, test_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.query(insertQuery, [
      student_id,
      institute_id,
      passage_name,
      marks,
      total_mistakes || 0,
      grammar_mistakes || 0,
      spelling_mistakes || 0,
      added_words || 0,
      missed_words || 0,
      mysqlDate,
      mysqlTime
    ]);

    console.log('[DEBUG] Result inserted with ID:', result.insertId);

    res.status(201).json({
      success: true,
      message: 'Results submitted successfully',
      data: {
        result_id: result.insertId,
        student_id,
        institute_id,
        passage_name,
        marks,
        date: `${day}/${month}/${year}`,
        time: mysqlTime
      }
    });

  } catch (error) {
    console.error('[ERROR] Failed to submit results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit results',
      error: error.message
    });
  }
};

/**
 * Get student results by student_id
 * GET /api/student-results/:student_id
 */
exports.getStudentResults = async (req, res) => {
  const { student_id } = req.params;

  try {
    const [results] = await connection.query(
      `SELECT 
        id,
        student_id,
        institute_id,
        passage_name,
        marks,
        total_mistakes,
        grammar_mistakes,
        spelling_mistakes,
        added_words,
        missed_words,
        DATE_FORMAT(test_date, '%d/%m/%Y') as test_date,
        TIME_FORMAT(test_time, '%H:%i:%s') as test_time,
        created_at
      FROM student_results 
      WHERE student_id = ?
      ORDER BY created_at DESC`,
      [student_id]
    );

    res.json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (error) {
    console.error('[ERROR] Failed to fetch results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch results',
      error: error.message
    });
  }
};

/**
 * Get all results for an institute
 * GET /api/institute-results/:institute_id
 */
exports.getInstituteResults = async (req, res) => {
  const { institute_id } = req.params;

  try {
    const [results] = await connection.query(
      `SELECT 
        sr.id,
        sr.student_id,
        sr.institute_id,
        CONCAT(s.firstName, ' ', s.lastName) as student_name,
        sr.passage_name,
        sr.marks,
        sr.total_mistakes,
        sr.grammar_mistakes,
        sr.spelling_mistakes,
        sr.added_words,
        sr.missed_words,
        DATE_FORMAT(sr.test_date, '%d/%m/%Y') as test_date,
        TIME_FORMAT(sr.test_time, '%H:%i:%s') as test_time,
        sr.created_at
      FROM student_results sr
      LEFT JOIN student14 s ON sr.student_id = s.student_id
      WHERE sr.institute_id = ?
      ORDER BY sr.created_at DESC`,
      [institute_id]
    );

    res.json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (error) {
    console.error('[ERROR] Failed to fetch institute results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch institute results',
      error: error.message
    });
  }
};

module.exports = exports;
