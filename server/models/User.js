// server/models/User.js
const db = require('../config/db');

const User = {
  findByEmail: async (email) => {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
  },

  findById: async (id) => {
    const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0];
  },

  findSecurityStatusById: async (id) => {
    const { rows } = await db.query('SELECT role, is_suspended, created_at FROM users WHERE id = $1', [id]);
    return rows[0];
  },

  findAll: async () => {
    const { rows } = await db.query(
      'SELECT id, name, email, role, is_suspended, created_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  },

  create: async ({ name, email, password_hash, role }) => {
    const { rows } = await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, password_hash, role]
    );
    return rows[0];
  },

  update: async (id, { name, email, avatar_url }) => {
    const { rows } = await db.query(
      'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), avatar_url = COALESCE($3, avatar_url) WHERE id = $4 RETURNING id, name, email, role, avatar_url, created_at',
      [name, email, avatar_url, id]
    );
    return rows[0];
  },

  updatePassword: async (id, hashedPassword) => {
    const { rows } = await db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id',
      [hashedPassword, id]
    );
    return rows[0];
  },

  updateRole: async (id, role) => {
    const { rows } = await db.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
      [role, id]
    );
    return rows[0];
  },

  toggleSuspension: async (id, isSuspended) => {
    const { rows } = await db.query(
      'UPDATE users SET is_suspended = $1 WHERE id = $2 RETURNING id, name, email, role, is_suspended',
      [isSuspended, id]
    );
    return rows[0];
  },

  delete: async (id) => {
    const { rows } = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    return rows[0];
  },

  countAll: async () => {
    const { rows } = await db.query('SELECT COUNT(*) FROM users');
    return parseInt(rows[0].count) || 0;
  },

  globalSearch: async (queryStr, limit = 3) => {
    const { rows } = await db.query(
      'SELECT id, name, email, role FROM users WHERE name ILIKE $1 OR email ILIKE $1 LIMIT $2',
      [queryStr, limit]
    );
    return rows;
  }
};

module.exports = User;
