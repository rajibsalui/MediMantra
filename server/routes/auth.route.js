import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
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
  getCurrentUser,
  // googleAuth,
  // facebookAuth
} from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user & clear cookies
 * @access  Private
 */
router.post('/logout', authMiddleware, logout);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public (with refresh token)
 */
router.post('/refresh-token', refreshAccessToken);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify user email with token
 * @access  Public
 */
router.post('/verify-email', verifyEmail);

/**
 * @route   POST /api/auth/resend-verification-email
 * @desc    Resend verification email
 * @access  Public
 */
router.post('/resend-verification-email', resendVerificationEmail);

/**
 * @route   POST /api/auth/verify-phone
 * @desc    Verify user phone number with OTP
 * @access  Public
 */
router.post('/verify-phone', verifyPhone);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', resetPassword);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change password for authenticated user
 * @access  Private
 */
router.put('/change-password', authMiddleware, changePassword);

/**
 * @route   GET /api/auth/current-user
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/current-user', authMiddleware, getCurrentUser);

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate with Google
 * @access  Public
 */
// router.post('/google', googleAuth);

/**
 * @route   POST /api/auth/facebook
 * @desc    Authenticate with Facebook
 * @access  Public
 */
// router.post('/facebook', facebookAuth);

export default router;