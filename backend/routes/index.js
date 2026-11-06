import { Router } from 'express';
import { getProfile, login, register } from '../controllers/authController.js';
import { submitContact } from '../controllers/contactController.js';
import { bookController, movieController } from '../controllers/contentController.js';
import {
  getAdminGenres,
  getAdminSummary,
  fetchAdminImage,
} from '../controllers/adminController.js';

import {
  addFavourite,
  getFavourites,
  removeFavourite,
} from '../controllers/favouriteController.js';
import { addHistory, getHistory } from '../controllers/historyController.js';
import { getMoods, getRecommendations } from '../controllers/moodController.js';
import authenticate from '../middleware/auth.js';
import requireAdmin from '../middleware/requireAdmin.js';

const router = Router();

router.get('/health', (req, res) => res.json({ success: true, message: 'MoodMatch API is running' }));

// Authentication
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/profile', authenticate, getProfile);

// Moods + recommendations
router.get('/moods', getMoods);
router.post('/moods/recommendations', getRecommendations);

// Books and movies (public read access)
router.get('/books', bookController.list);
router.get('/books/:id', bookController.getOne);
router.get('/movies', movieController.list);
router.get('/movies/:id', movieController.getOne);

// Catalogue management (administrator only)
router.get('/admin/summary', authenticate, requireAdmin, getAdminSummary);
router.get('/admin/genres', authenticate, requireAdmin, getAdminGenres);
router.post('/admin/books', authenticate, requireAdmin, bookController.create);
router.put('/admin/books/:id', authenticate, requireAdmin, bookController.update);
router.delete('/admin/books/:id', authenticate, requireAdmin, bookController.remove);
router.post('/admin/movies', authenticate, requireAdmin, movieController.create);

// Fetch book covers and movie posters
router.post('/admin/fetch-image', authenticate, requireAdmin, fetchAdminImage);
router.put('/admin/movies/:id', authenticate, requireAdmin, movieController.update);
router.delete('/admin/movies/:id', authenticate, requireAdmin, movieController.remove);

// Favourites (logged-in users only)
router.get('/favourites', authenticate, getFavourites);
router.post('/favourites', authenticate, addFavourite);
router.delete('/favourites/:id', authenticate, removeFavourite);

// Mood history (logged-in users only)
router.get('/history', authenticate, getHistory);
router.post('/history', authenticate, addHistory);

// Contact form (public)
router.post('/contact', submitContact);

export default router;
