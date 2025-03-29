import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  // This will be implemented in the controller
});

router.get('/profile', authMiddleware, (req, res) => {
  // This will be implemented in the controller
});

router.get('/:id', authMiddleware, (req, res) => {
  // This will be implemented in the controller
});

router.put('/profile', authMiddleware, (req, res) => {
  // This will be implemented in the controller
});

router.put('/medical-info', authMiddleware, (req, res) => {
  // This will be implemented in the controller
});

router.put('/emergency-contact', authMiddleware, (req, res) => {
  // This will be implemented in the controller
});

router.put('/insurance', authMiddleware, (req, res) => {
  // This will be implemented in the controller
});

router.get('/appointments', authMiddleware, (req, res) => {
  // This will be implemented in the controller
});

router.get('/prescriptions', authMiddleware, (req, res) => {
  // This will be implemented in the controller
});

router.get('/medical-records', authMiddleware, (req, res) => {
  // This will be implemented in the controller
});

router.get('/upcoming-appointments', authMiddleware, (req, res) => {
  // This will be implemented in the controller
});

router.put('/profile-picture', authMiddleware, (req, res) => {
  // This will be implemented in the controller
});

router.delete('/', authMiddleware, (req, res) => {
  // This will be implemented in the controller
});

export default router;