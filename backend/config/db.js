import mysql from 'mysql2/promise';
import env from './env.js';

// One shared connection pool for the whole app.
// All models call pool.query(sql, params): values are always passed as
// parameters (never concatenated into the SQL), which prevents SQL injection.
const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  decimalNumbers: true, // return DECIMAL columns (ratings) as numbers, not strings
});

export async function testConnection() {
  const connection = await pool.getConnection();
  await connection.ping();
  connection.release();
}

export default pool;
