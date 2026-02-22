const pool = require('./config/db');

async function checkDelays() {
    try {
        const [rows] = await pool.query('SELECT id, status, delay_reason FROM trips ORDER BY id DESC LIMIT 5;');
        console.log(rows);
    } catch (e) {
        console.log(e.message);
    }
    process.exit();
}

checkDelays();
