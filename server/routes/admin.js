const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/auth');
const adminController = require('../controllers/admin');
const router = express.Router();

// All routes require admin role
router.use(authMiddleware, requireRole('admin'));

router.get('/dashboard/stats', adminController.getDashboardStats);

router.get('/profile', adminController.getAccountProfile);
router.patch('/profile', adminController.updateAccountProfile);
router.patch('/profile/password', adminController.updateAccountPassword);

router.get('/settings', adminController.getSettings);
router.patch('/settings', adminController.updateSetting);

router.get('/users/:id', adminController.getUserDetail);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/suspend', adminController.toggleUserSuspension);

router.get('/properties', adminController.getAllProperties);
router.get('/properties/:id', adminController.getPropertyDetail);
router.post('/properties', adminController.createProperty);
router.put('/properties/:id', adminController.updateProperty);
router.delete('/properties/:id', adminController.deleteProperty);

router.get('/finance/stats', adminController.getFinanceStats);
router.get('/finance/payouts', adminController.getAllPayouts);
router.patch('/finance/payouts/:id/pay', adminController.markPayoutAsPaid);
router.post('/finance/refund/:bookingId', adminController.processRefund);

router.get('/bookings', adminController.getAllBookings);
router.patch('/bookings/:id/status', adminController.updateBookingStatus);
router.delete('/bookings/:id', adminController.deleteBooking);
router.get('/support', adminController.getAllSupportTickets);
router.get('/support/:id', adminController.getSupportTicketDetail);
router.patch('/support/:id/metadata', adminController.updateTicketMetadata);
router.post('/support/:id/activity', adminController.addTicketActivity);
router.delete('/support/:id', adminController.deleteTicket);
router.patch('/support/:id/resolve', adminController.resolveSupportTicket);
router.get('/notifications', adminController.getNotifications);
router.get('/search', adminController.globalSearch);

module.exports = router;
