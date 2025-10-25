import express from 'express';
import {
  getQuizzes,
  getQuizById,
  submitQuiz,
  getUserQuizResults,
  createQuiz
} from '../controllers/quizController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getQuizzes);
router.post('/', protect, admin, createQuiz);
router.get('/results', protect, getUserQuizResults);
router.get('/:id', protect, getQuizById);
router.post('/:id/submit', protect, submitQuiz);

export default router;
