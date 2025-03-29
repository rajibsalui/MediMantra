import express from 'express';
import {
  createOrUpdateConsent,
  revokeConsent,
  getConsentById,
  getConsentsForPatient,
  getConsentsForDoctor,
  checkConsent,
  requestConsent,
  getConsentRequestsForPatient,
  respondToConsentRequest,
  getConsentTypes
} from '../controllers/consent.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// authMiddleware all routes
router.use(authMiddleware);

// Create or update consent
router.post('/', createOrUpdateConsent);

// Revoke consent
router.put('/:id/revoke', revokeConsent);

// Get consent by ID
router.get('/:id', getConsentById);

// Get consents for patient
router.get('/patient/:patientId', getConsentsForPatient);

// Get consents for doctor
router.get('/doctor/:doctorId', getConsentsForDoctor);

// Check if consent exists
router.get('/check', checkConsent);

// Request consent from patient (doctor only)
router.post('/request', roleMiddleware(['doctor']), requestConsent);

// Get consent requests for patient
router.get('/requests/patient', roleMiddleware(['patient']), getConsentRequestsForPatient);

// Respond to consent request
router.put('/requests/:id/respond', roleMiddleware(['patient']), respondToConsentRequest);

// Get consent types (admin only)
router.get('/types', roleMiddleware(['admin']), getConsentTypes);

export default router;
