const pool = require('../config/db');

// Create a new trip (Admin only)
exports.createTrip = async (req, res) => {
    try {
        const { direction, departure_date, estimated_arrival, notes, max_capacity } = req.body;

        if (!direction || !departure_date) {
            return res.status(400).json({ success: false, message: 'Direction and departure date are required' });
        }

        const [result] = await pool.query(
            'INSERT INTO trips (admin_id, direction, departure_date, estimated_arrival, notes, max_capacity) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, direction, departure_date, estimated_arrival || null, notes || null, max_capacity || 0]
        );

        // Create notification for all customers
        const [customers] = await pool.query('SELECT id FROM users WHERE role = "customer" AND is_active = TRUE');

        const directionLabel = direction === 'manila_to_bohol' ? 'Manila to Bohol' : 'Bohol to Manila';

        if (customers.length > 0) {
            const notifValues = customers.map((c) => [
                c.id,
                '🚚 New Trip Available!',
                `A new trip ${directionLabel} is scheduled for ${departure_date}. Book your shipment now!`,
                'trip_update',
                result.insertId,
                'trip',
            ]);
            await pool.query(
                'INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type) VALUES ?',
                [notifValues]
            );
        }

        const [trip] = await pool.query('SELECT * FROM trips WHERE id = ?', [result.insertId]);

        res.status(201).json({ success: true, message: 'Trip created successfully', data: trip[0] });
    } catch (error) {
        console.error('Create trip error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get all trips
exports.getTrips = async (req, res) => {
    try {
        const { status, direction } = req.query;
        let query = 'SELECT t.*, u.first_name as admin_first_name, u.last_name as admin_last_name, (SELECT COUNT(*) FROM orders WHERE trip_id = t.id) as order_count FROM trips t JOIN users u ON t.admin_id = u.id WHERE 1=1';
        const params = [];

        if (status) {
            query += ' AND t.status = ?';
            params.push(status);
        }
        if (direction) {
            query += ' AND t.direction = ?';
            params.push(direction);
        }

        query += ' ORDER BY t.departure_date DESC';

        const [trips] = await pool.query(query, params);
        res.json({ success: true, data: trips });
    } catch (error) {
        console.error('Get trips error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get upcoming trips (for customers)
exports.getUpcomingTrips = async (req, res) => {
    try {
        const [trips] = await pool.query(
            `SELECT t.*, u.first_name as admin_first_name, u.last_name as admin_last_name,
       (SELECT COUNT(*) FROM orders WHERE trip_id = t.id) as order_count
       FROM trips t JOIN users u ON t.admin_id = u.id
       WHERE t.status NOT IN ('completed', 'cancelled')
       ORDER BY t.departure_date ASC`
        );

        res.json({ success: true, data: trips });
    } catch (error) {
        console.error('Get upcoming trips error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get trip by ID
exports.getTripById = async (req, res) => {
    try {
        const [trips] = await pool.query(
            `SELECT t.*, u.first_name as admin_first_name, u.last_name as admin_last_name,
       (SELECT COUNT(*) FROM orders WHERE trip_id = t.id) as order_count
       FROM trips t JOIN users u ON t.admin_id = u.id WHERE t.id = ?`,
            [req.params.id]
        );

        if (trips.length === 0) {
            return res.status(404).json({ success: false, message: 'Trip not found' });
        }

        res.json({ success: true, data: trips[0] });
    } catch (error) {
        console.error('Get trip error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update trip (Admin only)
exports.updateTrip = async (req, res) => {
    try {
        const { direction, departure_date, estimated_arrival, notes, max_capacity } = req.body;

        await pool.query(
            'UPDATE trips SET direction = COALESCE(?, direction), departure_date = COALESCE(?, departure_date), estimated_arrival = COALESCE(?, estimated_arrival), notes = COALESCE(?, notes), max_capacity = COALESCE(?, max_capacity) WHERE id = ?',
            [direction, departure_date, estimated_arrival, notes, max_capacity, req.params.id]
        );

        const [trip] = await pool.query('SELECT * FROM trips WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Trip updated', data: trip[0] });
    } catch (error) {
        console.error('Update trip error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update trip status (Admin only) — broadcasts to all customers on this trip
exports.updateTripStatus = async (req, res) => {
    try {
        const { status, delay_reason } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }

        await pool.query('UPDATE trips SET status = ? WHERE id = ?', [status, req.params.id]);

        // Get trip info
        const [trips] = await pool.query('SELECT * FROM trips WHERE id = ?', [req.params.id]);
        const trip = trips[0];
        const directionLabel = trip.direction === 'manila_to_bohol' ? 'Manila to Bohol' : 'Bohol to Manila';

        // Status label mapping
        const statusLabels = {
            upcoming: 'Upcoming',
            pickup_phase: 'Pickup Phase',
            in_transit: 'In Transit',
            boarding_ship: 'Boarding Ship',
            at_sea: 'At Sea',
            arrived: 'Arrived',
            delivering: 'Out for Delivery',
            completed: 'Completed',
            cancelled: 'Cancelled',
        };

        // Notify all customers who have orders on this trip
        const [customers] = await pool.query(
            'SELECT DISTINCT customer_id FROM orders WHERE trip_id = ?',
            [req.params.id]
        );

        if (customers.length > 0) {
            let title = `📦 Trip Update: ${statusLabels[status]}`;
            let message = `Your ${directionLabel} trip (${trip.departure_date}) is now: ${statusLabels[status]}.`;

            if (delay_reason) {
                title = '⚠️ Trip Delayed';
                message = `Your ${directionLabel} trip has been delayed. Reason: ${delay_reason}`;
            }

            const notifValues = customers.map((c) => [
                c.customer_id,
                title,
                message,
                delay_reason ? 'delay' : 'trip_update',
                trip.id,
                'trip',
            ]);

            await pool.query(
                'INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type) VALUES ?',
                [notifValues]
            );
        }

        res.json({ success: true, message: 'Trip status updated', data: trip });
    } catch (error) {
        console.error('Update trip status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete trip (Admin only)
exports.deleteTrip = async (req, res) => {
    try {
        await pool.query('DELETE FROM trips WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Trip deleted' });
    } catch (error) {
        console.error('Delete trip error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
