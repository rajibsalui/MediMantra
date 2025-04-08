import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  getDoctors,
  getDoctorById,
  updateDoctorProfile,
  updateAvailability,
  uploadVerificationDocuments,
  getDoctorAppointments,
  getDoctorPatients,
  getPatientById,
  getPatientAppointments,
  getPatientPrescriptions,
  getPatientMedicalRecords,
  getDoctorReviews,
  addEducation,
  removeEducation,
  updateProfileImage,
  getDoctorDashboardStats,
  getDoctorProfile,
  verifyDoctor,
  rejectDoctor,
  searchDoctors,
  searchPatients,
  filterDoctorsBySpecialty,
  toggleDoctorAvailability,
  deleteDoctor,
  getDoctorAvailability,
  getAppointmentById,
  updateAppointmentStatus,
  updateAppointmentDetails
} from '../controllers/doctor.controller.js';

const router = express.Router();

/**
 * @route   GET /api/doctors
 * @desc    Get all doctors (with pagination)
 * @access  Public
 */
router.get('/', getDoctors);

/**
 * @route   GET /api/doctors/search
 * @desc    Search doctors by name or specialty
 * @access  Public
 */
router.get('/search', searchDoctors);

/**
 * @route   GET /api/doctors/specialty/:specialty
 * @desc    Filter doctors by specialty
 * @access  Public
 */
router.get('/specialty/:specialty', filterDoctorsBySpecialty);

/**
 * @route   GET /api/doctors/profile
 * @desc    Get current doctor's profile
 * @access  Private (Doctor only)
 */
router.get('/profile', authMiddleware, getDoctorProfile);

/**
 * @route   GET /api/doctors/patients/search
 * @desc    Search patients by name or email
 * @access  Private (Doctor only)
 */
router.get('/patients/search', authMiddleware, searchPatients);


/**
 * @route   GET /api/doctors/:id/availability
 * @desc    Get doctor availability for a specific date
 * @access  Public
 */
router.get('/:id/availability', getDoctorAvailability);

/**
 * @route   PUT /api/doctors/profile
 * @desc    Update doctor's profile
 * @access  Private (Doctor only)
 */
router.put('/profile', authMiddleware, updateDoctorProfile);

/**
 * @route   PUT /api/doctors/availability
 * @desc    Update doctor's availability
 * @access  Private (Doctor only)
 */
router.put('/availability', authMiddleware, updateAvailability);

/**
 * @route   POST /api/doctors/verification-documents
 * @desc    Upload verification documents
 * @access  Private (Doctor only)
 */
router.post('/verification-documents', authMiddleware, uploadVerificationDocuments);

/**
 * @route   GET /api/doctors/appointments
 * @desc    Get doctor's appointments
 * @access  Private (Doctor only)
 */
router.get('/appointments', authMiddleware, getDoctorAppointments);

/**
 * @route   GET /api/doctors/patients
 * @desc    Get doctor's patients
 * @access  Private (Doctor only)
 */
router.get('/patients', authMiddleware, getDoctorPatients);

/**
 * @route   GET /api/doctors/patients/:id
 * @desc    Get a specific patient by ID
 * @access  Private (Doctor only)
 */
router.get('/patients/:id', authMiddleware, getPatientById);

/**
 * @route   GET /api/doctors/patients/:id/appointments
 * @desc    Get appointments for a specific patient
 * @access  Private (Doctor only)
 */
router.get('/patients/:id/appointments', authMiddleware, getPatientAppointments);

/**
 * @route   GET /api/doctors/patients/:id/prescriptions
 * @desc    Get prescriptions for a specific patient
 * @access  Private (Doctor only)
 */
router.get('/patients/:id/prescriptions', authMiddleware, getPatientPrescriptions);

/**
 * @route   GET /api/doctors/patients/:id/medical-records
 * @desc    Get medical records for a specific patient
 * @access  Private (Doctor only)
 */
router.get('/patients/:id/medical-records', authMiddleware, getPatientMedicalRecords);

/**
 * @route   GET /api/doctors/reviews
 * @desc    Get doctor's reviews
 * @access  Private (Doctor only)
 */
router.get('/reviews', authMiddleware, getDoctorReviews);

/**
 * @route   POST /api/doctors/education
 * @desc    Add education to doctor's profile
 * @access  Private (Doctor only)
 */
router.post('/education', authMiddleware, addEducation);

/**
 * @route   DELETE /api/doctors/education/:eduId
 * @desc    Remove education from doctor's profile
 * @access  Private (Doctor only)
 */
router.delete('/education/:eduId', authMiddleware, removeEducation);

/**
 * @route   PUT /api/doctors/profile-image
 * @desc    Update doctor's profile image
 * @access  Private (Doctor only)
 */
router.put('/profile-image', authMiddleware, updateProfileImage);

/**
 * @route   GET /api/doctors/dashboard-stats
 * @desc    Get doctor's dashboard statistics
 * @access  Private (Doctor only)
 */
router.get('/dashboard-stats', authMiddleware, getDoctorDashboardStats);

/**
 * @route   PUT /api/doctors/:id/verify
 * @desc    Verify a doctor (Admin only)
 * @access  Private (Admin only)
 */
router.put('/:id/verify', authMiddleware, verifyDoctor);

/**
 * @route   PUT /api/doctors/:id/reject
 * @desc    Reject a doctor (Admin only)
 * @access  Private (Admin only)
 */
router.put('/:id/reject', authMiddleware, rejectDoctor);

/**
 * @route   PUT /api/doctors/toggle-availability
 * @desc    Toggle doctor's availability status
 * @access  Private (Doctor only)
 */
router.put('/toggle-availability', authMiddleware, toggleDoctorAvailability);

/**
 * @route   DELETE /api/doctors
 * @desc    Delete doctor's account
 * @access  Private (Doctor only)
 */
router.delete('/', authMiddleware, deleteDoctor);

/**
 * @route   GET /api/doctors/appointments/:id
 * @desc    Get a single appointment by ID
 * @access  Private (Doctor only)
 */
router.get('/appointments/:id', authMiddleware, getAppointmentById);

/**
 * @route   PUT /api/doctors/appointments/:id/status
 * @desc    Update appointment status
 * @access  Private (Doctor only)
 */
router.put('/appointments/:id/status', authMiddleware, updateAppointmentStatus);

/**
 * @route   PUT /api/doctors/appointments/:id
 * @desc    Update appointment details
 * @access  Private (Doctor only)
 */
router.put('/appointments/:id', authMiddleware, updateAppointmentDetails);

/**
 * @route   GET /api/doctors/:id
 * @desc    Get doctor by ID
 * @access  Public
 */
router.get('/:id', getDoctorById);
export default router;