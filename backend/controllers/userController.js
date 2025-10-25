import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Complete onboarding
// @route   POST /api/users/onboarding
// @access  Private
export const completeOnboarding = async (req, res) => {
  try {
    const { skillsToLearn, skillsToTeach, schedule } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.skillsToLearn = skillsToLearn;
    user.skillsToTeach = skillsToTeach;
    user.schedule = schedule;
    user.completedOnboarding = true;

    await user.save();

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('-password')
      .sort('-stats.totalHoursTaught');

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('endorsements.endorsedBy', 'name profileImage');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search users
// @route   POST /api/users/search
// @access  Private
export const searchUsers = async (req, res) => {
  try {
    const { skill, city, timePreference, dayOfWeek } = req.body;

    let query = { _id: { $ne: req.user._id }, completedOnboarding: true };

    if (skill) {
      query.skillsToTeach = { $in: [skill] };
    }

    if (city) {
      query.city = new RegExp(city, 'i');
    }

    if (timePreference) {
      query['schedule.timePreferences'] = { $in: [timePreference] };
    }

    if (dayOfWeek) {
      query['schedule.daysOfWeek'] = { $in: [dayOfWeek] };
    }

    const users = await User.find(query).select('-password');

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Follow user
// @route   POST /api/users/:id/follow
// @access  Private
export const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({ success: false, message: 'Already following this user' });
    }

    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);

    await currentUser.save();
    await userToFollow.save();

    // Create notification
    await Notification.create({
      user: userToFollow._id,
      type: 'follow',
      title: 'New Follower',
      message: `${currentUser.name} started following you`,
      relatedUser: currentUser._id
    });

    res.json({
      success: true,
      message: 'User followed successfully'
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Unfollow user
// @route   POST /api/users/:id/unfollow
// @access  Private
export const unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToUnfollow) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userToUnfollow._id.toString()
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Endorse skill
// @route   POST /api/users/:id/endorse
// @access  Private
export const endorseSkill = async (req, res) => {
  try {
    const { skill } = req.body;
    const userToEndorse = await User.findById(req.params.id);

    if (!userToEndorse) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if already endorsed
    const alreadyEndorsed = userToEndorse.endorsements.find(
      e => e.skill === skill && e.endorsedBy.toString() === req.user._id.toString()
    );

    if (alreadyEndorsed) {
      return res.status(400).json({ success: false, message: 'Already endorsed this skill' });
    }

    userToEndorse.endorsements.push({
      skill,
      endorsedBy: req.user._id
    });

    await userToEndorse.save();

    // Create notification
    await Notification.create({
      user: userToEndorse._id,
      type: 'endorsement',
      title: 'Skill Endorsed',
      message: `${req.user.name} endorsed your ${skill} skill`,
      relatedUser: req.user._id
    });

    res.json({
      success: true,
      message: 'Skill endorsed successfully'
    });
  } catch (error) {
    console.error('Endorse skill error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Private
export const getLeaderboard = async (req, res) => {
  try {
    const teachingLeaders = await User.find()
      .select('name profileImage stats.totalHoursTaught level city')
      .sort('-stats.totalHoursTaught')
      .limit(10);

    const learningLeaders = await User.find()
      .select('name profileImage stats.totalHoursLearned level city')
      .sort('-stats.totalHoursLearned')
      .limit(10);

    res.json({
      success: true,
      data: {
        teaching: teachingLeaders,
        learning: learningLeaders
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
