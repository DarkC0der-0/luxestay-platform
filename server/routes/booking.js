// server/routers/bookingRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createBookingSchema } = require('../validations/bookingSchema');
const bookingController = require('../controllers/booking');

// Guest routes
router.post('/', authMiddleware, requireRole('guest'), validate(createBookingSchema), bookingController.createBooking);
router.get('/my-bookings', authMiddleware, requireRole('guest'), bookingController.getGuestBookings);
router.patch('/:id/cancel', authMiddleware, requireRole('guest'), bookingController.cancelBooking);

// Host routes
router.get('/host/reservations', authMiddleware, requireRole('host', 'admin'), bookingController.getHostBookings);

module.exports = router;
