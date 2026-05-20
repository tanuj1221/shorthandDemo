const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'tanuj1221',
    database: 'demo1'
};

async function diagnose() {
    const connection = await mysql.createConnection(dbConfig);
    try {
        console.log("Checking `qrpay` column types...");
        const [columns] = await connection.query("SHOW COLUMNS FROM qrpay LIKE 'date'");
        console.log(columns);

        console.log("\nChecking distinct date formats (first 20 rows ordered by id desc)...");
        // modify query if no id column, but schema says there isn't one? 
        // schema.js: qrpay: student_id, user, mobile, email, utr, date, amount
        // It doesn't seem to have a primary key 'id'.

        const [rows] = await connection.query("SELECT date FROM qrpay LIMIT 20");
        console.log(rows.map(r => r.date));

        // Check for the specific date mentioned by user
        console.log("\nChecking for specific date '2025-10-15'...");
        const [specific] = await connection.query("SELECT * FROM qrpay WHERE date LIKE '%2025-10-15%' LIMIT 5");
        console.log(specific);

    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

diagnose();
