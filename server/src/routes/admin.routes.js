import express from 'express';
import {
  getDashboardStats,
  getUserList,
  getUserProfile,
  updateUserStatus,
  verifyDoctor,
  getPendingDoctorVerifications,
  sendSystemNotification,
  deleteUser
} from '../controllers/admin.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// authMiddleware all routes and restrict to admin
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getUserList);
router.get('/users/:id', getUserProfile);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Doctor verification
router.get('/doctors/pending-verification', getPendingDoctorVerifications);
router.put('/doctors/:id/verify', verifyDoctor);

// Notifications
router.post('/notifications', sendSystemNotification);

export default router;
