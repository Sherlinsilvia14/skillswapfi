import express from 'express';
import {
  completeOnboarding,
  getAllUsers,
  getUserById,
  searchUsers,
  followUser,
  unfollowUser,
  endorseSkill,
  getLeaderboard
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/onboarding', protect, completeOnboarding);
router.get('/', protect, getAllUsers);
router.post('/search', protect, searchUsers);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/:id', protect, getUserById);
router.post('/:id/follow', protect, followUser);
router.post('/:id/unfollow', protect, unfollowUser);
router.post('/:id/endorse', protect, endorseSkill);

export default router;
