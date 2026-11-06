import pool from '../config/db.js';

export async function findByEmail(email) {
  const [rows] = await pool.query(
    'SELECT user_id, full_name, email, password, role, created_at FROM users WHERE email = ?',
    [email]
  );
  return rows[0] || null;
}

// Never selects the password column.
export async function findById(userId) {
  const [rows] = await pool.query(
    'SELECT user_id, full_name, email, role, created_at FROM users WHERE user_id = ?',
    [userId]
  );
  return rows[0] || null;
}

export async function create({ fullName, email, passwordHash }) {
  const [result] = await pool.query(
    'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, \'USER\')',
    [fullName, email, passwordHash]
  );
  return result.insertId;
}
