const { Pool } = require('pg');

console.log(process.env.DB_HOST);
// Create a connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mydb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: {
    rejectUnauthorized: process.env.DB_SSL, // Set to true in production for security
  },
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('✅ Database connected successfully');
  release();
});

module.exports = pool;