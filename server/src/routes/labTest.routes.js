import express from 'express';
import {
  createLabTest,
  getLabTestById,
  getLabTestsForPatient,
  getPendingLabTests,
  updateLabTestResults,
  verifyLabTestResults,
  getLabTestStatistics
} from '../controllers/labTest.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// authMiddleware all routes
router.use(authMiddleware);

// Create a new lab test
router.post('/', roleMiddleware(['doctor', 'admin']), createLabTest);

// Get lab test by ID
router.get('/:id', getLabTestById);

// Get lab tests for patient
router.get('/patient/:patientId', getLabTestsForPatient);

// Get pending lab tests for lab staff
router.get('/pending', roleMiddleware(['lab', 'admin']), getPendingLabTests);

// Update lab test results
router.put('/:id/results', roleMiddleware(['lab', 'admin']), updateLabTestResults);

// Verify lab test results
router.put('/:id/verify', roleMiddleware(['doctor', 'admin']), verifyLabTestResults);

// Get lab test statistics
router.get('/statistics', roleMiddleware(['lab', 'admin']), getLabTestStatistics);

// Note: cancelLabOrder route has been removed as the function doesn't exist
// If you need this functionality, use updateLabTestResults with a status of 'cancelled'

export default router;
