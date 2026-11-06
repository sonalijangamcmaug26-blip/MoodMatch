import pool from '../config/db.js';

export async function findAll() {
  const [rows] = await pool.query('SELECT genre_id, genre_name FROM genres ORDER BY genre_name');
  return rows;
}
