import React, { useState, useEffect } from 'react';
import { quizAPI } from '../services/api';
import { showToast } from '../utils/helpers';
import './Quizzes.css';

const Quizzes = ({ user }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await quizAPI.getQuizzes();
      setQuizzes(response.data.data);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
      showToast('Failed to load quizzes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (quizId) => {
    try {
      const response = await quizAPI.getQuizById(quizId);
      setSelectedQuiz(response.data.data);
      setCurrentQuestion(0);
      setAnswers([]);
      setResult(null);
    } catch (error) {
      showToast('Failed to load quiz', 'error');
    }
  };

  const handleAnswer = (questionIndex, answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      questionIndex,
      selectedAnswer: answerIndex
    };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (answers.length !== selectedQuiz.questions.length) {
      showToast('Please answer all questions', 'error');
      return;
    }

    try {
      const response = await quizAPI.submitQuiz(selectedQuiz._id, answers);
      setResult(response.data.data);
      showToast(response.data.data.passed ? 'Quiz Passed! 🎉' : 'Quiz Failed. Try again!', 
                response.data.data.passed ? 'success' : 'error');
    } catch (error) {
      showToast('Failed to submit quiz', 'error');
    }
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="quiz-result">
        <div className="result-card">
          <div className={`result-icon ${result.passed ? 'passed' : 'failed'}`}>
            {result.passed ? '✅' : '❌'}
          </div>
          <h1>{result.passed ? 'Congratulations!' : 'Try Again!'}</h1>
          <p className="result-message">
            {result.passed 
              ? 'You passed the quiz!' 
              : `You need ${selectedQuiz.passingScore}% to pass`}
          </p>
          
          <div className="result-stats">
            <div className="result-stat">
              <h2>{result.percentage}%</h2>
              <p>Score</p>
            </div>
            <div className="result-stat">
              <h2>{result.correctAnswers}/{result.totalQuestions}</h2>
              <p>Correct</p>
            </div>
          </div>

          <div className="result-actions">
            <button className="btn btn-primary" onClick={resetQuiz}>
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedQuiz) {
    const question = selectedQuiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / selectedQuiz.questions.length) * 100;

    return (
      <div className="quiz-taking">
        <div className="quiz-header">
          <h2>{selectedQuiz.title}</h2>
          <button className="btn btn-outline btn-sm" onClick={resetQuiz}>
            Exit Quiz
          </button>
        </div>

        <div className="quiz-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p>Question {currentQuestion + 1} of {selectedQuiz.questions.length}</p>
        </div>

        <div className="question-card">
          <h3>{question.question}</h3>
          <div className="options-list">
            {question.options.map((option, index) => (
              <button
                key={index}
                className={`option-btn ${answers[currentQuestion]?.selectedAnswer === index ? 'selected' : ''}`}
                onClick={() => handleAnswer(currentQuestion, index)}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span>{option}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="quiz-navigation">
          <button
            className="btn btn-outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </button>

          {currentQuestion === selectedQuiz.questions.length - 1 ? (
            <button className="btn btn-primary" onClick={handleSubmit}>
              Submit Quiz
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleNext}
              disabled={!answers[currentQuestion]}
            >
              Next
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="quizzes-page">
      <div className="quizzes-header">
        <h1>Quizzes & Assessments</h1>
        <p>Test your knowledge and track your progress</p>
      </div>

      <div className="quizzes-grid">
        {quizzes.map(quiz => (
          <div key={quiz._id} className="quiz-card">
            <div className="quiz-card-header">
              <h3>{quiz.title}</h3>
              <span className={`difficulty-badge ${quiz.difficulty}`}>
                {quiz.difficulty}
              </span>
            </div>
            <div className="quiz-card-body">
              <p className="quiz-skill">📚 {quiz.skill}</p>
              <p className="quiz-info">
                {quiz.questions.length} Questions • {quiz.passingScore}% to Pass
              </p>
            </div>
            <button
              className="btn btn-primary btn-full"
              onClick={() => startQuiz(quiz._id)}
            >
              Start Quiz
            </button>
          </div>
        ))}
      </div>

      {quizzes.length === 0 && (
        <div className="empty-state">
          <p>No quizzes available yet</p>
        </div>
      )}
    </div>
  );
};

export default Quizzes;
