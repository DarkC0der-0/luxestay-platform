// scripts/seed_messages.js
const { Pool } = require('pg');
require('dotenv').config({ path: '/Users/darkc0der/Desktop/assess/.env' });

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

const seedMessages = async () => {
  const client = await pool.connect();
  try {
    console.log('Starting messages seeding...');

    // 1. Fetch all guest users
    const { rows: guests } = await client.query("SELECT id, name, email FROM users WHERE role = 'guest'");
    console.log(`Found ${guests.length} guest users.`);

    if (guests.length === 0) {
      console.log('No guests found. Please register or seed guests first.');
      return;
    }

    // 2. Fetch all properties with host details
    const { rows: properties } = await client.query(`
      SELECT p.id as property_id, p.title, p.host_id, u.name as host_name 
      FROM properties p
      JOIN users u ON p.host_id = u.id
      WHERE u.role = 'host'
    `);
    console.log(`Found ${properties.length} host-owned properties.`);

    if (properties.length === 0) {
      console.log('No properties owned by hosts found. Seeding skipped.');
      return;
    }

    // 3. Clear existing messages to have a clean start (optional/good for demo resets)
    await client.query('DELETE FROM messages');
    console.log('Cleared existing message rows.');

    // 4. Seed conversations
    for (let i = 0; i < guests.length; i++) {
      const guest = guests[i];
      // Assign up to 2 properties for this guest to chat about
      const assignedProps = [
        properties[i % properties.length],
        properties[(i + 1) % properties.length]
      ];

      // Remove duplicate if only 1 property exists
      const uniqueProps = [...new Map(assignedProps.map(p => [p.property_id, p])).values()];

      for (const prop of uniqueProps) {
        console.log(`Creating chat between Guest: "${guest.name}" and Host: "${prop.host_name}" about listing: "${prop.title}"`);

        const messages = [
          {
            sender_id: guest.id,
            receiver_id: prop.host_id,
            content: `Hello! I really love your listing "${prop.title}". Is it available for check-in next Friday?`,
            offsetMinutes: 120 // 2 hours ago
          },
          {
            sender_id: prop.host_id,
            receiver_id: guest.id,
            content: `Hi ${guest.name.split(' ')[0]}! Yes, it is fully available and cleaned. What time are you planning to arrive?`,
            offsetMinutes: 90 // 1.5 hours ago
          },
          {
            sender_id: guest.id,
            receiver_id: prop.host_id,
            content: `Great! We'll probably arrive around 3:00 PM. Is self-check-in available?`,
            offsetMinutes: 60 // 1 hour ago
          },
          {
            sender_id: prop.host_id,
            receiver_id: guest.id,
            content: `Yes, we have a smart lock at the entrance. I'll send you the entry code and check-in instructions on the morning of your arrival. Looking forward to hosting you!`,
            offsetMinutes: 10 // 10 minutes ago
          }
        ];

        for (const msg of messages) {
          const messageTime = new Date(Date.now() - msg.offsetMinutes * 60 * 1000);
          await client.query(
            `INSERT INTO messages (property_id, sender_id, receiver_id, content, created_at)
             VALUES ($1, $2, $3, $4, $5)`,
            [prop.property_id, msg.sender_id, msg.receiver_id, msg.content, messageTime]
          );
        }
      }
    }

    console.log('✓ Seeding messages completed successfully!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
};

seedMessages();
