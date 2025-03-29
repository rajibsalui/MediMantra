import express from 'express';
import {
  createUpdatePharmacyProfile,
  getPharmacyById,
  updatePharmacy,
  listPharmacies,
  searchPharmacies,
  getNearbyPharmacies,
  getPharmacyByService,
  updatePharmacyStatus,
  verifyPharmacy,
  addPharmacyReview,
  getPharmacyReviews,
  updatePharmacyHours,
  getPharmacyBySpecialty
} from '../controllers/pharmacy.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';
import { uploadMiddleware } from '../middleware/upload.middleware.js';

const router = express.Router();

// Pharmacy CRUD operations
router.post('/', authMiddleware, roleMiddleware(['admin', 'pharmacy']), createUpdatePharmacyProfile);
router.get('/:id', getPharmacyById);
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'pharmacy']), updatePharmacy);

// Pharmacy listings
router.get('/', listPharmacies);
router.get('/search', searchPharmacies);
router.get('/nearby', getNearbyPharmacies);
router.get('/service/:service', getPharmacyByService);
router.get('/specialty/:specialty', getPharmacyBySpecialty);

// Pharmacy management
router.put('/:id/hours', authMiddleware, roleMiddleware(['admin', 'pharmacy']), updatePharmacyHours);
router.put('/:id/status', authMiddleware, roleMiddleware(['admin']), updatePharmacyStatus);
router.put('/:id/verify', authMiddleware, roleMiddleware(['admin']), verifyPharmacy);

// Pharmacy reviews
router.post('/:id/review', authMiddleware, roleMiddleware(['patient']), addPharmacyReview);
router.get('/:id/reviews', getPharmacyReviews);

export default router;
