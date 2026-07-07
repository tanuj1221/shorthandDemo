const connection = require('../config/db1');
const cron = require('node-cron');

/**
 * Reset student timers based on their subject's Demo_Timer
 */
async function resetStudentTimers() {
  console.log('[TIMER RESET] Starting timer reset process...');
  
  try {
    const query = `
      UPDATE student14 s
      JOIN subjectsDb sub ON JSON_UNQUOTE(JSON_EXTRACT(s.subjectsId, '$[0]')) = sub.subjectId
      SET s.rem_time = sub.Demo_Timer
    `;
    
    const [result] = await connection.query(query);
    
    console.log('[TIMER RESET] Success!');
    console.log(`[TIMER RESET] Affected rows: ${result.affectedRows}`);
    console.log(`[TIMER RESET] Changed rows: ${result.changedRows}`);
    
    return {
      success: true,
      affectedRows: result.affectedRows,
      changedRows: result.changedRows,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error('[TIMER RESET] Error:', err);
    throw err;
  }
}

/**
 * Reset every student's timer to a fixed value (in minutes).
 * Used by the manual "Reset Time to X min" admin actions.
 * Mirrors the storage format of resetStudentTimers()/updateRemTime (plain minutes).
 */
async function setAllStudentTimers(minutes) {
  // Validate: must be a positive integer number of minutes
  const value = Number(minutes);
  if (!Number.isInteger(value) || value <= 0) {
    const err = new Error('Invalid timer value. Minutes must be a positive integer.');
    err.statusCode = 400;
    throw err;
  }

  console.log(`[TIMER RESET] Setting rem_time = ${value} for all students...`);

  try {
    const query = 'UPDATE student14 SET rem_time = ?';
    const [result] = await connection.query(query, [value]);

    console.log('[TIMER RESET] Success!');
    console.log(`[TIMER RESET] Affected rows: ${result.affectedRows}`);
    console.log(`[TIMER RESET] Changed rows: ${result.changedRows}`);

    return {
      success: true,
      minutes: value,
      affectedRows: result.affectedRows,
      changedRows: result.changedRows,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error('[TIMER RESET] Error:', err);
    throw err;
  }
}

/**
 * Schedule timer reset to run at midnight every day
 * Cron format: second minute hour day month weekday
 * '0 0 0 * * *' = At 00:00:00 (midnight) every day
 */
function scheduleTimerReset() {
  // Run at midnight (00:00) every day
  cron.schedule('0 0 0 * * *', async () => {
    console.log('[CRON] Midnight timer reset triggered');
    try {
      const result = await resetStudentTimers();
      console.log('[CRON] Timer reset completed:', result);
    } catch (err) {
      console.error('[CRON] Timer reset failed:', err);
    }
  }, {
    timezone: "Asia/Kolkata" // Set your timezone
  });
  
  console.log('[CRON] Timer reset scheduled for midnight (00:00) every day');
}

module.exports = {
  resetStudentTimers,
  setAllStudentTimers,
  scheduleTimerReset
};
