const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'tanuj1221',
    database: 'demo1'
};

function parseDateRobust(dateStr) {
    if (!dateStr) return null;
    dateStr = dateStr.toString().trim();

    // 1. Try ISO-like YYYY-MM-DD (starts with 2025, 2024 etc)
    // Matches 20xx-xx-xx or 20xx/xx/xx
    if (/^20\d{2}[-/]\d{1,2}[-/]\d{1,2}/.test(dateStr)) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) return d;
    }

    // 2. Try DD-MM-YYYY or DD/MM/YYYY
    // Matches 1-31 followed by separator
    const dmy = dateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(.*)$/);
    if (dmy) {
        const day = parseInt(dmy[1]);
        const month = parseInt(dmy[2]) - 1; // JS months are 0-11
        const year = parseInt(dmy[3]);
        const timePart = dmy[4] ? dmy[4].trim() : '';

        // Handle time if present (basic)
        let hours = 0, minutes = 0, seconds = 0;
        if (timePart) {
            const time = timePart.match(/(\d{1,2}):(\d{1,2})(:(\d{1,2}))?/);
            if (time) {
                hours = parseInt(time[1]);
                minutes = parseInt(time[2]);
                seconds = time[4] ? parseInt(time[4]) : 0;

                // Handle PM/AM if simple
                if (timePart.toLowerCase().includes('p') && hours < 12) hours += 12;
                if (timePart.toLowerCase().includes('a') && hours === 12) hours = 0;
            }
        }

        const d = new Date(year, month, day, hours, minutes, seconds);
        if (!isNaN(d.getTime())) return d;
    }

    // 3. Fallback to standard Date parse (covers MM/DD/YYYY in some locales, usually rarely used here given the context)
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;

    return null;
}

async function generateRobustReport() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        // Fetch ALL rows because string filtering in SQL fails for mixed formats
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
        `;

        const [rows] = await connection.query(query);

        if (rows.length === 0) {
            console.log("No payment records found.");
            return;
        }

        const transactions = new Map();
        const startFilterDate = new Date('2025-01-01');

        rows.forEach(row => {
            const parsedDate = parseDateRobust(row.payment_date_str);

            // Filter invalid or old dates
            if (!parsedDate || parsedDate < startFilterDate) {
                return;
            }

            // Grouping Logic
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
                    originalDateStr: row.payment_date_str,
                    students: [],
                    isVerified: false,
                    studentNames: []
                });
            }

            const txn = transactions.get(key);

            if (row.student_status === 'paid' || row.student_status === 'Paid') {
                txn.isVerified = true;
            }

            txn.students.push(row.student_id);
            if (txn.studentNames.length < 2) {
                const name = (row.firstName && row.lastName) ? `${row.firstName} ${row.lastName}` : (row.user || "N/A");
                txn.studentNames.push(name);
            }
        });

        let totalRevenue = 0;
        let verifiedRevenue = 0;
        let pendingRevenue = 0;

        console.log("-------------------------------------------------------------------------------------------------------");
        console.log(pad("Date", 12) + pad("UTR/Batch Key", 22) + pad("Amount", 12) + pad("St. Count", 10) + pad("Verified", 10) + "Sample Student");
        console.log("-------------------------------------------------------------------------------------------------------");

        const sortedTxns = Array.from(transactions.values()).sort((a, b) => b.date - a.date);

        for (const txn of sortedTxns) {
            totalRevenue += txn.amount;

            if (txn.isVerified) {
                verifiedRevenue += txn.amount;
            } else {
                pendingRevenue += txn.amount;
            }

            // formatted date dd/mm/yyyy
            const d = txn.date;
            const dateStr = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

            const displayKey = txn.utr !== 'N/A' ? txn.utr : "No UTR";
            const verifiedStr = txn.isVerified ? "YES" : "NO";
            const sampleName = txn.studentNames[0] || "";

            console.log(
                pad(dateStr, 12) +
                pad(displayKey.substring(0, 20), 22) +
                pad(txn.amount.toFixed(0), 12) +
                pad(txn.students.length.toString(), 10) +
                pad(verifiedStr, 10) +
                sampleName.substring(0, 25)
            );
        }

        console.log("-------------------------------------------------------------------------------------------------------");
        console.log(`\n=== ROBUST REVENUE REPORT (Jan 1 2025 - Present) ===`);
        console.log(`- Parsed ${rows.length} raw records.`);
        console.log(`- Included ${transactions.size} transactions after date filtering.`);
        console.log(`\nTOTAL COLLECTED REVENUE: ${totalRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`);
        console.log(`\nBreakdown:`);
        console.log(`[+] Verified Revenue: ${verifiedRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`);
        console.log(`[-] Pending Revenue:  ${pendingRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`);

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

generateRobustReport();
