import pool from '../config/db.js';

const SELECT_MOVIE = `
  SELECT m.movie_id, m.title, m.director, m.description, m.rating, m.poster_image,
         m.release_year, m.genre_id, g.genre_name AS genre
    FROM movies m
    JOIN genres g ON g.genre_id = m.genre_id`;

const SORT_COLUMNS = {
  rating: 'm.rating DESC, m.title ASC',
  title: 'm.title ASC',
  year: 'm.release_year DESC',
};

export async function findAll({ genre, search, sort = 'rating', limit = 50 } = {}) {
  const conditions = [];
  const params = [];
  if (genre) { conditions.push('g.genre_name = ?'); params.push(genre); }
  if (search) {
    conditions.push('(m.title LIKE ? OR m.director LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = SORT_COLUMNS[sort] || SORT_COLUMNS.rating;
  const [rows] = await pool.query(`${SELECT_MOVIE} ${where} ORDER BY ${orderBy} LIMIT ?`, [...params, limit]);
  return rows;
}

export async function findById(movieId) {
  const [rows] = await pool.query(`${SELECT_MOVIE} WHERE m.movie_id = ?`, [movieId]);
  return rows[0] || null;
}

export async function findByGenreIds(genreIds) {
  if (genreIds.length === 0) return [];
  const [rows] = await pool.query(`${SELECT_MOVIE} WHERE m.genre_id IN (?)`, [genreIds]);
  return rows;
}

export async function create(item) {
  const [result] = await pool.query(
    `INSERT INTO movies (title, director, description, genre_id, rating, poster_image, release_year)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [item.title, item.creator, item.description, item.genreId, item.rating, item.image || null, item.year]
  );
  return findById(result.insertId);
}

export async function update(movieId, item) {
  const [result] = await pool.query(
    `UPDATE movies SET title = ?, director = ?, description = ?, genre_id = ?, rating = ?, poster_image = ?, release_year = ?
     WHERE movie_id = ?`,
    [item.title, item.creator, item.description, item.genreId, item.rating, item.image || null, item.year, movieId]
  );
  if (!result.affectedRows) return findById(movieId);
  return findById(movieId);
}

export async function deleteById(movieId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM favourites WHERE movie_id = ?', [movieId]);
    const [result] = await connection.query('DELETE FROM movies WHERE movie_id = ?', [movieId]);
    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
