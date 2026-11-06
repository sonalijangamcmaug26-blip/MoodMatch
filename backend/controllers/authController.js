import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import * as userModel from '../models/userModel.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { cleanString, throwIfInvalid, validateLogin, validateRegistration } from '../utils/validators.js';

const SALT_ROUNDS = 10;
// Hash of a throw-away value, compared when the email is unknown so that
// "wrong email" and "wrong password" take a similar time to answer.
const DUMMY_HASH = bcrypt.hashSync('moodmatch-dummy-password', SALT_ROUNDS);

// Removes the password hash before a user object is sent to the client.
const toPublicUser = ({ user_id, full_name, email, role, created_at }) => ({
  user_id,
  full_name,
  email,
  role: role || 'USER',
  created_at,
});

export const register = asyncHandler(async (req, res) => {
  throwIfInvalid(validateRegistration(req.body));

  const fullName = cleanString(req.body.fullName);
  const email = req.body.email.trim().toLowerCase();

  if (await userModel.findByEmail(email)) {
    throw new AppError('Validation failed', 409, { email: 'This email is already registered.' });
  }

  const passwordHash = await bcrypt.hash(req.body.password, SALT_ROUNDS);

  let userId;
  try {
    userId = await userModel.create({ fullName, email, passwordHash });
  } catch (error) {
    // Two people registering the same email at the same moment
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError('Validation failed', 409, { email: 'This email is already registered.' });
    }
    throw error;
  }

  const user = await userModel.findById(userId);
  return sendSuccess(res, { user }, 'Registration successful. You can now log in.', 201);
});

export const login = asyncHandler(async (req, res) => {
  throwIfInvalid(validateLogin(req.body));

  const email = req.body.email.trim().toLowerCase();
  const user = await userModel.findByEmail(email);

  const passwordMatches = await bcrypt.compare(
    req.body.password,
    user ? user.password : DUMMY_HASH
  );
  if (!user || !passwordMatches) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = jwt.sign({ userId: user.user_id }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

  return sendSuccess(res, { token, user: toPublicUser(user) }, 'Login successful.');
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.userId);
  if (!user) throw new AppError('Your account no longer exists. Please log in again.', 401);
  return sendSuccess(res, { user }, 'Profile loaded.');
});
