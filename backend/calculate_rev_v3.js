const mysql = require('mysql2/promise');

const dbConfig = {
    host: '103.17.193.168',
    user: 'root',
    password: 'tanuj1221',
    database: 'sh_demo'
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

async function generateFinalReport() {
    let connection;
    try {
        console.log(`Connecting to remote database...`);
        connection = await mysql.createConnection(dbConfig);

        // Fetch all qrpay records
        const query = `
            SELECT 
                q.utr,
                q.amount as txn_amount,
                q.date as payment_date_str,
                q.student_id,
                q.user,
                s.amount as current_status,  -- Renamed for clarity: this is current access status
                s.firstName,
                s.lastName
            FROM qrpay q
            LEFT JOIN student14 s ON q.student_id = s.student_id
        `;

        const [rows] = await connection.query(query);

        if (rows.length === 0) {
            console.log("No payment records found.");
            return;
        }

        const transactions = new Map();
        const startFilterDate = new Date('2025-01-01');

        // Track unique students manually
        const uniqueStudentIds = new Set();

        rows.forEach(row => {
            const parsedDate = parseDateRobust(row.payment_date_str);

            // Filter by date (Jan 1 2025 onwards)
            if (!parsedDate || parsedDate < startFilterDate) {
                return;
            }

            // Add to unique student set if valid date
            uniqueStudentIds.add(row.student_id);

            // Grouping Logic to identify Unique Transactions
            let key;
            const cleanUtr = (row.utr && row.utr.trim().length > 2) ? row.utr.trim() : null;

            if (cleanUtr) {
                key = `UTR_${cleanUtr}`;
            } else {
                // Fallback: Group by timestamp + amount
                key = `BATCH_${parsedDate.getTime()}_${row.txn_amount}`;
            }

            if (!transactions.has(key)) {
                transactions.set(key, {
                    key: key,
                    utr: cleanUtr || 'N/A',
                    amount: parseFloat(row.txn_amount) || 0,
                    date: parsedDate,
                    studentNames: [],
                    studentCount: 0,
                    statuses: new Set()
                });
            }

            const txn = transactions.get(key);

            txn.studentCount++;
            txn.statuses.add(row.current_status);

            if (txn.studentNames.length < 1) {
                const name = (row.firstName && row.lastName) ? `${row.firstName} ${row.lastName}` : (row.user || "N/A");
                txn.studentNames.push(name);
            }
        });

        let totalRevenue = 0;
        let totalStudentEnrollments = 0;

        console.log("----------------------------------------------------------------------------------------------------------------");
        console.log(pad("Date", 12) + pad("UTR/Ref", 25) + pad("Amount", 12) + pad("Students", 10) + "Current Status (Info Only)");
        console.log("----------------------------------------------------------------------------------------------------------------");

        const sortedTxns = Array.from(transactions.values()).sort((a, b) => b.date - a.date);

        for (const txn of sortedTxns) {
            totalRevenue += txn.amount;
            totalStudentEnrollments += txn.studentCount;

            const d = txn.date;
            const dateStr = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
            const displayKey = txn.utr !== 'N/A' ? txn.utr : "No UTR";
            const sampleName = txn.studentNames[0] || "";
            const statusStr = Array.from(txn.statuses).join(', ');

            console.log(
                pad(dateStr, 12) +
                pad(displayKey.substring(0, 23), 25) +
                pad(txn.amount.toFixed(0), 12) +
                pad(txn.studentCount.toString(), 10) +
                statusStr.substring(0, 30)
            );
        }

        console.log("----------------------------------------------------------------------------------------------------------------");
        console.log(`\n=== FINAL REVENUE REPORT (Jan 1 2025 - Present) ===`);
        console.log(`Based on Transaction History in 'qrpay' table.`);
        console.log(`Note: This includes ALL payments, even if the student's plan has since expired.`);
        console.log(`\n>>> TOTAL COLLECTED REVENUE: ${totalRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} <<<`);

        console.log(`\n=== STUDENT COUNTS ===`);
        console.log(`Total Student Enrollments/Payments Processed: ${totalStudentEnrollments}`);
        console.log(`Total Unique Students Paid: ${uniqueStudentIds.size}`);

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

generateFinalReport();
