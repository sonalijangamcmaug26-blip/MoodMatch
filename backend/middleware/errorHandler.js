import AppError from '../utils/AppError.js';

export function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

// Central error handler: every error ends up here and is sent as JSON
// { success: false, message, errors? }.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Malformed JSON body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Request body is not valid JSON.' });
  }

  // Errors we raised on purpose (validation, auth, not found ...)
  if (err instanceof AppError) {
    const body = { success: false, message: err.message };
    if (err.errors) body.errors = err.errors;
    return res.status(err.statusCode).json(body);
  }

  // A valid token whose user was deleted: the foreign key to users fails
  if (err.code === 'ER_NO_REFERENCED_ROW_2' && /user_id/.test(err.sqlMessage || '')) {
    return res
      .status(401)
      .json({ success: false, message: 'Your account no longer exists. Please log in again.' });
  }

  // Unexpected errors: log details on the server, hide them from the client
  console.error('Unexpected error:', err);
  return res.status(500).json({ success: false, message: 'Something went wrong on the server.' });
}
