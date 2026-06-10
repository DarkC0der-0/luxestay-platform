const db = require('../config/db');

const Setting = {
  getByKey: async (key) => {
    const { rows } = await db.query('SELECT value FROM platform_settings WHERE key = $1', [key]);
    return rows[0]?.value;
  },

  getAll: async () => {
    const { rows } = await db.query('SELECT key, value FROM platform_settings ORDER BY key');
    return rows;
  },

  update: async (key, value, updatedBy) => {
    const jsonValue = JSON.stringify(value);
    const { rows } = await db.query(
      `INSERT INTO platform_settings (key, value, updated_by) VALUES ($1, $2::jsonb, $3)
       ON CONFLICT (key) DO UPDATE SET value = $2::jsonb, updated_at = CURRENT_TIMESTAMP, updated_by = $3
       RETURNING *`,
      [key, jsonValue, updatedBy]
    );
    return rows[0];
  }
};

module.exports = Setting;
