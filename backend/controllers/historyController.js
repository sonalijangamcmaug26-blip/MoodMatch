import * as historyModel from '../models/historyModel.js';
import * as moodModel from '../models/moodModel.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { toPositiveInt } from '../utils/validators.js';

export const getHistory = asyncHandler(async (req, res) => {
  const limit = Math.min(toPositiveInt(req.query.limit) || 50, 200);
  const history = await historyModel.listByUser(req.user.userId, limit);
  return sendSuccess(res, { history }, 'Mood history loaded.');
});

// POST /api/history   body: { moodId }
export const addHistory = asyncHandler(async (req, res) => {
  const moodId = toPositiveInt(req.body.moodId);
  if (!moodId) throw new AppError('moodId must be a positive whole number.', 400);

  const mood = await moodModel.findById(moodId);
  if (!mood) throw new AppError('Mood not found.', 404);

  const historyId = await historyModel.create(req.user.userId, moodId);
  return sendSuccess(res, { history_id: historyId, mood }, 'Mood saved to your history.', 201);
});
