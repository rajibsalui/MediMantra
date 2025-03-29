import express from 'express';
import {
  createPayment,
  getPaymentById,
  getUserPayments,
  getDoctorPayments,
  processPayment,
  verifyPayment,
  generateInvoice,
  refundPayment,
  getPaymentStatus,
  getPaymentAnalytics,
  getPendingPayments,
  generateReceipt,
  createPaymentIntent
} from '../controllers/payment.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create payments
router.post('/', authMiddleware, createPayment);
router.post('/intent', authMiddleware, createPaymentIntent);

// Get payment information
router.get('/:id', authMiddleware, getPaymentById);
router.get('/user/:userId', authMiddleware, getUserPayments);
router.get('/doctor/:doctorId', authMiddleware, getDoctorPayments);
router.get('/:id/status', authMiddleware, getPaymentStatus);

// Process payments
router.post('/:id/process', authMiddleware, processPayment);
router.post('/:id/verify', verifyPayment);
router.post('/:id/refund', authMiddleware, roleMiddleware(['admin']), refundPayment);

// Documents 
router.get('/:id/invoice', authMiddleware, generateInvoice);
router.get('/:id/receipt', authMiddleware, generateReceipt);

// Admin features
router.get('/admin/pending', authMiddleware, roleMiddleware(['admin']), getPendingPayments);
router.get('/analytics', authMiddleware, roleMiddleware(['admin']), getPaymentAnalytics);

export default router;
