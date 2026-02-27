import pg from 'pg';

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME || 'orbit',
  user: process.env.DB_USER || 'orbit_admin',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 3,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 5000,
  ssl: { rejectUnauthorized: false },
});

export async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export { pool };
