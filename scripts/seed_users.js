const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: './.env' });

const connectionString = process.env.DATABASE_URL;
const isLocal = connectionString && (
  connectionString.includes('localhost') || 
  connectionString.includes('127.0.0.1') || 
  connectionString.includes('db:5432') ||
  process.env.DB_SSL === 'false'
);

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

const seedUsers = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to DB. Seeding users...');

    const passwordHash = await bcrypt.hash('Password123!', 10);

    const users = [
      { name: 'System Admin', email: 'admin@luxestay.com', role: 'admin' },
      { name: 'Premium Host', email: 'host@luxestay.com', role: 'host' },
      { name: 'Test Guest', email: 'guest@luxestay.com', role: 'guest' }
    ];

    for (const user of users) {
      // Check if exists
      const { rows } = await client.query('SELECT id FROM users WHERE email = $1', [user.email]);
      if (rows.length === 0) {
        await client.query(
          'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
          [user.name, user.email, passwordHash, user.role]
        );
        console.log(`Created ${user.role} user: ${user.email}`);
      } else {
        console.log(`User ${user.email} already exists. Skipping.`);
      }
    }

    console.log('Seeding complete!');
    client.release();
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await pool.end();
  }
};

seedUsers();
