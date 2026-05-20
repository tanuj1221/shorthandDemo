const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'tanuj1221',
    database: 'demo1'
};

async function generateCorrectedReport() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        const query = `
            SELECT 
                q.utr,
                q.amount as txn_amount,
                q.date as payment_date,
                q.student_id,
                q.user,
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

        const transactions = new Map();
        let fallbackCounter = 0;

        rows.forEach(row => {
            // Identifier logic:
            // 1. Prefer UTR.
            // 2. If UTR is missing/empty, use Date + Amount + User (to group batch keys).

            let key;
            const cleanUtr = row.utr ? row.utr.trim() : '';

            if (cleanUtr.length > 2) { // Allow short UTRs? usually they are long. assume > 2 is valid-ish
                key = `UTR_${cleanUtr}`;
            } else {
                // Fallback: Group by timestamp and amount
                // Convert date to timestamps to ignore slight ms discrepancies if any (though usually batch insert has same time)
                const timeKey = new Date(row.payment_date).getTime();
                key = `BATCH_${timeKey}_${row.txn_amount}`;
            }

            if (!transactions.has(key)) {
                transactions.set(key, {
                    key: key,
                    utr: cleanUtr || 'N/A',
                    amount: parseFloat(row.txn_amount) || 0,
                    date: row.payment_date,
                    students: [],
                    isVerified: false,
                    studentNames: []
                });
            }

            const txn = transactions.get(key);

            // Check verification status
            // If strictly 'paid', we count it as verified.
            if (row.student_status === 'paid' || row.student_status === 'Paid') {
                txn.isVerified = true;
            }

            txn.students.push(row.student_id);
            if (txn.studentNames.length < 3) { // Limit stored names
                const name = (row.firstName && row.lastName) ? `${row.firstName} ${row.lastName}` : (row.user || "N/A");
                txn.studentNames.push(name);
            }
        });

        let totalRevenue = 0;
        let verifiedRevenue = 0;
        let pendingRevenue = 0;

        console.log("--------------------------------------------------------------------------------------------------");
        console.log(pad("Date", 12) + pad("UTR/Batch Key", 25) + pad("Amount (Unique)", 18) + pad("St. Count", 12) + "Verified?");
        console.log("--------------------------------------------------------------------------------------------------");

        const sortedTxns = Array.from(transactions.values()).sort((a, b) => new Date(b.date) - new Date(a.date));

        for (const txn of sortedTxns) {
            // Basic logic: The amount in the row is the TRANSACTION Total.
            // So we add it ONCE per transaction key.

            totalRevenue += txn.amount;

            if (txn.isVerified) {
                verifiedRevenue += txn.amount;
            } else {
                pendingRevenue += txn.amount;
            }

            const dateStr = new Date(txn.date).toLocaleDateString('en-GB');
            const verifiedStr = txn.isVerified ? "YES" : "NO";

            // Truncate key if too long
            let displayKey = txn.utr !== 'N/A' ? txn.utr : "No UTR (Batched)";

            // Log large/suspicious amounts?
            // console.log ...

            console.log(
                pad(dateStr, 12) +
                pad(displayKey.substring(0, 24), 25) +
                pad(txn.amount.toFixed(2), 18) +
                pad(txn.students.length.toString(), 12) +
                verifiedStr
            );
        }

        console.log("--------------------------------------------------------------------------------------------------");
        console.log(`\n\n=== REVENUE REPORT (Jan 1 2025 - Present) ===`);
        console.log(`Logic: Grouped by UTR. If UTR is shared, Amount is counted ONCE.`);
        console.log(`\nTOTAL COLLECTED REVENUE: ${totalRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`);
        console.log(`\nBreakdown:`);
        console.log(`[+] Verified Revenue (Students marked 'paid'): ${verifiedRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`);
        console.log(`[-] Unverified/Pending (Students 'waiting'):   ${pendingRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`);

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

generateCorrectedReport();
