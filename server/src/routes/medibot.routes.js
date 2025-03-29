import express from 'express';
// import {
//   startConversation,
//   sendMessage,
//   getConversationById,
//   getUserConversations,
//   provideRecommendations,
//   provideConversationFeedback,
//   getUrgentConversations,
//   searchMedicalKnowledge,
//   getRecentConversations
// } from '../controllers/medibot.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Conversation management
// router.post('/conversation', authMiddleware, startConversation);
// router.get('/conversation/:id', authMiddleware, getConversationById);
// router.get('/conversations', authMiddleware, getUserConversations);
// router.get('/conversations/recent', authMiddleware, getRecentConversations);
// // router.put('/conversation/:id/complete', authMiddleware, completeConversation);

// // Messaging
// router.post('/conversation/:id/message', authMiddleware, sendMessage);

// // Analysis and recommendations
// // router.post('/conversation/:id/analyze', authMiddleware, analyzeSymptoms);
// router.post('/conversation/:id/recommend', authMiddleware, provideRecommendations);

// // Feedback and escalation
// router.post('/conversation/:id/feedback', authMiddleware, provideConversationFeedback);
// // router.post('/conversation/:id/escalate', authMiddleware, escalateToDoctor);

// Admin and doctor routes
// router.get('/conversations/urgent', authMiddleware, roleMiddleware(['doctor', 'admin']), getUrgentConversations);

// // Knowledge base
// router.get('/knowledge/search', authMiddleware, searchMedicalKnowledge);

export default router;
