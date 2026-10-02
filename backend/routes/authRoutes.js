import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  getPoetPublicProfile,
  toggleFollowUser,
  getMyNotifications,
  markNotificationsRead,
  forgotPassword,
  resetPasswordWithOtp,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordWithOtp);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/poet/:id', getPoetPublicProfile);

// Follow & notifications
router.post('/follow/:id', protect, toggleFollowUser);
router.get('/notifications', protect, getMyNotifications);
router.put('/notifications/read', protect, markNotificationsRead);

export default router;
