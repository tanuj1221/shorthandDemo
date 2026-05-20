const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'tanuj1221',
    database: 'demo1'
};

async function generateReport() {
    let connection;
    try {
        console.log("Connecting to database...");
        connection = await mysql.createConnection(dbConfig);

        console.log("Fetching QR/Hybrid payment records since Jan 1, 2025...");

        // Query qrpay and join with student14 to get current status
        // qrpay.date is likely stored as a DATETIME string or object based on app.js
        // app.js inserts: const currentDateTime = istDate.toISOString().slice(0, 19).replace('T', ' ');

        const query = `
            SELECT 
                q.student_id,
                q.user as name,
                q.utr,
                q.amount as paid_amount,
                q.date as payment_date,
                s.amount as current_status,
                s.firstName,
                s.lastName
            FROM qrpay q
            LEFT JOIN student14 s ON q.student_id = s.student_id
            WHERE q.date >= '2025-01-01'
            ORDER BY q.date DESC
        `;

        const [rows] = await connection.query(query);

        if (rows.length === 0) {
            console.log("No payment records found since Jan 1, 2025.");
            return;
        }

        console.log(`\nFound ${rows.length} payment records.\n`);

        let totalCollected = 0;
        let confirmedPaidTotal = 0;

        console.log("------------------------------------------------------------------------------------------------------------------");
        console.log(pad("Date", 20) + pad("Student ID", 15) + pad("Name", 20) + pad("UTR", 20) + pad("Amount", 10) + pad("Status", 10));
        console.log("------------------------------------------------------------------------------------------------------------------");

        rows.forEach(row => {
            const dateStr = new Date(row.payment_date).toLocaleString();
            const name = (row.firstName && row.lastName) ? `${row.firstName} ${row.lastName}` : (row.name || "N/A");

            // Calculate totals
            const amount = parseFloat(row.paid_amount) || 0;
            totalCollected += amount;

            if (row.current_status === 'paid') {
                confirmedPaidTotal += amount;
            }

            console.log(
                pad(dateStr, 20) +
                pad(row.student_id || "N/A", 15) +
                pad(name.substring(0, 19), 20) +
                pad(row.utr || "N/A", 20) +
                pad(amount.toFixed(2), 10) +
                pad(row.current_status || "unknown", 10)
            );
        });

        console.log("------------------------------------------------------------------------------------------------------------------");
        console.log(`\nTotal Collected (All Records): ${totalCollected.toFixed(2)}`);
        console.log(`Total from Confirmed 'Paid' Status: ${confirmedPaidTotal.toFixed(2)}`);
        console.log(`\n(Note: 'Status' refers to the current student status in the system. 'waiting' means payment is submitted but strictly not yet fully approved/activated if manual approval is required, though 'qrpay' table records the attempt.)`);

    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        if (connection) await connection.end();
    }
}

function pad(str, len) {
    str = String(str);
    if (str.length >= len) return str.substring(0, len - 1) + " ";
    return str + " ".repeat(len - str.length);
}

generateReport();
