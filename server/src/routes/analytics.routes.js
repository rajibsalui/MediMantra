import express from 'express';
import {
  getGeneralAnalytics,
  getDoctorPerformanceAnalytics,
  getPatientEngagementAnalytics,
  getRevenueAnalytics,
  getOperationalAnalytics
} from '../controllers/analytics.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// authMiddleware all routes and restrict to admin
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

// Analytics routes
router.get('/general', getGeneralAnalytics);
router.get('/doctor/:doctorId', getDoctorPerformanceAnalytics);
router.get('/patient-engagement', getPatientEngagementAnalytics);
router.get('/revenue', getRevenueAnalytics);
router.get('/operational', getOperationalAnalytics);

export default router;
