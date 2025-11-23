const fs = require('fs');
const xlsx = require('xlsx');
const pool = require("../config/db1");

exports.importExcel = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const { tableName } = req.params;
  const excelFilePath = req.file.path;

  if (!tableName) {
    fs.unlinkSync(excelFilePath);
    return res.status(400).json({ error: 'Table name is required' });
  }

  try {
    // Read the Excel file
    const workbook = xlsx.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0]; // Use first sheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    if (!jsonData || jsonData.length === 0) {
      fs.unlinkSync(excelFilePath);
      return res.status(400).json({ error: 'No data found in the Excel file' });
    }

    // Get columns from first row
    const columns = Object.keys(jsonData[0]);

    const createTableQuery = `CREATE TABLE IF NOT EXISTS ?? (
      ${columns.map(column => `\`${column}\` LONGTEXT`).join(', ')}
    )`;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      await connection.query(createTableQuery, [tableName]);
      await connection.query(`TRUNCATE TABLE ??`, [tableName]);

      const insertPromises = [];
      const chunkSize = 1000;
      
      for (let i = 0; i < jsonData.length; i += chunkSize) {
        const chunk = jsonData.slice(i, i + chunkSize);
        insertPromises.push(insertChunk(connection, tableName, columns, chunk));
      }

      await Promise.all(insertPromises);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    fs.unlinkSync(excelFilePath);
    res.json({ 
      message: `Excel data imported into table '${tableName}' successfully`,
      rowsInserted: jsonData.length 
    });
  } catch (error) {
    console.error('Error processing Excel:', error.message);
    if (fs.existsSync(excelFilePath)) {
      fs.unlinkSync(excelFilePath);
    }
    res.status(500).json({ error: error.message });
  }
};

async function insertChunk(connection, tableName, columns, chunk) {
  const insertQuery = `INSERT INTO ?? (${columns.map(column => `\`${column}\``).join(', ')}) VALUES ?`;
  const values = chunk.map(row => {
    const rowValues = columns.map(column => {
      const value = row[column];
      // Convert undefined/null to empty string
      return value !== undefined && value !== null ? value : '';
    });
    return rowValues;
  });
  await connection.query(insertQuery, [tableName, values]);
}