import express from 'express';
import {
  createMedicalRecord,
  getMedicalRecordById,
  updateMedicalRecord,
  getMedicalRecordsForPatient,
  getMedicalRecordsForDoctor,
  addLabResult,
  addDocument,
  deleteDocument,
  updateAccessControl,
  shareMedicalRecord,
  revokeAccess,
  getAccessLog
} from '../controllers/medicalRecord.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';
import {uploadMiddleware} from '../middleware/upload.middleware.js';

const router = express.Router();

// Protect all routes
router.use(authMiddleware);

// Create a new medical record
router.post('/', authorize(['doctor', 'admin']), createMedicalRecord);

// Get medical record by ID
router.get('/:id', getMedicalRecordById);

// Update medical record
router.put('/:id', authorize(['doctor', 'admin']), updateMedicalRecord);

// Get medical records for patient
router.get('/patient/:patientId', getMedicalRecordsForPatient);

// Get medical records for doctor
router.get('/doctor/:doctorId', authorize(['doctor', 'admin']), getMedicalRecordsForDoctor);

// Add lab result
router.post('/:id/lab-result', authorize(['doctor', 'lab', 'admin']), addLabResult);

// Add document to medical record
router.post('/:id/document', uploadMiddleware.single('file'), addDocument);

// Delete document
router.delete('/:id/document/:documentId', deleteDocument);

// Update access control
router.put('/:id/access', updateAccessControl);

// Share medical record with another doctor
router.post('/:id/share', shareMedicalRecord);

// Revoke shared access
router.delete('/:id/share/:doctorId', revokeAccess);

// Get access log
router.get('/:id/access-log', getAccessLog);

export default router;
