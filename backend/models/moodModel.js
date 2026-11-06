import pool from '../config/db.js';

export async function findAll() {
  const [rows] = await pool.query(
    'SELECT mood_id, mood_name, emoji, description FROM moods ORDER BY mood_id'
  );
  return rows;
}

export async function findById(moodId) {
  const [rows] = await pool.query(
    'SELECT mood_id, mood_name, emoji, description FROM moods WHERE mood_id = ?',
    [moodId]
  );
  return rows[0] || null;
}

export async function findByName(moodName) {
  const [rows] = await pool.query(
    'SELECT mood_id, mood_name, emoji, description FROM moods WHERE mood_name = ?',
    [moodName]
  );
  return rows[0] || null;
}

// Step 3 of the algorithm: genres linked to a mood through the mood_genres table.
export async function findGenresForMood(moodId) {
  const [rows] = await pool.query(
    `SELECT mg.genre_id, g.genre_name, mg.priority, mg.reason
       FROM mood_genres mg
       JOIN genres g ON g.genre_id = mg.genre_id
      WHERE mg.mood_id = ?
      ORDER BY mg.priority DESC`,
    [moodId]
  );
  return rows;
}
