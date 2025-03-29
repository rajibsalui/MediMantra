import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { upload } from '../utils/uploadFile.js';
import {
  sendMessage,
  getConversation,
  deleteMessage,
  markMessageAsRead,
  markMessageAsDelivered,
  editMessage,
  addReaction,
  removeReaction,
  replyToMessage,
  getUnreadMessages,
  deleteChat
} from '../controllers/message.controller.js';

const router = express.Router();

// Basic message operations
router.post('/send/:userId', authMiddleware, upload.single('file'), sendMessage);
router.get('/conversation/:userId', authMiddleware, getConversation);
router.delete('/:messageId', authMiddleware, deleteMessage);

// Message status
router.put('/read/:messageId', authMiddleware , markMessageAsRead);
router.put('/deliver/:messageId', authMiddleware, markMessageAsDelivered);
router.get('/unread', authMiddleware, getUnreadMessages);

// Message interactions
router.put('/edit/:messageId', authMiddleware, editMessage);
router.post('/reply/:messageId', authMiddleware, upload.single('file'), replyToMessage);
router.post('/reaction/:messageId', authMiddleware, addReaction);
router.delete('/reaction/:messageId', authMiddleware, removeReaction);

// New route for deleting chat
router.delete('/chats/:chatId', authMiddleware, deleteChat);

// Update the reaction routes
router.delete('/reactions/:messageId/:reactionType', authMiddleware, removeReaction);

export default router;