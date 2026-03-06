const pool = require('../config/db');

// Generate ticket number: TKT-2026-XXXX
function generateTicketNumber() {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `TKT-${year}-${rand}`;
}

// ────────────────────────────────────────────────
// Create Ticket (Customer)
// ────────────────────────────────────────────────
exports.createTicket = async (req, res) => {
    try {
        const { category, subject, message, related_order_id } = req.body;

        if (!category || !subject || !message) {
            return res.status(400).json({ success: false, message: 'Category, subject, and message are required' });
        }

        const ticketNumber = generateTicketNumber();

        const [result] = await pool.query(
            `INSERT INTO tickets (ticket_number, customer_id, category, subject, related_order_id)
             VALUES (?, ?, ?, ?, ?)`,
            [ticketNumber, req.user.id, category, subject, related_order_id || null]
        );

        // Insert the initial message
        await pool.query(
            `INSERT INTO ticket_messages (ticket_id, sender_id, sender_role, message)
             VALUES (?, ?, 'customer', ?)`,
            [result.insertId, req.user.id, message]
        );

        // Notify all admins
        const [admins] = await pool.query('SELECT id FROM users WHERE role = "admin"');
        if (admins.length > 0) {
            const notifValues = admins.map(a => [
                a.id,
                `New Support Ticket: ${ticketNumber}`,
                `${subject} — ${category.replace('_', ' ')}`,
                'general',
                result.insertId,
                'ticket',
            ]);
            await pool.query(
                `INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type)
                 VALUES ?`,
                [notifValues]
            );
        }

        res.status(201).json({
            success: true,
            message: 'Ticket created successfully',
            data: {
                id: result.insertId,
                ticket_number: ticketNumber,
                category,
                subject,
                status: 'open',
            },
        });
    } catch (err) {
        console.error('Create ticket error:', err);
        res.status(500).json({ success: false, message: 'Failed to create ticket' });
    }
};

// ────────────────────────────────────────────────
// Get Tickets (Role-filtered)
// ────────────────────────────────────────────────
exports.getTickets = async (req, res) => {
    try {
        const { status } = req.query;
        const isAdmin = req.user.role === 'admin';

        let query = `
            SELECT t.*, 
                   u.first_name, u.last_name, u.email,
                   (SELECT COUNT(*) FROM ticket_messages WHERE ticket_id = t.id) as message_count,
                   (SELECT tm.message FROM ticket_messages tm WHERE tm.ticket_id = t.id ORDER BY tm.created_at DESC LIMIT 1) as last_message,
                   (SELECT tm.sender_role FROM ticket_messages tm WHERE tm.ticket_id = t.id ORDER BY tm.created_at DESC LIMIT 1) as last_sender_role
            FROM tickets t
            JOIN users u ON t.customer_id = u.id
        `;

        const conditions = [];
        const values = [];

        if (!isAdmin) {
            conditions.push('t.customer_id = ?');
            values.push(req.user.id);
        }

        if (status) {
            conditions.push('t.status = ?');
            values.push(status);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY t.updated_at DESC';

        const [tickets] = await pool.query(query, values);

        res.json({ success: true, data: tickets });
    } catch (err) {
        console.error('Get tickets error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
    }
};

// ────────────────────────────────────────────────
// Get Ticket By ID (with messages)
// ────────────────────────────────────────────────
exports.getTicketById = async (req, res) => {
    try {
        const { id } = req.params;
        const isAdmin = req.user.role === 'admin';

        const [tickets] = await pool.query(
            `SELECT t.*, u.first_name, u.last_name, u.email
             FROM tickets t
             JOIN users u ON t.customer_id = u.id
             WHERE t.id = ?`,
            [id]
        );

        if (tickets.length === 0) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        const ticket = tickets[0];

        // Customers can only view their own tickets
        if (!isAdmin && ticket.customer_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Get all messages
        const [messages] = await pool.query(
            `SELECT tm.*, u.first_name, u.last_name, u.role
             FROM ticket_messages tm
             JOIN users u ON tm.sender_id = u.id
             WHERE tm.ticket_id = ?
             ORDER BY tm.created_at ASC`,
            [id]
        );

        res.json({ success: true, data: { ...ticket, messages } });
    } catch (err) {
        console.error('Get ticket by ID error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch ticket' });
    }
};

// ────────────────────────────────────────────────
// Add Message to Ticket
// ────────────────────────────────────────────────
exports.addMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        // Verify ticket exists
        const [tickets] = await pool.query('SELECT * FROM tickets WHERE id = ?', [id]);
        if (tickets.length === 0) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        const ticket = tickets[0];
        const isAdmin = req.user.role === 'admin';

        // Customers can only reply to their own tickets
        if (!isAdmin && ticket.customer_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const senderRole = isAdmin ? 'admin' : 'customer';

        await pool.query(
            `INSERT INTO ticket_messages (ticket_id, sender_id, sender_role, message)
             VALUES (?, ?, ?, ?)`,
            [id, req.user.id, senderRole, message]
        );

        // Update ticket's updated_at
        await pool.query('UPDATE tickets SET updated_at = NOW() WHERE id = ?', [id]);

        // Notify the other party
        if (isAdmin) {
            // Notify the customer
            await pool.query(
                `INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type)
                 VALUES (?, ?, ?, 'general', ?, 'ticket')`,
                [ticket.customer_id, `Reply on Ticket ${ticket.ticket_number}`, message.substring(0, 100), id]
            );
        } else {
            // Notify all admins
            const [admins] = await pool.query('SELECT id FROM users WHERE role = "admin"');
            if (admins.length > 0) {
                const notifValues = admins.map(a => [
                    a.id,
                    `Customer reply on ${ticket.ticket_number}`,
                    message.substring(0, 100),
                    'general',
                    id,
                    'ticket',
                ]);
                await pool.query(
                    `INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type)
                     VALUES ?`,
                    [notifValues]
                );
            }
        }

        res.json({ success: true, message: 'Reply sent' });
    } catch (err) {
        console.error('Add message error:', err);
        res.status(500).json({ success: false, message: 'Failed to send reply' });
    }
};

// ────────────────────────────────────────────────
// Update Ticket Status (Admin only)
// ────────────────────────────────────────────────
exports.updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Status must be: ${validStatuses.join(', ')}` });
        }

        const [tickets] = await pool.query('SELECT * FROM tickets WHERE id = ?', [id]);
        if (tickets.length === 0) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        const ticket = tickets[0];

        await pool.query('UPDATE tickets SET status = ? WHERE id = ?', [status, id]);

        // Notify customer about status change
        const statusLabels = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed' };
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type)
             VALUES (?, ?, ?, 'general', ?, 'ticket')`,
            [ticket.customer_id, `Ticket ${ticket.ticket_number} Updated`, `Status changed to: ${statusLabels[status]}`, id]
        );

        res.json({ success: true, message: `Ticket status updated to ${status}` });
    } catch (err) {
        console.error('Update ticket status error:', err);
        res.status(500).json({ success: false, message: 'Failed to update ticket status' });
    }
};
