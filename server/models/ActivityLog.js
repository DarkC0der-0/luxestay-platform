const db = require('../config/db');

const ActivityLog = {
  create: async ({ type, message, actorId = null, metadata = null }) => {
    try {
      const { rows } = await db.query(
        'INSERT INTO activity_log (type, message, actor_id, metadata) VALUES ($1, $2, $3, $4) RETURNING *',
        [type, message, actorId, metadata ? JSON.stringify(metadata) : null]
      );
      return rows[0];
    } catch (error) {
      console.error('Failed to log system activity in model:', error);
      return null;
    }
  },

  findRecent: async (limit = 5) => {
    const { rows } = await db.query(`
      SELECT type, message, created_at 
      FROM activity_log 
      ORDER BY created_at DESC 
      LIMIT $1
    `, [limit]);
    return rows;
  },

  findRecentByUser: async (userId, userEmail, limit = 5) => {
    const { rows } = await db.query(`
      (SELECT 'booking' as type, b.created_at, 'Booked ' || p.title as description, b.total_price as val
       FROM bookings b JOIN properties p ON b.property_id = p.id WHERE b.guest_id = $1)
      UNION ALL
      (SELECT 'listing' as type, created_at, 'Listed ' || title as description, price_per_night as val
       FROM properties WHERE host_id = $1)
      UNION ALL
      (SELECT 'support' as type, created_at, 'Subject: ' || subject as description, NULL as val
       FROM support_tickets WHERE email = $2)
      ORDER BY created_at DESC LIMIT $3
    `, [userId, userEmail, limit]);
    return rows;
  }
};

module.exports = ActivityLog;
