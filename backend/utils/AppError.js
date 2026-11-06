// Error with an HTTP status code. The central error handler turns it into JSON.
export default class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; // optional { field: 'message' } map for validation errors
    this.isOperational = true;
  }
}
