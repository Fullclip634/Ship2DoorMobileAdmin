const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/', authenticateToken, tripController.getTrips);
router.get('/upcoming', authenticateToken, tripController.getUpcomingTrips);
router.get('/:id', authenticateToken, tripController.getTripById);
router.post('/', authenticateToken, requireAdmin, tripController.createTrip);
router.put('/:id', authenticateToken, requireAdmin, tripController.updateTrip);
router.patch('/:id/status', authenticateToken, requireAdmin, tripController.updateTripStatus);
router.delete('/:id', authenticateToken, requireAdmin, tripController.deleteTrip);

module.exports = router;
