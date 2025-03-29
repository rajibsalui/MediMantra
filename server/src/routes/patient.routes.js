import express from 'express';
import {
  getPatientProfile,
  updatePatientProfile,
  getPatientMedicalHistory,
  updateMedicalInformation,
  getPatientAppointments,
  getPatientPrescriptions,
  addAllergies,
  removeAllergies,
  updateEmergencyContact,
  getPatientLabResults,
  updateInsuranceInfo,
  getBMI,
  getAge,
  getPatientById
} from '../controllers/patient.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Patient profile routes
router.get('/profile', authMiddleware, roleMiddleware(['patient']), getPatientProfile);
router.put('/profile', authMiddleware, roleMiddleware(['patient']), updatePatientProfile);

// Medical information
router.get('/medical-history', authMiddleware, roleMiddleware(['patient']), getPatientMedicalHistory);
router.put('/medical-information', authMiddleware, roleMiddleware(['patient']), updateMedicalInformation);
router.post('/allergies', authMiddleware, roleMiddleware(['patient']), addAllergies);
router.delete('/allergies/:id', authMiddleware, roleMiddleware(['patient']), removeAllergies);

// Emergency contact
router.put('/emergency-contact', authMiddleware, roleMiddleware(['patient']), updateEmergencyContact);

// Insurance information
router.put('/insurance', authMiddleware, roleMiddleware(['patient']), updateInsuranceInfo);

// Health calculations
router.get('/bmi', authMiddleware, roleMiddleware(['patient']), getBMI);
router.get('/age', authMiddleware, roleMiddleware(['patient']), getAge);

// Patient records, appointments and prescriptions
router.get('/appointments', authMiddleware, roleMiddleware(['patient']), getPatientAppointments);
router.get('/prescriptions', authMiddleware, roleMiddleware(['patient']), getPatientPrescriptions);
router.get('/lab-results', authMiddleware, roleMiddleware(['patient']), getPatientLabResults);

// Doctor access to patient
router.get('/:id', authMiddleware, roleMiddleware(['doctor', 'admin']), getPatientById);

export default router;
