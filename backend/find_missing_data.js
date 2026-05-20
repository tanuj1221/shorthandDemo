const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'tanuj1221'
};

async function checkDatabasesAndInstitutePayments() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        console.log("=== DATABASES ===");
        const [dbs] = await connection.query("SHOW DATABASES");
        console.log(dbs.map(d => d.Database));

        // Check tables in likely databases
        const databases = ['demo', 'demo1', 'shorthand']; // common names

        for (const dbName of dbs.map(d => d.Database)) {
            if (['information_schema', 'mysql', 'performance_schema', 'sys'].includes(dbName)) continue;

            console.log(`\n--- Inspecting ${dbName} ---`);
            try {
                await connection.query(`USE ${dbName}`);
                const [tables] = await connection.query("SHOW TABLES");
                const tableNames = tables.map(t => Object.values(t)[0]);
                // console.log("Tables:", tableNames.join(', '));

                // Check if 'qrpay' exists here
                if (tableNames.includes('qrpay')) {
                    console.log(`Table 'qrpay' found in ${dbName}. Checking for 'Gurudatta'...`);
                    const [rows] = await connection.query(`SELECT * FROM qrpay WHERE user LIKE '%Gurudatta%' OR date LIKE '%2025-10-15%' LIMIT 5`);
                    if (rows.length > 0) {
                        console.log("FOUND matching records in this database!");
                        console.log(rows);
                        console.log(`*** USE THIS DATABASE: ${dbName} ***`);
                    } else {
                        console.log("No matching 'Gurudatta' or '2025-10-15' records found in this qrpay.");
                    }
                }
            } catch (err) {
                console.log(`Skipping ${dbName}: ${err.message}`);
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        if (connection) await connection.end();
    }
}

checkDatabasesAndInstitutePayments();
