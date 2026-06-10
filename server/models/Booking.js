// server/models/Booking.js
const db = require('../config/db');

const Booking = {
  create: async ({ property_id, guest_id, check_in, check_out, total_price, payment_intent_id }, client = db) => {
    const { rows } = await client.query(
      'INSERT INTO bookings (property_id, guest_id, check_in, check_out, total_price, payment_intent_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [property_id, guest_id, check_in, check_out, total_price, payment_intent_id]
    );
    return rows[0];
  },

  findByGuestId: async (guestId) => {
    const { rows } = await db.query(
      `SELECT 
         b.*, 
         p.title as property_name, 
         p.location, 
         p.image_urls, 
         u.name as host_name, 
         u.id as host_id, 
         u.avatar_url as host_avatar,
         (
           SELECT m.content 
           FROM messages m
           WHERE m.property_id = b.property_id
           AND ((m.sender_id = b.guest_id AND m.receiver_id = p.host_id) OR (m.sender_id = p.host_id AND m.receiver_id = b.guest_id))
           ORDER BY m.created_at DESC
           LIMIT 1
         ) AS last_message_content,
         (
           SELECT m.created_at 
           FROM messages m
           WHERE m.property_id = b.property_id
           AND ((m.sender_id = b.guest_id AND m.receiver_id = p.host_id) OR (m.sender_id = p.host_id AND m.receiver_id = b.guest_id))
           ORDER BY m.created_at DESC
           LIMIT 1
         ) AS last_message_time,
         (
           SELECT COUNT(*) 
           FROM messages m
           WHERE m.property_id = b.property_id
           AND ((m.sender_id = b.guest_id AND m.receiver_id = p.host_id) OR (m.sender_id = p.host_id AND m.receiver_id = b.guest_id))
         ) AS message_count
       FROM bookings b 
       JOIN properties p ON b.property_id = p.id 
       JOIN users u ON p.host_id = u.id
       WHERE b.guest_id = $1 
       ORDER BY COALESCE((
         SELECT m.created_at 
         FROM messages m
         WHERE m.property_id = b.property_id
         AND ((m.sender_id = b.guest_id AND m.receiver_id = p.host_id) OR (m.sender_id = p.host_id AND m.receiver_id = b.guest_id))
         ORDER BY m.created_at DESC
         LIMIT 1
       ), b.created_at) DESC`,
      [guestId]
    );
    return rows;
  },

  findByHostId: async (hostId) => {
    const { rows } = await db.query(
      `SELECT 
         b.*, 
         p.title as property_name, 
         p.location, 
         p.image_urls, 
         u.name as guest_name, 
         u.email as guest_email, 
         u.avatar_url as guest_avatar,
         (
           SELECT m.content 
           FROM messages m
           WHERE m.property_id = b.property_id
           AND ((m.sender_id = b.guest_id AND m.receiver_id = p.host_id) OR (m.sender_id = p.host_id AND m.receiver_id = b.guest_id))
           ORDER BY m.created_at DESC
           LIMIT 1
         ) AS last_message_content,
         (
           SELECT m.created_at 
           FROM messages m
           WHERE m.property_id = b.property_id
           AND ((m.sender_id = b.guest_id AND m.receiver_id = p.host_id) OR (m.sender_id = p.host_id AND m.receiver_id = b.guest_id))
           ORDER BY m.created_at DESC
           LIMIT 1
         ) AS last_message_time,
         (
           SELECT COUNT(*) 
           FROM messages m
           WHERE m.property_id = b.property_id
           AND ((m.sender_id = b.guest_id AND m.receiver_id = p.host_id) OR (m.sender_id = p.host_id AND m.receiver_id = b.guest_id))
         ) AS message_count
       FROM bookings b 
       JOIN properties p ON b.property_id = p.id 
       JOIN users u ON b.guest_id = u.id 
       WHERE p.host_id = $1 
       ORDER BY COALESCE((
         SELECT m.created_at 
         FROM messages m
         WHERE m.property_id = b.property_id
         AND ((m.sender_id = b.guest_id AND m.receiver_id = p.host_id) OR (m.sender_id = p.host_id AND m.receiver_id = b.guest_id))
         ORDER BY m.created_at DESC
         LIMIT 1
       ), b.created_at) DESC`,
      [hostId]
    );
    return rows;
  },

  updateStatus: async (id, status, client = db) => {
    const { rows } = await client.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return rows[0];
  },

  delete: async (id) => {
    const { rowCount } = await db.query('DELETE FROM bookings WHERE id = $1', [id]);
    return rowCount > 0;
  },

  findAvailabilityByPropertyId: async (propertyId) => {
    const { rows } = await db.query(
      `SELECT check_in, check_out 
       FROM bookings 
       WHERE property_id = $1 AND check_out >= CURRENT_DATE 
       ORDER BY check_in ASC`,
      [propertyId]
    );
    return rows;
  },

  // Admin and Search Extended Methods
  findAllAdmin: async () => {
    const { rows } = await db.query(`
      SELECT b.id, b.property_id, p.title as property_title, b.guest_id, u.name as guest_name, 
             b.check_in AS start_date, b.check_out AS end_date, b.total_price, b.status, b.created_at
      FROM bookings b
      LEFT JOIN properties p ON b.property_id = p.id
      LEFT JOIN users u ON b.guest_id = u.id
      ORDER BY b.created_at DESC
    `);
    return rows;
  },

  countAll: async () => {
    const { rows } = await db.query('SELECT COUNT(*) FROM bookings');
    return parseInt(rows[0].count) || 0;
  },

  findRecent: async (limit = 5) => {
    const { rows } = await db.query(`
      SELECT b.id, b.total_price, b.status, b.created_at, u.name as guest_name, p.title as property_title
      FROM bookings b
      LEFT JOIN users u ON b.guest_id = u.id
      LEFT JOIN properties p ON b.property_id = p.id
      ORDER BY b.created_at DESC
      LIMIT $1
    `, [limit]);
    return rows;
  },

  findDetailsForActivity: async (id) => {
    const { rows } = await db.query(`
      SELECT u.name as guest_name, p.title as property_title, b.total_price 
      FROM bookings b
      JOIN users u ON b.guest_id = u.id
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = $1
    `, [id]);
    return rows[0];
  },

  globalSearch: async (queryStr, limit = 3) => {
    const { rows } = await db.query(
      `SELECT b.id, p.title as property_title, u.name as guest_name 
       FROM bookings b 
       LEFT JOIN properties p ON b.property_id = p.id
       LEFT JOIN users u ON b.guest_id = u.id
       WHERE p.title ILIKE $1 OR u.name ILIKE $1 LIMIT $2`,
      [queryStr, limit]
    );
    return rows;
  }
};

module.exports = Booking;
