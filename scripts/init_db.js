// scripts/init_db.js
const fs = require('fs');
const path = require('path');
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


const initializeDatabase = async () => {
  const schemaPath = path.join(__dirname, '../server/db/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  try {
    console.log('Connecting to Supabase for database initialization...');
    const client = await pool.connect();
    console.log('Connected! Executing schema script...');
    
    await client.query(schema);
    
    console.log('Database initialized successfully with schema, enums, and indices.');
    client.release();
  } catch (err) {
    console.error('Database initialization failed:', err);
  } finally {
    await pool.end();
  }
};

initializeDatabase();
