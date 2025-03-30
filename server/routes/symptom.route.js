import express from 'express';
import { analyzeSymptoms } from '../controllers/symptom.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/symptom-checker/analyze
 * @desc    Analyze symptoms and provide health recommendations
 * @access  Public (can be made private with authMiddleware)
 */
router.post('/analyze', analyzeSymptoms);

export default router;