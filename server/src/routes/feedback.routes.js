import express from 'express';
import {
  submitFeedback,
  getUserFeedback,
  getFeedbackById,
  updateFeedback,
  processFeedback,
  getAllFeedback,
  getFeedbackStatistics,
  deleteFeedback
} from '../controllers/feedback.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public feedback submission
router.post('/', submitFeedback);

// authMiddlewareed routes
router.use(authMiddleware);

// User feedback routes
router.get('/user', getUserFeedback);
router.get('/:id', getFeedbackById);
router.put('/:id', updateFeedback);

// Admin routes
router.use(roleMiddleware(['admin']));
router.get('/', getAllFeedback);
router.get('/statistics', getFeedbackStatistics);
router.put('/:id/process', processFeedback); // Changed from addInternalNote to processFeedback
router.delete('/:id', deleteFeedback);

export default router;
