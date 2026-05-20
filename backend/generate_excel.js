const mysql = require('mysql2/promise');
const xlsx = require('xlsx');
const path = require('path');

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
        // We can ignore time for sorting or keep it? Let's assume day granularity is clear enough for Excel, 
        // but sorting by time is nice.

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

async function generateExcelReport() {
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

        // Also try to join institute table if possible?
        // Let's assume instituteId is the Code for now.

        const [rows] = await connection.query(query);
        console.log(`Fetched ${rows.length} rows. Processing...`);

        const dataForExcel = [];
        const startFilterDate = new Date('2025-01-01');

        rows.forEach(row => {
            const parsedDate = parseDateRobust(row.payment_date_str);
            if (!parsedDate || parsedDate < startFilterDate) {
                return;
            }

            // Determine if 'Rejected' logic applies
            // If status is 'pending' but they have a record here, it could be rejected or just not processed.
            // User specifically asked about "rejected", so let's inferred it.
            // If they are 'paid', they are Accepted.
            // If 'waiting', they are Pending Approval.
            // If 'pending' (and date is old), likely Rejected or reset.
            // We will just output the status column.

            const name = (row.firstName && row.lastName) ? `${row.firstName} ${row.lastName}` : (row.user || "N/A");

            dataForExcel.push({
                'Date': parsedDate, // Date object for Excel formatting
                'Date String': row.payment_date_str, // Original string for reference
                'Student ID': row.student_id,
                'Student Name': name,
                'Center Code': row.center_code || 'N/A',
                'UTR / Reference': row.utr || 'N/A',
                'Amount': parseFloat(row.paid_amount) || 0,
                'Current Status': row.current_status || 'Unknown',
                'Mobile': row.mobile || '',
                'Batch': row.batchNo || '',
                'Batch Year': row.batch_year || ''
            });
        });

        // Sort by Date Descending
        dataForExcel.sort((a, b) => b['Date'] - a['Date']);

        // Remove the Date Object column if we want just string, or format it?
        // Excel stores dates as numbers. xlsx handles Date objects.
        // We will keep 'Date' as the first column.

        // Final clean up for excel (removing Date obj if needed, but xlsx usually converts fine)
        // Let's format date to simple string YYYY-MM-DD HH:mm for consistency in output
        const formattedData = dataForExcel.map(item => ({
            ...item,
            'Date': item['Date'].toISOString().slice(0, 19).replace('T', ' ')
        }));

        if (formattedData.length === 0) {
            console.log("No records found for 2025.");
            return;
        }

        // Create Work Book
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(formattedData);

        // Adjust column widths (rough estimate)
        const wscols = [
            { wch: 20 }, // Date
            { wch: 20 }, // Date Str
            { wch: 15 }, // Student ID
            { wch: 30 }, // Name
            { wch: 15 }, // Center Code
            { wch: 25 }, // UTR
            { wch: 10 }, // Amount
            { wch: 15 }, // Status
            { wch: 15 }, // Mobile
        ];
        ws['!cols'] = wscols;

        xlsx.utils.book_append_sheet(wb, ws, "Revenue_2025");

        const fileName = "Revenue_Report_2025.xlsx";
        const filePath = path.join(__dirname, fileName);

        xlsx.writeFile(wb, filePath);
        console.log(`\n✅ Excel report generated successfully: ${filePath}`);

    } catch (err) {
        console.error("Error generating report:", err);
    } finally {
        if (connection) await connection.end();
    }
}

generateExcelReport();
