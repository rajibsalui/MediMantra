import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  getConversations,
  getConversationMessages,
  startConversation,
  requestConversation,
  respondToConversationRequest,
  getConversationRequests,
  sendMessage,
  markMessageAsRead,
  deleteConversation
} from '../controllers/message.controller.js';

const router = express.Router();

/**
 * @route   GET /api/messages/conversations
 * @desc    Get all conversations for the current user
 * @access  Private
 */
router.get('/conversations', authMiddleware, getConversations);

/**
 * @route   GET /api/messages/conversations/:conversationId
 * @desc    Get messages for a specific conversation
 * @access  Private
 */
router.get('/conversations/:conversationId', authMiddleware, getConversationMessages);

/**
 * @route   POST /api/messages/conversations
 * @desc    Start a new conversation or get existing one (doctor only)
 * @access  Private
 */
router.post('/conversations', authMiddleware, startConversation);

/**
 * @route   POST /api/messages/conversations/request
 * @desc    Request a new conversation with a doctor (patient only)
 * @access  Private
 */
router.post('/conversations/request', authMiddleware, requestConversation);

/**
 * @route   GET /api/messages/conversations/requests
 * @desc    Get all conversation requests (doctor only)
 * @access  Private
 */
router.get('/conversations/requests', authMiddleware, getConversationRequests);

/**
 * @route   PATCH /api/messages/conversations/:conversationId/respond
 * @desc    Respond to a conversation request (doctor only)
 * @access  Private
 */
router.patch('/conversations/:conversationId/respond', authMiddleware, respondToConversationRequest);

/**
 * @route   POST /api/messages
 * @desc    Send a message (HTTP fallback)
 * @access  Private
 */
router.post('/', authMiddleware, sendMessage);

/**
 * @route   PATCH /api/messages/:messageId/read
 * @desc    Mark a message as read
 * @access  Private
 */
router.patch('/:messageId/read', authMiddleware, markMessageAsRead);

/**
 * @route   DELETE /api/messages/conversations/:conversationId
 * @desc    Delete a conversation (soft delete)
 * @access  Private
 */
router.delete('/conversations/:conversationId', authMiddleware, deleteConversation);

export default router;
