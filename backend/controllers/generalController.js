const pool = require('../config/db');

// Create announcement (Admin only)
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, message, is_pinned } = req.body;

        if (!title || !message) {
            return res.status(400).json({ success: false, message: 'Title and message are required' });
        }

        const [result] = await pool.query(
            'INSERT INTO announcements (admin_id, title, message, is_pinned) VALUES (?, ?, ?, ?)',
            [req.user.id, title, message, is_pinned || false]
        );

        // Notify all customers
        const [customers] = await pool.query('SELECT id FROM users WHERE role = "customer" AND is_active = TRUE');

        if (customers.length > 0) {
            const notifValues = customers.map((c) => [
                c.id,
                `📢 ${title}`,
                message.substring(0, 200),
                'announcement',
                result.insertId,
                'announcement',
            ]);
            await pool.query(
                'INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type) VALUES ?',
                [notifValues]
            );
        }

        const [announcement] = await pool.query('SELECT * FROM announcements WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, message: 'Announcement posted', data: announcement[0] });
    } catch (error) {
        console.error('Create announcement error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get all announcements
exports.getAnnouncements = async (req, res) => {
    try {
        const [announcements] = await pool.query(
            `SELECT a.*, u.first_name as admin_first_name, u.last_name as admin_last_name
       FROM announcements a JOIN users u ON a.admin_id = u.id
       ORDER BY a.is_pinned DESC, a.created_at DESC`
        );
        res.json({ success: true, data: announcements });
    } catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete announcement (Admin only)
exports.deleteAnnouncement = async (req, res) => {
    try {
        await pool.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Announcement deleted' });
    } catch (error) {
        console.error('Delete announcement error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get notifications for current user
exports.getNotifications = async (req, res) => {
    try {
        const [notifications] = await pool.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
            [req.user.id]
        );

        const [unreadCount] = await pool.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
            [req.user.id]
        );

        res.json({ success: true, data: { notifications, unread_count: unreadCount[0].count } });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Mark notification as read
exports.markNotificationRead = async (req, res) => {
    try {
        await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Mark all notifications as read
exports.markAllNotificationsRead = async (req, res) => {
    try {
        await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.id]);
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all notifications read error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get all customers (Admin only)
exports.getCustomers = async (req, res) => {
    try {
        const [customers] = await pool.query(
            `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.address, u.city, u.province, u.profile_photo, u.created_at,
       (SELECT COUNT(*) FROM orders WHERE customer_id = u.id) as total_orders,
       (SELECT COUNT(*) FROM orders WHERE customer_id = u.id AND status = 'delivered') as completed_orders
       FROM users u WHERE u.role = 'customer' AND u.is_active = TRUE
       ORDER BY u.created_at DESC`
        );
        res.json({ success: true, data: customers });
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Send broadcast notification (Admin only)
exports.sendBroadcast = async (req, res) => {
    try {
        const { title, message, trip_id } = req.body;

        if (!title || !message) {
            return res.status(400).json({ success: false, message: 'Title and message are required' });
        }

        let customers;
        if (trip_id) {
            // Notify only customers on a specific trip
            [customers] = await pool.query(
                'SELECT DISTINCT customer_id as id FROM orders WHERE trip_id = ?',
                [trip_id]
            );
        } else {
            // Notify all customers
            [customers] = await pool.query('SELECT id FROM users WHERE role = "customer" AND is_active = TRUE');
        }

        if (customers.length > 0) {
            const notifValues = customers.map((c) => [
                c.id,
                title,
                message,
                'general',
                null,
                null,
            ]);
            await pool.query(
                'INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type) VALUES ?',
                [notifValues]
            );
        }

        res.json({ success: true, message: `Broadcast sent to ${customers.length} customers` });
    } catch (error) {
        console.error('Send broadcast error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
