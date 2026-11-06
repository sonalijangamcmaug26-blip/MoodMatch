import * as bookModel from '../models/bookModel.js';
import * as favouriteModel from '../models/favouriteModel.js';
import * as movieModel from '../models/movieModel.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { toPositiveInt } from '../utils/validators.js';

export const getFavourites = asyncHandler(async (req, res) => {
  const favourites = await favouriteModel.listByUser(req.user.userId);
  return sendSuccess(res, favourites, 'Favourites loaded.');
});

// POST /api/favourites   body: { bookId } OR { movieId }  (exactly one)
export const addFavourite = asyncHandler(async (req, res) => {
  const { bookId, movieId } = req.body;
  const hasBook = bookId !== undefined && bookId !== null;
  const hasMovie = movieId !== undefined && movieId !== null;

  if (hasBook === hasMovie) {
    throw new AppError('Send exactly one of bookId or movieId.', 400);
  }

  const id = toPositiveInt(hasBook ? bookId : movieId);
  if (!id) throw new AppError('The id must be a positive whole number.', 400);

  // Make sure the book / movie really exists
  const item = hasBook ? await bookModel.findById(id) : await movieModel.findById(id);
  if (!item) throw new AppError(`${hasBook ? 'Book' : 'Movie'} not found.`, 404);

  try {
    const favouriteId = await favouriteModel.add(
      req.user.userId,
      hasBook ? { bookId: id } : { movieId: id }
    );
    return sendSuccess(res, { favourite_id: favouriteId }, 'Added to favourites.', 201);
  } catch (error) {
    // UNIQUE (user_id, book_id) / (user_id, movie_id) stops duplicates
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError('This item is already in your favourites.', 409);
    }
    throw error;
  }
});

// DELETE /api/favourites/:id   (id = favourite_id)
export const removeFavourite = asyncHandler(async (req, res) => {
  const favouriteId = toPositiveInt(req.params.id);
  if (!favouriteId) throw new AppError('Invalid favourite id.', 400);

  const removed = await favouriteModel.remove(favouriteId, req.user.userId);
  if (!removed) throw new AppError('Favourite not found.', 404);
  return sendSuccess(res, null, 'Removed from favourites.');
});
