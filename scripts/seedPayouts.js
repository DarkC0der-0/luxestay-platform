const { Pool } = require('pg');
require('dotenv').config();

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

async function seedPayouts() {
  const client = await pool.connect();
  try {
    console.log('Syncing payouts with existing bookings and spreading over time...');

    // Clear existing payouts for a clean analytics set
    await client.query('DELETE FROM payouts');

    // Fetch all bookings and their property hosts
    const { rows: bookings } = await client.query(`
      SELECT b.id, b.total_price, b.status, p.host_id 
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
    `);

    const monthsToSpread = 6;
    
    for (let i = 0; i < bookings.length; i++) {
      const booking = bookings[i];
      const amount = booking.total_price * 0.9;
      const platform_fee = booking.total_price * 0.1;
      let status = 'pending';
      let paid_at = null;
      
      // Spread created_at over the last 6 months
      const monthOffset = Math.floor(Math.random() * monthsToSpread);
      const dayOffset = Math.floor(Math.random() * 28);
      const created_at = new Date();
      created_at.setMonth(created_at.getMonth() - monthOffset);
      created_at.setDate(dayOffset + 1);

      if (booking.status === 'cancelled') {
        status = 'cancelled';
      } else {
        // Randomly mark some as paid
        if (Math.random() > 0.4) {
          status = 'paid';
          paid_at = new Date(created_at);
          paid_at.setDate(paid_at.getDate() + 2); // Paid 2 days later
        }
      }

      await client.query(
        `INSERT INTO payouts (booking_id, host_id, amount, platform_fee, status, paid_at, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [booking.id, booking.host_id, amount, platform_fee, status, paid_at, created_at]
      );
    }

    console.log(`Processed and distributed payouts for ${bookings.length} bookings.`);
  } catch (err) {
    console.error('Error seeding payouts:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedPayouts();
