import Course from '../models/Course.js';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
export const getAllCourses = async (req, res) => {
  try {
    const { skill, level } = req.query;
    
    let query = { isPublished: true };
    
    if (skill) {
      query.skill = new RegExp(skill, 'i');
    }
    
    if (level) {
      query.level = level;
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name profileImage level')
      .sort('-createdAt');

    res.json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Private
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name profileImage level bio')
      .populate('enrolledStudents.user', 'name profileImage');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private
export const createCourse = async (req, res) => {
  try {
    const course = await Course.create({
      ...req.body,
      instructor: req.user._id
    });

    const populatedCourse = await Course.findById(course._id)
      .populate('instructor', 'name profileImage');

    res.status(201).json({
      success: true,
      data: populatedCourse
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private
export const enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if already enrolled
    const alreadyEnrolled = course.enrolledStudents.find(
      s => s.user.toString() === req.user._id.toString()
    );

    if (alreadyEnrolled) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    course.enrolledStudents.push({
      user: req.user._id
    });

    await course.save();

    res.json({
      success: true,
      message: 'Successfully enrolled in course'
    });
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update course progress
// @route   PUT /api/courses/:id/progress
// @access  Private
export const updateProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const enrollment = course.enrolledStudents.find(
      s => s.user.toString() === req.user._id.toString()
    );

    if (!enrollment) {
      return res.status(400).json({ success: false, message: 'Not enrolled in this course' });
    }

    enrollment.progress = progress;
    if (progress >= 100) {
      enrollment.completed = true;
    }

    await course.save();

    res.json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user enrolled courses
// @route   GET /api/courses/my-courses
// @access  Private
export const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      'enrolledStudents.user': req.user._id
    }).populate('instructor', 'name profileImage');

    const coursesWithProgress = courses.map(course => {
      const enrollment = course.enrolledStudents.find(
        s => s.user.toString() === req.user._id.toString()
      );
      return {
        ...course.toObject(),
        myProgress: enrollment.progress,
        myCompleted: enrollment.completed,
        enrolledAt: enrollment.enrolledAt
      };
    });

    res.json({
      success: true,
      count: coursesWithProgress.length,
      data: coursesWithProgress
    });
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
