import pool from '../config/db.js';

const SELECT_BOOK = `
  SELECT b.book_id, b.title, b.author, b.description, b.rating, b.cover_image,
         b.published_year, b.genre_id, g.genre_name AS genre
    FROM books b
    JOIN genres g ON g.genre_id = b.genre_id`;

const SORT_COLUMNS = {
  rating: 'b.rating DESC, b.title ASC',
  title: 'b.title ASC',
  year: 'b.published_year DESC',
};

export async function findAll({ genre, search, sort = 'rating', limit = 50 } = {}) {
  const conditions = [];
  const params = [];
  if (genre) { conditions.push('g.genre_name = ?'); params.push(genre); }
  if (search) {
    conditions.push('(b.title LIKE ? OR b.author LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = SORT_COLUMNS[sort] || SORT_COLUMNS.rating;
  const [rows] = await pool.query(`${SELECT_BOOK} ${where} ORDER BY ${orderBy} LIMIT ?`, [...params, limit]);
  return rows;
}

export async function findById(bookId) {
  const [rows] = await pool.query(`${SELECT_BOOK} WHERE b.book_id = ?`, [bookId]);
  return rows[0] || null;
}

export async function findByGenreIds(genreIds) {
  if (genreIds.length === 0) return [];
  const [rows] = await pool.query(`${SELECT_BOOK} WHERE b.genre_id IN (?)`, [genreIds]);
  return rows;
}

export async function create(item) {
  const [result] = await pool.query(
    `INSERT INTO books (title, author, description, genre_id, rating, cover_image, published_year)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [item.title, item.creator, item.description, item.genreId, item.rating, item.image || null, item.year]
  );
  return findById(result.insertId);
}

export async function update(bookId, item) {
  const [result] = await pool.query(
    `UPDATE books SET title = ?, author = ?, description = ?, genre_id = ?, rating = ?, cover_image = ?, published_year = ?
     WHERE book_id = ?`,
    [item.title, item.creator, item.description, item.genreId, item.rating, item.image || null, item.year, bookId]
  );
  if (!result.affectedRows) return findById(bookId);
  return findById(bookId);
}

export async function deleteById(bookId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM favourites WHERE book_id = ?', [bookId]);
    const [result] = await connection.query('DELETE FROM books WHERE book_id = ?', [bookId]);
    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
