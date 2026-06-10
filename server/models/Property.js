// server/models/Property.js
const db = require('../config/db');

const Property = {
  findAll: async (filters = {}) => {
    let query = 'SELECT * FROM properties WHERE 1=1';
    const values = [];
    let count = 1;

    if (filters.location) {
      query += ` AND location ILIKE $${count}`;
      values.push(`%${filters.location}%`);
      count++;
    }
    if (filters.minPrice) {
      query += ` AND price_per_night >= $${count}`;
      values.push(filters.minPrice);
      count++;
    }
    if (filters.maxPrice) {
      query += ` AND price_per_night <= $${count}`;
      values.push(filters.maxPrice);
      count++;
    }
    if (filters.property_type) {
      query += ` AND property_type = $${count}`;
      values.push(filters.property_type);
      count++;
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${count}`;
      values.push(filters.limit);
      count++;
    }
    if (filters.offset) {
      query += ` OFFSET $${count}`;
      values.push(filters.offset);
      count++;
    }

    const { rows } = await db.query(query, values);
    return rows;
  },

  findById: async (id) => {
    const query = `
      SELECT p.*, u.name as host_name, u.email as host_email, u.role as host_role, u.avatar_url as host_avatar
      FROM properties p
      JOIN users u ON p.host_id = u.id
      WHERE p.id = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },

  findByHostId: async (hostId) => {
    const { rows } = await db.query('SELECT * FROM properties WHERE host_id = $1 ORDER BY created_at DESC', [hostId]);
    return rows;
  },

  create: async ({ host_id, title, description, location, price_per_night, property_type, image_urls, bedrooms, bathrooms, max_guests }) => {
    const { rows } = await db.query(
      'INSERT INTO properties (host_id, title, description, location, price_per_night, property_type, image_urls, bedrooms, bathrooms, max_guests) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [host_id, title, description, location, price_per_night, property_type, image_urls, bedrooms || 1, bathrooms || 1, max_guests || 2]
    );
    return rows[0];
  },

  update: async (id, { title, description, location, price_per_night, property_type, image_urls, bedrooms, bathrooms, max_guests }) => {
    const { rows } = await db.query(
      'UPDATE properties SET title = $1, description = $2, location = $3, price_per_night = $4, property_type = $5, image_urls = $6, bedrooms = $7, bathrooms = $8, max_guests = $9 WHERE id = $10 RETURNING *',
      [title, description, location, price_per_night, property_type, image_urls, bedrooms, bathrooms, max_guests, id]
    );
    return rows[0];
  },

  delete: async (id) => {
    await db.query('DELETE FROM properties WHERE id = $1', [id]);
  },

  getUniqueLocations: async () => {
    const { rows } = await db.query('SELECT DISTINCT location FROM properties ORDER BY location ASC');
    return rows.map(row => row.location);
  },

  // Admin and Search Extended Methods
  findAllAdmin: async () => {
    const { rows } = await db.query(`
      SELECT p.id, p.title, p.price_per_night as price, p.location as city, p.status, p.host_id, u.name as host_name, p.created_at
      FROM properties p
      LEFT JOIN users u ON p.host_id = u.id
      ORDER BY p.created_at DESC
    `);
    return rows;
  },

  updateAdmin: async (id, { host_id, title, description, location, price_per_night, property_type, image_urls, bedrooms, bathrooms, max_guests }) => {
    const { rows } = await db.query(
      `UPDATE properties 
       SET host_id = $1,
           title = $2, 
           description = $3, 
           location = $4, 
           price_per_night = $5, 
           property_type = $6, 
           image_urls = $7, 
           bedrooms = $8, 
           bathrooms = $9, 
           max_guests = $10 
       WHERE id = $11 RETURNING *`,
      [host_id, title, description, location, price_per_night, property_type, image_urls, bedrooms, bathrooms, max_guests, id]
    );
    return rows[0];
  },

  countAll: async () => {
    const { rows } = await db.query('SELECT COUNT(*) FROM properties');
    return parseInt(rows[0].count) || 0;
  },

  globalSearch: async (queryStr, limit = 3) => {
    const { rows } = await db.query(
      'SELECT id, title, location FROM properties WHERE title ILIKE $1 OR location ILIKE $1 LIMIT $2',
      [queryStr, limit]
    );
    return rows;
  }
};

module.exports = Property;
