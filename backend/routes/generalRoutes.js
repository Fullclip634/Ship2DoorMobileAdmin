const express = require('express');
const router = express.Router();
const generalController = require('../controllers/generalController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Announcements
router.get('/announcements', authenticateToken, generalController.getAnnouncements);
router.post('/announcements', authenticateToken, requireAdmin, generalController.createAnnouncement);
router.delete('/announcements/:id', authenticateToken, requireAdmin, generalController.deleteAnnouncement);

// Notifications
router.get('/notifications', authenticateToken, generalController.getNotifications);
router.patch('/notifications/:id/read', authenticateToken, generalController.markNotificationRead);
router.patch('/notifications/read-all', authenticateToken, generalController.markAllNotificationsRead);

// Customers (Admin only)
router.get('/customers', authenticateToken, requireAdmin, generalController.getCustomers);

// Broadcast (Admin only)
router.post('/broadcast', authenticateToken, requireAdmin, generalController.sendBroadcast);

module.exports = router;
