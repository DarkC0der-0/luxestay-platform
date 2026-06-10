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

const guests = [
  '654f0a1d-4318-4f25-9113-55ff03a61345', // Ahmed Younes
  '0ffe7353-942b-4d09-a720-58f9c219f3a1', // Test Guest
];

const properties = [
  'd1fbc257-8991-4a94-98d0-aac6fb728297',
  'f8705af2-6694-4f22-833f-1141b36bebd5',
  'feec48cc-5836-47d1-97c0-65ce96fa882a',
  '0a76278d-d3c1-4d68-a2bf-a6012b8a304c',
  'b505cb7e-6751-41b2-9f2e-d623d23a8bf2',
  '7eb04242-2e4b-4000-a7dc-d4b051ba5b27',
  '486e4b1a-5463-457b-ae52-193a1baa8ac1',
  '75ce0d13-b4d9-4755-973c-d83f5dfde21c',
  'fe57ec57-7fb1-4d5e-a498-1c6e965ebd18',
  '7a8733f0-f408-456b-a944-a156b666b2ed',
];

const statuses = ['confirmed', 'pending', 'cancelled'];

async function seedBookings() {
  const client = await pool.connect();
  try {
    console.log('Starting bookings seed...');

    // Clear existing bookings if any (optional, but good for clean state)
    // await client.query('DELETE FROM bookings');

    const bookings = [];
    
    // Generate 15 random bookings
    for (let i = 0; i < 15; i++) {
      const property_id = properties[Math.floor(Math.random() * properties.length)];
      const guest_id = guests[Math.floor(Math.random() * guests.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Random dates in 2026
      const startMonth = Math.floor(Math.random() * 12) + 1;
      const startDay = Math.floor(Math.random() * 20) + 1;
      const duration = Math.floor(Math.random() * 7) + 1;
      
      const check_in = `2026-${startMonth.toString().padStart(2, '0')}-${startDay.toString().padStart(2, '0')}`;
      const check_out = `2026-${startMonth.toString().padStart(2, '0')}-${(startDay + duration).toString().padStart(2, '0')}`;
      
      const total_price = (Math.random() * 2000 + 500).toFixed(2);
      const payment_intent_id = `pi_${Math.random().toString(36).substring(2, 15)}`;

      bookings.push({
        property_id,
        guest_id,
        check_in,
        check_out,
        total_price,
        status,
        payment_intent_id
      });
    }

    for (const booking of bookings) {
      try {
        await client.query(
          `INSERT INTO bookings (property_id, guest_id, check_in, check_out, total_price, status, payment_intent_id) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [booking.property_id, booking.guest_id, booking.check_in, booking.check_out, booking.total_price, booking.status, booking.payment_intent_id]
        );
      } catch (insertErr) {
        if (insertErr.code === '23P01') {
          console.log(`Skipped overlapping booking for property ${booking.property_id}`);
        } else {
          throw insertErr;
        }
      }
    }

    console.log(`Successfully seeded ${bookings.length} bookings.`);
  } catch (err) {
    console.error('Error seeding bookings:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedBookings();
