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

const locations = ['Dubai, UAE', 'Paris, France', 'New York, USA', 'Tokyo, Japan', 'Maldives', 'London, UK', 'Bali, Indonesia', 'Santorini, Greece', 'Rome, Italy', 'Aspen, USA'];
const propertyTypes = ['VILLA', 'RESIDENCE', 'PENTHOUSE', 'CHALET', 'APARTMENT'];

const imagePool = [
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1449156001935-d2863fb72690?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1513584684374-89744f11d41a?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80'
];

const seedMassData = async () => {
  const client = await pool.connect();
  try {
    console.log('Seeding 10 hosts and 50 properties with full galleries...');
    const passwordHash = await bcrypt.hash('Password123!', 10);

    // Create 10 host users
    const hostIds = [];
    const avatars = [
      'https://i.pravatar.cc/150?u=host1',
      'https://i.pravatar.cc/150?u=host2',
      'https://i.pravatar.cc/150?u=host3',
      'https://i.pravatar.cc/150?u=host4',
      'https://i.pravatar.cc/150?u=host5',
      'https://i.pravatar.cc/150?u=host6',
      'https://i.pravatar.cc/150?u=host7',
      'https://i.pravatar.cc/150?u=host8',
      'https://i.pravatar.cc/150?u=host9',
      'https://i.pravatar.cc/150?u=host10'
    ];

    for (let i = 1; i <= 10; i++) {
      const email = `host${i}@luxestay.com`;
      const name = `Host User ${i}`;
      const avatar = avatars[i-1];
      
      const res = await client.query(
        `INSERT INTO users (name, email, password_hash, role, avatar_url) 
         VALUES ($1, $2, $3, 'host', $4) 
         ON CONFLICT (email) DO UPDATE SET role = 'host', avatar_url = EXCLUDED.avatar_url RETURNING id`,
        [name, email, passwordHash, avatar]
      );
      hostIds.push(res.rows[0].id);
    }

    // Clear existing properties
    await client.query('DELETE FROM properties');
    console.log('Cleared existing properties.');

    // Generate 5 properties for each host
    let propCount = 0;
    for (let i = 0; i < hostIds.length; i++) {
      const hostId = hostIds[i];
      for (let j = 1; j <= 5; j++) {
        propCount++;
        const propType = propertyTypes[propCount % propertyTypes.length];
        const title = `Premium ${propType} ${propCount}`;
        const description = `This is a beautiful ${propType} offering luxurious amenities and breathtaking views. Perfect for your next getaway. Experience the pinnacle of architectural design and comfort.`;
        const location = locations[propCount % locations.length];
        const price = 500 + (Math.floor(Math.random() * 20) * 100);

        // Selection of 5 images per property
        const propertyImages = [];
        for (let k = 0; k < 5; k++) {
          propertyImages.push(imagePool[(propCount + k) % imagePool.length]);
        }

        const bedrooms = 1 + (propCount % 5);
        const bathrooms = 1 + (propCount % 3);
        const maxGuests = bedrooms * 2;

        await client.query(
          'INSERT INTO properties (host_id, title, description, location, price_per_night, property_type, image_urls, bedrooms, bathrooms, max_guests) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
          [hostId, title, description, location, price, propType, propertyImages, bedrooms, bathrooms, maxGuests]
        );
      }
    }

    console.log(`Successfully seeded 10 hosts and ${propCount} properties with 5 images each!`);
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
};

seedMassData();
