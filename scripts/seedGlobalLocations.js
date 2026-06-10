// scripts/seedGlobalLocations.js
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

const locations = [
  // North America
  { city: 'New York', province: 'New York', country: 'USA', full_name: 'New York, NY, USA' },
  { city: 'Los Angeles', province: 'California', country: 'USA', full_name: 'Los Angeles, CA, USA' },
  { city: 'Chicago', province: 'Illinois', country: 'USA', full_name: 'Chicago, IL, USA' },
  { city: 'Miami', province: 'Florida', country: 'USA', full_name: 'Miami, FL, USA' },
  { city: 'Toronto', province: 'Ontario', country: 'Canada', full_name: 'Toronto, ON, Canada' },
  { city: 'Vancouver', province: 'British Columbia', country: 'Canada', full_name: 'Vancouver, BC, Canada' },
  { city: 'Mexico City', province: null, country: 'Mexico', full_name: 'Mexico City, Mexico' },
  { city: 'Tulum', province: 'Quintana Roo', country: 'Mexico', full_name: 'Tulum, Mexico' },

  // Europe
  { city: 'London', province: null, country: 'United Kingdom', full_name: 'London, UK' },
  { city: 'Paris', province: null, country: 'France', full_name: 'Paris, France' },
  { city: 'Berlin', province: null, country: 'Germany', full_name: 'Berlin, Germany' },
  { city: 'Rome', province: null, country: 'Italy', full_name: 'Rome, Italy' },
  { city: 'Madrid', province: null, country: 'Spain', full_name: 'Madrid, Spain' },
  { city: 'Barcelona', province: null, country: 'Spain', full_name: 'Barcelona, Spain' },
  { city: 'Amsterdam', province: null, country: 'Netherlands', full_name: 'Amsterdam, Netherlands' },
  { city: 'Santorini', province: null, country: 'Greece', full_name: 'Santorini, Greece' },
  { city: 'Zurich', province: null, country: 'Switzerland', full_name: 'Zurich, Switzerland' },
  { city: 'Lisbon', province: null, country: 'Portugal', full_name: 'Lisbon, Portugal' },

  // Asia
  { city: 'Tokyo', province: null, country: 'Japan', full_name: 'Tokyo, Japan' },
  { city: 'Seoul', province: null, country: 'South Korea', full_name: 'Seoul, South Korea' },
  { city: 'Singapore', province: null, country: 'Singapore', full_name: 'Singapore' },
  { city: 'Bangkok', province: null, country: 'Thailand', full_name: 'Bangkok, Thailand' },
  { city: 'Bali', province: null, country: 'Indonesia', full_name: 'Bali, Indonesia' },
  { city: 'Dubai', province: null, country: 'UAE', full_name: 'Dubai, UAE' },
  { city: 'Hong Kong', province: null, country: 'China', full_name: 'Hong Kong' },
  { city: 'Phuket', province: null, country: 'Thailand', full_name: 'Phuket, Thailand' },

  // Oceania
  { city: 'Sydney', province: 'NSW', country: 'Australia', full_name: 'Sydney, NSW, Australia' },
  { city: 'Melbourne', province: 'Victoria', country: 'Australia', full_name: 'Melbourne, VIC, Australia' },
  { city: 'Auckland', province: null, country: 'New Zealand', full_name: 'Auckland, New Zealand' },
  { city: 'Bora Bora', province: null, country: 'French Polynesia', full_name: 'Bora Bora' },

  // South America
  { city: 'Rio de Janeiro', province: null, country: 'Brazil', full_name: 'Rio de Janeiro, Brazil' },
  { city: 'Buenos Aires', province: null, country: 'Argentina', full_name: 'Buenos Aires, Argentina' },
  { city: 'Cusco', province: null, country: 'Peru', full_name: 'Cusco, Peru' },

  // Africa
  { city: 'Cape Town', province: null, country: 'South Africa', full_name: 'Cape Town, South Africa' },
  { city: 'Marrakesh', province: null, country: 'Morocco', full_name: 'Marrakesh, Morocco' },
  { city: 'Cairo', province: null, country: 'Egypt', full_name: 'Cairo, Egypt' }
];

const seed = async () => {
  const client = await pool.connect();
  try {
    console.log('Seeding global locations into Supabase...');
    
    // Clear existing locations
    await client.query('DELETE FROM locations');

    for (const loc of locations) {
      await client.query(
        'INSERT INTO locations (city, province, country, full_name) VALUES ($1, $2, $3, $4)',
        [loc.city, loc.province, loc.country, loc.full_name]
      );
    }

    console.log(`Seeding complete! ${locations.length} global destinations added.`);
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
