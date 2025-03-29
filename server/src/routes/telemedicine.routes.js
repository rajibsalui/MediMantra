import express from 'express';
import {
  createSession,
  getSessionById,
  startSession,
  endSession,
  joinSession,
  getUpcomingSessions,
  getPastSessions,
  cancelSession
} from '../controllers/telemedicine.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// authMiddleware all routes
router.use(authMiddleware);

// Create telemedicine session
router.post('/', roleMiddleware(['doctor']), createSession);

// Get session by ID
router.get('/:id', getSessionById);

// Start session (doctor only)
router.post('/:id/start', roleMiddleware(['doctor']), startSession);

// End session (doctor only)
router.post('/:id/end', roleMiddleware(['doctor']), endSession);

// Join session
router.post('/:id/join', joinSession);

// Get upcoming sessions
router.get('/upcoming', getUpcomingSessions);

// Get past sessions
router.get('/history', getPastSessions);

// Cancel session
router.post('/:id/cancel', cancelSession);

export default router;
