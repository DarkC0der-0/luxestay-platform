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

const tickets = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Refund request for cancelled booking',
    message: 'I cancelled my booking 3 days ago but haven\'t received the refund yet. Can you please check?',
    status: 'open'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    subject: 'Unable to upload property photos',
    message: 'The website keeps throwing an error when I try to upload more than 5 photos for my villa listing.',
    status: 'open'
  },
  {
    name: 'Mike Johnson',
    email: 'mike@example.com',
    subject: 'Question about host fees',
    message: 'What is the percentage taken by the platform for each booking?',
    status: 'resolved'
  },
  {
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    subject: 'Account suspension inquiry',
    message: 'My account was suspended without warning. I believe this is a mistake.',
    status: 'open'
  },
  {
    name: 'Robert Brown',
    email: 'robert@example.com',
    subject: 'Feature request: Pet-friendly filter',
    message: 'It would be great if we could filter properties by whether they allow pets.',
    status: 'resolved'
  },
  {
    name: 'Emily Davis',
    email: 'emily@example.com',
    subject: 'Login issues',
    message: 'I am not receiving the password reset email.',
    status: 'open'
  },
  {
    name: 'Chris Wilson',
    email: 'chris@example.com',
    subject: 'Inquiry about Malibu location',
    message: 'Are there any beachfront properties available in Malibu for July?',
    status: 'resolved'
  },
  {
    name: 'Jessica Taylor',
    email: 'jessica@example.com',
    subject: 'Host dashboard slow loading',
    message: 'The host dashboard is taking over 10 seconds to load my properties list.',
    status: 'open'
  }
];

async function seedTickets() {
  const client = await pool.connect();
  try {
    console.log('Starting support tickets seed...');

    for (const ticket of tickets) {
      await client.query(
        `INSERT INTO support_tickets (name, email, subject, message, status) 
         VALUES ($1, $2, $3, $4, $5)`,
        [ticket.name, ticket.email, ticket.subject, ticket.message, ticket.status]
      );
    }

    console.log(`Successfully seeded ${tickets.length} support tickets.`);
  } catch (err) {
    console.error('Error seeding tickets:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedTickets();
