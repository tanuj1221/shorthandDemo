const connection = require('../config/db1');
const xlsx = require('xlsx');
const path = require('path');
const csv = require('csv-parser');
const fs = require('fs');

const pool = require('../config/db1');
exports.getDistricts = async (req, res) => {
  try {
    const batchQuery = "SELECT * FROM district";
    const batchData = await connection.query(batchQuery);

    if (batchData !== null) {
      res.json(batchData[0]);
    } else {
      res.status(404).send("District database not added, please add it");
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.getBatchData = async (req, res) => {
  try {
    const batchQuery = "SELECT * FROM batch";
    const batchData = await connection.query(batchQuery);

    if (batchData !== null) {
      res.json(batchData[0]);
    } else {
      res.status(404).send("District database not added, please add it");
    }
  } catch (err) {
    res.status(500).send(err);
  }
};


exports.getAllTables = async (req, res) => {
  try {
    const query = "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'";
    const connection = await pool.getConnection();

    try {
      const [results] = await connection.query(query);
      connection.release();

      // Extract table names and send them in the response
      const tableNames = results.map(row => row.TABLE_NAME); // Adjusted from table_name to TABLE_NAME
      res.json({ tables: tableNames });
      console.log(tableNames); // Log the correct table names to verify
    } catch (error) {
      connection.release();
      console.error('Failed to retrieve table names:', error);
      res.status(500).json({ error: 'Failed to retrieve table names' });
    }
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection error' });
  }
};


exports.loginadmin = async (req, res) => {
  console.log("Trying admin login");
  const { userId, password } = req.body;

  const query1 = 'SELECT * FROM admindb WHERE adminid = ?';

  try {
    const [results] = await connection.query(query1, [userId]);
    if (results.length > 0) {
      const admin = results[0];
      console.log(admin);

      if (admin.password === password) {
        // Set institute session
        req.session.adminid = admin.adminid;
        res.send('Logged in successfully as an admin!');
      } else {
        res.status(401).send('Invalid credentials for admin');
        res.status(401).send('Invalid credentials for admin');
      }
    } else {
      res.status(404).send('admin not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};


exports.getTheTable = async (req, res) => {
  try {
    const [tables] = await connection.query("SHOW TABLES");
    const tableName = req.params.tableName;

    // Extract table names dynamically
    const validTables = tables.map(t => Object.values(t)[0]);

    if (!validTables.includes(tableName)) {
      return res.status(400).send("Table not found in DB");
    }

    const [table] = await connection.query(`SELECT * FROM ${tableName}`);

    console.log("✅ Data fetched from:", tableName);

    if (table.length === 0) {
      return res.status(404).send("No data found in table");
    }

    res.json(table);
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).send("Failed to retrieve table data");
  }
};





exports.updateTableData = async (req, res) => {
  console.log('[updateTableData] Starting update process...');
  console.log(`[updateTableData] Table: ${req.params.tableName}`);
  console.log('[updateTableData] Request body:', req.body);

  const { tableName } = req.params;
  const updates = req.body;

  // Validate input
  if (!tableName || !updates || !Array.isArray(updates)) {
    console.error('[updateTableData] Invalid request parameters');
    return res.status(400).json({
      success: false,
      message: 'Invalid request data'
    });
  }

  const conn = await connection.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Verify table exists and get its structure with more details
    const [tableInfo] = await conn.query(`
      SELECT 
        COLUMN_NAME, 
        COLUMN_KEY, 
        DATA_TYPE,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = ?
    `, [tableName]);

    if (tableInfo.length === 0) {
      console.error(`[updateTableData] Table not found: ${tableName}`);
      return res.status(404).json({
        success: false,
        message: `Table '${tableName}' not found`
      });
    }

    // 2. Identify primary key (fall back to first column if no PK found)
    const primaryKeyColumn = tableInfo.find(col => col.COLUMN_KEY === 'PRI') || tableInfo[0];
    const primaryKey = primaryKeyColumn.COLUMN_NAME;
    console.log(`[updateTableData] Using primary key: ${primaryKey}`);

    // 3. Process each update
    const results = [];
    for (const row of updates) {
      console.log(`[updateTableData] Processing row with ${primaryKey}=${row[primaryKey]}`);

      if (!row[primaryKey]) {
        const errorMsg = `Missing primary key (${primaryKey}) in row data`;
        console.error(`[updateTableData] ${errorMsg}`);
        results.push({
          success: false,
          message: errorMsg,
          rowData: row
        });
        continue;
      }

      // Filter valid columns that exist in table and aren't the PK
      const validUpdates = {};
      for (const [col, value] of Object.entries(row)) {
        if (col === primaryKey) continue;

        const columnInfo = tableInfo.find(c => c.COLUMN_NAME === col);
        if (!columnInfo) {
          console.warn(`[updateTableData] Column ${col} not found in table ${tableName}`);
          continue;
        }

        // Handle NULL values for nullable columns
        if (value === null || value === 'NULL') {
          if (columnInfo.IS_NULLABLE === 'NO') {
            console.warn(`[updateTableData] Column ${col} is not nullable`);
            continue;
          }
          validUpdates[col] = null;
        }
        // Handle data type conversion
        else if (columnInfo.DATA_TYPE.includes('int')) {
          validUpdates[col] = parseInt(value) || 0;
        } else if (columnInfo.DATA_TYPE.includes('decimal')) {
          validUpdates[col] = parseFloat(value) || 0.0;
        } else {
          validUpdates[col] = value;
        }
      }

      if (Object.keys(validUpdates).length === 0) {
        const errorMsg = `No valid columns to update for ${primaryKey}=${row[primaryKey]}`;
        console.error(`[updateTableData] ${errorMsg}`);
        results.push({
          success: false,
          message: errorMsg,
          rowData: row
        });
        continue;
      }

      try {
        // Build dynamic update query
        const setClause = Object.keys(validUpdates)
          .map(col => `${col} = ?`)
          .join(', ');

        const values = [
          ...Object.values(validUpdates),
          row[primaryKey] // WHERE clause value
        ];

        const updateQuery = `UPDATE ${tableName} SET ${setClause} WHERE ${primaryKey} = ?`;
        console.log(`[updateTableData] Executing: ${updateQuery}`, values);

        const [result] = await conn.query(updateQuery, values);

        results.push({
          success: result.affectedRows > 0,
          primaryKey: row[primaryKey],
          affectedRows: result.affectedRows,
          updatedColumns: Object.keys(validUpdates)
        });

      } catch (error) {
        console.error(`[updateTableData] Update failed for ${primaryKey}=${row[primaryKey]}:`, error);
        results.push({
          success: false,
          primaryKey: row[primaryKey],
          error: error.message,
          sqlMessage: error.sqlMessage
        });
      }
    }

    // Check for failures
    const failedUpdates = results.filter(r => !r.success);
    if (failedUpdates.length > 0) {
      console.error(`[updateTableData] ${failedUpdates.length} updates failed, rolling back`);
      await conn.rollback();
      return res.status(207).json({
        success: false,
        message: `${failedUpdates.length} of ${updates.length} updates failed`,
        results,
        _debug: {
          tableName,
          primaryKey,
          columns: tableInfo.map(col => col.COLUMN_NAME)
        }
      });
    }

    await conn.commit();
    console.log(`[updateTableData] Successfully updated ${updates.length} rows`);
    return res.json({
      success: true,
      message: `Updated ${updates.length} rows in ${tableName}`,
      results
    });

  } catch (error) {
    console.error('[updateTableData] Transaction error:', error);
    await conn.rollback();
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message,
      sqlMessage: error.sqlMessage
    });
  } finally {
    conn.release();
    console.log('[updateTableData] Connection released');
  }
};


exports.addTableRecord = async (req, res) => {
  try {
    const tableName = req.params.tableName;
    const newData = req.body;
    const MAX_IMAGE_SIZE = 50 * 1024; // 50KB

    console.log("addTableRecord tableName:", tableName);
    console.log("addTableRecord newData:", newData);

    // Security check: only allow alphanumeric + underscore table names
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      return res.status(400).send("Invalid table name format");
    }

    // Process base64 image size validation
    for (const [key, value] of Object.entries(newData)) {
      if (typeof value === 'string' && value.startsWith('data:image')) {
        const base64Size = Math.ceil((value.length * 3) / 4);
        if (base64Size > MAX_IMAGE_SIZE) {
          return res.status(400).json({
            success: false,
            message: `Image size for field '${key}' exceeds 50KB. Current size: ${(base64Size / 1024).toFixed(2)}KB`
          });
        }
      }
    }

    // Prepare insert query
    const columns = Object.keys(newData).join(', ');
    const values = Object.values(newData);
    const placeholders = values.map(() => '?').join(', ');

    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    const [result] = await connection.query(query, values);

    console.log("✅ Record added successfully, ID:", result.insertId);

    res.status(200).json({
      success: true,
      message: 'Record added successfully',
      insertId: result.insertId
    });

  } catch (err) {
    console.log("❌ Error adding record:", err);
    res.status(500).json({
      success: false,
      error: 'Failed to add record to DB',
      details: err.message
    });
  }
};


exports.deleteTableRecord = async (req, res) => {
  const { tableName } = req.params;
  const rowData = req.body;

  try {
    if (!tableName || !rowData) {
      return res.status(400).json({
        success: false,
        message: 'Table name and row data are required'
      });
    }

    // 🔹 Security: validate tableName format (avoid SQL injection)
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid table name format'
      });
    }

    const connection = await pool.getConnection();

    try {
      // 🔹 Dynamically check if the table exists
      const [tables] = await connection.query(`SHOW TABLES LIKE ?`, [tableName]);
      if (tables.length === 0) {
        connection.release();
        return res.status(400).json({
          success: false,
          message: `Table '${tableName}' does not exist`
        });
      }

      // Get all columns from the table
      const [columns] = await connection.query(`SHOW COLUMNS FROM ${tableName}`);

      if (columns.length === 0) {
        connection.release();
        return res.status(400).json({
          success: false,
          message: 'No columns found for table'
        });
      }

      // Find potential unique columns (id, _id, tablename_id, etc.)
      const uniqueColumns = columns.filter(col =>
        col.Key === 'PRI' ||
        col.Key === 'UNI' ||
        col.Field.toLowerCase().includes('id') ||
        col.Field.toLowerCase().includes(tableName.toLowerCase() + '_id')
      ).map(col => col.Field);

      // If no obvious unique columns, use all columns for exact match
      const columnsToUse = uniqueColumns.length > 0 ? uniqueColumns : columns.map(col => col.Field);

      // Build WHERE clause dynamically
      let whereClause = '';
      const values = [];

      for (const column of columnsToUse) {
        if (rowData[column] !== undefined && rowData[column] !== null) {
          if (whereClause) whereClause += ' AND ';
          whereClause += `${column} = ?`;
          values.push(rowData[column]);
        }
      }

      if (!whereClause) {
        connection.release();
        return res.status(400).json({
          success: false,
          message: 'No matching columns found for deletion'
        });
      }

      // Delete the record using dynamic WHERE clause
      const [result] = await connection.query(
        `DELETE FROM ${tableName} WHERE ${whereClause}`,
        values
      );

      connection.release();

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'No matching record found to delete'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Record deleted successfully',
        affectedRows: result.affectedRows,
        matchedColumns: columnsToUse.filter(col => rowData[col] !== undefined && rowData[col] !== null)
      });

    } catch (dbError) {
      if (connection) connection.release();
      throw dbError;
    }

  } catch (err) {
    console.error('❌ Delete operation failed:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete record',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};



exports.saveTheTable = async (req, res) => {
  try {
    const tableName = req.params.tableName;
    const tableData = req.body;

    console.log("saveTheTable tableName: " + tableName);
    console.log("saveTheTable tableData: " + tableData);

    //clear the table before repopulating
    await connection.query(`TRUNCATE TABLE ${tableName};`);

    for (const row of tableData) {
      const insertQuery = `INSERT INTO ${tableName} VALUES (?)`;
      const [table] = await connection.query(insertQuery, [Object.values(row)]);
      console.log("shubh: backend: " + [Object.values(row)]);
    }

    console.log('Data saved successfully');
    res.status(200).json({ message: 'Table data saved successfully' });

  } catch (err) {
    console.log("Exception saving table here is error: " + err);
    res.status(500).json({ error: 'Failed to save data to DB' });
  }
};


exports.getPaidStudents = async (req, res) => {
  // Set up pagination (default: page 1, 10 items per page)
  const page = parseInt(req.query.page) || 1;
  const itemsPerPage = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * itemsPerPage;

  try {
    // 1. COUNT TOTAL PAID STUDENTS
    // (Students are considered "paid" if their amount > 0)
    const [countResult] = await connection.query(
      'SELECT COUNT(*) AS total FROM qrpay WHERE amount > 0'
    );
    const totalPaidStudents = countResult[0].total;
    const totalPages = Math.ceil(totalPaidStudents / itemsPerPage);

    // 2. GET PAGINATED STUDENT DATA
    const [students] = await connection.query(
      `SELECT 
        student_id,    
        user,         
        mobile,       
        email,        
        utr,          
        date,         
        amount        
      FROM qrpay 
      WHERE amount > 0 
      ORDER BY date DESC 
      LIMIT ? OFFSET ?`, // Pagination limits
      [itemsPerPage, offset]
    );

    // 3. RETURN RESULTS
    res.status(200).json({
      success: true,
      data: students,           // The list of paid students
      totalStudents: totalPaidStudents, // Total count
      totalPages               // Total pages available
    });

  } catch (error) {
    // HANDLE ERRORS
    console.error('Failed to fetch paid students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load payment data',
      error: error.message // Helpful for debugging
    });
  }
};


exports.getAllWaitingStudents = async (req, res) => {
  try {
    console.log('Starting query execution...');

    const detailsQuery = `
            SELECT qrpay.*, student14.instituteId, student14.student_id
            FROM qrpay
            INNER JOIN student14 ON qrpay.student_id = student14.student_id
            WHERE student14.amount = 'waiting';
        `;

    console.log('Executing SQL:', detailsQuery);

    const [details] = await connection.query(detailsQuery);

    console.log('Query result:', details); // Log raw result

    if (!Array.isArray(details)) {
      console.error('Unexpected query result type:', typeof details, details);
      return res.status(500).send('Invalid data format from database');
    }

    if (details.length > 0) {
      console.log(`Found ${details.length} waiting students`);
      res.send(details);
    } else {
      console.log('No waiting students found');
      res.status(404).send('No waiting students found');
    }
  } catch (err) {
    console.error('🚨 Full error object:', err); // Log full error including stack, code, sqlMessage
    console.error('Error fetching waiting students:', err.message);

    // Optional: Handle specific DB errors
    if (err.code === 'ER_NO_SUCH_TABLE') {
      console.error('Database table missing:', err.sqlMessage);
    } else if (err.code === 'ER_PARSE_ERROR') {
      console.error('SQL syntax error:', err.sqlMessage);
    }

    res.status(500).send({
      message: 'Internal server error',
      error: err.message,
      code: err.code || null,
      sqlMessage: err.sqlMessage || null
    });
  }
};


exports.approveStudent = async (req, res) => {
  const { student_id } = req.body;

  if (!student_id) {
    return res.status(400).send('Student ID is required');
  }

  try {
    const updateQuery = `
        UPDATE student14
        SET amount = 'paid'
        WHERE student_id = ? AND amount = 'waiting';
      `;

    const [result] = await connection.query(updateQuery, [student_id]);

    if (result.affectedRows > 0) {
      res.send({ message: 'Student approved successfully', studentId: student_id });
    } else {
      res.status(404).send('Student not found or was not in waiting status');
    }
  } catch (err) {
    console.log('Error approving student:', err);
    res.status(500).send(err.message);
  }
};


exports.getStudentStatusCounts = async (req, res) => {
  try {
    console.log('Fetching student status counts...');

    const countQuery = `
            SELECT
                COUNT(CASE WHEN amount = 'paid' THEN 1 END) AS paid,
                COUNT(CASE WHEN amount = 'pending' THEN 1 END) AS pending,
                COUNT(CASE WHEN amount = 'waiting' THEN 1 END) AS waiting
            FROM student14;
        `;

    console.log('Executing SQL:', countQuery);

    const [rows] = await connection.query(countQuery);

    console.log('Query result:', rows); // Log raw result

    if (!Array.isArray(rows) || rows.length === 0) {
      console.error('Unexpected query result:', rows);
      return res.status(500).send({ message: 'Failed to retrieve student counts' });
    }

    const counts = rows[0]; // First row contains the counts

    console.log(`Student Status Counts - Paid: ${counts.paid}, Pending: ${counts.pending}, Waiting: ${counts.waiting}`);

    res.send({
      paid: counts.paid,
      pending: counts.pending,
      waiting: counts.waiting
    });

  } catch (err) {
    console.error('🚨 Error fetching student status counts:', err);
    console.error('Error message:', err.message);

    if (err.code === 'ER_NO_SUCH_TABLE') {
      console.error('Database table missing:', err.sqlMessage);
    } else if (err.code === 'ER_PARSE_ERROR') {
      console.error('SQL syntax error:', err.sqlMessage);
    }

    res.status(500).send({
      message: 'Internal server error',
      error: err.message,
      code: err.code || null,
      sqlMessage: err.sqlMessage || null
    });
  }
};


exports.rejectStudent = async (req, res) => {
  const { student_id } = req.body;

  if (!student_id) {
    return res.status(400).send('Student ID is required');
  }

  try {
    const updateQuery = `
        UPDATE student14
        SET amount = 'pending'
        WHERE student_id = ? AND amount = 'waiting';
      `;

    const [result] = await connection.query(updateQuery, [student_id]);

    if (result.affectedRows > 0) {
      res.send({ message: 'Student rejected successfully', studentId: student_id });
    } else {
      res.status(404).send('Student not found or was not in waiting status');
    }
  } catch (err) {
    console.log('Error approving student:', err);
    res.status(500).send(err.message);
  }
};


exports.handleStudentUpdate = async (req, res) => {
  console.log('Request method:', req.method);
  console.log('Request query:', req.query);
  console.log('Request body:', req.body);

  const studentId = req.query.id;

  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  // Fix: Check if req.body exists and has content, handle undefined case
  const hasBody = req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0;
  const isUpdateRequest = hasBody && req.method === 'PUT';

  try {
    if (!isUpdateRequest || req.method === 'GET') {
      // ---------- FETCH Student by ID ----------
      console.log("Fetching student with ID:", studentId);

      const [results] = await connection.query(
        'SELECT * FROM student14 WHERE student_id = ?',
        [studentId]
      );

      if (results.length === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      return res.json(results[0]);
    } else {
      // ---------- UPDATE Student by ID ----------
      console.log("Updating student with ID:", studentId);

      const {
        first_name,
        last_name,
        middle_name,
        mothers_name,
        amount,
        subject_id,
        image_url,
        // Additional fields from your database
        instituteId,
        batchNo,
        batchStartDate,
        batchEndDate,
        courseId,
        batch_year,
        sem,
        mobile_no,
        email,
        rem_time,
        done,
        loggedin
      } = req.body;

      // Build dynamic update query based on provided fields
      const updateFields = [];
      const updateValues = [];

      if (first_name !== undefined) {
        updateFields.push('firstName = ?');
        updateValues.push(first_name);
      }
      if (last_name !== undefined) {
        updateFields.push('lastName = ?');
        updateValues.push(last_name);
      }
      if (middle_name !== undefined) {
        updateFields.push('middleName = ?');
        updateValues.push(middle_name);
      }
      if (mothers_name !== undefined) {
        updateFields.push('motherName = ?');
        updateValues.push(mothers_name);
      }
      if (amount !== undefined) {
        updateFields.push('amount = ?');
        updateValues.push(amount);
      }
      if (subject_id !== undefined) {
        updateFields.push('subjectsId = ?');
        updateValues.push(subject_id);
      }
      if (image_url !== undefined) {
        updateFields.push('image = ?');
        updateValues.push(image_url);
      }
      if (instituteId !== undefined) {
        updateFields.push('instituteId = ?');
        updateValues.push(instituteId);
      }
      if (batchNo !== undefined) {
        updateFields.push('batchNo = ?');
        updateValues.push(batchNo);
      }
      if (batchStartDate !== undefined) {
        updateFields.push('batchStartDate = ?');
        updateValues.push(batchStartDate);
      }
      if (batchEndDate !== undefined) {
        updateFields.push('batchEndDate = ?');
        updateValues.push(batchEndDate);
      }
      if (courseId !== undefined) {
        updateFields.push('courseId = ?');
        updateValues.push(courseId);
      }
      if (batch_year !== undefined) {
        updateFields.push('batch_year = ?');
        updateValues.push(batch_year);
      }
      if (sem !== undefined) {
        updateFields.push('sem = ?');
        updateValues.push(sem);
      }
      if (mobile_no !== undefined) {
        updateFields.push('mobile_no = ?');
        updateValues.push(mobile_no);
      }
      if (email !== undefined) {
        updateFields.push('email = ?');
        updateValues.push(email);
      }
      if (rem_time !== undefined) {
        updateFields.push('rem_time = ?');
        updateValues.push(rem_time);
      }
      if (done !== undefined) {
        updateFields.push('done = ?');
        updateValues.push(done);
      }
      if (loggedin !== undefined) {
        updateFields.push('loggedin = ?');
        updateValues.push(loggedin);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      // Add student ID to the end of values array
      updateValues.push(studentId);

      const updateSql = `
        UPDATE student14
        SET ${updateFields.join(', ')}
        WHERE student_id = ?
      `;

      const [updateResult] = await connection.query(updateSql, updateValues);

      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ error: 'Student not found for update' });
      }

      const [updatedStudent] = await connection.query(
        'SELECT * FROM student14 WHERE student_id = ?',
        [studentId]
      );

      return res.json({
        message: 'Student updated successfully!',
        student: updatedStudent[0]
      });
    }
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: 'Database operation failed' });
  }
};

// ----------------------audio checking------------------------

exports.getAudioSubmissions = async (req, res) => {
  try {
    console.log('Fetching all audio submissions...');

    const query = `
      SELECT ac.*, i.InstituteName 
      FROM audio_checking ac
      LEFT JOIN institutedb i ON ac.instituteId = i.instituteId
      ORDER BY ac.created_at DESC
    `;

    console.log('Executing SQL:', query);

    const [rows] = await connection.query(query);

    console.log(`Found ${rows.length} submissions`);

    if (!Array.isArray(rows)) {
      console.error('Unexpected query result:', rows);
      return res.status(500).send({
        success: false,
        message: 'Unexpected database response format'
      });
    }

    res.send({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (err) {
    console.error('🚨 Error fetching audio submissions:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      sql: err.sql
    });

    res.status(500).send({
      success: false,
      message: 'Failed to fetch submissions',
      error: {
        code: err.code || 'UNKNOWN_ERROR',
        details: err.message
      }
    });
  }
};

exports.approveAudioSubmission = async (req, res) => {
  const { id, remark } = req.body;

  try {
    console.log(`Starting approval for submission ${id}`); // Log entry point

    await connection.query('START TRANSACTION');
    console.log('Transaction started'); // Confirm transaction

    // 1. Update submission
    const updateQuery = `UPDATE audio_checking SET status='approved', remark=?, approved_by=1 WHERE id=?`;
    console.log('Executing:', updateQuery, [remark, id]); // Log query

    const [updateResult] = await connection.query(updateQuery, [remark, id]);
    console.log('Update result:', updateResult); // Log result

    if (updateResult.affectedRows === 0) {
      await connection.query('ROLLBACK');
      console.log('No rows affected - submission not found');
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // 2. Get instituteId
    const [submission] = await connection.query(
      'SELECT instituteId FROM audio_checking WHERE id=?',
      [id]
    );
    console.log('Institute ID:', submission[0]?.instituteId); // Log institute

    if (!submission.length) {
      await connection.query('ROLLBACK');
      console.log('Institute not found');
      return res.status(404).json({ success: false, message: 'Institute not found' });
    }

    // 3. Add points
    const pointsQuery = 'UPDATE institutedb SET points=points+200 WHERE instituteId=?';
    console.log('Executing:', pointsQuery, [submission[0].instituteId]);

    await connection.query(pointsQuery, [submission[0].instituteId]);
    await connection.query('COMMIT');

    console.log('Approval successful'); // Final confirmation
    res.json({
      success: true,
      message: 'Approved (approved_by=1)',
      points_added: 200
    });

  } catch (err) {
    await connection.query('ROLLBACK');
    console.error('🚨 FULL ERROR:', {
      message: err.message,
      sql: err.sql,
      stack: err.stack  // Critical for debugging
    });
    res.status(500).json({
      success: false,
      message: 'Server error during approval',
      error: err.message  // Send error details to client (remove in production)
    });
  }
};

exports.rejectAudioSubmission = async (req, res) => {
  const { id, remark } = req.body;

  try {
    console.log(`[REJECT] Starting rejection for submission ${id}`); // 1. Log entry
    console.log(`[REJECT] Request data:`, { id, remark }); // 2. Log input

    const query = `
      UPDATE audio_checking 
      SET status = 'rejected', 
          remark = ?, 
          approved_by = 0, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    console.log(`[REJECT] Executing query:`, query); // 3. Log raw SQL
    console.log(`[REJECT] Query params:`, [remark, id]); // 4. Log parameters

    const [result] = await connection.query(query, [remark, id]);
    console.log(`[REJECT] Query result:`, result); // 5. Log result

    if (result.affectedRows === 0) {
      console.log(`[REJECT] No rows affected - submission ${id} not found`);
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    console.log(`[REJECT] Successfully rejected submission ${id}`);
    res.json({
      success: true,
      message: 'Rejected (approved_by set to 0)',
      rejected_id: id
    });

  } catch (err) {
    console.error(`[REJECT] 🚨 FULL ERROR FOR SUBMISSION ${id}:`, {
      message: err.message,
      sqlMessage: err.sqlMessage,
      sql: err.sql,
      stack: err.stack
    });
    res.status(500).json({
      success: false,
      message: 'Server error during rejection',
      debug: process.env.NODE_ENV === 'development' ? err.message : null // Hide in prod
    });
  }
};

exports.deleteAudioSubmission = async (req, res) => {
  const { id } = req.body;

  try {
    console.log(`Deleting submission ID: ${id}`);
    console.log('Request body:', req.body);

    const query = 'DELETE FROM audio_checking WHERE id = ?';
    console.log('Executing query:', query);

    const [result] = await connection.query(query, [id]);

    if (result.affectedRows === 0) {
      console.error(`No submission found with ID: ${id}`);
      return res.status(404).send({
        success: false,
        message: 'Submission not found'
      });
    }

    console.log(`Submission ${id} deleted successfully`);

    res.send({
      success: true,
      message: 'Submission deleted successfully'
    });

  } catch (err) {
    console.error('🚨 Error deleting submission:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      sql: err.sql
    });

    res.status(500).send({
      success: false,
      message: 'Failed to delete submission',
      error: {
        code: err.code || 'DELETE_FAILED',
        details: err.message
      }
    });
  }
};


// exports.uploadExcelFile = async (req, res) => {
//   try {
//     // Validate request
//     if (!req.file) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'No file uploaded' 
//       });
//     }

//     if (!req.body.tableName || req.body.tableName.trim() === '') {
//       // Clean up file if validation fails
//       if (fs.existsSync(req.file.path)) {
//         fs.unlinkSync(req.file.path);
//       }
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Table name is required' 
//       });
//     }

//     // Process file and table name
//     const filePath = req.file.path;
//     const tableName = req.body.tableName
//       .replace(/\s+/g, '_')
//       .replace(/[^a-zA-Z0-9_]/g, '')
//       .toLowerCase();

//     // Read Excel file
//     const workbook = xlsx.readFile(filePath);
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];
//     const jsonData = xlsx.utils.sheet_to_json(worksheet);

//     if (jsonData.length === 0) {
//       fs.unlinkSync(filePath);
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Excel file is empty' 
//       });
//     }

//     // Determine column structure from first row
//     const firstRow = jsonData[0];
//     const columns = [];
    
//     for (const key in firstRow) {
//       const value = firstRow[key];
//       let type = 'TEXT';
      
//       if (typeof value === 'number') {
//         type = Number.isInteger(value) ? 'INTEGER' : 'REAL';
//       } else if (value instanceof Date) {
//         type = 'DATETIME';
//       }
      
//       columns.push({
//         name: key.replace(/[^a-zA-Z0-9_]/g, '_'),
//         type: type
//       });
//     }

//     // Create table SQL
//     const createTableSQL = `
//       CREATE TABLE IF NOT EXISTS ${tableName} (
//         ${columns.map(col => `\`${col.name}\` ${col.type}`).join(', ')}
//       )
//     `;

//     await connection.query(createTableSQL);

//     // Insert data in batches
//     const batchSize = 100;
//     for (let i = 0; i < jsonData.length; i += batchSize) {
//       const batch = jsonData.slice(i, i + batchSize);
//       const keys = columns.map(col => col.name);
//       const placeholders = batch.map(() => `(${keys.map(() => '?').join(', ')})`).join(', ');
//       const values = batch.flatMap(row => keys.map(key => row[key] || null));
      
//       const insertSQL = `
//         INSERT INTO ${tableName} (${keys.map(k => `\`${k}\``).join(', ')})
//         VALUES ${placeholders}
//       `;
      
//       await connection.query(insertSQL, values);
//     }

//     // Clean up file
//     fs.unlinkSync(filePath);

//     // Return success response
//     res.json({
//       success: true,
//       message: 'Excel file uploaded and processed successfully',
//       tableName: tableName,
//       rowsInserted: jsonData.length,
//       columns: columns
//     });

//   } catch (error) {
//     console.error('🚨 Error in uploadExcelFile:', {
//       message: error.message,
//       stack: error.stack,
//       sql: error.sql
//     });
    
//     // Clean up file if exists
//     if (req.file && fs.existsSync(req.file.path)) {
//       fs.unlinkSync(req.file.path);
//     }
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to process Excel file',
//       error: process.env.NODE_ENV === 'development' ? error.message : null
//     });
//   }
// };


// exports.uploadExcelFile = async (req, res) => {
//   try {
//     // Validate request
//     if (!req.file) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'No file uploaded' 
//       });
//     }

//     if (!req.body.tableName || req.body.tableName.trim() === '') {
//       if (fs.existsSync(req.file.path)) {
//         fs.unlinkSync(req.file.path);
//       }
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Table name is required' 
//       });
//     }

//     // Process file and table name
//     const filePath = req.file.path;
//     const tableName = req.body.tableName
//       .replace(/\s+/g, '_')
//       .replace(/[^a-zA-Z0-9_]/g, '')
//       .toLowerCase();

//     // Read Excel file
//     const workbook = xlsx.readFile(filePath);
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];
//     const jsonData = xlsx.utils.sheet_to_json(worksheet);

//     if (jsonData.length === 0) {
//       fs.unlinkSync(filePath);
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Excel file is empty' 
//       });
//     }

//     // Determine column structure from first row
//     const firstRow = jsonData[0];
//     const columns = [];

//     for (const key in firstRow) {
//       const original = key.trim(); // original Excel header
//       const sanitized = original.replace(/[^a-zA-Z0-9_]/g, '_'); // DB-safe

//       const value = firstRow[key];
//       let type = 'TEXT';

//       if (typeof value === 'number') {
//         type = Number.isInteger(value) ? 'INTEGER' : 'REAL';
//       } else if (value instanceof Date) {
//         type = 'DATETIME';
//       }

//       columns.push({
//         original: original,
//         name: sanitized,
//         type: type
//       });
//     }

//     // Drop table if exists (always recreate schema fresh)
//     const dropTableSQL = `DROP TABLE IF EXISTS ${tableName}`;
//     await connection.query(dropTableSQL);

//     // Create table SQL
//     const createTableSQL = `
//       CREATE TABLE ${tableName} (
//         ${columns.map(col => `\`${col.name}\` ${col.type}`).join(', ')}
//       )
//     `;

//     await connection.query(createTableSQL);

//     // Insert data in batches
//     const batchSize = 100;
//     for (let i = 0; i < jsonData.length; i += batchSize) {
//       const batch = jsonData.slice(i, i + batchSize);

//       const keys = columns.map(col => col.name);
//       const placeholders = batch.map(() => `(${keys.map(() => '?').join(', ')})`).join(', ');

//       const values = batch.flatMap(row =>
//         columns.map(col => row[col.original] ?? null) // ✅ map using original Excel key
//       );

//       const insertSQL = `
//         INSERT INTO ${tableName} (${keys.map(k => `\`${k}\``).join(', ')})
//         VALUES ${placeholders}
//       `;

//       await connection.query(insertSQL, values);
//     }

//     // Clean up file
//     fs.unlinkSync(filePath);

//     // Return success response
//     res.json({
//       success: true,
//       message: 'Excel file uploaded and processed successfully',
//       tableName: tableName,
//       rowsInserted: jsonData.length,
//       columns: columns.map(c => ({ original: c.original, dbName: c.name, type: c.type }))
//     });

//   } catch (error) {
//     console.error('🚨 Error in uploadExcelFile:', {
//       message: error.message,
//       stack: error.stack,
//       sql: error.sql
//     });
    
//     if (req.file && fs.existsSync(req.file.path)) {
//       fs.unlinkSync(req.file.path);
//     }
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to process Excel file',
//       error: error.message
//     });
//   }
// };


exports.uploadExcelFile = async (req, res) => {
  try {
    // Validate request
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    if (!req.body.tableName || req.body.tableName.trim() === '') {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        success: false, 
        message: 'Table name is required' 
      });
    }

    // Process file and table name
    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const tableName = req.body.tableName
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .toLowerCase();

    let jsonData = [];

    // Process file based on extension
    if (fileExtension === '.csv') {
      // Process CSV file
      jsonData = await processCSVFile(filePath);
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      // Process Excel file
      jsonData = await processExcelFile(filePath);
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ 
        success: false, 
        message: 'Unsupported file format' 
      });
    }

    if (jsonData.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ 
        success: false, 
        message: 'File is empty or could not be processed' 
      });
    }

    // Determine column structure from first row
    const firstRow = jsonData[0];
    const columns = [];

    for (const key in firstRow) {
      const original = key.trim(); // original header
      const sanitized = original.replace(/[^a-zA-Z0-9_]/g, '_'); // DB-safe

      const value = firstRow[key];
      let type = 'TEXT';

      if (typeof value === 'number') {
        type = Number.isInteger(value) ? 'INTEGER' : 'REAL';
      } else if (value instanceof Date) {
        type = 'DATETIME';
      }

      columns.push({
        original: original,
        name: sanitized,
        type: type
      });
    }

    // Drop table if exists (always recreate schema fresh)
    const dropTableSQL = `DROP TABLE IF EXISTS ${tableName}`;
    await connection.query(dropTableSQL);

    // Create table SQL
    const createTableSQL = `
      CREATE TABLE ${tableName} (
        ${columns.map(col => `\`${col.name}\` ${col.type}`).join(', ')}
      )
    `;

    await connection.query(createTableSQL);

    // Insert data in batches
    const batchSize = 100;
    for (let i = 0; i < jsonData.length; i += batchSize) {
      const batch = jsonData.slice(i, i + batchSize);

      const keys = columns.map(col => col.name);
      const placeholders = batch.map(() => `(${keys.map(() => '?').join(', ')})`).join(', ');

      const values = batch.flatMap(row =>
        columns.map(col => row[col.original] ?? null) // ✅ map using original header key
      );

      const insertSQL = `
        INSERT INTO ${tableName} (${keys.map(k => `\`${k}\``).join(', ')})
        VALUES ${placeholders}
      `;

      await connection.query(insertSQL, values);
    }

    // Clean up file
    fs.unlinkSync(filePath);

    // Return success response
    res.json({
      success: true,
      message: 'File uploaded and processed successfully',
      tableName: tableName,
      rowsInserted: jsonData.length,
      columns: columns.map(c => ({ original: c.original, dbName: c.name, type: c.type }))
    });

  } catch (error) {
    console.error('🚨 Error in uploadExcelFile:', {
      message: error.message,
      stack: error.stack,
      sql: error.sql
    });
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to process file',
      error: error.message
    });
  }
};

// Helper function to process Excel files
function processExcelFile(filePath) {
  return new Promise((resolve, reject) => {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet);
      resolve(jsonData);
    } catch (error) {
      reject(error);
    }
  });
}

// Helper function to process CSV files
function processCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}


// ---------------------- TIMER RESET ----------------------
const { resetStudentTimers } = require('../services/resetTimerService');

exports.resetAllStudentTimers = async (req, res) => {
  console.log('[ADMIN] Manual timer reset triggered');
  
  try {
    const result = await resetStudentTimers();
    
    res.status(200).json({
      success: true,
      message: 'Student timers reset successfully',
      ...result
    });
  } catch (err) {
    console.error('[ADMIN] Timer reset failed:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to reset student timers',
      error: err.message
    });
  }
};
