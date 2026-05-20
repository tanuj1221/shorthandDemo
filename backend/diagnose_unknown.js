const mysql = require('mysql2/promise');

const dbConfig = {
    host: '103.17.193.168',
    user: 'root',
    password: 'tanuj1221',
    database: 'sh_demo'
};

async function diagnoseUnknowns() {
    let connection;
    try {
        console.log("Connecting to database...");
        connection = await mysql.createConnection(dbConfig);

        console.log("Finding records where status is effectively unknown/null...");

        // Find qrpay records where the JOIN to student14 fails OR where student14.amount is missing
        const query = `
            SELECT 
                q.student_id as qr_student_id,
                q.user,
                q.amount as paid_amount,
                s.student_id as student_table_id,
                s.amount as student_status,
                s.firstName,
                s.lastName
            FROM qrpay q
            LEFT JOIN student14 s ON q.student_id = s.student_id
            WHERE s.student_id IS NULL OR s.amount IS NULL OR s.amount = ''
            LIMIT 10
        `;

        const [rows] = await connection.query(query);

        if (rows.length === 0) {
            console.log("No 'unknown' status records found in LIMIT 10 sample.");
        } else {
            console.log(`Found ${rows.length} sample records causing 'unknown' status:`);
            rows.forEach(r => {
                let reason = "";
                if (!r.student_table_id) reason = "Student ID not found in student14 table (Join Failed)";
                else if (r.student_status === null) reason = "student14.amount is NULL";
                else if (r.student_status === '') reason = "student14.amount is empty string";

                console.log(`\nID: ${r.qr_student_id} | User: ${r.user} | Amount: ${r.paid_amount}`);
                console.log(`Reason: ${reason}`);
            });
        }

    } catch (err) {
        console.error(err);
    } finally {
        if (connection) await connection.end();
    }
}

diagnoseUnknowns();
