import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { showToast, validateEmail } from '../utils/helpers';
import './Auth.css';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      showToast('Please enter a valid email', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      const { data } = response.data;

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      
      showToast('Login successful!', 'success');

      if (data.completedOnboarding) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding/step1');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast(error.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back to SkillSwap</h1>
          <p>Login to continue exchanging skills</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="input-field"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="input-field"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <div className="auth-visual">
        <h2>Start Learning Today</h2>
        <p>Exchange skills with people around the world</p>
        <div className="features">
          <div className="feature-item">
            <span className="feature-icon">📚</span>
            <span>Learn New Skills</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎓</span>
            <span>Teach Others</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🏆</span>
            <span>Earn Rewards</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
