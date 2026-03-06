const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const orderRoutes = require('./routes/orderRoutes');
const generalRoutes = require('./routes/generalRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', generalRoutes);
app.use('/api/tickets', ticketRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Ship2Door API is running 🚚',
        version: '1.0.0',
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

const { startSLAScheduler } = require('./schedulers/slaReminder');

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚚 Ship2Door API Server running on port ${PORT}`);
    console.log(`   http://localhost:${PORT}\n`);

    // Start background schedulers
    startSLAScheduler();
});
