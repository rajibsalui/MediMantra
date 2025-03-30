import express from 'express';
import chatbotController from '../controllers/aichatbot.controller.js';

const router = express.Router();

// POST endpoint to handle user queries to the chatbot
router.post('/query', chatbotController.handleUserQuery);

export default router;
