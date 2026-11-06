
import 'dotenv/config';
import * as genreModel from '../models/genreModel.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const getAdminGenres = asyncHandler(async (req, res) => {
  const genres = await genreModel.findAll();
  return sendSuccess(res, { genres }, 'Genres loaded.');
});

export const getAdminSummary = asyncHandler(async (req, res) => {
  return sendSuccess(res, {
    message: 'You have administrator access to manage the MoodMatch catalogue.',
  }, 'Admin dashboard ready.');
});

// Normalize titles to compare search results safely.
const normalizeTitle = (value) =>
  String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

export const fetchAdminImage = asyncHandler(async (req, res) => {
  const { type, title, creator, year } = req.body;

  if (!['book', 'movie'].includes(type)) {
    throw new AppError('Type must be book or movie.', 400);
  }

  if (!title || !String(title).trim()) {
    throw new AppError('Please provide a title.', 400);
  }

  let imageUrl = null;
  let matchedTitle = null;
  let source = null;

  if (type === 'book') {
    const params = new URLSearchParams({
      title: String(title).trim(),
      ...(creator ? { author: String(creator).trim() } : {}),
      fields: 'title,author_name,cover_i',
      limit: '10',
    });

    const response = await fetch(
      `https://openlibrary.org/search.json?${params}`
    );

    if (!response.ok) {
      throw new AppError('Open Library search failed. Please try again.', 502);
    }

    const data = await response.json();
    const requestedTitle = normalizeTitle(title);

    const match = data.docs?.find((book) => {
      const candidateTitle = normalizeTitle(book.title);

      return book.cover_i &&
        candidateTitle === requestedTitle;
    });

    if (match) {
      imageUrl = `https://covers.openlibrary.org/b/id/${match.cover_i}-L.jpg`;
      matchedTitle = match.title;
      source = 'Open Library';
    }
  } else {
    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
      throw new AppError('TMDB API key is missing from backend/.env.', 500);
    }

    const params = new URLSearchParams({
      api_key: apiKey,
      query: String(title).trim(),
      ...(year ? { year: String(year) } : {}),
    });

    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?${params}`
    );

    if (!response.ok) {
      throw new AppError('TMDB search failed. Please check your API key.', 502);
    }

    const data = await response.json();
    const requestedTitle = normalizeTitle(title);

    const match = data.results?.find((movie) =>
      movie.poster_path &&
      normalizeTitle(movie.title) === requestedTitle
    );

    if (match) {
      imageUrl = `https://image.tmdb.org/t/p/w500${match.poster_path}`;
      matchedTitle = match.title;
      source = 'TMDB';
    }
  }

  if (!imageUrl) {
    throw new AppError(
      `No matching image found for "${title}". You can enter an image URL manually.`,
      404
    );
  }

  return sendSuccess(
    res,
    { imageUrl, matchedTitle, source },
    'Image found successfully.'
  );
});

