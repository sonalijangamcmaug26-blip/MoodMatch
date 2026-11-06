import AppError from './AppError.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isValidEmail = (email) =>
  typeof email === 'string' && email.length <= 150 && EMAIL_REGEX.test(email.trim());

export const cleanString = (value) => (typeof value === 'string' ? value.trim() : '');

// Parses a positive integer (ids, limits). Returns null when invalid.
export function toPositiveInt(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

// Throws a 400 AppError when the errors object has any entries.
export function throwIfInvalid(errors) {
  if (Object.keys(errors).length > 0) {
    throw new AppError('Validation failed', 400, errors);
  }
}

export function validateRegistration({ fullName, email, password, confirmPassword }) {
  const errors = {};
  const name = cleanString(fullName);

  if (name.length < 2 || name.length > 100) {
    errors.fullName = 'Full name must be between 2 and 100 characters.';
  }
  if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (typeof password !== 'string' || password.length < 8) {
    errors.password = 'Password must be at least 8 characters long.';
  } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.password = 'Password must contain at least one letter and one number.';
  } else if (password.length > 72) {
    // bcrypt only uses the first 72 bytes
    errors.password = 'Password must be 72 characters or fewer.';
  }
  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }
  return errors;
}

export function validateLogin({ email, password }) {
  const errors = {};
  if (!isValidEmail(email)) errors.email = 'Please enter a valid email address.';
  if (typeof password !== 'string' || password.length === 0) {
    errors.password = 'Password is required.';
  }
  return errors;
}

export function validateContact({ name, email, subject, message }) {
  const errors = {};
  const cleanName = cleanString(name);
  const cleanSubject = cleanString(subject);
  const cleanMessage = cleanString(message);

  if (cleanName.length < 2 || cleanName.length > 100) {
    errors.name = 'Name must be between 2 and 100 characters.';
  }
  if (!isValidEmail(email)) errors.email = 'Please enter a valid email address.';
  if (cleanSubject.length < 3 || cleanSubject.length > 150) {
    errors.subject = 'Subject must be between 3 and 150 characters.';
  }
  if (cleanMessage.length < 10 || cleanMessage.length > 2000) {
    errors.message = 'Message must be between 10 and 2000 characters.';
  }
  return errors;
}
