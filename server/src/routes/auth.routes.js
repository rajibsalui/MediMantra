import express from 'express';
import { 
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  verifyPhone,
  registerDoctor,
  googleAuth,
  facebookAuth,
  getCurrentUser
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Authentication routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', authMiddleware, logoutUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/change-password', authMiddleware, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Email and phone verification
router.post('/verify-email/:token', verifyEmail);
router.post('/resend-verification-email', resendVerificationEmail);
router.post('/verify-phone', verifyPhone);

// Doctor registration (requires additional info and verification)
router.post('/register-doctor', registerDoctor);

// Social authentication
router.post('/google', googleAuth);
router.post('/facebook', facebookAuth);

// Current user
router.get('/me', authMiddleware, getCurrentUser);

export default router;