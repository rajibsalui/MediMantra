import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  getCallHistory,
  saveCallRecord
} from '../controllers/videoCall.controller.js';

const router = express.Router();

/**
 * @route   GET /api/video-calls/history
 * @desc    Get call history for the current user
 * @access  Private
 */
router.get('/history', authMiddleware, getCallHistory);

/**
 * @route   POST /api/video-calls/record
 * @desc    Save a call record
 * @access  Private
 */
router.post('/record', authMiddleware, saveCallRecord);

export default router;
