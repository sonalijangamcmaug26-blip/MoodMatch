
import 'dotenv/config';
import pool from '../config/db.js';

const TMDB_API_KEY = process.env.TMDB_API_KEY;

const OPEN_LIBRARY_SEARCH = 'https://openlibrary.org/search.json';
const TMDB_SEARCH = 'https://api.themoviedb.org/3/search/movie';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchBookCover(title, author) {
  try {
    const params = new URLSearchParams({
      title,
      ...(author ? { author } : {}),
      fields: 'title,author_name,cover_i',
      limit: '5',
    });

    const response = await fetch(`${OPEN_LIBRARY_SEARCH}?${params}`);
    if (!response.ok) throw new Error(`Open Library HTTP ${response.status}`);

    const data = await response.json();
    const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');

    const match = data.docs?.find((book) => {
      const candidate = (book.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return book.cover_i && (
        candidate === normalizedTitle ||
        candidate.includes(normalizedTitle) ||
        normalizedTitle.includes(candidate)
      );
    });

    return match
      ? `https://covers.openlibrary.org/b/id/${match.cover_i}-L.jpg`
      : null;
  } catch (error) {
    console.error(`Book lookup failed: ${title}: ${error.message}`);
    return null;
  }
}

async function fetchMoviePoster(title, year) {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY is missing from backend/.env');
  }

  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      query: title,
      ...(year ? { year: String(year) } : {}),
    });

    const response = await fetch(`${TMDB_SEARCH}?${params}`);
    if (!response.ok) throw new Error(`TMDB HTTP ${response.status}`);

    const data = await response.json();
    const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');

    const match = data.results?.find((movie) => {
      const candidate = (movie.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return movie.poster_path && (
        candidate === normalizedTitle ||
        candidate.includes(normalizedTitle) ||
        normalizedTitle.includes(candidate)
      );
    });

    return match
      ? `https://image.tmdb.org/t/p/w500${match.poster_path}`
      : null;
  } catch (error) {
    console.error(`Movie lookup failed: ${title}: ${error.message}`);
    return null;
  }
}

async function main() {
  try {
    if (!TMDB_API_KEY) {
      throw new Error('TMDB_API_KEY is missing from backend/.env');
    }

    const [books] = await pool.query(
      `SELECT book_id, title, author, published_year, cover_image
       FROM books`
    );

    const [movies] = await pool.query(
      `SELECT movie_id, title, release_year, poster_image
       FROM movies`
    );

    console.log(`Found ${books.length} books and ${movies.length} movies.`);

    let bookUpdated = 0;
    let movieUpdated = 0;

    console.log('\nFetching book covers...');

    for (const book of books) {
      if (book.cover_image) {
        console.log(`Skipped existing cover: ${book.title}`);
        continue;
      }

      const imageUrl = await fetchBookCover(book.title, book.author);

      if (imageUrl) {
        await pool.query(
          'UPDATE books SET cover_image = ? WHERE book_id = ?',
          [imageUrl, book.book_id]
        );
        bookUpdated++;
        console.log(`Updated book: ${book.title}`);
      } else {
        console.log(`No matching cover: ${book.title}`);
      }

      await delay(250);
    }

    console.log('\nFetching movie posters...');

    for (const movie of movies) {
      if (movie.poster_image) {
        console.log(`Skipped existing poster: ${movie.title}`);
        continue;
      }

      const imageUrl = await fetchMoviePoster(
        movie.title,
        movie.release_year
      );

      if (imageUrl) {
        await pool.query(
          'UPDATE movies SET poster_image = ? WHERE movie_id = ?',
          [imageUrl, movie.movie_id]
        );
        movieUpdated++;
        console.log(`Updated movie: ${movie.title}`);
      } else {
        console.log(`No matching poster: ${movie.title}`);
      }

      await delay(250);
    }

    console.log('\nImage fetching completed!');
    console.log(`Book covers updated: ${bookUpdated}`);
    console.log(`Movie posters updated: ${movieUpdated}`);
  } catch (error) {
    console.error('\nImage fetching failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
