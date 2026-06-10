// scripts/deploySchema.js
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

const deploy = async () => {
  const schemaPath = path.join(__dirname, '../server/db/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  try {
    console.log('Connecting to Supabase...');
    const client = await pool.connect();
    console.log('Connected! Executing schema...');
    
    await client.query(schema);
    
    console.log('Schema deployed successfully!');
    client.release();
  } catch (err) {
    console.error('Deployment failed:', err);
  } finally {
    await pool.end();
  }
};

deploy();
