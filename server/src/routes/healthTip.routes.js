import express from 'express';
import {
  createHealthTip,
  getAllHealthTips,
  getHealthTipById,
  updateHealthTip,
  deleteHealthTip,
  getFeaturedHealthTips,
  getHealthTipsByAuthor,
  likeHealthTip,
  getCategories,
  getRelatedHealthTips,
  getPendingHealthTips
} from '../controllers/healthTip.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllHealthTips);
router.get('/featured', getFeaturedHealthTips);
router.get('/categories', getCategories);
router.get('/:id', getHealthTipById);
router.get('/:id/related', getRelatedHealthTips);

// authMiddlewareed routes
router.use(authMiddleware);

// Author-specific routes
router.get('/author/:authorId', getHealthTipsByAuthor);

// User interaction routes
router.post('/:id/like', likeHealthTip);

// Content creation/management routes (doctors and admin only)
router.post('/', roleMiddleware(['doctor', 'admin']), createHealthTip);
router.put('/:id', roleMiddleware(['doctor', 'admin']), updateHealthTip);
router.delete('/:id', roleMiddleware(['doctor', 'admin']), deleteHealthTip);

// Admin-only routes
router.get('/admin/pending', roleMiddleware(['admin']), getPendingHealthTips);

export default router;
