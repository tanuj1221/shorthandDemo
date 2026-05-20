const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'tanuj1221',
    database: 'demo1' // In app.js it connects to db1 which uses demo1
};

async function calculateRevenue() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // 1. Calculate QR Code Revenue
        // Assuming 'date' is DATETIME
        const [qrResult] = await connection.query(
            "SELECT SUM(amount) as total, COUNT(*) as count FROM qrpay WHERE date >= '2025-01-01'"
        );

        console.log('\n--- QR/Manual Payments (from qrpay) ---');
        console.log(`Total Collected: ${qrResult[0].total || 0}`);
        console.log(`Transaction Count: ${qrResult[0].count}`);

        // 2. Analyze 'Paid' Students in student14
        // check if batchStartDate is used as payment date
        console.log('\n--- Online/Other Payments (from student14 where amount="paid") ---');

        // Fetch all paid students
        const [paidStudents] = await connection.query(
            "SELECT student_id, batchStartDate, batchEndDate FROM student14 WHERE amount = 'paid'"
        );

        let inferredTotal = 0;
        let inferredCount = 0;
        let skippedCount = 0;

        for (const student of paidStudents) {
            // Check if date is in range
            // batchStartDate is stored as text 'DD/MM/YYYY' or 'YYYY-MM-DD' depending on how it was inserted.
            // app.js uses 'en-GB' -> 'DD/MM/YYYY'

            const dateStr = student.batchStartDate;
            if (!dateStr) {
                skippedCount++;
                continue;
            }

            let dateParts;
            let paymentDate;

            if (dateStr.includes('/')) {
                // Assume DD/MM/YYYY
                dateParts = dateStr.split('/');
                if (dateParts.length === 3) {
                    paymentDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
                }
            } else if (dateStr.includes('-')) {
                // Assume YYYY-MM-DD
                paymentDate = new Date(dateStr);
            }

            if (paymentDate && !isNaN(paymentDate) && paymentDate >= new Date('2025-01-01')) {
                // Calculate inferred amount based on duration
                // 2 months = 200, 4 months = 350, 6 months = 450

                // We need distinct start and end date to calc diff
                // But simplified: 
                // However, we don't know the END date for sure if it's not consistent?
                // Let's assume the user wants count, and I can try to guess amount.

                // For now, let's just output the count of paid students with recent dates
                inferredCount++;

                // Estimate price
                if (student.batchEndDate) {
                    // Try to parse end date
                    let endDateParts;
                    let endDate;
                    if (student.batchEndDate.includes('/')) {
                        endDateParts = student.batchEndDate.split('/');
                        endDate = new Date(`${endDateParts[2]}-${endDateParts[1]}-${endDateParts[0]}`);
                    } else if (student.batchEndDate.includes('-')) {
                        endDate = new Date(student.batchEndDate);
                    }

                    if (endDate) {
                        const diffTime = Math.abs(endDate - paymentDate);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays >= 170) inferredTotal += 450; // ~6 months
                        else if (diffDays >= 110) inferredTotal += 350; // ~4 months
                        else inferredTotal += 200; // ~2 months (default)
                    } else {
                        inferredTotal += 200; // Default
                    }
                } else {
                    inferredTotal += 200;
                }
            }
        }

        console.log(`Students marked 'paid' with BatchStartDate >= Jan 1 2025: ${inferredCount}`);
        console.log(`Estimated Revenue from 'paid' status (Inferred): ${inferredTotal}`);
        console.log(`Skipped (No Date / Invalid Date): ${skippedCount}`);
        console.log(`\nNOTE: 'Paid' students might overlap with QR payments if status was updated manually.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

calculateRevenue();
