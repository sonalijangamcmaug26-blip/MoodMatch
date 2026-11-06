import pool from '../config/db.js';

// Returns the logged-in user's favourite books and movies (always filtered by user_id).
export async function listByUser(userId) {
  const [books] = await pool.query(
    `SELECT f.favourite_id, f.created_at AS added_at, b.book_id, b.title, b.author,
            b.description, b.rating, b.cover_image, b.published_year, g.genre_name AS genre
       FROM favourites f
       JOIN books b  ON b.book_id  = f.book_id
       JOIN genres g ON g.genre_id = b.genre_id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC, f.favourite_id DESC`,
    [userId]
  );
  const [movies] = await pool.query(
    `SELECT f.favourite_id, f.created_at AS added_at, m.movie_id, m.title, m.director,
            m.description, m.rating, m.poster_image, m.release_year, g.genre_name AS genre
       FROM favourites f
       JOIN movies m ON m.movie_id = f.movie_id
       JOIN genres g ON g.genre_id = m.genre_id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC, f.favourite_id DESC`,
    [userId]
  );
  return { books, movies };
}

// Inserts a favourite. Exactly one of bookId / movieId must be given.
// The database CHECK and UNIQUE keys enforce the same rules as a safety net.
export async function add(userId, { bookId = null, movieId = null }) {
  const [result] = await pool.query(
    'INSERT INTO favourites (user_id, book_id, movie_id) VALUES (?, ?, ?)',
    [userId, bookId, movieId]
  );
  return result.insertId;
}

// The user_id condition means nobody can delete another user's favourite.
export async function remove(favouriteId, userId) {
  const [result] = await pool.query(
    'DELETE FROM favourites WHERE favourite_id = ? AND user_id = ?',
    [favouriteId, userId]
  );
  return result.affectedRows;
}
