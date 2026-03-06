/**
 * SLA Reminder Scheduler
 *
 * Periodically checks for idle tickets (no admin reply within X hours)
 * and sends reminder notifications to all admin users.
 *
 * Config:
 *   SLA_HOURS        — Alert threshold (default: 4 hours)
 *   CHECK_INTERVAL   — How often to check (default: every 30 minutes)
 */

const pool = require('../config/db');

const SLA_HOURS = 4;
const CHECK_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

async function checkIdleTickets() {
    try {
        // Find tickets that are open/in_progress where the last message
        // was from a CUSTOMER and was sent more than SLA_HOURS ago,
        // AND we haven't already sent a notification for this idle period.
        const [idleTickets] = await pool.query(
            `SELECT t.id, t.ticket_number, t.subject, t.category, t.status,
                    t.customer_id, u.first_name, u.last_name,
                    tm.created_at AS last_message_at,
                    TIMESTAMPDIFF(HOUR, tm.created_at, NOW()) AS idle_hours
             FROM tickets t
             JOIN users u ON t.customer_id = u.id
             JOIN ticket_messages tm ON tm.id = (
                 SELECT MAX(id) FROM ticket_messages WHERE ticket_id = t.id
             )
             WHERE t.status IN ('open', 'in_progress')
               AND tm.sender_role = 'customer'
               AND tm.created_at < DATE_SUB(NOW(), INTERVAL ? HOUR)
               AND NOT EXISTS (
                   SELECT 1 FROM notifications n
                   WHERE n.reference_id = t.id
                     AND n.reference_type = 'ticket'
                     AND n.title LIKE '%SLA%'
                     AND n.created_at > tm.created_at
               )`,
            [SLA_HOURS]
        );

        if (idleTickets.length === 0) return;

        // Get all admin user IDs
        const [admins] = await pool.query(
            `SELECT id FROM users WHERE role = 'admin'`
        );

        if (admins.length === 0) return;

        // Build notification inserts for each idle ticket × each admin
        const notifications = [];
        for (const ticket of idleTickets) {
            for (const admin of admins) {
                notifications.push([
                    admin.id,
                    `⚠️ SLA Alert: ${ticket.ticket_number}`,
                    `Ticket from ${ticket.first_name} ${ticket.last_name} has been waiting for ${ticket.idle_hours}h without a response. Subject: "${ticket.subject}"`,
                    'general',
                    ticket.id,
                    'ticket',
                ]);
            }
        }

        if (notifications.length > 0) {
            await pool.query(
                `INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type) VALUES ?`,
                [notifications]
            );
            console.log(`⚠️  SLA Alert: ${idleTickets.length} idle ticket(s) — ${notifications.length} notification(s) sent`);
        }
    } catch (err) {
        console.error('SLA check error:', err.message);
    }
}

/**
 * Start the SLA reminder scheduler.
 */
function startSLAScheduler() {
    console.log(`🕐 SLA Scheduler active — checking every ${CHECK_INTERVAL_MS / 60000}min for tickets idle > ${SLA_HOURS}h`);

    // Run once on startup after a short delay
    setTimeout(checkIdleTickets, 5000);

    // Then run on interval
    setInterval(checkIdleTickets, CHECK_INTERVAL_MS);
}

module.exports = { startSLAScheduler, checkIdleTickets };
