import Session from '../models/Session.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendSessionAcceptedEmail } from '../utils/email.js';

// @desc    Create session request
// @route   POST /api/sessions
// @access  Private
export const createSession = async (req, res) => {
  try {
    const { teacherId, skill, notes } = req.body;

    const teacher = await User.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const session = await Session.create({
      teacher: teacherId,
      learner: req.user._id,
      skill,
      notes
    });

    // Create notification for teacher
    await Notification.create({
      user: teacherId,
      type: 'session_request',
      title: 'New Session Request',
      message: `${req.user.name} wants to learn ${skill} from you`,
      relatedUser: req.user._id,
      relatedSession: session._id
    });

    const populatedSession = await Session.findById(session._id)
      .populate('teacher', 'name email profileImage')
      .populate('learner', 'name email profileImage');

    res.status(201).json({
      success: true,
      data: populatedSession
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user sessions
// @route   GET /api/sessions
// @access  Private
export const getUserSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ teacher: req.user._id }, { learner: req.user._id }]
    })
      .populate('teacher', 'name email profileImage city')
      .populate('learner', 'name email profileImage city')
      .sort('-createdAt');

    res.json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update session status
// @route   PUT /api/sessions/:id
// @access  Private
export const updateSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Only teacher can accept/reject, both can cancel
    if (req.body.status === 'accepted' || req.body.status === 'rejected') {
      if (session.teacher.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    Object.assign(session, req.body);
    await session.save();

    const populatedSession = await Session.findById(session._id)
      .populate('teacher', 'name email profileImage')
      .populate('learner', 'name email profileImage');

    // Create notification
    if (req.body.status === 'accepted') {
      await Notification.create({
        user: session.learner,
        type: 'session_accepted',
        title: 'Session Accepted',
        message: `${populatedSession.teacher.name} accepted your session request for ${session.skill}`,
        relatedUser: session.teacher,
        relatedSession: session._id
      });

      // Send email
      const learner = await User.findById(session.learner);
      const teacher = await User.findById(session.teacher);
      await sendSessionAcceptedEmail(learner, teacher, session);
    } else if (req.body.status === 'rejected') {
      await Notification.create({
        user: session.learner,
        type: 'session_rejected',
        title: 'Session Declined',
        message: `${populatedSession.teacher.name} declined your session request`,
        relatedUser: session.teacher,
        relatedSession: session._id
      });
    }

    res.json({
      success: true,
      data: populatedSession
    });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Complete session
// @route   POST /api/sessions/:id/complete
// @access  Private
export const completeSession = async (req, res) => {
  try {
    const { rating, feedback, actualDuration } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    session.status = 'completed';
    session.rating = rating;
    session.feedback = feedback;
    session.actualDuration = actualDuration;
    session.endedAt = new Date();

    await session.save();

    // Update user stats
    const teacher = await User.findById(session.teacher);
    const learner = await User.findById(session.learner);

    teacher.stats.totalHoursTaught += actualDuration;
    teacher.stats.points += actualDuration * 10;
    
    if (rating) {
      teacher.stats.totalRatings += 1;
      teacher.stats.rating = 
        (teacher.stats.rating * (teacher.stats.totalRatings - 1) + rating) / teacher.stats.totalRatings;
    }

    teacher.updateLevel();
    await teacher.save();

    learner.stats.totalHoursLearned += actualDuration;
    await learner.save();

    // Check for achievements
    await checkAchievements(teacher);

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Complete session error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Start session
// @route   POST /api/sessions/:id/start
// @access  Private
export const startSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    session.isActive = true;
    session.startedAt = new Date();
    session.roomId = `room_${session._id}`;

    await session.save();

    // Notify both users
    const teacher = await User.findById(session.teacher);
    const learner = await User.findById(session.learner);

    await Notification.create({
      user: session.learner,
      type: 'session_started',
      title: 'Session Started',
      message: `Your session with ${teacher.name} has started`,
      relatedSession: session._id
    });

    await Notification.create({
      user: session.teacher,
      type: 'session_started',
      title: 'Session Started',
      message: `Your session with ${learner.name} has started`,
      relatedSession: session._id
    });

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to check achievements
async function checkAchievements(user) {
  const achievements = [];

  if (user.stats.totalHoursTaught >= 10 && !user.achievements.find(a => a.name === 'First 10 Hours')) {
    achievements.push({
      name: 'First 10 Hours',
      description: 'Taught for 10 hours',
      badge: '🎖️'
    });
  }

  if (user.stats.totalHoursTaught >= 50 && !user.achievements.find(a => a.name === 'Half Century')) {
    achievements.push({
      name: 'Half Century',
      description: 'Taught for 50 hours',
      badge: '🏆'
    });
  }

  if (user.stats.totalHoursTaught >= 100 && !user.achievements.find(a => a.name === 'Century Club')) {
    achievements.push({
      name: 'Century Club',
      description: 'Taught for 100 hours',
      badge: '👑'
    });
  }

  if (achievements.length > 0) {
    user.achievements.push(...achievements);
    await user.save();

    // Create notifications
    for (const achievement of achievements) {
      await Notification.create({
        user: user._id,
        type: 'achievement',
        title: 'Achievement Unlocked!',
        message: `You earned: ${achievement.name} ${achievement.badge}`
      });
    }
  }
}
