import express from 'express';
import {
  getPatientDashboard,
  getDoctorDashboard,
  getAdminDashboard,
  getQuickStats,
  getActivityLog
} from '../controllers/dashboard.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// authMiddleware all routes
router.use(authMiddleware);

// Dashboard routes
router.get('/patient', roleMiddleware(['patient']), getPatientDashboard);
router.get('/doctor', roleMiddleware(['doctor']), getDoctorDashboard);
router.get('/admin', roleMiddleware(['admin']), getAdminDashboard);
router.get('/quick-stats', getQuickStats);
router.get('/activity', getActivityLog);

export default router;
