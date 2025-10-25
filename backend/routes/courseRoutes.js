import express from 'express';
import {
  getAllCourses,
  getCourseById,
  createCourse,
  enrollInCourse,
  updateProgress,
  getMyCourses
} from '../controllers/courseController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getAllCourses);
router.post('/', protect, createCourse);
router.get('/my-courses', protect, getMyCourses);
router.get('/:id', protect, getCourseById);
router.post('/:id/enroll', protect, enrollInCourse);
router.put('/:id/progress', protect, updateProgress);

export default router;
