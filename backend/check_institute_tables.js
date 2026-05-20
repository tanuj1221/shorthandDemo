const pool = require('./config/db1');

(async () => {
  try {
    const [rows] = await pool.query(
      `SELECT instituteId, InstituteName, password, district, mobile, email
         FROM sh_demo.institutedb
        WHERE instituteId = '22012'`);
    console.log(rows);
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await pool.end();
  }
})();
