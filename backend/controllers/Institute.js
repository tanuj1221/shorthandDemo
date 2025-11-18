const connection = require("../config/db1");
const fs = require('fs');
const xlsx = require('xlsx');


exports.loginInstitute = async (req, res) => {
  console.log("[DEBUG] Attempting institute login");
  const { userId, password } = req.body;

  // Input validation
  if (!userId || !password) {
    return res.status(400).json({
      success: false,
      message: "Institute ID and password are required",
    });
  }

  // Check if session already exists
  if (req.session.instituteId) {
    console.log(
      `[DEBUG] Existing session found for instituteId: ${req.session.instituteId}`
    );
    return res.status(200).json({
      success: true,
      message: `Already logged in as institute with ID: ${req.session.instituteId}`,
      sessionId: req.sessionID,
    });
  }

  const query = "SELECT * FROM institutedb WHERE instituteId = ?";

  try {
    const [results] = await connection.query(query, [userId]);

    // 1. Check if institute exists
    if (results.length === 0) {
      console.log(`[ERROR] No institute found with instituteId: ${userId}`);
      return res.status(404).json({
        success: false,
        message: "Institute not found",
      });
    }

    const institute = results[0];
    console.log(`[DEBUG] Institute found: ${JSON.stringify(institute)}`);

    // 2. STRICT PASSWORD COMPARISON (added type conversion)
    if (String(institute.password) !== String(password)) {
      console.log("[ERROR] Invalid password provided");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials for institute",
      });
    }

    // 3. Create session
    req.session.instituteId = institute.instituteId;
    console.log(`[DEBUG] New session created with sessionId: ${req.sessionID}`);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully as an institute!",
      sessionId: req.sessionID,
      instituteId: institute.instituteId,
      instituteName: institute.name, // Make sure this field exists in your DB
    });
  } catch (err) {
    console.error(`[ERROR] Database error during login: ${err.message}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


exports.logoutInstitute = (req, res) => {
  console.log("Session ID before logout: ", req.session.instituteId); // Log session ID
  if (req.session) {
    console.log("Session exists, proceeding with destruction.");
    req.session.destroy((err) => {
      if (err) {
        console.error("Failed to destroy the session during logout", err);
        return res.status(500).send("Could not log out, please try again.");
      }
      res.clearCookie("connect.sid");
      res.send("Logged out successfully");
    });
  } else {
    console.log("No active session found during logout attempt.");
    res.status(400).send("No active session found");
  }
};



exports.getInstituteDetails = async (req, res) => {
  console.log("\n\nFetching institute details");
  // Assuming the instituteId is stored in the session when the institute logs in
  const instituteId = req.session.instituteId;

  if (!instituteId) {
    return res.status(403).send("No institute session found");
  }

  const query =
    "SELECT instituteId, InstituteName FROM institutedb WHERE instituteId = ?";

  try {
    const [results] = await connection.query(query, [instituteId]);
    console.log("Query results:", results);
    if (results.length > 0) {
      const instituteDetails = results[0];
      // console.log(instituteDetails);
      res.send(instituteDetails);
    } else {
      res.status(404).send("Institute not found");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};


exports.getStudentsByInstitute = async (req, res) => {
  if (!req.session || !req.session.instituteId) {
    return res.status(403).send("Not authenticated as an institute");
  }
  const instituteId = req.session.instituteId;
  const studentQuery = "SELECT * FROM student14 WHERE instituteId = ?";

  try {
    const [students] = await connection.query(studentQuery, [instituteId]);
    if (students.length > 0) {
      res.json(students);
    } else {
      res.status(404).send("No students found for this institute");
    }
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Failed to retrieve data");
  }
};

exports.registerStudent = async (req, res) => {
  console.log("Registering student...");
  // Log the full request body
  console.log("Received request body:", req.body);

  // Log the session data
  const instituteId = req.session.instituteId;
  console.log("Session instituteId:", instituteId);

  const {
    firstName,
    lastName,
    motherName,
    middleName,
    subjectsId,
    password,
    courseId,
    batch_year,
    sem,
    batchStartDate,
    batchEndDate,
    amount,
    loggedIn,
    remTime,
    done,
    image,
    mobile_no,
    email,
  } = req.body;

  // Debug: Log image format received
  if (image) {
    console.log("Image received:");
    console.log("- Type:", typeof image);
    console.log("- Starts with data:image?", image.startsWith('data:image'));
    console.log("- Length:", image.length);
    console.log("- First 50 chars:", image.substring(0, 50));
  } else {
    console.log("No image received");
  }

  try {
    // Get the next student_id by finding the maximum existing student_id
    const [maxIdResult] = await connection.query(
      "SELECT MAX(student_id) as maxId FROM student14 WHERE instituteId = ?",
      [instituteId]
    );

    let nextStudentId;
    if (maxIdResult[0].maxId) {
      nextStudentId = parseInt(maxIdResult[0].maxId) + 1;
    } else {
      // First student for this institute, start from a base number
      nextStudentId = parseInt(instituteId + "001"); // e.g., 11100001
    }

    console.log("Generated student_id:", nextStudentId);



    // Map subject names to IDs
    let courseIds = [];
    if (subjectsId && Array.isArray(subjectsId)) {
      courseIds = subjectsId.map(subjectName => SUBJECT_MAP[subjectName]).filter(id => id !== undefined);
      console.log("Original subjects:", subjectsId);
      console.log("Mapped course IDs:", courseIds);
    }

    // Generate 4-digit numeric password (same for all subject entries)
    const generatedPassword = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("Generated password:", generatedPassword);

    const insertQuery =
      "INSERT INTO student14 (student_id, password, instituteId, firstName, lastName, motherName, middleName, subjectsId, batchNo, courseId, batch_year, sem, batchStartDate, batchEndDate, amount, loggedIn, rem_time, done, image, mobile_no, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    // Create one entry per subject
    const insertedStudentIds = [];
    
    for (let i = 0; i < courseIds.length; i++) {
      const currentStudentId = nextStudentId + i;
      const courseId = courseIds[i];
      
      const values = [
        currentStudentId,
        generatedPassword, // Same password for all entries of this student
        instituteId,
        firstName,
        lastName,
        motherName,
        middleName,
        JSON.stringify([courseId]), // Store single course ID as array
        sem || null,
        JSON.stringify([courseId]), // courseId field
        batch_year || null,
        sem || null,
        batchStartDate || null,
        batchEndDate || null,
        "pending",
        loggedIn || "no",
        remTime || "300",
        done || "no",
        image || null,
        mobile_no || null,
        email,
      ];

      console.log(`Inserting student entry ${i + 1}/${courseIds.length} with ID:`, currentStudentId);
      await connection.query(insertQuery, values);
      insertedStudentIds.push(currentStudentId);
    }

    console.log("Student registered successfully with IDs:", insertedStudentIds);

    res.json({
      message: "Student registered successfully",
      studentIds: insertedStudentIds,
      temporaryPassword: generatedPassword,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      // Handle duplicate student_id - retry with next number
      console.log("Duplicate student_id, retrying...");
      return exports.registerStudent(req, res); // Recursive retry
    }

    console.error("Error inserting student:", err);
    res.status(500).send("Error registering student");
  }
};

exports.updateStudent = async (req, res) => {
  const studentId = req.params.studentId;
  console.log("=== UPDATE STUDENT STARTED ===");
  console.log("Updating student with ID:", studentId);
  console.log("Request body:", req.body);

  const {
    firstName,
    lastName,
    motherName,
    middleName,
    batch_year,
    sem,
    image,
    mobile_no,
    email,
  } = req.body;

  if (!studentId) {
    console.error("ERROR: No studentId provided in the request");
    return res.status(400).send("Student ID is required for update");
  }

  // Log all received fields
  console.log("Received fields:", {
    firstName,
    lastName,
    motherName,
    middleName,
    batch_year,
    sem,
    image,
    mobile_no,
    email,
  });

  const selectQuery = "SELECT * FROM student14 WHERE student_id = ?";
  try {
    console.log("Executing SELECT query:", selectQuery, "with ID:", studentId);
    const [student] = await connection.query(selectQuery, [studentId]);
    if (student.length === 0) {
      console.error(`ERROR: No student found with ID: ${studentId}`);
      return res.status(404).send("Student not found");
    }
    console.log("Current student data:", student[0]);
  } catch (err) {
    console.error("ERROR in SELECT query:", err);
    return res.status(500).send("Error fetching student for update");
  }

  const updateQuery = `
    UPDATE student14 
    SET 
      firstName = ?,
      lastName = ?,
      motherName = ?,
      middleName = ?,
      batch_year = ?,
      sem = ?,
      image = ?,
      mobile_no = ?,
      email = ?
    WHERE student_id = ?;
  `;

  console.log("Preparing UPDATE query:", updateQuery);
  console.log("Parameters order should be:", [
    "firstName",
    "lastName",
    "motherName",
    "middleName",
    "batch_year",
    "sem",
    "image",
    "mobile_no",
    "email",
    "studentId",
  ]);

  console.log("Actual parameters being sent:", [
    firstName,
    lastName,
    motherName,
    middleName,
    batch_year,
    sem,
    image,
    mobile_no,
    email,
    studentId,
  ]);

  try {
    console.log("Executing UPDATE query...");
    const result = await connection.query(updateQuery, [
      firstName,
      lastName,
      motherName,
      middleName,
      batch_year,
      sem,
      image,
      mobile_no,
      email,
      studentId,
    ]);

    console.log("UPDATE result:", result);
    console.log("Affected rows:", result[0].affectedRows);

    if (result[0].affectedRows === 0) {
      console.error("WARNING: No rows affected by the update");
      return res.status(200).send("No changes made to student data");
    }

    console.log("Student updated successfully in database");
    res.send("Student updated successfully");
  } catch (err) {
    console.error("ERROR in UPDATE query:", err);
    console.error("Error details:", {
      code: err.code,
      errno: err.errno,
      sqlMessage: err.sqlMessage,
      sqlState: err.sqlState,
      sql: err.sql,
    });
    res.status(500).send("Error updating student");
  } finally {
    console.log("=== UPDATE STUDENT COMPLETED ===");
  }
};


exports.getstudentslist = async (req, res) => {
  try {
    const instituteId = req.session.instituteId;
    
    // Enhanced query to properly handle payment status
    const studentQuery = `
      SELECT 
        student_id, firstName, lastName, motherName, middleName, 
        amount, batch_year, subjectsId, image,
        CASE 
          WHEN amount = 'paid' THEN 'paid'
          WHEN amount = 'pending' THEN 'unpaid'
          WHEN amount = 'waiting' THEN 'unpaid'
          ELSE 'unpaid' 
        END as payment_status
      FROM student14 
      WHERE instituteId = ?
    `;
    
    const [students] = await connection.query(studentQuery, [instituteId]);
    
    // Fetch subjects
    const [subjects] = await connection.query("SELECT subjectId, subject_name FROM subjectsDb");
    const subjectMap = subjects.reduce((map, subject) => {
      map[subject.subjectId] = subject.subject_name;
      return map;
    }, {});
    
    // Transform student data
    const enrichedStudents = students.map(student => {
      // Handle subjects - better parsing
      let subjectNames = "No Subjects";
      if (student.subjectsId) {
        try {
          // Handle both array format and string format
          let subjectIds = [];
          
          if (typeof student.subjectsId === 'string') {
            // Remove brackets and quotes, then split
            const cleanedIds = student.subjectsId
              .replace(/[\[\]'"]/g, "")
              .split(",")
              .map(id => id.trim())
              .filter(id => id !== "");
            subjectIds = cleanedIds;
          } else if (Array.isArray(student.subjectsId)) {
            subjectIds = student.subjectsId;
          }
          
          // Map IDs to names
          const mappedSubjects = subjectIds
            .map(id => subjectMap[id] || `Unknown Subject (${id})`)
            .filter(name => name !== "Unknown Subject ()");
          
          if (mappedSubjects.length > 0) {
            subjectNames = mappedSubjects.join(", ");
          }
        } catch (error) {
          console.error("Error parsing subjects for student:", student.student_id, error);
          subjectNames = "Error parsing subjects";
        }
      }
      
      return {
        ...student,
        subject_name: subjectNames,
        subjects: subjectNames,
        payment_status: student.payment_status
      };
    });
    
    console.log("Enriched students sample:", enrichedStudents.slice(0, 2)); // Debug log
    res.json(enrichedStudents);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Failed to retrieve student data");
  }
};


exports.getPendingAmountStudentsList = async (req, res) => {
  try {
    const instituteId = req.session.instituteId;
    
    // Updated query to get ALL students with proper payment status
    const studentQuery = `
      SELECT 
        student_id, firstName, lastName, motherName, middleName, 
        password, amount, batch_year, subjectsId, image,
        CASE 
          WHEN amount = 'paid' THEN 'paid'
          WHEN amount = 'pending' THEN 'unpaid'
          WHEN amount = 'waiting' THEN 'unpaid'
          ELSE 'unpaid' 
        END as payment_status
      FROM student14 
      WHERE instituteId = ?
    `;
    
    const [students] = await connection.query(studentQuery, [instituteId]);
    
    // Fetch subjects
    const [subjects] = await connection.query("SELECT subjectId, subject_name FROM subjectsDb");
    const subjectMap = subjects.reduce((map, subject) => {
      map[subject.subjectId] = subject.subject_name;
      return map;
    }, {});
    
    // Transform student data (same logic as getstudentslist)
    const enrichedStudents = students.map(student => {
      // Handle subjects - better parsing
      let subjectNames = "No Subjects";
      if (student.subjectsId) {
        try {
          // Handle both array format and string format
          let subjectIds = [];
          
          if (typeof student.subjectsId === 'string') {
            // Remove brackets and quotes, then split
            const cleanedIds = student.subjectsId
              .replace(/[\[\]'"]/g, "")
              .split(",")
              .map(id => id.trim())
              .filter(id => id !== "");
            subjectIds = cleanedIds;
          } else if (Array.isArray(student.subjectsId)) {
            subjectIds = student.subjectsId;
          }
          
          // Map IDs to names
          const mappedSubjects = subjectIds
            .map(id => subjectMap[id] || `${id}`)
            .filter(name => name);
          
          if (mappedSubjects.length > 0) {
            subjectNames = mappedSubjects.join(", ");
          }
        } catch (error) {
          console.error("Error parsing subjects for student:", student.student_id, error);
          subjectNames = "Error parsing subjects";
        }
      }
      
      return {
        ...student,
        subject_name: subjectNames,
        subjects: subjectNames,
        payment_status: student.payment_status
      };
    });
    
    console.log("Payment students sample:", enrichedStudents.slice(0, 2)); // Debug log
    res.json(enrichedStudents);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Failed to retrieve student data");
  }
};

// Export all students to Excel
exports.downloadStudentsExcel = async (req, res) => {
  try {
    const instituteId = req.session.instituteId;
    
    const studentQuery = `
      SELECT 
        student_id, firstName, lastName, motherName, middleName, 
        password, amount, batch_year, subjectsId,
        CASE 
          WHEN amount = 'paid' THEN 'paid'
          WHEN amount = 'pending' THEN 'unpaid'
          WHEN amount = 'waiting' THEN 'unpaid'
          ELSE 'unpaid' 
        END as payment_status
      FROM student14 
      WHERE instituteId = ?
    `;
    
    const [students] = await connection.query(studentQuery, [instituteId]);
    
    // Fetch subjects
    const [subjects] = await connection.query("SELECT subjectId, subject_name FROM subjectsDb");
    const subjectMap = subjects.reduce((map, subject) => {
      map[subject.subjectId] = subject.subject_name;
      return map;
    }, {});
    
    // Transform data for Excel
    const excelData = students.map(student => {
      let subjectNames = "No Subjects";
      if (student.subjectsId) {
        try {
          let subjectIds = [];
          if (typeof student.subjectsId === 'string') {
            const cleanedIds = student.subjectsId
              .replace(/[\[\]'"]/g, "")
              .split(",")
              .map(id => id.trim())
              .filter(id => id !== "");
            subjectIds = cleanedIds;
          } else if (Array.isArray(student.subjectsId)) {
            subjectIds = student.subjectsId;
          }
          
          const mappedSubjects = subjectIds
            .map(id => subjectMap[id] || `${id}`)
            .filter(name => name);
          
          if (mappedSubjects.length > 0) {
            subjectNames = mappedSubjects.join(", ");
          }
        } catch (error) {
          subjectNames = "Error parsing subjects";
        }
      }
      
      return {
        'Student ID': student.student_id,
        'First Name': student.firstName,
        'Last Name': student.lastName,
        'Mother Name': student.motherName,
        'Middle Name': student.middleName,
        'Password': student.password,
        'Payment Status': student.payment_status,
        'Batch Year': student.batch_year,
        'Subjects': subjectNames
      };
    });
    
    // Create workbook and worksheet
    const worksheet = xlsx.utils.json_to_sheet(excelData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');
    
    // Generate buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Set headers and send file
    res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
    
  } catch (err) {
    console.error("Error generating Excel:", err);
    res.status(500).send("Failed to generate Excel file");
  }
};

//--------------------------------------------------------------------------------------------------------------------

exports.getStudentPaymentsStatus = async (req, res) => {
  console.log("[DEBUG] Fetching student payment status");

  // Session validation
  if (!req.session.instituteId) {
    console.log("[ERROR] No active institute session");
    return res.status(401).json({
      success: false,
      message: "Please log in first",
    });
  }
  
  const instituteId = req.session.instituteId;
  console.log(`[DEBUG] Fetching data for instituteId: ${instituteId}`);
  
  try {
    // Get payment status counts with explicit number conversion
    const [results] = await connection.query(
      `SELECT
                COUNT(CASE WHEN amount = 'paid' THEN 1 END) AS paid,
                COUNT(CASE WHEN amount = 'pending' THEN 1 END) AS pending,
                COUNT(CASE WHEN amount = 'waiting' THEN 1 END) AS waiting
            FROM student14
       WHERE instituteId = ?`,
      [instituteId]
    );
    
    // Ensure numeric values
    const responseData = {
  paid: Number(results[0]?.paid || 0),
  pending: Number(results[0]?.pending || 0),
  waiting: Number(results[0]?.waiting || 0)
};
    
    console.log(`[DEBUG] Payment results:`, responseData);
    
    return res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (err) {
    console.error("[ERROR] Database error:", {
      message: err.message,
      sql: err.sql,
      stack: err.stack
    });
    
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment data",
      error: {
        message: err.message,
        sqlMessage: err.sqlMessage
      }
    });
  }
};


const SUBJECT_MAP = {
  "Shorthand Dummy Subject": 101,
  "English Shorthand 60 wpm": 50,
  "English Shorthand 80 wpm": 51,
  "English Shorthand 100 wpm": 52,
  "English Shorthand 120 wpm": 53,
  "English Shorthand 130 wpm": 54,
  "English Shorthand 140 wpm": 55,
  "English Shorthand 150 wpm": 56,
  "English Shorthand 160 wpm": 57,
  "Marathi Shorthand 60 wpm": 60,
  "Marathi Shorthand 80 wpm": 61,
  "Marathi Shorthand 100 wpm": 62,
  "Marathi Shorthand 120 wpm": 63,
  "Hindi Shorthand 60 wpm": 70,
  "Hindi Shorthand 80 wpm": 71,
  "Hindi Shorthand 100 wpm": 72,
  "Hindi Shorthand 120 wpm": 73
};

exports.submitAudio = async (req, res) => {
  if (!req.session.instituteId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No institute session"
    });
  }

  try {
    const { subjectName, recorderBy, answer } = req.body;
    const audioFile = req.file;

    // Validation
    if (!subjectName || !recorderBy || !answer || !audioFile) {
      if (audioFile) fs.unlinkSync(audioFile.path);
      return res.status(400).json({
        success: false,
        message: "Subject name, recorder name, answer, and audio file are required"
      });
    }

    const subjectId = SUBJECT_MAP[subjectName];
    if (!subjectId) {
      if (audioFile) fs.unlinkSync(audioFile.path);
      return res.status(400).json({
        success: false,
        message: "Invalid subject selected"
      });
    }

    // Updated path with /audio subfolder
    const fileLink = `http://localhost:8080/uploads/audio/${audioFile.filename}`;
    // const fileLink = `http://45.119.47.81:8080/uploads/audio/${audioFile.filename}`;


    // Database insertion
    const [result] = await connection.query(
      `INSERT INTO audio_checking 
       (subjectId, instituteId, recorded_by, answer, link, status) 
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [subjectId, req.session.instituteId, recorderBy, answer, fileLink]
    );

    res.status(201).json({
      success: true,
      message: "Audio submitted successfully",
      passageId: result.insertId,
      filePath: fileLink
    });

  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error("Submission Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during submission",
      error: err.message
    });
  }
};


exports.resetInstitutePassword = async (req, res) => {
  console.log("[DEBUG] Starting resetInstitutePassword");

  try {
    // 1. Check authentication
    if (!req.session.instituteId) {
      return res.status(403).send("Not authenticated");
    }

    // 2. Validate request body
    const { instituteId, newPassword } = req.body;

    if (!instituteId || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Institute ID and new password are required",
      });
    }

    // 3. Verify the requesting institute matches the session
    if (instituteId !== req.session.instituteId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to reset password for this institute",
      });
    }

    // 4. Validate password length
    if (newPassword.length !== 4 || !/^\d+$/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must be exactly 4 digits (numbers only)",
      });
    }

    // 5. Update password in database
    const updatePasswordQuery =
      "UPDATE institutedb SET password = ? WHERE instituteId = ?";

    await connection.query(updatePasswordQuery, [newPassword, instituteId]);

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("[ERROR] in resetInstitutePassword:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



exports.getInstitutePoints = async (req, res) => {
  console.log("\n\nFetching institute points");
  const instituteId = req.session.instituteId;

  if (!instituteId) {
    return res.status(403).json({
      success: false,
      message: "No institute session found"
    });
  }

  const query = `
    SELECT 
      instituteId,
      InstituteName,
      points AS totalPoints,
      0 AS spentPoints 
    FROM 
      institutedb 
    WHERE 
      instituteId = ?
  `;

  try {
    const [results] = await connection.query(query, [instituteId]);
    console.log("Query results:", results);

    if (results.length > 0) {
      res.json({
        success: true,
        data: {
          totalPoints: results[0].totalPoints,
          spentPoints: results[0].spentPoints
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Institute not found"
      });
    }
  } catch (err) {
    console.error("Error fetching institute points:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.getInstitutePoints2 = async (req, res) => {
  console.log("\n\nFetching institute points");
  // Assuming the instituteId is stored in the session when the institute logs in
  const instituteId = req.session.instituteId;

  if (!instituteId) {
    return res.status(403).json({
      success: false,
      message: "No institute session found"
    });
  }

  // Query to get points from institutedb table
  // Assuming you have a 'points' column in your institutedb table
  // If not, you might need to add this column or adjust the query
  const query = "SELECT points FROM institutedb WHERE instituteId = ?";

  try {
    const [results] = await connection.query(query, [instituteId]);
    console.log("Points query results:", results);

    if (results.length > 0) {
      const points = results[0].points || 0; // Default to 0 if null
      console.log(`Institute ${instituteId} has ${points} points`);

      // Return points in the format expected by frontend
      res.json({
        success: true,
        points: points,
        message: "Points fetched successfully"
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Institute not found",
        points: 0
      });
    }
  } catch (err) {
    console.error("Error fetching institute points:", err);
    res.status(500).json({
      success: false,
      message: err.message,
      points: 0
    });
  }
};


exports.getStudentById = async (req, res) => {
  try {
    const studentId = req.params.id; // Correct this line
    const studentQuery = `
      SELECT
        student_id, firstName, lastName, middleName, motherName, sem,
        mobile_no, email, batch_year, subjectsId, image
      FROM
        student14
      WHERE
        student_id = ?;
    `;
    const [student] = await connection.query(studentQuery, [studentId]);

    console.log(student, studentId);
    if (student.length === 0) {
      res.status(404).send("Student not found");
      return;
    }

    // Assuming subjectsId contains comma-separated subject IDs
    const subjectQuery = `
      SELECT subjectId, subject_name FROM subjectsDb
      WHERE subjectId IN (?);
    `;
    const subjectsIds = student[0].subjectsId.split(",");
    const [subjects] = await connection.query(subjectQuery, [subjectsIds]);

    // Add subjects directly into the student object
    student[0].subjects = subjects.map((sub) => ({
      subjectId: sub.subjectId,
      subject_name: sub.subject_name,
    }));

    res.json(student[0]);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Failed to retrieve student data");
  }
};

exports.deleteStudent = async (req, res) => {
  const studentId = req.params.id;

  const deleteQuery = "DELETE FROM student14 WHERE student_id = ?";

  try {
    await connection.query(deleteQuery, [studentId]);
    res.send("Student deleted successfully");
  } catch (err) {
    console.error("Error deleting student:", err);
    res.status(500).send("Error deleting student");
  }
};

// Assuming you have 'connection' set up to handle MySQL queries
exports.getStudentById = async (req, res) => {
  try {
    const { id: studentId } = req.params; // Rename id to studentId // Get student ID from request parameters
    console.log("Request parameters:", req.params);

    const studentQuery = `
        SELECT
          student_id, firstName, lastName, middleName, motherName,
          mobile_no, email, batch_year, subjectsId
        FROM
          student14
        WHERE
          student_id = ?;
      `;
    const [student] = await connection.query(studentQuery, [studentId]);

    console.log(student, studentId);
    if (student.length === 0) {
      res.status(404).send("Student not found");
      return;
    }

    // Assuming subjectsId contains comma-separated subject IDs
    const subjectQuery = `
        SELECT subjectId, subject_name FROM subjectsDb
        WHERE subjectId IN (?);
      `;
    const subjectsIds = student[0].subjectsId.split(",");
    const [subjects] = await connection.query(subjectQuery, [subjectsIds]);

    // Add subjects directly into the student object
    student[0].subjects = subjects.map((sub) => ({
      subjectId: sub.subjectId,
      subject_name: sub.subject_name,
    }));

    res.json(student[0]);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Failed to retrieve student data");
  }
};

// exports.processHybridPayment = async (req, res) => {
//   console.log("\n\nProcessing hybrid payment");

//   const instituteId = req.session.instituteId;

//   if (!instituteId) {
//     return res.status(403).send("No institute session found");
//   }

//   const {
//     payments,
//     totalPointsUsed,
//     totalCashAmount,
//     subscriptionMode,
//     utrNumber
//   } = req.body;

//   console.log("Payment data received:", {
//     instituteId,
//     totalPointsUsed,
//     totalCashAmount,
//     studentsCount: payments.length
//   });

//   try {
//     // Check if institute has enough points (only if points are being used)
//     if (totalPointsUsed > 0) {
//       const query = "SELECT points FROM institutedb WHERE instituteId = ?";
//       const [results] = await connection.query(query, [instituteId]);

//       if (results.length === 0) {
//         return res.status(404).send("Institute not found");
//       }

//       const availablePoints = results[0].points || 0;
//       if (availablePoints < totalPointsUsed) {
//         return res.status(400).send(`Insufficient points. Available: ${availablePoints}, Required: ${totalPointsUsed}`);
//       }

//       // Deduct points from institute
//       const updateInstituteQuery = "UPDATE institutedb SET points = points - ? WHERE instituteId = ?";
//       await connection.query(updateInstituteQuery, [totalPointsUsed, instituteId]);

//       console.log(`Deducted ${totalPointsUsed} points from institute ${instituteId}`);
//     }

//     // Process each student payment
//     for (const payment of payments) {
//       console.log(`Processing payment for student: ${payment.studentId}`);

//       // Get student details from student14 table
//       const getStudentQuery = "SELECT firstName, lastName, mobile_no, email FROM student14 WHERE student_id = ?";
//       const [studentResults] = await connection.query(getStudentQuery, [payment.studentId]);

//       if (studentResults.length === 0) {
//         return res.status(404).send(`Student not found: ${payment.studentId}`);
//       }

//       const student = studentResults[0];
//       const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim();

//       // Add points to student (FULL AMOUNT, NOT DIVIDED)
//       if (totalPointsUsed > 0) {
//         const updateStudentQuery = "UPDATE student14 SET points = points + ? WHERE student_id = ?";
//         await connection.query(updateStudentQuery, [totalPointsUsed, payment.studentId]);

//         console.log(`Added ${totalPointsUsed} points to student ${payment.studentId}`);
//       }

//       // Insert QR payment record if cash amount exists
//       if (totalCashAmount > 0 && utrNumber) {
//         const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

//         const insertQrQuery = `INSERT INTO qrpay 
//                               (student_id, user, mobile, email, utr, date, amount) 
//                               VALUES (?, ?, ?, ?, ?, ?, ?)`;

//         await connection.query(insertQrQuery, [
//           payment.studentId,
//           studentName,
//           student.mobile_no || '',
//           student.email || '',
//           utrNumber,
//           currentDate,
//           payment.cashAmount.toString()
//         ]);

//         console.log(`Added QR payment record for student ${payment.studentId} - Amount: ${payment.cashAmount}`);
//       }
//     }

//     console.log("Hybrid payment completed successfully");

//     const responseData = {
//       success: true,
//       message: "Payment processed successfully",
//       instituteId: instituteId,
//       totalPointsUsed: totalPointsUsed,
//       totalCashAmount: totalCashAmount,
//       studentsUpdated: payments.length,
//       subscriptionMode: subscriptionMode
//     };

//     res.send(responseData);

//   } catch (err) {
//     console.error("Hybrid payment error:", err);
//     res.status(500).send(err.message);
//   }
// };

//-----------------------------------------------------------------------------------
// exports.processHybridPayment = async (req, res) => {
//   console.log("\n\nProcessing hybrid payment");

//   const instituteId = req.session.instituteId;

//   if (!instituteId) {
//     return res.status(403).send("No institute session found");
//   }

//   const {
//     payments,
//     totalPointsUsed,
//     totalCashAmount,
//     subscriptionMode,
//     utrNumber
//   } = req.body;

//   console.log("Payment data received:", {
//     instituteId,
//     totalPointsUsed,
//     totalCashAmount,
//     studentsCount: payments.length,
//     subscriptionMode
//   });

//   try {
//     // Start transaction
//     await connection.query('START TRANSACTION');

//     // Check if institute has enough points (only if points are being used)
//     if (totalPointsUsed > 0) {
//       const query = "SELECT points FROM institutedb WHERE instituteId = ?";
//       const [results] = await connection.query(query, [instituteId]);

//       if (results.length === 0) {
//         await connection.query('ROLLBACK');
//         return res.status(404).send("Institute not found");
//       }

//       const availablePoints = results[0].points || 0;
//       if (availablePoints < totalPointsUsed) {
//         await connection.query('ROLLBACK');
//         return res.status(400).send(`Insufficient points. Available: ${availablePoints}, Required: ${totalPointsUsed}`);
//       }

//       // Deduct points from institute
//       const updateInstituteQuery = "UPDATE institutedb SET points = points - ? WHERE instituteId = ?";
//       await connection.query(updateInstituteQuery, [totalPointsUsed, instituteId]);
//       console.log(`Deducted ${totalPointsUsed} points from institute ${instituteId}`);
//     }

//     // Calculate batch dates
//     const now = new Date();
//     const istOffset = 5.5 * 60 * 60 * 1000; // IST offset
//     const istDate = new Date(now.getTime() + istOffset);
    
//     // Format dates as DD/MM/YYYY for batch dates
//     const batchStartDate = istDate.toLocaleDateString('en-GB'); // DD/MM/YYYY
    
//     // Calculate end date based on subscription
//     const monthsToAdd = {
//       '2months': 2,
//       '4months': 4,
//       '6months': 6
//     };
    
//     const endDate = new Date(istDate);
//     endDate.setMonth(endDate.getMonth() + monthsToAdd[subscriptionMode]);
//     const batchEndDate = endDate.toLocaleDateString('en-GB'); // DD/MM/YYYY
    
//     // Current date for payment record (YYYY-MM-DD format for qrpay table)
//     const currentDate = istDate.toISOString().split('T')[0]; // YYYY-MM-DD

//     // Process each student payment
//     for (const payment of payments) {
//       console.log(`Processing payment for student: ${payment.studentId}`);

//       // Get student details from student14 table
//       const getStudentQuery = "SELECT firstName, lastName, mobile_no, email FROM student14 WHERE student_id = ?";
//       const [studentResults] = await connection.query(getStudentQuery, [payment.studentId]);

//       if (studentResults.length === 0) {
//         await connection.query('ROLLBACK');
//         return res.status(404).send(`Student not found: ${payment.studentId}`);
//       }

//       const student = studentResults[0];
//       const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim();

//       // Update student record with payment status and batch information - keep as 'waiting'
//       const updateStudentQuery = `UPDATE student14 SET 
//                                  amount = 'waiting',
//                                  batchStartDate = ?,
//                                  batchEndDate = ?
//                                  WHERE student_id = ?`;
      
//       await connection.query(updateStudentQuery, [batchStartDate, batchEndDate, payment.studentId]);

//       // Add points to student if points were used
//       if (totalPointsUsed > 0) {
//         const updateStudentPointsQuery = "UPDATE student14 SET points = points + ? WHERE student_id = ?";
//         await connection.query(updateStudentPointsQuery, [totalPointsUsed, payment.studentId]);
//         console.log(`Added ${totalPointsUsed} points to student ${payment.studentId}`);
//       }

//       // Insert QR payment record if cash amount exists
//       if (totalCashAmount > 0 && utrNumber) {
//         const insertQrQuery = `INSERT INTO qrpay 
//                               (student_id, user, mobile, email, utr, date, amount) 
//                               VALUES (?, ?, ?, ?, ?, ?, ?)`;

//         await connection.query(insertQrQuery, [
//           payment.studentId,
//           studentName,
//           student.mobile_no || '',
//           student.email || '',
//           utrNumber,
//           currentDate,
//           payment.cashAmount.toString()
//         ]);

//         console.log(`Added QR payment record for student ${payment.studentId} - Amount: ${payment.cashAmount}`);
//       }
//     }

//     // Commit transaction
//     await connection.query('COMMIT');
//     console.log("Hybrid payment completed successfully");

//     const responseData = {
//       success: true,
//       message: "Payment processed successfully",
//       instituteId: instituteId,
//       totalPointsUsed: totalPointsUsed,
//       totalCashAmount: totalCashAmount,
//       studentsUpdated: payments.length,
//       subscriptionMode: subscriptionMode,
//       batchStartDate: batchStartDate,
//       batchEndDate: batchEndDate
//     };

//     res.send(responseData);

//   } catch (err) {
//     await connection.query('ROLLBACK');
//     console.error("Hybrid payment error:", err);
//     res.status(500).send(err.message);
//   }
// };
//------------------------------------------------------------------------------------

exports.processHybridPayment = async (req, res) => {
  console.log("\n\nProcessing hybrid payment");

  const instituteId = req.session.instituteId;

  if (!instituteId) {
    return res.status(403).send("No institute session found");
  }

  const {
    payments,
    totalPointsUsed,
    totalCashAmount,
    subscriptionMode,
    utrNumber
  } = req.body;

  console.log("Payment data received:", {
    instituteId,
    totalPointsUsed,
    totalCashAmount,
    studentsCount: payments.length,
    subscriptionMode
  });

  try {
    // Start transaction
    await connection.query('START TRANSACTION');

    // Check if institute has enough points (only if points are being used)
    if (totalPointsUsed > 0) {
      const query = "SELECT points FROM institutedb WHERE instituteId = ?";
      const [results] = await connection.query(query, [instituteId]);

      if (results.length === 0) {
        await connection.query('ROLLBACK');
        return res.status(404).send("Institute not found");
      }

      const availablePoints = results[0].points || 0;
      if (availablePoints < totalPointsUsed) {
        await connection.query('ROLLBACK');
        return res.status(400).send(`Insufficient points. Available: ${availablePoints}, Required: ${totalPointsUsed}`);
      }

      // Deduct points from institute
      const updateInstituteQuery = "UPDATE institutedb SET points = points - ? WHERE instituteId = ?";
      await connection.query(updateInstituteQuery, [totalPointsUsed, instituteId]);
      console.log(`Deducted ${totalPointsUsed} points from institute ${instituteId}`);
    }

    // Calculate batch dates
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset
    const istDate = new Date(now.getTime() + istOffset);
    
    // Format dates as DD/MM/YYYY for batch dates
    const batchStartDate = istDate.toLocaleDateString('en-GB'); // DD/MM/YYYY
    
    // Calculate end date based on subscription
    const monthsToAdd = {
      '2months': 2,
      '4months': 4,
      '6months': 6
    };
    
    const endDate = new Date(istDate);
    endDate.setMonth(endDate.getMonth() + monthsToAdd[subscriptionMode]);
    const batchEndDate = endDate.toLocaleDateString('en-GB'); // DD/MM/YYYY
    
    // Current date for payment record (YYYY-MM-DD format for qrpay table)
    const currentDate = istDate.toISOString().split('T')[0]; // YYYY-MM-DD

    // Process each student payment
    for (const payment of payments) {
      console.log(`Processing payment for student: ${payment.studentId}`);

      // Get student details from student14 table
      const getStudentQuery = "SELECT firstName, lastName, mobile_no, email FROM student14 WHERE student_id = ?";
      const [studentResults] = await connection.query(getStudentQuery, [payment.studentId]);

      if (studentResults.length === 0) {
        await connection.query('ROLLBACK');
        return res.status(404).send(`Student not found: ${payment.studentId}`);
      }

      const student = studentResults[0];
      const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim();

      // Update student record with payment status and batch information - keep as 'waiting'
      const updateStudentQuery = `UPDATE student14 SET 
                                 amount = 'waiting',
                                 batchStartDate = ?,
                                 batchEndDate = ?
                                 WHERE student_id = ?`;
      
      await connection.query(updateStudentQuery, [batchStartDate, batchEndDate, payment.studentId]);

      // Remove the points addition to student since student14 table doesn't have points column
      // Previously was: UPDATE student14 SET points = points + ? WHERE student_id = ?

      // Insert QR payment record if cash amount exists
      if (totalCashAmount > 0 && utrNumber) {
        const insertQrQuery = `INSERT INTO qrpay 
                              (student_id, user, mobile, email, utr, date, amount) 
                              VALUES (?, ?, ?, ?, ?, ?, ?)`;

        await connection.query(insertQrQuery, [
          payment.studentId,
          studentName,
          student.mobile_no || '',
          student.email || '',
          utrNumber,
          currentDate,
          payment.cashAmount.toString()
        ]);

        console.log(`Added QR payment record for student ${payment.studentId} - Amount: ${payment.cashAmount}`);
      }
    }

    // Commit transaction
    await connection.query('COMMIT');
    console.log("Hybrid payment completed successfully");

    const responseData = {
      success: true,
      message: "Payment processed successfully",
      instituteId: instituteId,
      totalPointsUsed: totalPointsUsed,
      totalCashAmount: totalCashAmount,
      studentsUpdated: payments.length,
      subscriptionMode: subscriptionMode,
      batchStartDate: batchStartDate,
      batchEndDate: batchEndDate
    };

    res.send(responseData);

  } catch (err) {
    await connection.query('ROLLBACK');
    console.error("Hybrid payment error:", err);
    res.status(500).send(err.message);
  }
};