// server/models/Location.js
const db = require('../config/db');

const Location = {
  findAll: async () => {
    const { rows } = await db.query('SELECT full_name FROM locations ORDER BY full_name ASC');
    return rows.map(row => row.full_name);
  },

  create: async ({ city, province, country, full_name }) => {
    const { rows } = await db.query(
      'INSERT INTO locations (city, province, country, full_name) VALUES ($1, $2, $3, $4) ON CONFLICT (full_name) DO NOTHING RETURNING *',
      [city, province, country, full_name]
    );
    return rows[0];
  },
};

module.exports = Location;
