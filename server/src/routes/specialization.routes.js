import express from 'express';
// import {
//   createSpecialization,
//   getSpecializationById,
//   getAllSpecializations,
//   updateSpecialization,
//   deleteSpecialization,
//   getPopularSpecializations,
//   getSpecializationsByCondition,
//   getTopLevelSpecializations,
//   getSubSpecializations,
//   updateAverageConsultationFee,
//   getSpecializationDetails
// } from '../controllers/specialization.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';
import { uploadMiddleware } from '../middleware/upload.middleware.js';

const router = express.Router();

// CRUD operations
router.post('/', authMiddleware, roleMiddleware(['admin']), createSpecialization);
router.get('/:id', getSpecializationById);
router.get('/', getAllSpecializations);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateSpecialization);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteSpecialization);

// // Specialized queries
router.get('/popular', getPopularSpecializations);
router.get('/condition/:condition', getSpecializationsByCondition);
router.get('/top-level', getTopLevelSpecializations);
router.get('/:id/subspecializations', getSubSpecializations);
router.get('/:id/details', getSpecializationDetails);

// // Administrative functions
router.put('/:id/update-fee', authMiddleware, roleMiddleware(['admin']), updateAverageConsultationFee);

export default router;
