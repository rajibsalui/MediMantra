import express from 'express';
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  sendTestNotification
} from '../controllers/notification.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get notifications
router.get('/', authMiddleware, getUserNotifications);
router.get('/unread/count', authMiddleware, getUnreadNotificationCount);

// Manage notifications
router.put('/:id/read', authMiddleware, markNotificationAsRead);
router.put('/read-all', authMiddleware, markAllNotificationsAsRead);
router.delete('/:id', authMiddleware, deleteNotification);

// Preferences 
router.get('/preferences', authMiddleware, getNotificationPreferences);
router.put('/preferences', authMiddleware, updateNotificationPreferences);

// Admin/system routes
router.post('/', authMiddleware, roleMiddleware(['admin']), createNotification);
router.post('/test', authMiddleware, roleMiddleware(['admin']), sendTestNotification);

export default router;
