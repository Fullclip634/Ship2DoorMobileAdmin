const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/', authenticateToken, orderController.getOrders);
router.get('/dashboard', authenticateToken, requireAdmin, orderController.getDashboardStats);
router.get('/:id', authenticateToken, orderController.getOrderById);
router.post('/', authenticateToken, orderController.createOrder);
router.patch('/:id/status', authenticateToken, requireAdmin, orderController.updateOrderStatus);
router.patch('/:id/cancel', authenticateToken, orderController.cancelOrder);

module.exports = router;
