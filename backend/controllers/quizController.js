import Quiz from '../models/Quiz.js';
import QuizResult from '../models/QuizResult.js';

// @desc    Get quizzes by skill
// @route   GET /api/quizzes
// @access  Private
export const getQuizzes = async (req, res) => {
  try {
    const { skill } = req.query;
    
    let query = {};
    if (skill) {
      query.skill = new RegExp(skill, 'i');
    }

    const quizzes = await Quiz.find(query).select('-questions.correctAnswer');

    res.json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get quiz by ID
// @route   GET /api/quizzes/:id
// @access  Private
export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select('-questions.correctAnswer');

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Randomize questions
    const randomizedQuestions = quiz.questions
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(quiz.questions.length, 10));

    const randomizedQuiz = {
      ...quiz.toObject(),
      questions: randomizedQuestions
    };

    res.json({
      success: true,
      data: randomizedQuiz
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit quiz
// @route   POST /api/quizzes/:id/submit
// @access  Private
export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    let correctCount = 0;
    const processedAnswers = answers.map((answer, index) => {
      const question = quiz.questions[answer.questionIndex];
      const isCorrect = question.correctAnswer === answer.selectedAnswer;
      if (isCorrect) correctCount++;

      return {
        questionIndex: answer.questionIndex,
        selectedAnswer: answer.selectedAnswer,
        isCorrect
      };
    });

    const percentage = (correctCount / answers.length) * 100;
    const passed = percentage >= quiz.passingScore;

    const result = await QuizResult.create({
      user: req.user._id,
      quiz: quiz._id,
      answers: processedAnswers,
      score: correctCount,
      percentage,
      passed
    });

    res.json({
      success: true,
      data: {
        ...result.toObject(),
        totalQuestions: answers.length,
        correctAnswers: correctCount
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user quiz results
// @route   GET /api/quizzes/results
// @access  Private
export const getUserQuizResults = async (req, res) => {
  try {
    const results = await QuizResult.find({ user: req.user._id })
      .populate('quiz', 'title skill difficulty')
      .sort('-createdAt');

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create quiz (Admin only)
// @route   POST /api/quizzes
// @access  Private/Admin
export const createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create({
      ...req.body,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
