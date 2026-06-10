// server/controllers/booking.js
const Booking = require('../models/Booking');
const db = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const { logActivity } = require('../utils/activityLogger');
const User = require('../models/User');
const Property = require('../models/Property');
const Setting = require('../models/Setting');
const Payout = require('../models/Payout');

exports.createBooking = async (req, res, next) => {
  // Check Maintenance Mode
  try {
    const inMaintenance = await Setting.getByKey('maintenance_mode') === true;
    if (inMaintenance) {
      return res.status(503).json({
        success: false,
        error: { code: 'MAINTENANCE_MODE', message: 'Platform is undergoing maintenance. Bookings are temporarily suspended.', status: 503 }
      });
    }
  } catch (err) {
    console.error('Failed to check maintenance settings:', err);
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    const { property_id, check_in, check_out, total_price, payment_intent_id } = req.body;
    const guest_id = req.user.id;

    const newBooking = await Booking.create({
      property_id,
      guest_id,
      check_in,
      check_out,
      total_price,
      payment_intent_id
    }, client);

    // Fetch guest name and property title/host details
    const user = await User.findById(guest_id);
    const property = await Property.findById(property_id);
    const guestName = user?.name || 'Guest';
    const propertyTitle = property?.title || 'Property';
    const hostId = property?.host_id;

    // Fetch dynamic platform fee rate from platform settings
    const platformFeePercent = await Setting.getByKey('platform_fee') ?? 10.0; // fallback to 10%
    const platformFee = parseFloat(total_price) * (parseFloat(platformFeePercent) / 100.0);
    const hostAmount = parseFloat(total_price) - platformFee;

    // Create the payout entry in the same transaction
    await Payout.create({
      booking_id: newBooking.id,
      host_id: hostId,
      amount: hostAmount,
      platform_fee: platformFee,
      status: 'pending'
    }, client);

    // Log the booking activity
    await logActivity(
      'booking',
      `New reservation: ${guestName} booked "${propertyTitle}" for $${Number(total_price).toLocaleString()}`,
      guest_id,
      { bookingId: newBooking.id }
    );

    await client.query('COMMIT');
    res.status(201).json(newBooking);
  } catch (error) {
    await client.query('ROLLBACK');
    // Forward to global error handler
    next(error);
  } finally {
    client.release();
  }
};

exports.getGuestBookings = catchAsync(async (req, res) => {
  const bookings = await Booking.findByGuestId(req.user.id);
  const formatted = bookings.map(b => ({
    id: b.id,
    property_id: b.property_id,
    guest_id: b.guest_id,
    check_in: b.check_in,
    check_out: b.check_out,
    total_price: b.total_price,
    // Add camelCase compatibility aliases for frontend dashboard
    startDate: b.check_in,
    endDate: b.check_out,
    totalPrice: b.total_price,
    status: b.status,
    payment_intent_id: b.payment_intent_id,
    created_at: b.created_at,
    lastMessageContent: b.last_message_content,
    lastMessageTime: b.last_message_time,
    messageCount: parseInt(b.message_count) || 0,
    // Add structured nested property expected by frontend
    property: {
      id: b.property_id,
      title: b.property_name,
      location: b.location,
      image: b.image_urls?.[0] || '/placeholder.png',
      host_id: {
        id: b.host_id,
        name: b.host_name,
        avatar_url: b.host_avatar
      }
    }
  }));
  res.json({ success: true, data: formatted, bookings: formatted });
});

exports.getHostBookings = catchAsync(async (req, res) => {
  const bookings = await Booking.findByHostId(req.user.id);
  const formatted = bookings.map(b => ({
    id: b.id,
    property_id: b.property_id,
    guest_id: b.guest_id,
    check_in: b.check_in,
    check_out: b.check_out,
    total_price: b.total_price,
    // Add camelCase compatibility aliases for frontend dashboard
    startDate: b.check_in,
    endDate: b.check_out,
    totalPrice: b.total_price,
    status: b.status,
    payment_intent_id: b.payment_intent_id,
    created_at: b.created_at,
    lastMessageContent: b.last_message_content,
    lastMessageTime: b.last_message_time,
    messageCount: parseInt(b.message_count) || 0,
    // Add nested user details expected by frontend when user is host
    user: {
      id: b.guest_id,
      name: b.guest_name,
      email: b.guest_email,
      avatar_url: b.guest_avatar
    },
    // Add nested property details expected by frontend when user is host
    property: {
      id: b.property_id,
      title: b.property_name,
      location: b.location,
      image: b.image_urls?.[0] || '/placeholder.png'
    }
  }));
  res.json({ success: true, data: formatted, bookings: formatted });
});

exports.getPropertyAvailability = catchAsync(async (req, res) => {
  const { id } = req.params; // property id
  const availability = await Booking.findAvailabilityByPropertyId(id);
  res.json({ success: true, availability });
});

exports.cancelBooking = catchAsync(async (req, res, next) => {
  const bookingId = req.params.id;
  const guestId = req.user.id;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch booking to check ownership and state
    const { rows: bookingRows } = await client.query(
      `SELECT b.*, p.title as property_title, p.host_id, u.name as guest_name
       FROM bookings b
       JOIN properties p ON b.property_id = p.id
       JOIN users u ON b.guest_id = u.id
       WHERE b.id = $1`,
      [bookingId]
    );

    if (bookingRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const booking = bookingRows[0];

    // Verify ownership
    if (booking.guest_id !== guestId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ success: false, error: 'Unauthorized to cancel this booking' });
    }

    // Verify status is conditional (can cancel if pending or confirmed)
    if (booking.status === 'cancelled') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'Booking is already cancelled' });
    }

    // 2. Update booking status to cancelled
    const { rows: updatedRows } = await client.query(
      `UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *`,
      [bookingId]
    );

    // 3. Update associated payout status to cancelled
    await client.query(
      `UPDATE payouts SET status = 'cancelled' WHERE booking_id = $1`,
      [bookingId]
    );

    // 4. Log the cancellation activity
    await logActivity(
      'booking_cancellation',
      `Booking cancelled by guest: ${booking.guest_name} cancelled reservation for "${booking.property_title}"`,
      guestId,
      { bookingId }
    );

    await client.query('COMMIT');
    res.json({ success: true, data: updatedRows[0], message: 'Booking successfully cancelled' });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});
