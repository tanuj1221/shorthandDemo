// controllers/authController.js
const connection = require('../config/db1');

const xl = require('excel4node');
const fs = require('fs');
const path = require('path');


exports.loginStudent = async (req, res) => {
  console.log("Trying student login");
  const { userId, password } = req.body;

  const query1 = 'SELECT * FROM student14 WHERE student_id = ?';

  try {
    const [results] = await connection.query(query1, [userId]);
    if (results.length > 0) {
      const student = results[0];

      if (student.password === password) {
        // Set student session
        req.session.studentId = student.student_id;
        res.send('Logged in successfully as a student!');
      } else {
        res.status(401).send('Invalid credentials for student');
      }
    } else {
      res.status(404).send('Student not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.logoutStudent = async (req, res) => {
  // Checking if the student session exists
  console.log('logged out')
  if (req.session.studentId) {
    const studentId = req.session.studentId;

    // Mark student as logged out in database
    try {
      const updateQuery = 'UPDATE student14 SET is_logged_in = 0 WHERE student_id = ?';
      await connection.query(updateQuery, [studentId]);
    } catch (err) {
      console.error('Error updating logout status:', err);
    }

    // Destroy the session
    req.session.destroy(err => {
      if (err) {
        // Error occurred during session destroy
        res.status(500).send("Failed to log out, please try again.");
      } else {
        // Optionally clear the client-side cookie if it's not set to auto-clear
        res.clearCookie('connect.sid');  // Adjust the cookie name according to your settings

        // Send a successful logout message
        res.send("Logged out successfully.");
      }
    });
  } else {
    // If there is no session, indicating the user was not logged in
    res.status(400).send("No active session to log out from.");
  }
};


exports.changePassword = async (req, res) => {
  const { newPassword } = req.body;
  const userId = req.session.studentId; // Assuming userId is stored in the session

  // Update password in the database
  const updateQuery = 'UPDATE student14 SET password = ? WHERE student_id = ?';

  await connection.query(updateQuery, [newPassword, userId], (err, result) => {
    if (err) {
      console.error('Error updating password:', err);
      res.status(500).send('Error updating password');
    } else {
      console.log('Password updated successfully');
      res.send('Password updated successfully');
    }
  });
};







// getting the student data 
exports.getstudentData = async (req, res) => {
  try {
    const userId = req.session.studentId;
    const selectQuery = 'SELECT * FROM student14 WHERE student_id = ?';
    // Use promise-based query execution
    const [rows, fields] = await connection.query(selectQuery, [userId]);
    console.log([rows, fields])
    if (rows.length > 0) {
      const studentData = rows[0];
      res.json(studentData);
    } else {
      res.status(404).send('Student not found');
    }
  } catch (err) {
    console.log('Error fetching user data:', err);
    res.status(500).send(err);
  }
};


exports.getStudentSubjects = async (req, res) => {
  try {
    const userId = req.session.studentId;
    const subjectQuery = "SELECT subjectsId FROM student14 WHERE student_id = ?";

    const subjects = await connection.query(subjectQuery, [userId]);
    console.log(subjects);

    // Check if the query returned any results
    if (subjects.length > 0 && subjects[0].length > 0) {
      // Parse the subjectsId assuming it is stored as a JSON string (e.g., "[101]")
      const rawSubjectsId = subjects[0][0].subjectsId;
      const parsedSubjectsId = JSON.parse(rawSubjectsId);  // Now should be an array, e.g., [101]

      // Fetch details from subjectsDb table
      const subjectsDetailsQuery = 'SELECT * FROM subjectsDb WHERE subjectId IN (?)';
      const subjectDetails = await connection.query(subjectsDetailsQuery, [parsedSubjectsId]);

      if (subjectDetails.length > 0) {
        res.json(subjectDetails[0]);
      } else {
        res.status(404).send('Subjects not found');
      }
    } else {
      res.status(404).send('Student not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
}

exports.getStudentSubjects12 = async (req, res) => {
  try {
    const userId = req.session.studentId;
    const subjectQuery = "SELECT subjectsId FROM student14 WHERE student_id = ?";

    const subjects = await connection.query(subjectQuery, [userId]);

    // Check if the query returned any results
    if (subjects.length > 0 && subjects[0].length > 0) {
      // Parse the subjectsId assuming it is stored as a JSON string (e.g., "[101]")
      const rawSubjectsId = subjects[0][0].subjectsId;
      const parsedSubjectsId = JSON.parse(rawSubjectsId);  // Now should be an array, e.g., [101]

      // Fetch details from subjectsDb table for the specific subject IDs
      const subjectsDetailsQuery = 'SELECT * FROM subjectsDb WHERE subjectId IN (?)';
      const subjectDetails = await connection.query(subjectsDetailsQuery, [parsedSubjectsId]);

      if (subjectDetails.length > 0) {
        res.json(subjectDetails[0]);
      } else {
        res.status(404).send('Subjects not found');
      }
    } else {
      res.status(404).send('Student not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
}

exports.updateRemTime = async (req, res) => {
  try {
    // Update the rem_time column of all rows in student14 table to '300'
    const updateRemTimeQuery = "UPDATE student14 SET rem_time = '300'";
    await connection.query(updateRemTimeQuery);

    res.send('rem_time updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
}

exports.updateTimer = async (req, res) => {
  try {
    const { timerValue } = req.body; // Directly using timerValue from the request body
    const studentId = req.session.studentId; // Assuming studentId is stored in session
    console.log(req.body); // Logging the body to see what's received

    // Ensure timerValue is a string representing a non-negative integer
    if (!/^\d+$/.test(timerValue)) {
      return res.status(400).send('Invalid timer value');
    }

    const updateQuery = 'UPDATE student14 SET rem_time = ? WHERE student_id = ?';
    const [result] = await connection.query(updateQuery, [timerValue, studentId]);

    if (result.affectedRows > 0) {
      res.send('Timer updated successfully');
    } else {
      res.status(404).send('Student not found');
    }
  } catch (err) {
    console.error('Error updating timer:', err);
    res.status(500).send(err.message);
  }
};

exports.getStudentSubjectInfo = async (req, res) => {
  try {
    const userId = req.session.studentId;  // Get student ID from the session, assumed to be stored as a string
    console.log('this fetched')

    const studentSubjectsQuery = `
      SELECT s.student_id, s.image,s.instituteId, CONCAT(s.firstName, ' ', s.lastName) AS studename, sub.subject_name, sub.subjectId
      FROM student14 AS s
      JOIN JSON_TABLE(
        s.subjectsId,
        '$[*]' COLUMNS(subjectId CHAR(50) COLLATE utf8mb4_unicode_ci PATH '$')  -- Specifying collation here
      ) AS subjects ON s.student_id = ?
      JOIN subjectsDb AS sub ON subjects.subjectId COLLATE utf8mb4_unicode_ci = sub.subjectId COLLATE utf8mb4_unicode_ci  -- Matching collations for safe comparison
    `;

    const studentSubjects = await connection.query(studentSubjectsQuery, [userId]);

    if (studentSubjects.length > 0) {
      res.json(studentSubjects[0]);
    } else {
      res.status(404).send('No subjects found for this student');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error: ' + err.message);
  }
};

exports.getStudentSubjectInfo12 = async (req, res) => {
  try {
    const userId = req.session.studentId;  // Get student ID from the session, assumed to be stored as a string
    console.log('this fetched123')

    const studentSubjectsQuery = `
  SELECT
    s.student_id,
    s.image,
    s.instituteId,
    CONCAT(s.firstName, ' ', s.lastName) AS studename,
    s.rem_time,
    sub.subject_name,
    sub.subjectId,
    sub.* -- Include all columns from subjectsDb table
  FROM
    student14 AS s
    JOIN JSON_TABLE(
      s.subjectsId,
      '$[*]' COLUMNS(subjectId CHAR(50) COLLATE utf8mb4_unicode_ci PATH '$')
    ) AS subjects ON s.student_id = ?
    JOIN subjectsDb AS sub ON subjects.subjectId COLLATE utf8mb4_unicode_ci = sub.subjectId COLLATE utf8mb4_unicode_ci
`;
    const studentSubjects = await connection.query(studentSubjectsQuery, [userId]);

    if (studentSubjects.length > 0) {
      res.json(studentSubjects[0]);
    } else {
      res.status(404).send('No subjects found for this student');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error: ' + err.message);
  }
};

process.env.TZ = 'Asia/Kolkata';

const moment = require('moment-timezone');


exports.saveData = async (req, res) => {
  try {
    const { answer, original, list, student_id, instituteId, subjectId } = req.body;
    console.log(req.body); // Logging the body to see what's received

    // Basic validation (you might want to add more complex checks here)
    if (!answer || !original || !list || !student_id || !instituteId || !subjectId) {
      return res.status(400).send('Missing required fields');
    }

    const indianTime = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');

    const insertQuery = `INSERT INTO savedata (answer, original, list, student_id, instituteId, subjectId, created_at)
                         VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await connection.query(insertQuery, [answer.trim(), original, list, student_id, instituteId, subjectId, indianTime]);

    if (result.affectedRows > 0) {
      res.send('Data saved successfully');
    } else {
      res.status(400).send('Failed to save data');
    }
  } catch (err) {
    console.error('Error saving data:', err);
    res.status(500).send(err.message);
  } finally {
    console.log('completed')
  }
};
exports.downloadExcel = async (req, res) => {
  try {
    const [rows] = await connection.query('SELECT * FROM savedata');

    // Define the CSV headers
    const headers = [
      'ID',
      'Answer',
      'Original',
      'List',
      'Student ID',
      'Institute ID',
      'Subject ID',
      'Created At'
    ];

    // Initialize the CSV data with headers
    let csvData = headers.join(',') + '\n';

    // Iterate over the rows and append data to the CSV
    rows.forEach((row) => {
      const data = [
        row.id,
        row.answer,
        row.original,
        row.list,
        row.student_id,
        row.instituteId,
        row.subjectId,
        row.created_at
      ];
      csvData += data.map(field => `"${field}"`).join(',') + '\n';
    });

    // Set the response headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=saved_data.csv');

    // Send the CSV file as the response
    res.send(csvData);
  } catch (err) {
    console.error('Error downloading CSV:', err);
    res.status(500).send(err.message);
  }
};

exports.getDemoExamData = async (req, res) => {
  try {
    const { subjectId } = req.body;
    console.log('=== FETCHING DEMO EXAM DATA ===');
    console.log('SubjectId:', subjectId);

    if (!subjectId) {
      console.log('ERROR: Subject ID is required');
      return res.status(400).send('Subject ID is required');
    }

    // First, get the Passage_Timer from subjectsDb
    const timerQuery = 'SELECT Passage_Timer FROM subjectsDb WHERE subjectId = ?';
    console.log('Fetching timer from subjectsDb for subjectId:', subjectId);
    const [timerResult] = await connection.query(timerQuery, [subjectId]);
    
    let passageTimer = 300; // Default 5 minutes in seconds
    if (timerResult.length > 0 && timerResult[0].Passage_Timer) {
      passageTimer = timerResult[0].Passage_Timer * 60; // Convert minutes to seconds
      console.log(`Passage_Timer found: ${timerResult[0].Passage_Timer} minutes = ${passageTimer} seconds`);
    } else {
      console.log('No timer found in subjectsDb, using default:', passageTimer, 'seconds');
    }

    const query = 'SELECT * FROM audiodb1 WHERE subjectId = ?';
    console.log('Executing query:', query, 'with subjectId:', subjectId);
    const [rows] = await connection.query(query, [subjectId]);
    console.log('Total audio passages found:', rows.length);

    if (rows.length === 0) {
      console.log('No audio passages found for subject:', subjectId);
      return res.status(404).send('No audio passages found for this subject');
    }

    // Filter for 'A' passages (case-insensitive check)
    const passagesA = rows.filter(row =>
      row.passageCode &&
      row.passageCode.trim().toUpperCase().endsWith('A')
    );
    console.log('Passages with "A" suffix found:', passagesA.length);

    if (passagesA.length === 0) {
      console.log('No "A" series passages found');
      return res.status(404).send('No "A" series audio passages found');
    }

    // Pick a random 'A' passage
    const randomA = passagesA[Math.floor(Math.random() * passagesA.length)];
    console.log('Selected random A passage:', randomA.passageCode);

    // Determine corresponding 'B' passage code
    // Assuming code is something like "501A", we want "501B"
    const baseCode = randomA.passageCode.trim().slice(0, -1);
    const targetCodeB = baseCode + 'B';
    console.log('Looking for corresponding B passage:', targetCodeB);

    // Find the 'B' passage in the fetched rows
    const passageB = rows.find(row =>
      row.passageCode &&
      row.passageCode.trim().toUpperCase() === targetCodeB.toUpperCase()
    );

    if (!passageB) {
      console.log('ERROR: B passage not found for:', targetCodeB);
      return res.status(404).send(`Corresponding 'B' passage (${targetCodeB}) not found for ${randomA.passageCode}`);
    }
    console.log('Found B passage:', passageB.passageCode);

    // Construct the response
    const responseData = {
      examId: `DEMO_${baseCode}`,
      passage1: {
        code: randomA.passageCode,
        audioUrl: randomA.links,
        text: randomA.answer,
        length: passageTimer.toString() // Timer from subjectsDb in seconds
      },
      passage2: {
        code: passageB.passageCode,
        audioUrl: passageB.links,
        text: passageB.answer,
        length: passageTimer.toString() // Timer from subjectsDb in seconds
      }
    };

    console.log('=== RESPONSE DATA ===');
    console.log('Exam ID:', responseData.examId);
    console.log('Passage Timer:', passageTimer, 'seconds');
    console.log('Passage 1:', responseData.passage1.code, '| URL:', responseData.passage1.audioUrl);
    console.log('Passage 2:', responseData.passage2.code, '| URL:', responseData.passage2.audioUrl);
    console.log('=====================');

    res.json(responseData);

  } catch (err) {
    console.error('Error in getDemoExamData:', err);
    res.status(500).send('Internal Server Error: ' + err.message);
  }
};