import pool from '../config/db.js';

export async function create(userId, moodId) {
  const [result] = await pool.query('INSERT INTO mood_history (user_id, mood_id) VALUES (?, ?)', [
    userId,
    moodId,
  ]);
  return result.insertId;
}

export async function listByUser(userId, limit = 50) {
  const [rows] = await pool.query(
    `SELECT h.history_id, h.selected_at, m.mood_id, m.mood_name, m.emoji, m.description
       FROM mood_history h
       JOIN moods m ON m.mood_id = h.mood_id
      WHERE h.user_id = ?
      ORDER BY h.selected_at DESC, h.history_id DESC
      LIMIT ?`,
    [userId, limit]
  );
  return rows;
}
