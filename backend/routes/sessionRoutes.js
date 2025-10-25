import express from 'express';
import {
  createSession,
  getUserSessions,
  updateSession,
  completeSession,
  startSession
} from '../controllers/sessionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createSession);
router.get('/', protect, getUserSessions);
router.put('/:id', protect, updateSession);
router.post('/:id/complete', protect, completeSession);
router.post('/:id/start', protect, startSession);

export default router;
