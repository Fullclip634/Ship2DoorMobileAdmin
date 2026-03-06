const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

/**
 * Send a password reset code email
 * @param {string} to - Recipient email
 * @param {string} firstName - User's first name
 * @param {string} code - 6-digit reset code
 */
exports.sendResetCodeEmail = async (to, firstName, code) => {
    const mailOptions = {
        from: process.env.SMTP_FROM || 'Ship2Door <noreply@ship2door.com>',
        to,
        subject: 'Ship2Door — Password Reset Code',
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #F8F9FB; border-radius: 12px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #1B3A5C; font-size: 28px; margin: 0;">
                        Ship<span style="color: #F58220;">2</span>Door
                    </h1>
                    <p style="color: #6B7280; font-size: 13px; margin-top: 4px;">Manila — Bohol Cargo Delivery</p>
                </div>
                <div style="background: #FFFFFF; border-radius: 12px; padding: 28px; border: 1px solid #E5E7EB;">
                    <p style="color: #1A1A2E; font-size: 16px; margin: 0 0 8px;">Hi ${firstName},</p>
                    <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                        You requested a password reset. Use the code below to reset your password. This code expires in <strong>15 minutes</strong>.
                    </p>
                    <div style="text-align: center; margin: 24px 0;">
                        <div style="display: inline-block; background: #FFF3E6; border: 2px dashed #F58220; border-radius: 12px; padding: 16px 32px;">
                            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1B3A5C; padding-left: 6px;">${code}</span>
                        </div>
                    </div>
                    <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 24px 0 0;">
                        If you didn't request this, you can safely ignore this email.
                    </p>
                </div>
                <p style="color: #9CA3AF; font-size: 11px; text-align: center; margin-top: 20px;">
                    &copy; ${new Date().getFullYear()} Ship2Door. All rights reserved.
                </p>
            </div>
        `,
    };

    return transporter.sendMail(mailOptions);
};
