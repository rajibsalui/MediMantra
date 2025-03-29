import express from 'express';
import {
  getProfile,
  updateProfile,
  updateAvatar,
  deleteAccount,
  updatePreferences,
  getNotificationSettings,
  updateNotificationSettings,
  searchUsers,
  addDeviceToken,
  removeDeviceToken
} from '../controllers/user.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';
import { uploadMiddleware } from '../middleware/upload.middleware.js';

const router = express.Router();

// User profile routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/avatar', authMiddleware, uploadMiddleware.single('avatar'), updateAvatar);
router.delete('/', authMiddleware, deleteAccount);

// User preferences
router.put('/preferences', authMiddleware, updatePreferences);
router.get('/notification-settings', authMiddleware, getNotificationSettings);
router.put('/notification-settings', authMiddleware, updateNotificationSettings);

// Device tokens for push notifications
router.post('/device-token', authMiddleware, addDeviceToken);
router.delete('/device-token/:token', authMiddleware, removeDeviceToken);

// Admin routes for user management
router.get('/search', authMiddleware, roleMiddleware(['admin']), searchUsers);

export default router;