import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', (req, res) => {
  // This will be implemented in the controller
});

router.post('/login', (req, res) => {
  // This will be implemented in the controller
});

router.post('/logout', authMiddleware, (req, res) => {
  // This will be implemented in the controller
});

router.post('/refresh-token', (req, res) => {
  // This will be implemented in the controller
});

router.post('/verify-email', (req, res) => {
  // This will be implemented in the controller
});

router.post('/resend-verification-email', (req, res) => {
  // This will be implemented in the controller
});

router.post('/verify-phone', (req, res) => {
  // This will be implemented in the controller
});

router.post('/forgot-password', (req, res) => {
  // This will be implemented in the controller
});

router.post('/reset-password', (req, res) => {
  // This will be implemented in the controller
});

router.put('/change-password', authMiddleware, (req, res) => {
  // This will be implemented in the controller
});

router.get('/current-user', authMiddleware, (req, res) => {
  // This will be implemented in the controller
});

router.post('/google', (req, res) => {
  // This will be implemented in the controller
});

router.post('/facebook', (req, res) => {
  // This will be implemented in the controller
});

export default router;