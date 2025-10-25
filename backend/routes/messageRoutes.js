import express from 'express';
import {
  getChatHistory,
  sendMessage,
  markAsRead,
  getConversations
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getChatHistory);
router.post('/', protect, sendMessage);
router.put('/:userId/read', protect, markAsRead);

export default router;
