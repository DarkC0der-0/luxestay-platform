const db = require('../config/db');

const Payout = {
  create: async ({ booking_id, host_id, amount, platform_fee, status = 'pending' }, client = db) => {
    const { rows } = await client.query(
      'INSERT INTO payouts (booking_id, host_id, amount, platform_fee, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [booking_id, host_id, amount, platform_fee, status]
    );
    return rows[0];
  },

  getTotalRevenue: async () => {
    const { rows } = await db.query("SELECT SUM(platform_fee) as fees FROM payouts WHERE status != 'cancelled'");
    return rows[0].fees || 0;
  },

  getFinanceStats: async () => {
    const { rows } = await db.query(`
      SELECT 
        SUM(CASE WHEN status != 'cancelled' THEN amount + platform_fee ELSE 0 END) as total_volume,
        SUM(CASE WHEN status = 'cancelled' THEN amount + platform_fee ELSE 0 END) as total_refunds,
        SUM(CASE WHEN status != 'cancelled' THEN platform_fee ELSE 0 END) as platform_fees,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_payouts,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as completed_payouts
      FROM payouts
    `);
    return rows[0];
  },

  getMonthlyRevenue: async () => {
    const { rows } = await db.query(`
      SELECT 
        TO_CHAR(created_at, 'Mon') as month,
        SUM(platform_fee) as amount,
        EXTRACT(MONTH FROM created_at) as month_num
      FROM payouts
      WHERE status != 'cancelled'
      GROUP BY month, month_num
      ORDER BY month_num
    `);
    return rows;
  },

  findAllAdmin: async () => {
    const { rows } = await db.query(`
      SELECT 
        pay.id, pay.amount, pay.platform_fee, pay.status, pay.paid_at, pay.created_at,
        u.name as host_name, u.email as host_email,
        p.title as property_title,
        b.id as booking_id
      FROM payouts pay
      JOIN users u ON pay.host_id = u.id
      JOIN bookings b ON pay.booking_id = b.id
      JOIN properties p ON b.property_id = p.id
      ORDER BY pay.created_at DESC
    `);
    return rows;
  },

  findDetailsById: async (id) => {
    const { rows } = await db.query(`
      SELECT pay.amount, u.name as host_name 
      FROM payouts pay
      JOIN users u ON pay.host_id = u.id
      WHERE pay.id = $1
    `, [id]);
    return rows[0];
  },

  markAsPaid: async (id) => {
    const { rows } = await db.query(
      "UPDATE payouts SET status = 'paid', paid_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id]
    );
    return rows[0];
  },

  cancelByBookingId: async (bookingId, client = db) => {
    const { rows } = await client.query(
      "UPDATE payouts SET status = 'cancelled' WHERE booking_id = $1 RETURNING *",
      [bookingId]
    );
    return rows;
  }
};

module.exports = Payout;
