import express from 'express';
import {
  createPrescription,
  getPrescriptionById,
  getPrescriptionsForPatient,
  getPrescriptionsForDoctor,
  updatePrescription,
  addMedication,
  removeMedication,
  updateMedication,
  markDispensed,
  markCompleted,
  checkDrugInteractions,
  generatePrescriptionPDF,
  getActivePrescriptionsForPatient,
  verifyPrescription
} from '../controllers/prescription.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create and update prescriptions
router.post('/', authMiddleware, roleMiddleware(['doctor']), createPrescription);
router.put('/:id', authMiddleware, roleMiddleware(['doctor']), updatePrescription);

// Get prescriptions
router.get('/:id', authMiddleware, getPrescriptionById);
router.get('/patient/:patientId', authMiddleware, getPrescriptionsForPatient);
router.get('/doctor/:doctorId', authMiddleware, getPrescriptionsForDoctor);
router.get('/patient/:patientId/active', authMiddleware, getActivePrescriptionsForPatient);

// Medication management
router.post('/:id/medication', authMiddleware, roleMiddleware(['doctor']), addMedication);
router.delete('/:id/medication/:medicationId', authMiddleware, roleMiddleware(['doctor']), removeMedication);
router.put('/:id/medication/:medicationId', authMiddleware, roleMiddleware(['doctor']), updateMedication);

// Prescription status
router.put('/:id/dispense', authMiddleware, roleMiddleware(['pharmacy', 'admin']), markDispensed);
router.put('/:id/complete', authMiddleware, roleMiddleware(['doctor', 'pharmacy', 'admin']), markCompleted);

// Utilities
router.post('/check-interactions', authMiddleware, roleMiddleware(['doctor', 'pharmacy']), checkDrugInteractions);
router.get('/:id/pdf', authMiddleware, generatePrescriptionPDF);
router.get('/:id/verify', verifyPrescription);

export default router;
