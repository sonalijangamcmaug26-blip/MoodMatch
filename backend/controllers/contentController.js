import * as bookModel from '../models/bookModel.js';
import * as movieModel from '../models/movieModel.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { cleanString, toPositiveInt } from '../utils/validators.js';

function validateContent(body, type) {
  const errors = {};
  const title = cleanString(body.title);
  const creator = cleanString(body.creator);
  const description = cleanString(body.description);
  const genreId = toPositiveInt(body.genreId);
  const rating = Number(body.rating);
  const year = Number(body.year);
  const image = cleanString(body.image);

  if (!title || title.length > 200) errors.title = 'Title is required (maximum 200 characters).';
  if (!creator || creator.length > 150) errors.creator = 'Author/director is required (maximum 150 characters).';
  if (!description) errors.description = 'Description is required.';
  if (!genreId) errors.genreId = 'Please select a valid genre.';
  if (!Number.isFinite(rating) || rating < 0 || rating > (type === 'book' ? 5 : 10)) {
    errors.rating = `Rating must be between 0 and ${type === 'book' ? 5 : 10}.`;
  }
  if (!Number.isInteger(year) || year < 1000 || year > 2100) errors.year = 'Enter a valid year.';
  if (image && (image.length > 500 || !/^https?:\/\//i.test(image))) {
    errors.image = 'Image must be a valid HTTP or HTTPS URL (maximum 500 characters).';
  }
  if (Object.keys(errors).length) throw new AppError('Please correct the highlighted fields.', 400, errors);
  return { title, creator, description, genreId, rating, year, image };
}

function createContentController({ model, plural, singular, idField, label, type }) {
  const list = asyncHandler(async (req, res) => {
    const limit = Math.min(toPositiveInt(req.query.limit) || 50, 100);
    const items = await model.findAll({
      genre: cleanString(req.query.genre) || undefined,
      search: cleanString(req.query.search) || undefined,
      sort: cleanString(req.query.sort) || 'rating',
      limit,
    });
    return sendSuccess(res, { [plural]: items }, `${label}s loaded.`);
  });

  const getOne = asyncHandler(async (req, res) => {
    const id = toPositiveInt(req.params.id);
    if (!id) throw new AppError(`Invalid ${singular} id.`, 400);
    const item = await model.findById(id);
    if (!item) throw new AppError(`${label} not found.`, 404);
    return sendSuccess(res, { [singular]: item }, `${label} loaded.`);
  });

  const create = asyncHandler(async (req, res) => {
    const item = await model.create(validateContent(req.body, type));
    return sendSuccess(res, { [singular]: item }, `${label} created successfully.`, 201);
  });

  const update = asyncHandler(async (req, res) => {
    const id = toPositiveInt(req.params.id);
    if (!id) throw new AppError(`Invalid ${singular} id.`, 400);
    const item = await model.update(id, validateContent(req.body, type));
    if (!item) throw new AppError(`${label} not found.`, 404);
    return sendSuccess(res, { [singular]: item }, `${label} updated successfully.`);
  });

  const remove = asyncHandler(async (req, res) => {
    const id = toPositiveInt(req.params.id);
    if (!id) throw new AppError(`Invalid ${singular} id.`, 400);
    const deleted = await model.deleteById(id);
    if (!deleted) throw new AppError(`${label} not found.`, 404);
    return sendSuccess(res, null, `${label} deleted successfully.`);
  });

  return { list, getOne, create, update, remove, idField };
}

export const bookController = createContentController({
  model: bookModel, plural: 'books', singular: 'book', idField: 'book_id', label: 'Book', type: 'book',
});

export const movieController = createContentController({
  model: movieModel, plural: 'movies', singular: 'movie', idField: 'movie_id', label: 'Movie', type: 'movie',
});
