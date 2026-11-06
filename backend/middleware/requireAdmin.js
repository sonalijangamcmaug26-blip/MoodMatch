import * as userModel from '../models/userModel.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Checks the current database role on every admin request, so a demoted
// account loses admin access even if it still has an unexpired JWT.
export default asyncHandler(async (req, res, next) => {
  const user = await userModel.findById(req.user.userId);
  if (!user) throw new AppError('Your account no longer exists. Please log in again.', 401);
  if (user.role !== 'ADMIN') throw new AppError('Administrator access is required.', 403);
  req.user.role = user.role;
  next();
});
