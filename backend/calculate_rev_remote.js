const mysql = require('mysql2/promise');

const dbConfig = {
    host: '103.17.193.168', // Remote host from db1.js
    user: 'root',
    password: 'tanuj1221',
    database: 'sh_demo'     // Database from db1.js
};

function parseDateRobust(dateStr) {
    if (!dateStr) return null;
    dateStr = dateStr.toString().trim();

    // 1. Try ISO-like YYYY-MM-DD
    if (/^20\d{2}[-/]\d{1,2}[-/]\d{1,2}/.test(dateStr)) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) return d;
    }

    // 2. Try DD-MM-YYYY or DD/MM/YYYY
    const dmy = dateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(.*)$/);
    if (dmy) {
        const day = parseInt(dmy[1]);
        const month = parseInt(dmy[2]) - 1;
        const year = parseInt(dmy[3]);
        const timePart = dmy[4] ? dmy[4].trim() : '';

        let hours = 0, minutes = 0, seconds = 0;
        if (timePart) {
            const time = timePart.match(/(\d{1,2}):(\d{1,2})(:(\d{1,2}))?/);
            if (time) {
                hours = parseInt(time[1]);
                minutes = parseInt(time[2]);
                seconds = time[4] ? parseInt(time[4]) : 0;
            }
        }

        const d = new Date(year, month, day, hours, minutes, seconds);
        if (!isNaN(d.getTime())) return d;
    }

    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;

    return null;
}

async function generateRemoteReport() {
    let connection;
    try {
        console.log(`Connecting to remote database ${dbConfig.database} at ${dbConfig.host}...`);
        connection = await mysql.createConnection(dbConfig);
        console.log("Connected successfully.");

        // Fetch rows
        // Note: We'll request 'date' and order by id or date descending
        // Assuming date is stored as string/text based on previous interaction
        const query = `
            SELECT 
                q.utr,
                q.amount as txn_amount,
                q.date as payment_date_str,
                q.student_id,
                q.user,
                s.amount as student_status,
                s.firstName,
                s.lastName
            FROM qrpay q
            LEFT JOIN student14 s ON q.student_id = s.student_id
            -- WHERE clause handled in code due to format issues, or we can try str matching
        `;

        const [rows] = await connection.query(query);

        if (rows.length === 0) {
            console.log("No payment records found in remote DB.");
            return;
        }

        console.log(` fetched ${rows.length} rows.`);

        const transactions = new Map();
        const startFilterDate = new Date('2025-01-01');

        rows.forEach(row => {
            const parsedDate = parseDateRobust(row.payment_date_str);

            if (!parsedDate || parsedDate < startFilterDate) {
                return; // Filter out older than 2025
            }

            let key;
            const cleanUtr = (row.utr && row.utr.trim().length > 2) ? row.utr.trim() : null;

            if (cleanUtr) {
                key = `UTR_${cleanUtr}`;
            } else {
                key = `BATCH_${parsedDate.getTime()}_${row.txn_amount}`;
            }

            if (!transactions.has(key)) {
                transactions.set(key, {
                    key: key,
                    utr: cleanUtr || 'N/A',
                    amount: parseFloat(row.txn_amount) || 0,
                    date: parsedDate,
                    displayDate: row.payment_date_str,
                    studentNames: [],
                    isVerified: false,
                    studentCount: 0
                });
            }

            const txn = transactions.get(key);

            // Check verification status
            if (row.student_status === 'paid' || row.student_status === 'Paid') {
                txn.isVerified = true;
            }

            txn.studentCount++;
            if (txn.studentNames.length < 1) {
                const name = (row.firstName && row.lastName) ? `${row.firstName} ${row.lastName}` : (row.user || "N/A");
                txn.studentNames.push(name);
            }
        });

        let totalRevenue = 0;
        let verifiedRevenue = 0;
        let pendingRevenue = 0;

        console.log("-------------------------------------------------------------------------------------------------------");
        console.log(pad("Date", 12) + pad("UTR/Ref", 25) + pad("Amount", 12) + pad("Count", 8) + pad("Verif", 8) + "Sample Student");
        console.log("-------------------------------------------------------------------------------------------------------");

        const sortedTxns = Array.from(transactions.values()).sort((a, b) => b.date - a.date);

        for (const txn of sortedTxns) {
            totalRevenue += txn.amount;

            if (txn.isVerified) {
                verifiedRevenue += txn.amount;
            } else {
                pendingRevenue += txn.amount;
            }

            const d = txn.date;
            const dateStr = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
            const displayKey = txn.utr !== 'N/A' ? txn.utr : "No UTR";
            const verifiedStr = txn.isVerified ? "YES" : "NO";
            const sampleName = txn.studentNames[0] || "";

            console.log(
                pad(dateStr, 12) +
                pad(displayKey.substring(0, 23), 25) +
                pad(txn.amount.toFixed(0), 12) +
                pad(txn.studentCount.toString(), 8) +
                pad(verifiedStr, 8) +
                sampleName.substring(0, 30)
            );
        }

        console.log("-------------------------------------------------------------------------------------------------------");
        console.log(`\n=== REMOTE DB REPORT (${dbConfig.host}) ===`);
        console.log(`TOTAL REVENUE (Jan 1 2025+): ${totalRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`);
        console.log(`Verified: ${verifiedRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`);
        console.log(`Pending:  ${pendingRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`);

    } catch (error) {
        console.error("Connection Error:", error);
    } finally {
        if (connection) await connection.end();
    }
}

function pad(str, len) {
    str = String(str);
    if (str.length >= len) return str.substring(0, len - 1) + " ";
    return str + " ".repeat(len - str.length);
}

generateRemoteReport();
