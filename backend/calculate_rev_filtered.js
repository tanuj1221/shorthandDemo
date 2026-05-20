const mysql = require('mysql2/promise');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

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

        const d = new Date(year, month, day);
        if (timePart) {
            const time = timePart.match(/(\d{1,2}):(\d{1,2})(:(\d{1,2}))?/);
            if (time) {
                const hours = parseInt(time[1]);
                const minutes = parseInt(time[2]);
                const seconds = time[4] ? parseInt(time[4]) : 0;
                d.setHours(hours, minutes, seconds);
            }
        }
        if (!isNaN(d.getTime())) return d;
    }

    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;

    return null;
}

async function generateFilteredReport() {
    let connection;
    try {
        console.log("Connecting to database...");
        connection = await mysql.createConnection(dbConfig);

        console.log("Fetching payment records...");
        const query = `
            SELECT 
                q.utr,
                q.amount as paid_amount,
                q.date as payment_date_str,
                q.student_id,
                q.user,
                q.mobile,
                s.amount as current_status,
                s.firstName,
                s.lastName,
                s.instituteId as center_code,
                s.batchNo,
                s.batch_year
            FROM qrpay q
            LEFT JOIN student14 s ON q.student_id = s.student_id
        `;

        const [rows] = await connection.query(query);
        console.log(`Fetched ${rows.length} rows. Processing...`);

        const transactions = new Map();
        const startFilterDate = new Date('2025-01-01');

        // Stats
        let excludedCount = 0;
        let includedCount = 0;

        rows.forEach(row => {
            const parsedDate = parseDateRobust(row.payment_date_str);
            if (!parsedDate || parsedDate < startFilterDate) {
                return;
            }

            // FILTER LOGIC: "except waiting and unknown"
            let status = row.current_status ? row.current_status.toLowerCase() : 'unknown';
            if (status === 'waiting' || status === 'unknown') {
                excludedCount++;
                return;
            }
            // Note: We keep 'pending', 'paid', etc.

            // Grouping Logic for precise Revenue Sum (Avoid grouping duplicates if UTR is reused for same student? No, UTR reused for distinct students is fine, same student same UTR is duplicate?)
            // We use the Transaction Key logic:
            // Key = UTR (if exists) OR Batch_Time_Amount

            let key;
            const cleanUtr = (row.utr && row.utr.trim().length > 2) ? row.utr.trim() : null;

            if (cleanUtr) {
                key = `UTR_${cleanUtr}`;
            } else {
                key = `BATCH_${parsedDate.getTime()}_${row.paid_amount}`;
            }

            if (!transactions.has(key)) {
                transactions.set(key, {
                    key: key,
                    utr: cleanUtr || 'N/A',
                    amount: parseFloat(row.paid_amount) || 0,
                    date: parsedDate,
                    dateStr: row.payment_date_str,
                    students: []
                });
            }

            const txn = transactions.get(key);

            // Generate full name
            const name = (row.firstName && row.lastName) ? `${row.firstName} ${row.lastName}` : (row.user || "N/A");

            txn.students.push({
                studentId: row.student_id,
                name: name,
                status: row.current_status,
                centerCode: row.center_code,
                mobile: row.mobile,
                batch: row.batchNo,
                batchYear: row.batch_year
            });

            includedCount++;
        });

        // Calculate Total Revenue
        let totalRevenue = 0;
        const excelRows = [];

        const sortedTxns = Array.from(transactions.values()).sort((a, b) => b.date - a.date);

        for (const txn of sortedTxns) {
            totalRevenue += txn.amount;

            // Flatten for Excel
            // If multiple students per UTR, we list them. 
            // BUT for the "Total Amount" column in Excel, we should be careful not to make it look like each row has that amount if we split rows.
            // Just listing 1st student or comma separated? 
            // Let's create one row per STUDENT for detailed report, but share the UTR Amount?
            // Or better: One row per Transaction?
            // "create proper excel with center code student_id name and all"
            // Usually implies detailed student list.
            // If we split students, the sum of "Amount" column in Excel might be wrong if we duplicate transaction amount.
            // I will set Amount to 0 for subsequent students in same UTR, OR just put it on first.

            txn.students.forEach((std, index) => {
                excelRows.push({
                    'Date': txn.date,
                    'Date String': txn.dateStr,
                    'UTR': txn.utr,
                    'Amount': (index === 0) ? txn.amount : 0, // Only attribute amount to first record to avoid summing double in Excel pivots
                    'Student ID': std.studentId,
                    'Student Name': std.name,
                    'Status': std.status,
                    'Center Code': std.centerCode || '',
                    'Mobile': std.mobile || '',
                    'Batch': std.batch || '',
                    'Batch Year': std.batchYear || ''
                });
            });
        }

        console.log(`\n-------------------------------------------------------------`);
        console.log(`FILTERED REPORT (Excluding 'waiting' & 'unknown')`);
        console.log(`-------------------------------------------------------------`);
        console.log(`Included Transactions: ${transactions.size}`);
        console.log(`Unique Students/Records processed: ${includedCount}`);
        console.log(`Excluded Records (Waiting/Unknown): ${excludedCount}`);
        console.log(`\n>>> TOTAL FILTERED REVENUE: ${totalRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} <<<`);
        console.log(`-------------------------------------------------------------`);

        // Generate Excel
        if (excelRows.length > 0) {
            const formattedData = excelRows.map(item => ({
                ...item,
                'Date': item['Date'].toISOString().slice(0, 19).replace('T', ' ')
            }));

            const wb = xlsx.utils.book_new();
            const ws = xlsx.utils.json_to_sheet(formattedData);

            const wscols = [
                { wch: 20 }, // Date
                { wch: 20 }, // Date Str
                { wch: 25 }, // UTR
                { wch: 10 }, // Amount
                { wch: 15 }, // Student ID
                { wch: 30 }, // Name
                { wch: 10 }, // Status
                { wch: 15 }, // Center Code
                { wch: 15 }, // Mobile
            ];
            ws['!cols'] = wscols;

            xlsx.utils.book_append_sheet(wb, ws, "Filtered_Revenue");
            const fileName = "Filtered_Revenue_Report_2025.xlsx";
            const filePath = path.join(__dirname, fileName);
            xlsx.writeFile(wb, filePath);
            console.log(`Excel file created: ${filePath}`);
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (connection) await connection.end();
    }
}

generateFilteredReport();
