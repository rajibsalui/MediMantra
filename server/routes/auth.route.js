import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { checkRole } from '../middleware/auth.middleware.js';
import {
  register,
  login,
  logout,
  refreshAccessToken,
  verifyEmail,
  resendVerificationEmail,
  verifyPhone,
  forgotPassword,
  resetPassword,
  changePassword,
  updateEmail,
  getCurrentUser
} from '../controllers/auth.controller.js';

import {
  registerDoctor,
  loginDoctor,
  completeDoctorProfile,
  uploadVerificationDocs
} from '../controllers/doctorAuth.controller.js';

const router = express.Router();

// Patient routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.post('/refresh-token', refreshAccessToken);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification-email', resendVerificationEmail);
router.post('/verify-phone', verifyPhone);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/change-password', authMiddleware, changePassword);
router.put('/update-email', authMiddleware, updateEmail);
router.get('/current-user', authMiddleware, getCurrentUser);

// Doctor specific routes
router.post('/doctor/register', registerDoctor);
router.post('/doctor/login', loginDoctor);
router.put('/doctor/complete-profile', authMiddleware, checkRole('doctor'), completeDoctorProfile);
router.post('/doctor/verification-documents', authMiddleware, checkRole('doctor'), uploadVerificationDocs);

export default router;