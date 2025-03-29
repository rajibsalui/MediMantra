import express from 'express';
import { register, login, logout, updateProfile, checkAuth, firebaseAuth } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  sendVerificationCodes,
  verifyCode,
  sendPhoneVerificationCode
} from '../controllers/verification.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/firebase', firebaseAuth);
router.post('/logout', protect, logout);
router.put('/update-profile', protect, updateProfile);
router.get('/check', protect, checkAuth);
router.post('/send-verification', protect, sendVerificationCodes);
router.post('/verify-code', protect, verifyCode);
router.put('/profile', protect, updateProfile);
router.post('/verify-phone/send', protect, sendPhoneVerificationCode);

export default router;