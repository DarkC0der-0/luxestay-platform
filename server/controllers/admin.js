const catchAsync = require('../utils/catchAsync');
const bcrypt = require('bcrypt');
const db = require('../config/db'); // kept only for direct transaction client pools
const { logActivity } = require('../utils/activityLogger');

const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Payout = require('../models/Payout');
const Setting = require('../models/Setting');
const SupportTicket = require('../models/SupportTicket');
const ActivityLog = require('../models/ActivityLog');

exports.getAccountProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });
  
  res.json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
      created_at: user.created_at
    }
  });
});

exports.updateAccountProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { name, email, avatar_url } = req.body;

  const updatedUser = await User.update(userId, { name, email, avatar_url });

  // Log admin profile update activity
  await logActivity(
    'user',
    `Administrator profile updated: ${updatedUser.name} (${updatedUser.email})`,
    userId,
    { userId }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar_url: updatedUser.avatar_url
    }
  });
});

exports.updateAccountPassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Verify current password
  const user = await User.findById(userId);
  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  
  if (!isMatch) {
    return res.status(401).json({ success: false, error: 'Incorrect current password' });
  }

  // Hash and save new password
  const hashed = await bcrypt.hash(newPassword, 10);
  await User.updatePassword(userId, hashed);

  // Log admin password update activity
  await logActivity(
    'user',
    `Administrator security credentials updated`,
    userId,
    { userId }
  );

  res.json({ success: true, message: 'Security credentials updated successfully' });
});

exports.getSettings = catchAsync(async (req, res, next) => {
  const settingsRows = await Setting.getAll();
  const settings = {};
  settingsRows.forEach(row => {
    settings[row.key] = row.value;
  });
  res.json({ success: true, data: settings });
});

exports.updateSetting = catchAsync(async (req, res, next) => {
  const { key, value } = req.body;
  const allowedKeys = ['platform_fee', 'site_name', 'maintenance_mode', 'allow_registrations', 'support_email'];

  if (!allowedKeys.includes(key)) {
    return res.status(400).json({ success: false, error: `Unknown setting key: ${key}` });
  }

  const updatedSetting = await Setting.update(key, value, req.user.id);

  // Log platform settings update activity
  await logActivity(
    'setting',
    `Platform configuration updated: "${key}" changed to ${JSON.stringify(value)}`,
    req.user.id,
    { key, value }
  );

  res.json({ success: true, message: 'Platform setting updated', data: updatedSetting });
});

exports.getDashboardStats = catchAsync(async (req, res, next) => {
  // Aggregate stats via Models
  const totalUsers = await User.countAll();
  const totalProperties = await Property.countAll();
  const totalBookings = await Booking.countAll();
  const totalRevenue = await Payout.getTotalRevenue();

  const recentBookings = await Booking.findRecent(5);
  const recentActivities = await ActivityLog.findRecent(5);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalProperties,
      totalBookings,
      totalRevenue,
      recentBookings,
      recentActivities
    }
  });
});

exports.getFinanceStats = catchAsync(async (req, res, next) => {
  const stats = await Payout.getFinanceStats();
  const monthlyRevenue = await Payout.getMonthlyRevenue();

  res.json({
    success: true,
    data: {
      summary: stats,
      chartData: monthlyRevenue
    }
  });
});

exports.getAllPayouts = catchAsync(async (req, res, next) => {
  const payouts = await Payout.findAllAdmin();
  res.json({ success: true, data: payouts });
});

exports.markPayoutAsPaid = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Fetch host and payout details
  const details = await Payout.findDetailsById(id);
  const hostName = details?.host_name || 'Host';
  const amount = details?.amount || 0;

  const updatedPayout = await Payout.markAsPaid(id);
  if (!updatedPayout) return res.status(404).json({ success: false, error: 'Payout not found' });

  // Log payout completed activity
  await logActivity(
    'payout',
    `Payout of $${Number(amount).toLocaleString()} completed for host ${hostName}`,
    req.user.id,
    { payoutId: id, amount }
  );

  res.json({ success: true, message: 'Payout marked as paid', data: updatedPayout });
});

exports.processRefund = catchAsync(async (req, res, next) => {
  const { bookingId } = req.params;

  // Fetch booking details before cancellation/refund
  const details = await Booking.findDetailsForActivity(bookingId);
  const guestName = details?.guest_name || 'Guest';
  const propertyTitle = details?.property_title || 'Property';
  const totalPrice = details?.total_price || 0;
  
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Update Booking Status
    const booking = await Booking.updateStatus(bookingId, 'cancelled', client);

    if (!booking) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // 2. Update Payout Status
    await Payout.cancelByBookingId(bookingId, client);

    // Log refund processed activity
    await logActivity(
      'booking',
      `Refund processed: Reservation for ${guestName} at "${propertyTitle}" cancelled ($${Number(totalPrice).toLocaleString()} refunded)`,
      req.user.id,
      { bookingId }
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Refund processed and booking cancelled' });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.findAll();
  res.json({
    success: true,
    data: users
  });
});

exports.getUserDetail = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  // 1. Core Platform Stats
  const { rows: bookingStats } = await db.query(`
    SELECT 
      COUNT(*) as total_count, 
      SUM(CASE WHEN status = 'confirmed' THEN total_price ELSE 0 END) as lifetime_spend
    FROM bookings 
    WHERE guest_id = $1
  `, [id]);

  const { rows: hostStats } = await db.query(`
    SELECT 
      COUNT(*) as property_count,
      (SELECT SUM(amount + platform_fee) FROM payouts WHERE host_id = $1 AND status != 'cancelled') as gross_generated
    FROM properties 
    WHERE host_id = $1
  `, [id]);

  // 2. Recent Activity Feed (Unified)
  const activities = await ActivityLog.findRecentByUser(id, user.email, 5);

  res.json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
      is_suspended: user.is_suspended,
      created_at: user.created_at,
      analytics: {
        guest: {
          totalBookings: parseInt(bookingStats[0].total_count) || 0,
          lifetimeSpend: parseFloat(bookingStats[0].lifetime_spend || 0)
        },
        host: {
          totalProperties: parseInt(hostStats[0].property_count) || 0,
          grossGenerated: parseFloat(hostStats[0].gross_generated || 0)
        },
        recentActivity: activities,
        lastActive: activities[0]?.created_at || user.created_at
      }
    }
  });
});

exports.updateUserRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;
  
  const updatedUser = await User.updateRole(id, role);
  
  if (!updatedUser) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  // Log user role update activity
  await logActivity(
    'user',
    `User role updated: access level for ${updatedUser.name} set to "${role}"`,
    req.user.id,
    { userId: id, role }
  );
  
  res.json({
    success: true,
    message: 'User role updated successfully',
    data: updatedUser
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  // Start transaction to handle related data
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    // Delete bookings and messages associated with the host's properties first to prevent ON DELETE RESTRICT violations
    await client.query('DELETE FROM bookings WHERE property_id IN (SELECT id FROM properties WHERE host_id = $1)', [id]);
    await client.query('DELETE FROM messages WHERE property_id IN (SELECT id FROM properties WHERE host_id = $1)', [id]);
    
    await client.query('DELETE FROM users WHERE id = $1', [id]);
    
    // Log user deletion activity
    await logActivity(
      'user',
      `User account permanently deleted: ${user.name} (${user.email})`,
      req.user.id,
      { userId: id, name: user.name, email: user.email }
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'User and all associated data deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

exports.toggleUserSuspension = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { is_suspended } = req.body;
  
  const updatedUser = await User.toggleSuspension(id, is_suspended);
  
  if (!updatedUser) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  // Log user suspension status change
  await logActivity(
    'user',
    `Account status updated: ${updatedUser.name} was ${is_suspended ? 'suspended' : 'reactivated'}`,
    req.user.id,
    { userId: id, is_suspended }
  );
  
  res.json({
    success: true,
    message: `User ${is_suspended ? 'suspended' : 'activated'} successfully`,
    data: updatedUser
  });
});

exports.getAllProperties = catchAsync(async (req, res, next) => {
  const properties = await Property.findAllAdmin();
  res.json({ success: true, data: properties });
});

exports.getPropertyDetail = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const property = await Property.findById(id);
  if (!property) {
    return res.status(404).json({ success: false, error: 'Property not found' });
  }
  res.json({ success: true, data: property });
});

exports.createProperty = catchAsync(async (req, res, next) => {
  const { host_id, title, description, location, price_per_night, property_type, image_urls, bedrooms, bathrooms, max_guests } = req.body;
  
  if (!title || !location || !price_per_night) {
    return res.status(400).json({ success: false, error: 'Missing required fields (title, location, price_per_night)' });
  }

  const hostId = host_id || req.user.id;
  
  // Format image_urls: make sure it is a list
  let images = ['/placeholder.png'];
  if (Array.isArray(image_urls) && image_urls.length > 0) {
    images = image_urls;
  } else if (typeof image_urls === 'string' && image_urls.trim() !== '') {
    images = image_urls.split(',').map(img => img.trim()).filter(Boolean);
  }

  const newProperty = await Property.create({
    host_id: hostId,
    title,
    description: description || '',
    location,
    price_per_night: parseFloat(price_per_night),
    property_type: property_type || 'Apartment',
    image_urls: images,
    bedrooms: parseInt(bedrooms) || 1,
    bathrooms: parseInt(bathrooms) || 1,
    max_guests: parseInt(max_guests) || 2
  });
  
  // Fetch host name for logs
  const host = await User.findById(hostId);
  const hostName = host?.name || 'Host';

  // Log property creation by admin
  await logActivity(
    'property',
    `Listing added: "${title}" by ${hostName} (via Admin)`,
    req.user.id,
    { propertyId: newProperty.id }
  );

  res.status(201).json({ success: true, data: newProperty });
});

exports.updateProperty = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { host_id, title, description, location, price_per_night, property_type, image_urls, bedrooms, bathrooms, max_guests } = req.body;
  
  if (!title || !location || !price_per_night) {
    return res.status(400).json({ success: false, error: 'Missing required fields (title, location, price_per_night)' });
  }

  let images = ['/placeholder.png'];
  if (Array.isArray(image_urls) && image_urls.length > 0) {
    images = image_urls;
  } else if (typeof image_urls === 'string' && image_urls.trim() !== '') {
    images = image_urls.split(',').map(img => img.trim()).filter(Boolean);
  }

  const hostId = host_id || req.user.id;

  const updatedProperty = await Property.updateAdmin(id, {
    host_id: hostId,
    title,
    description: description || '',
    location,
    price_per_night: parseFloat(price_per_night),
    property_type: property_type || 'Apartment',
    image_urls: images,
    bedrooms: parseInt(bedrooms) || 1,
    bathrooms: parseInt(bathrooms) || 1,
    max_guests: parseInt(max_guests) || 2
  });
  
  if (!updatedProperty) {
    return res.status(404).json({ success: false, error: 'Property not found' });
  }

  // Log property update by admin
  await logActivity(
    'property',
    `Listing updated: "${title}" (via Admin)`,
    req.user.id,
    { propertyId: id }
  );
  
  res.json({ success: true, data: updatedProperty });
});

exports.deleteProperty = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Fetch property details before deletion for logs
  const property = await Property.findById(id);
  if (!property) {
    return res.status(404).json({ success: false, error: 'Property not found' });
  }
  
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM bookings WHERE property_id = $1', [id]);
    await client.query('DELETE FROM messages WHERE property_id = $1', [id]);
    
    await client.query('DELETE FROM properties WHERE id = $1', [id]);
    
    // Log property deletion by admin
    await logActivity(
      'property',
      `Listing deleted: "${property.title}" (via Admin)`,
      req.user.id,
      { propertyId: id }
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Property and its associated bookings/messages deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

exports.getAllBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.findAllAdmin();
  res.json({ success: true, data: bookings });
});

exports.updateBookingStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  // Fetch guest name and property title for details
  const details = await Booking.findDetailsForActivity(id);
  const guestName = details?.guest_name || 'Guest';
  const propertyTitle = details?.property_title || 'Property';
  
  const updatedBooking = await Booking.updateStatus(id, status);
  if (!updatedBooking) {
    return res.status(404).json({ success: false, error: 'Booking not found' });
  }

  // Log booking status update activity
  await logActivity(
    'booking',
    `Booking status updated: Reservation for ${guestName} at "${propertyTitle}" set to "${status}"`,
    req.user.id,
    { bookingId: id, status }
  );
  
  res.json({
    success: true,
    message: 'Booking status updated successfully',
    data: updatedBooking
  });
});

exports.deleteBooking = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Fetch guest name and property title for details
  const details = await Booking.findDetailsForActivity(id);
  const guestName = details?.guest_name || 'Guest';
  const propertyTitle = details?.property_title || 'Property';
  
  const deleted = await Booking.delete(id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Booking not found' });
  }

  // Log booking deletion activity
  await logActivity(
    'booking',
    `Booking deleted: Reservation for ${guestName} at "${propertyTitle}" was removed`,
    req.user.id,
    { bookingId: id }
  );
  
  res.json({
    success: true,
    message: 'Booking deleted successfully'
  });
});

exports.getAllSupportTickets = catchAsync(async (req, res, next) => {
  const tickets = await SupportTicket.findAll();
  res.json({ success: true, data: tickets });
});

exports.getSupportTicketDetail = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const ticket = await SupportTicket.findById(id);
  if (!ticket) {
    return res.status(404).json({ success: false, error: 'Ticket not found' });
  }

  // Fetch activities (replies and notes)
  const activities = await SupportTicket.getActivitiesByTicketId(id);

  // Fetch user intelligence link
  const user = await User.findByEmail(ticket.email);

  res.json({ 
    success: true, 
    data: { 
      ...ticket, 
      activities,
      user_id: user?.id || null 
    } 
  });
});

exports.updateTicketMetadata = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { category, priority, status } = req.body;
  
  const updatedTicket = await SupportTicket.updateMetadata(id, { category, priority, status });
  if (!updatedTicket) return res.status(404).json({ success: false, error: 'Ticket not found' });

  // Log ticket metadata update/resolution/closure activity
  let logMsg = `Support ticket updated: "${updatedTicket.subject}" (Ticket by ${updatedTicket.name})`;
  if (status && status === 'resolved') {
    logMsg = `Support ticket resolved: "${updatedTicket.subject}" by ${updatedTicket.name}`;
  } else if (status) {
    logMsg = `Support ticket status updated: "${updatedTicket.subject}" marked as ${status}`;
  } else if (priority) {
    logMsg = `Support ticket priority updated: "${updatedTicket.subject}" set to ${priority}`;
  } else if (category) {
    logMsg = `Support ticket category updated: "${updatedTicket.subject}" set to ${category}`;
  }

  await logActivity(
    'support',
    logMsg,
    req.user.id,
    { ticketId: id, category, priority, status }
  );
  
  res.json({ success: true, message: 'Ticket updated successfully', data: updatedTicket });
});

exports.addTicketActivity = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { content, type } = req.body; // type: 'reply' or 'note'
  const adminId = req.user.id;

  const ticket = await SupportTicket.findById(id);
  if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });
  const senderName = ticket.name || 'User';
  const subject = ticket.subject || 'Inquiry';

  const activity = await SupportTicket.addActivity({ ticketId: id, adminId, content, type });

  // Log support reply activity
  await logActivity(
    'support',
    `Admin reply added: "${subject}" (Ticket by ${senderName})`,
    req.user.id,
    { ticketId: id, activityType: type }
  );

  res.json({ success: true, message: type === 'reply' ? 'Reply sent' : 'Note added', data: activity });
});

exports.deleteTicket = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const ticket = await SupportTicket.findById(id);
  if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });
  const senderName = ticket.name || 'User';
  const subject = ticket.subject || 'Inquiry';

  await SupportTicket.delete(id);

  // Log support ticket deletion activity
  await logActivity(
    'support',
    `Support ticket deleted: "${subject}" by ${senderName}`,
    req.user.id,
    { ticketId: id }
  );

  res.json({ success: true, message: 'Ticket deleted successfully' });
});

exports.resolveSupportTicket = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const ticket = await SupportTicket.resolve(id);
  if (!ticket) {
    return res.status(404).json({ success: false, error: 'Ticket not found' });
  }

  // Log support ticket resolution activity
  await logActivity(
    'support',
    `Support ticket resolved: "${ticket.subject}" by ${ticket.name}`,
    req.user.id,
    { ticketId: id }
  );
  
  res.json({
    success: true,
    message: 'Ticket resolved successfully',
    data: ticket
  });
});

exports.getNotifications = catchAsync(async (req, res, next) => {
  const recentBookings = await Booking.findRecent(5);
  const recentTickets = await SupportTicket.findRecent(5);

  const notifications = [
    ...recentBookings.map(b => ({
      id: `booking-${b.id}`,
      type: 'booking',
      title: 'New Reservation',
      message: `${b.guest_name} booked a stay for $${Number(b.total_price).toLocaleString()}`,
      created_at: b.created_at
    })),
    ...recentTickets.map(t => ({
      id: `support-${t.id}`,
      type: 'support',
      title: 'Support Inquiry',
      message: `New ticket from ${t.name}: "${t.subject}"`,
      created_at: t.created_at
    }))
  ];

  // Sort merged list by date descending
  notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json({
    success: true,
    data: notifications.slice(0, 8)
  });
});

exports.globalSearch = catchAsync(async (req, res, next) => {
  const { q } = req.query;
  if (!q || q.trim() === '') {
    return res.json({ success: true, data: { properties: [], users: [], bookings: [] } });
  }
  const query = `%${q}%`;

  const properties = await Property.globalSearch(query, 3);
  const users = await User.globalSearch(query, 3);
  const bookings = await Booking.globalSearch(query, 3);

  res.json({
    success: true,
    data: {
      properties,
      users,
      bookings
    }
  });
});
