const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
const { sendResetCodeEmail } = require('../services/emailService');
require('dotenv').config();

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );
};

// Register
exports.register = async (req, res) => {
    try {
        const { first_name, last_name, email, phone, password, address, city, province } = req.body;

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ success: false, message: 'First name, last name, email, and password are required' });
        }

        // Check if email already exists
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await pool.query(
            'INSERT INTO users (role, first_name, last_name, email, phone, password, address, city, province) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            ['customer', first_name, last_name, email, phone || null, hashedPassword, address || null, city || null, province || null]
        );

        const token = generateToken({ id: result.insertId, email, role: 'customer' });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                token,
                user: {
                    id: result.insertId,
                    role: 'customer',
                    first_name,
                    last_name,
                    email,
                    phone: phone || null,
                    address: address || null,
                    city: city || null,
                    province: province || null,
                    profile_photo: null,
                },
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        // Find user
        const [users] = await pool.query('SELECT * FROM users WHERE email = ? AND is_active = TRUE', [email]);
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const user = users[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    role: user.role,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    city: user.city,
                    province: user.province,
                    profile_photo: user.profile_photo,
                },
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, role, first_name, last_name, email, phone, address, city, province, profile_photo, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, data: users[0] });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const { first_name, last_name, phone, address, city, province } = req.body;

        await pool.query(
            'UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), phone = COALESCE(?, phone), address = COALESCE(?, address), city = COALESCE(?, city), province = COALESCE(?, province) WHERE id = ?',
            [first_name, last_name, phone, address, city, province, req.user.id]
        );

        const [users] = await pool.query(
            'SELECT id, role, first_name, last_name, email, phone, address, city, province, profile_photo, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        res.json({ success: true, message: 'Profile updated', data: users[0] });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update push token
exports.updatePushToken = async (req, res) => {
    try {
        const { push_token } = req.body;
        await pool.query('UPDATE users SET push_token = ? WHERE id = ?', [push_token, req.user.id]);
        res.json({ success: true, message: 'Push token updated' });
    } catch (error) {
        console.error('Update push token error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({ success: false, message: 'Current and new password are required' });
        }

        const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
        const isMatch = await bcrypt.compare(current_password, users[0].password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Forgot Password — Send reset code via email
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const [users] = await pool.query(
            'SELECT id, first_name, email FROM users WHERE email = ? AND is_active = TRUE',
            [email.toLowerCase()]
        );

        // Always return success to prevent email enumeration
        if (users.length === 0) {
            return res.json({ success: true, message: 'If an account with that email exists, a reset code has been sent.' });
        }

        const user = users[0];

        // Generate 6-digit code
        const resetCode = crypto.randomInt(100000, 999999).toString();
        const hashedCode = await bcrypt.hash(resetCode, 10);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Store hashed code and expiry in DB
        await pool.query(
            'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
            [hashedCode, expiresAt, user.id]
        );

        // Send email
        try {
            await sendResetCodeEmail(user.email, user.first_name, resetCode);
        } catch (emailErr) {
            console.error('Email send error:', emailErr);
            return res.status(500).json({ success: false, message: 'Failed to send reset email. Please try again later.' });
        }

        res.json({ success: true, message: 'If an account with that email exists, a reset code has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Reset Password — Verify code and set new password
exports.resetPassword = async (req, res) => {
    try {
        const { email, code, new_password } = req.body;

        if (!email || !code || !new_password) {
            return res.status(400).json({ success: false, message: 'Email, code, and new password are required' });
        }

        if (new_password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const [users] = await pool.query(
            'SELECT id, reset_token, reset_token_expires FROM users WHERE email = ? AND is_active = TRUE',
            [email.toLowerCase()]
        );

        if (users.length === 0 || !users[0].reset_token) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
        }

        const user = users[0];

        // Check expiry
        if (new Date() > new Date(user.reset_token_expires)) {
            await pool.query('UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [user.id]);
            return res.status(400).json({ success: false, message: 'Reset code has expired. Please request a new one.' });
        }

        // Verify code
        const isValid = await bcrypt.compare(code, user.reset_token);
        if (!isValid) {
            return res.status(400).json({ success: false, message: 'Invalid reset code' });
        }

        // Update password and clear token
        const hashedPassword = await bcrypt.hash(new_password, 10);
        await pool.query(
            'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        res.json({ success: true, message: 'Password reset successfully. You can now sign in.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
