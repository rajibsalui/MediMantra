import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  getPatientProfile,
  updatePatientProfile,
  getPatientAppointments,
  bookAppointment,
  cancelAppointment,
  updateProfileImage,
  getPatientMedicalRecords,
  getPatientVitalStats,
  rateDoctorAfterAppointment
} from '../controllers/patient.controller.js';

const router = express.Router();

/**
 * @route   GET /api/patients/profile
 * @desc    Get patient profile
 * @access  Private (Patient only)
 */
router.get('/profile', authMiddleware, getPatientProfile);

/**
 * @route   PUT /api/patients/profile
 * @desc    Update patient profile
 * @access  Private (Patient only)
 */
router.put('/profile', authMiddleware, updatePatientProfile);

/**
 * @route   GET /api/patients/appointments
 * @desc    Get patient appointments
 * @access  Private (Patient only)
 */
router.get('/appointments', authMiddleware, getPatientAppointments);

/**
 * @route   POST /api/patients/appointments
 * @desc    Book an appointment
 * @access  Private (Patient only)
 */
router.post('/appointments', authMiddleware, bookAppointment);

/**
 * @route   PUT /api/patients/appointments/:id/cancel
 * @desc    Cancel appointment
 * @access  Private (Patient only)
 */
router.put('/appointments/:id/cancel', authMiddleware, cancelAppointment);

/**
 * @route   PUT /api/patients/profile-image
 * @desc    Update patient profile image
 * @access  Private (Patient only)
 */
router.put('/profile-image', authMiddleware, updateProfileImage);

/**
 * @route   GET /api/patients/medical-records
 * @desc    Get patient medical records
 * @access  Private (Patient only)
 */
router.get('/medical-records', authMiddleware, getPatientMedicalRecords);

/**
 * @route   GET /api/patients/vital-stats
 * @desc    Get patient vital statistics
 * @access  Private (Patient only)
 */
router.get('/vital-stats', authMiddleware, getPatientVitalStats);

/**
 * @route   POST /api/patients/doctors/:doctorId/rate
 * @desc    Rate a doctor after appointment
 * @access  Private (Patient only)
 */
router.post('/doctors/:doctorId/rate', authMiddleware, rateDoctorAfterAppointment);

export default router;