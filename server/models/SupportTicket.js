const db = require('../config/db');

const SupportTicket = {
  create: async ({ name, email, subject, message, category = 'General', priority = 'medium', status = 'open' }) => {
    const { rows } = await db.query(
      `INSERT INTO support_tickets (name, email, subject, message, category, priority, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, email, subject, message, category, priority, status]
    );
    return rows[0];
  },

  findAll: async () => {
    const { rows } = await db.query(`
      SELECT id, name, email, subject, message, status, category, priority, created_at
      FROM support_tickets
      ORDER BY created_at DESC
    `);
    return rows;
  },

  findById: async (id) => {
    const { rows } = await db.query('SELECT * FROM support_tickets WHERE id = $1', [id]);
    return rows[0];
  },

  getActivitiesByTicketId: async (ticketId) => {
    const { rows } = await db.query(`
      SELECT a.*, u.name as admin_name 
      FROM support_ticket_activities a
      LEFT JOIN users u ON a.admin_id = u.id
      WHERE a.ticket_id = $1
      ORDER BY a.created_at ASC
    `, [ticketId]);
    return rows;
  },

  updateMetadata: async (id, { category, priority, status }) => {
    const { rows } = await db.query(`
      UPDATE support_tickets 
      SET category = COALESCE($1, category), 
          priority = COALESCE($2, priority),
          status = COALESCE($3, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 
      RETURNING *
    `, [category, priority, status, id]);
    return rows[0];
  },

  addActivity: async ({ ticketId, adminId, content, type }) => {
    const { rows } = await db.query(`
      INSERT INTO support_ticket_activities (ticket_id, admin_id, content, type)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [ticketId, adminId, content, type]);
    return rows[0];
  },

  delete: async (id) => {
    const { rows } = await db.query('DELETE FROM support_tickets WHERE id = $1 RETURNING *', [id]);
    return rows[0];
  },

  resolve: async (id) => {
    const { rows } = await db.query(
      "UPDATE support_tickets SET status = 'resolved' WHERE id = $1 RETURNING *",
      [id]
    );
    return rows[0];
  },

  findRecent: async (limit = 5) => {
    const { rows } = await db.query(`
      SELECT id, name, subject, created_at 
      FROM support_tickets
      ORDER BY created_at DESC
      LIMIT $1
    `, [limit]);
    return rows;
  }
};

module.exports = SupportTicket;
