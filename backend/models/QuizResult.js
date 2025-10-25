import mongoose from 'mongoose';

const quizResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  answers: [{
    questionIndex: Number,
    selectedAnswer: Number,
    isCorrect: Boolean
  }],
  score: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  timeTaken: {
    type: Number
  }
}, {
  timestamps: true
});

const QuizResult = mongoose.model('QuizResult', quizResultSchema);

export default QuizResult;
