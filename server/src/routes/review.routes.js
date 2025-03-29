import express from 'express';
import {
  createReview,
  getReviewById,
  getReviewsForDoctor,
  getReviewsByPatient,
  updateReview,
  deleteReview,
  markReviewHelpful,
  reportReview,
  respondToReview,
  moderateReview,
  getPendingReviews,
  getReviewMetrics
} from '../controllers/review.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create and manage reviews
router.post('/', authMiddleware, roleMiddleware(['patient']), createReview);
router.get('/:id', getReviewById);
router.put('/:id', authMiddleware, updateReview);
router.delete('/:id', authMiddleware, deleteReview);

// Doctor-specific review routes
router.get('/doctor/:doctorId', getReviewsForDoctor);
router.post('/:id/respond', authMiddleware, roleMiddleware(['doctor']), respondToReview);

// Patient review routes
router.get('/patient/:patientId', authMiddleware, getReviewsByPatient);

// Review interactions
router.post('/:id/helpful', authMiddleware, markReviewHelpful);
router.post('/:id/report', authMiddleware, reportReview);

// Admin moderation
router.get('/moderation/pending', authMiddleware, roleMiddleware(['admin']), getPendingReviews);
router.put('/:id/moderate', authMiddleware, roleMiddleware(['admin']), moderateReview);

// Analytics
router.get('/metrics/doctor/:doctorId', authMiddleware, roleMiddleware(['doctor', 'admin']), getReviewMetrics);

export default router;
