import express from 'express';
import {
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorsList,
  getDoctorById,
  updateAvailability,
  updateConsultationFee,
  getAppointments,
  getPatients,
  getPrescriptions,
  addQualification,
  removeQualification,
  addVerificationDocument,
  getVerificationStatus,
  updatePracticeLocations,
  getDoctorReviews,
  respondToReview,
  getDoctorsBySpecialization,
  getTopRatedDoctors,
  searchDoctors
} from '../controllers/doctor.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';
import { uploadMiddleware } from '../middleware/upload.middleware.js';

const router = express.Router();

// Doctor profile routes
router.get('/profile', authMiddleware, roleMiddleware(['doctor']), getDoctorProfile);
router.put('/profile', authMiddleware, roleMiddleware(['doctor']), updateDoctorProfile);

// Doctor availability and fees
router.put('/availability', authMiddleware, roleMiddleware(['doctor']), updateAvailability);
router.put('/consultation-fee', authMiddleware, roleMiddleware(['doctor']), updateConsultationFee);

// Doctor's appointments, patients, and prescriptions
router.get('/appointments', authMiddleware, roleMiddleware(['doctor']), getAppointments);
router.get('/patients', authMiddleware, roleMiddleware(['doctor']), getPatients);
router.get('/prescriptions', authMiddleware, roleMiddleware(['doctor']), getPrescriptions);

// Doctor qualifications and verification
router.post('/qualification', authMiddleware, roleMiddleware(['doctor']), addQualification);
router.delete('/qualification/:id', authMiddleware, roleMiddleware(['doctor']), removeQualification);
router.post('/verification-document', authMiddleware, roleMiddleware(['doctor']), uploadMiddleware.single('document'), addVerificationDocument);
router.get('/verification-status', authMiddleware, roleMiddleware(['doctor']), getVerificationStatus);

// Practice locations
router.put('/practice-locations', authMiddleware, roleMiddleware(['doctor']), updatePracticeLocations);

// Doctor reviews
router.get('/reviews', authMiddleware, roleMiddleware(['doctor']), getDoctorReviews);
router.post('/reviews/:reviewId/respond', authMiddleware, roleMiddleware(['doctor']), respondToReview);

// Public routes for finding doctors
router.get('/', getDoctorsList);
router.get('/specialization/:specialization', getDoctorsBySpecialization);
router.get('/top-rated', getTopRatedDoctors);
router.get('/search', searchDoctors);
router.get('/:id', getDoctorById);

export default router;
