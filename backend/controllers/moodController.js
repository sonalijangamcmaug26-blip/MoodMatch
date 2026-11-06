import * as bookModel from '../models/bookModel.js';
import * as moodModel from '../models/moodModel.js';
import * as movieModel from '../models/movieModel.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { buildRecommendations } from '../utils/recommendationEngine.js';
import { sendSuccess } from '../utils/response.js';
import { cleanString, toPositiveInt } from '../utils/validators.js';

export const getMoods = asyncHandler(async (req, res) => {
  const moods = await moodModel.findAll();
  return sendSuccess(res, { moods }, 'Moods loaded.');
});

// POST /api/moods/recommendations   body: { moodId } or { mood: "Happy" }
// Runs the algorithm described in utils/recommendationEngine.js.
export const getRecommendations = asyncHandler(async (req, res) => {
  const { moodId, mood: moodName } = req.body;
  const contentType = String(req.body.contentType || '').trim().toLowerCase();
  if (!['book', 'movie'].includes(contentType)) {
    throw new AppError('Please choose either books or movies.', 400);
  }

  // Step 1-2: receive the mood and identify the mood row
  let mood = null;
  if (moodId !== undefined) {
    const id = toPositiveInt(moodId);
    if (!id) throw new AppError('moodId must be a positive whole number.', 400);
    mood = await moodModel.findById(id);
  } else if (cleanString(moodName)) {
    mood = await moodModel.findByName(cleanString(moodName));
  } else {
    throw new AppError('Please provide a moodId (or mood name).', 400);
  }
  if (!mood) throw new AppError('Mood not found.', 404);

  // Step 3: genres linked to this mood
  const mappings = await moodModel.findGenresForMood(mood.mood_id);
  const genreIds = mappings.map((mapping) => mapping.genre_id);

  // Step 4: candidate books and movies from MySQL
  const books = contentType === 'book' ? await bookModel.findByGenreIds(genreIds) : [];
  const movies = contentType === 'movie' ? await movieModel.findByGenreIds(genreIds) : [];

  // Steps 5-7: rank, trim and explain
  const recommendations = buildRecommendations({ mood, mappings, books, movies });

  return sendSuccess(
    res,
    {
      mood,
      contentType,
      genres: mappings.map(({ genre_id, genre_name, priority, reason }) => ({
        genre_id,
        genre_name,
        priority,
        reason,
      })),
      books: recommendations.books,
      movies: recommendations.movies,
    },
    'Recommendations loaded.'
  );
});
