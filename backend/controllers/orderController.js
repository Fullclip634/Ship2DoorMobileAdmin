const pool = require('../config/db');

// Generate unique order number
const generateOrderNumber = () => {
    const prefix = 'S2D';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
};

// Create order (Customer)
exports.createOrder = async (req, res) => {
    try {
        const {
            trip_id, item_description, quantity, weight_estimate,
            special_instructions, pickup_address, pickup_city,
            delivery_address, delivery_city, receiver_name, receiver_phone,
        } = req.body;

        if (!trip_id || !item_description || !pickup_address || !delivery_address || !receiver_name || !receiver_phone) {
            return res.status(400).json({ success: false, message: 'Required fields: trip_id, item_description, pickup_address, delivery_address, receiver_name, receiver_phone' });
        }

        // Verify trip exists and is bookable
        const [trips] = await pool.query('SELECT * FROM trips WHERE id = ? AND status IN ("upcoming", "pickup_phase")', [trip_id]);
        if (trips.length === 0) {
            return res.status(400).json({ success: false, message: 'Trip not available for booking' });
        }

        const orderNumber = generateOrderNumber();

        const [result] = await pool.query(
            `INSERT INTO orders (order_number, trip_id, customer_id, item_description, quantity, weight_estimate, special_instructions, pickup_address, pickup_city, delivery_address, delivery_city, receiver_name, receiver_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [orderNumber, trip_id, req.user.id, item_description, quantity || 1, weight_estimate || null, special_instructions || null, pickup_address, pickup_city || null, delivery_address, delivery_city || null, receiver_name, receiver_phone]
        );

        // Notify admin
        const [admins] = await pool.query('SELECT id FROM users WHERE role = "admin"');
        if (admins.length > 0) {
            const notifValues = admins.map((a) => [
                a.id,
                '📦 New Order Received',
                `Order ${orderNumber} has been placed. Check the order details.`,
                'order_update',
                result.insertId,
                'order',
            ]);
            await pool.query(
                'INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type) VALUES ?',
                [notifValues]
            );
        }

        const [order] = await pool.query('SELECT * FROM orders WHERE id = ?', [result.insertId]);

        res.status(201).json({ success: true, message: 'Order placed successfully', data: order[0] });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get orders (filtered by user role)
exports.getOrders = async (req, res) => {
    try {
        const { trip_id, status } = req.query;
        let query = `SELECT o.*, t.direction, t.departure_date, t.status as trip_status,
                 u.first_name as customer_first_name, u.last_name as customer_last_name, u.phone as customer_phone, u.email as customer_email
                 FROM orders o
                 JOIN trips t ON o.trip_id = t.id
                 JOIN users u ON o.customer_id = u.id WHERE 1=1`;
        const params = [];

        // Customers only see their own orders
        if (req.user.role === 'customer') {
            query += ' AND o.customer_id = ?';
            params.push(req.user.id);
        }

        if (trip_id) {
            query += ' AND o.trip_id = ?';
            params.push(trip_id);
        }
        if (status) {
            query += ' AND o.status = ?';
            params.push(status);
        }

        query += ' ORDER BY o.created_at DESC';

        const [orders] = await pool.query(query, params);
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        let query = `SELECT o.*, t.direction, t.departure_date, t.status as trip_status, t.estimated_arrival,
                 u.first_name as customer_first_name, u.last_name as customer_last_name, u.phone as customer_phone, u.email as customer_email
                 FROM orders o
                 JOIN trips t ON o.trip_id = t.id
                 JOIN users u ON o.customer_id = u.id WHERE o.id = ?`;
        const params = [req.params.id];

        // Customers can only see their own orders
        if (req.user.role === 'customer') {
            query += ' AND o.customer_id = ?';
            params.push(req.user.id);
        }

        const [orders] = await pool.query(query, params);

        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, data: orders[0] });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update order status (Admin only)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, admin_notes, pickup_date, pickup_time_slot } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }

        const updateFields = ['status = ?'];
        const updateParams = [status];

        if (admin_notes !== undefined) {
            updateFields.push('admin_notes = ?');
            updateParams.push(admin_notes);
        }
        if (pickup_date) {
            updateFields.push('pickup_date = ?');
            updateParams.push(pickup_date);
        }
        if (pickup_time_slot) {
            updateFields.push('pickup_time_slot = ?');
            updateParams.push(pickup_time_slot);
        }

        updateParams.push(req.params.id);

        await pool.query(`UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`, updateParams);

        // Get order to notify customer
        const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
        const order = orders[0];

        const statusLabels = {
            pending: 'Pending',
            confirmed: 'Confirmed',
            pickup_scheduled: 'Pickup Scheduled',
            picked_up: 'Picked Up',
            in_transit: 'In Transit',
            delivered: 'Delivered',
            cancelled: 'Cancelled',
        };

        let notifTitle = `📦 Order ${order.order_number}: ${statusLabels[status]}`;
        let notifMessage = `Your order status has been updated to: ${statusLabels[status]}.`;

        if (status === 'pickup_scheduled' && pickup_date) {
            notifMessage = `Your item will be picked up on ${pickup_date}${pickup_time_slot ? ` (${pickup_time_slot})` : ''}. Please have it ready.`;
        } else if (status === 'delivered') {
            notifMessage = `Your order ${order.order_number} has been delivered successfully! 🎉`;
        }

        await pool.query(
            'INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type) VALUES (?, ?, ?, ?, ?, ?)',
            [order.customer_id, notifTitle, notifMessage, 'order_update', order.id, 'order']
        );

        res.json({ success: true, message: 'Order status updated', data: orders[0] });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Cancel order (Customer — only if pending)
exports.cancelOrder = async (req, res) => {
    try {
        const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? AND customer_id = ?', [req.params.id, req.user.id]);

        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (orders[0].status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Only pending orders can be cancelled' });
        }

        await pool.query('UPDATE orders SET status = "cancelled" WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Order cancelled' });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get admin dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        const [activeTrips] = await pool.query('SELECT COUNT(*) as count FROM trips WHERE status NOT IN ("completed", "cancelled")');
        const [pendingOrders] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE status = "pending"');
        const [totalCustomers] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "customer" AND is_active = TRUE');
        const [totalDelivered] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE status = "delivered"');
        const [todayPickups] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE pickup_date = CURDATE() AND status = "pickup_scheduled"');

        res.json({
            success: true,
            data: {
                active_trips: activeTrips[0].count,
                pending_orders: pendingOrders[0].count,
                total_customers: totalCustomers[0].count,
                total_delivered: totalDelivered[0].count,
                today_pickups: todayPickups[0].count,
            },
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
