import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import {
  createPrescription,
  getDoctorPrescriptions,
  getPrescription,
  updatePrescriptionStatus,
  downloadPrescriptionPDF
} from '../controllers/prescription.controller.js';

const router = express.Router();

/**
 * @route   POST /api/prescriptions
 * @desc    Create a new prescription
 * @access  Private (Doctor only)
 */
router.post('/', authMiddleware, roleMiddleware(['doctor']), createPrescription);

/**
 * @route   GET /api/prescriptions/doctor
 * @desc    Get all prescriptions for a doctor
 * @access  Private (Doctor only)
 */
router.get('/doctor', authMiddleware, roleMiddleware(['doctor']), getDoctorPrescriptions);

/**
 * @route   GET /api/prescriptions/:id
 * @desc    Get a single prescription
 * @access  Private (Doctor or Patient)
 */
router.get('/:id', authMiddleware, roleMiddleware(['doctor', 'patient']), getPrescription);

/**
 * @route   PUT /api/prescriptions/:id/status
 * @desc    Update prescription status
 * @access  Private (Doctor only)
 */
router.put('/:id/status', authMiddleware, roleMiddleware(['doctor']), updatePrescriptionStatus);

/**
 * @route   GET /api/prescriptions/:id/download
 * @desc    Download prescription PDF
 * @access  Private (Doctor or Patient)
 */
router.get('/:id/download', authMiddleware, roleMiddleware(['doctor', 'patient']), downloadPrescriptionPDF);

export default router;
