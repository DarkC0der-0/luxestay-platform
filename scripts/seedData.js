// scripts/seedData.js
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

const seed = async () => {
  const client = await pool.connect();
  try {
    console.log('Seeding premium property data...');

    // 1. Create a Host User if not exists
    const hostRes = await client.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ('Luxe Curator', 'host@luxestay.com', '$2b$10$r8M.T7U1Y.fO9P.yX9eU.Oe.yO.yO.yO.yO.yO.yO.yO.yO', 'host') ON CONFLICT (email) DO UPDATE SET role = 'host' RETURNING id"
    );
    const hostId = hostRes.rows[0].id;

    // 2. Add premium properties (removed DELETE to be additive)
    console.log('Adding premium properties...');

    // 3. Define premium properties
    const properties = [
      {
        title: 'Villa Oceanview',
        description: 'Breathtaking 180-degree ocean views with private infinity pool and designer interiors. Experience the pinnacle of coastal luxury in this Malibu masterpiece.',
        location: 'Malibu, USA',
        price_per_night: 1250,
        property_type: 'VILLA',
        image_urls: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1600&q=80'
        ],
        bedrooms: 4,
        bathrooms: 3,
        max_guests: 8
      },
      {
        title: 'The Glass House',
        description: 'Ultra-modern architectural masterpiece hidden in the heart of the forest. Minimalist design meets natural serenity in this one-of-a-kind residence.',
        location: 'London, UK',
        price_per_night: 850,
        property_type: 'RESIDENCE',
        image_urls: [
          'https://images.unsplash.com/photo-1449156001935-d2863fb72690?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1513584684374-89744f11d41a?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1600&q=80'
        ],
        bedrooms: 2,
        bathrooms: 2,
        max_guests: 4
      },
      {
        title: 'Azure Penthouse',
        description: 'Top-floor sanctuary with a 360-degree skyline view and private terrace. High-altitude living with bespoke finishes and unmatched privacy.',
        location: 'Dubai, UAE',
        price_per_night: 2200,
        property_type: 'PENTHOUSE',
        image_urls: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1600&q=80'
        ],
        bedrooms: 3,
        bathrooms: 3,
        max_guests: 6
      },
      {
        title: 'Alpine Chalet',
        description: 'Cozy yet expansive timber chalet featuring a world-class spa and mountain access. The ultimate winter retreat for those who appreciate the finer things.',
        location: 'Aspen, USA',
        price_per_night: 1100,
        property_type: 'CHALET',
        image_urls: [
          'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1513584684374-89744f11d41a?auto=format&fit=crop&w=1600&q=80'
        ],
        bedrooms: 5,
        bathrooms: 4,
        max_guests: 10
      }
    ];

    for (const p of properties) {
      await client.query(
        'INSERT INTO properties (host_id, title, description, location, price_per_night, property_type, image_urls, bedrooms, bathrooms, max_guests) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [hostId, p.title, p.description, p.location, p.price_per_night, p.property_type, p.image_urls, p.bedrooms, p.bathrooms, p.max_guests]
      );
    }

    console.log('Seeding complete! 4 premium properties added.');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
