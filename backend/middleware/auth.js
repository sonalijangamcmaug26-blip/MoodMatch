import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import AppError from '../utils/AppError.js';

// Protects a route: requires "Authorization: Bearer <token>".
// On success, req.user.userId holds the id stored inside the token.
export default function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError('Authentication required. Please log in.', 401));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { userId: payload.userId };
    return next();
  } catch (error) {
    const message =
      error.name === 'TokenExpiredError'
        ? 'Your session has expired. Please log in again.'
        : 'Invalid token. Please log in again.';
    return next(new AppError(message, 401));
  }
}
