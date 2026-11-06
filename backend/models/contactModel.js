import pool from '../config/db.js';

export async function create({ name, email, subject, message }) {
  const [result] = await pool.query(
    'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
    [name, email, subject, message]
  );
  return result.insertId;
}
