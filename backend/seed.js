/**
 * Ship2Door - Database Seed Script
 * Creates the default admin account with a properly hashed password.
 * Run: node seed.js
 */

const bcrypt = require('bcrypt');
const pool = require('./config/db');
require('dotenv').config();

async function seed() {
    try {
        console.log('🌱 Seeding database...\n');

        const email = 'admin@ship2door.com';
        const plainPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // Check if admin already exists
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);

        if (existing.length > 0) {
            // Update existing admin's password to make sure it matches
            await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
            console.log('✅ Admin password has been reset.\n');
        } else {
            await pool.query(
                `INSERT INTO users (role, first_name, last_name, email, phone, password, address, city, province)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ['admin', 'Ship2Door', 'Admin', email, '09171234567', hashedPassword, 'Tagbilaran City', 'Tagbilaran', 'Bohol']
            );
            console.log('✅ Admin account created.\n');
        }

        console.log('   Email:    admin@ship2door.com');
        console.log('   Password: admin123');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error.message);
        process.exit(1);
    }
}

seed();
