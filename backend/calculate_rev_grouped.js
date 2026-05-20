const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'tanuj1221',
    database: 'demo1'
};

async function generateGroupedReport() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        // Fetch valid payment records
        // We filter for dates >= Jan 1 2025
        const query = `
            SELECT 
                q.utr,
                q.amount as txn_amount,
                q.date as payment_date,
                q.student_id,
                s.amount as student_status,
                s.firstName,
                s.lastName
            FROM qrpay q
            LEFT JOIN student14 s ON q.student_id = s.student_id
            WHERE q.date >= '2025-01-01'
            ORDER BY q.date DESC
        `;

        const [rows] = await connection.query(query);

        if (rows.length === 0) {
            console.log("No payment records found.");
            return;
        }

        // Group by UTR
        const transactions = new Map();

        // Handle empty UTRs separately or generate unique ID?
        // If UTR is missing, we assume it's a unique manual transaction per row.
        let emptyUtrCounter = 0;

        rows.forEach(row => {
            let utrKey = row.utr ? row.utr.trim() : `NO_UTR_${++emptyUtrCounter}`;
            if (utrKey === '') utrKey = `NO_UTR_${++emptyUtrCounter}`;

            if (!transactions.has(utrKey)) {
                transactions.set(utrKey, {
                    utr: utrKey,
                    amount: parseFloat(row.txn_amount) || 0,
                    date: row.payment_date,
                    students: [],
                    hasPaidStudent: false
                });
            }

            const txn = transactions.get(utrKey);
            const studentName = (row.firstName && row.lastName) ? `${row.firstName} ${row.lastName}` : (row.student_id || "Unknown");
            const isPaid = (row.student_status === 'paid');

            txn.students.push({
                id: row.student_id,
                name: studentName,
                status: row.student_status
            });

            if (isPaid) {
                txn.hasPaidStudent = true;
            }
        });

        // Calculate Totals
        let totalRevenue = 0;
        let verifiedRevenue = 0;
        let pendingRevenue = 0;

        console.log("------------------------------------------------------------------------------------------------------------------------------------------------");
        console.log(pad("Date", 12) + pad("UTR", 20) + pad("Amount (Txn)", 15) + pad("Student Count", 15) + "Students (Status)");
        console.log("------------------------------------------------------------------------------------------------------------------------------------------------");

        const sortedTxns = Array.from(transactions.values()).sort((a, b) => new Date(b.date) - new Date(a.date));

        for (const txn of sortedTxns) {
            totalRevenue += txn.amount;

            if (txn.hasPaidStudent) {
                verifiedRevenue += txn.amount;
            } else {
                pendingRevenue += txn.amount;
            }

            const dateStr = new Date(txn.date).toLocaleDateString('en-GB'); // DD/MM/YYYY
            const studentSummary = txn.students.map(s => `${s.name} (${s.status})`).join(", ");

            console.log(
                pad(dateStr, 12) +
                pad(txn.utr, 20) +
                pad(txn.amount.toFixed(2), 15) +
                pad(txn.students.length.toString(), 15) +
                studentSummary.substring(0, 100) // Truncate for readability
            );
        }

        console.log("------------------------------------------------------------------------------------------------------------------------------------------------");
        console.log(`\nSUMMARY since Jan 1, 2025:`);
        console.log(`Total Transactions (Unique UTRs): ${transactions.size}`);
        console.log(`\n>>> TOTAL COLLECTED REVENUE: ${totalRevenue.toFixed(2)}`);
        console.log(`    (Based on sum of unique UTR transaction amounts)`);
        console.log(`\nBreakdown:`);
        console.log(`- Verified Revenue (At least one student marked 'paid'): ${verifiedRevenue.toFixed(2)}`);
        console.log(`- Pending/Unverified Revenue (No students marked 'paid'): ${pendingRevenue.toFixed(2)}`);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        if (connection) await connection.end();
    }
}

function pad(str, len) {
    str = String(str);
    if (str.length >= len) return str.substring(0, len - 1) + " ";
    return str + " ".repeat(len - str.length);
}

generateGroupedReport();
