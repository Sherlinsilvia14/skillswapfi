import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { showToast, validateEmail, validatePhone } from '../utils/helpers';
import './Auth.css';

const Register = ({ setUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    city: ''
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

    // Validation
    if (formData.name.length < 2) {
      showToast('Please enter your full name', 'error');
      return;
    }

    if (!validateEmail(formData.email)) {
      showToast('Please enter a valid email', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (!validatePhone(formData.contactNumber)) {
      showToast('Please enter a valid contact number', 'error');
      return;
    }

    if (formData.city.length < 2) {
      showToast('Please enter your city', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        contactNumber: formData.contactNumber,
        city: formData.city
      });

      const { data } = response.data;

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);

      showToast('Registration successful!', 'success');
      navigate('/onboarding/step1');
    } catch (error) {
      console.error('Registration error:', error);
      showToast(error.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Join SkillSwap</h1>
          <p>Create an account to start exchanging skills</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="input-field"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="input-field"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="input-field"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contactNumber">Contact Number</label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                className="input-field"
                placeholder="Enter contact number"
                value={formData.contactNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                className="input-field"
                placeholder="Enter your city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Login
            </Link>
          </p>
        </div>
      </div>

      <div className="auth-visual">
        <h2>Why Join SkillSwap?</h2>
        <div className="benefits">
          <div className="benefit-item">
            <div className="benefit-icon">🌟</div>
            <h3>Learn for Free</h3>
            <p>Exchange skills instead of money</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">🤝</div>
            <h3>Connect with Experts</h3>
            <p>Learn from skilled individuals</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">📈</div>
            <h3>Track Progress</h3>
            <p>Monitor your learning journey</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
