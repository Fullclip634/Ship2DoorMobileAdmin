const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All ticket routes require authentication
router.use(authenticateToken);

// Create ticket (customer)
router.post('/', ticketController.createTicket);

// Get tickets (role-filtered: customers see own, admins see all)
router.get('/', ticketController.getTickets);

// Get ticket by ID (with messages)
router.get('/:id', ticketController.getTicketById);

// Add message to ticket (customer or admin)
router.post('/:id/messages', ticketController.addMessage);

// Update ticket status (admin only)
router.patch('/:id/status', requireAdmin, ticketController.updateTicketStatus);

module.exports = router;
