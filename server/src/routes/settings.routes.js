import express from 'express';
import {
  getUserSettings,
  updateUserSettings,
  updateAvatar,
  changePassword,
  deleteAccount,
  getSystemSettings,
  updateSystemSettings
} from '../controllers/settings.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';
import { uploadMiddleware } from '../middleware/upload.middleware.js';

const router = express.Router();

// authMiddleware all routes
router.use(authMiddleware);

// User settings routes
router.get('/user', getUserSettings);
router.put('/user', updateUserSettings);
router.put('/avatar', uploadMiddleware.single('avatar'), updateAvatar);
router.post('/password', changePassword);
router.delete('/account', deleteAccount);

// System settings routes (admin only)
router.get('/system', roleMiddleware(['admin']), getSystemSettings);
router.put('/system', roleMiddleware(['admin']), updateSystemSettings);

export default router;
