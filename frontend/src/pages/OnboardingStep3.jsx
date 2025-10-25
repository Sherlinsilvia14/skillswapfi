import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { timePreferences, daysOfWeek } from '../utils/skillsData';
import { showToast } from '../utils/helpers';
import './Onboarding.css';

const OnboardingStep3 = ({ onboardingData, setOnboardingData, setUser }) => {
  const [schedule, setSchedule] = useState(
    onboardingData.schedule || {
      timePreferences: [],
      daysOfWeek: []
    }
  );
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleTime = (time) => {
    if (schedule.timePreferences.includes(time)) {
      setSchedule({
        ...schedule,
        timePreferences: schedule.timePreferences.filter(t => t !== time)
      });
    } else {
      setSchedule({
        ...schedule,
        timePreferences: [...schedule.timePreferences, time]
      });
    }
  };

  const toggleDay = (day) => {
    if (schedule.daysOfWeek.includes(day)) {
      setSchedule({
        ...schedule,
        daysOfWeek: schedule.daysOfWeek.filter(d => d !== day)
      });
    } else {
      setSchedule({
        ...schedule,
        daysOfWeek: [...schedule.daysOfWeek, day]
      });
    }
  };

  const handleComplete = async () => {
    if (schedule.timePreferences.length === 0) {
      showToast('Please select at least one time preference', 'error');
      return;
    }

    if (schedule.daysOfWeek.length === 0) {
      showToast('Please select at least one day', 'error');
      return;
    }

    setLoading(true);

    try {
      const completeData = {
        skillsToLearn: onboardingData.skillsToLearn,
        skillsToTeach: onboardingData.skillsToTeach,
        schedule
      };

      const response = await userAPI.completeOnboarding(completeData);
      const updatedUser = response.data.data;

      // Update user in localStorage
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const newUser = { ...storedUser, completedOnboarding: true };
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);

      showToast('Onboarding completed successfully!', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      showToast(error.response?.data?.message || 'Failed to complete onboarding', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setOnboardingData({
      ...onboardingData,
      schedule
    });
    navigate('/onboarding/step2');
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '100%' }}></div>
        </div>
        <div className="progress-steps">
          <div className="step completed">✓</div>
          <div className="step completed">✓</div>
          <div className="step active">3</div>
        </div>
      </div>

      <div className="onboarding-content">
        <div className="onboarding-header">
          <h1>When are you available?</h1>
          <p>Select your preferred time slots and days</p>
        </div>

        <div className="schedule-section">
          <h3>Preferred Time</h3>
          <div className="schedule-grid">
            {timePreferences.map(time => (
              <button
                key={time}
                className={`schedule-btn ${schedule.timePreferences.includes(time) ? 'selected' : ''}`}
                onClick={() => toggleTime(time)}
              >
                <span className="schedule-icon">
                  {time === 'Morning' && '🌅'}
                  {time === 'Afternoon' && '☀️'}
                  {time === 'Evening' && '🌆'}
                  {time === 'Night' && '🌙'}
                </span>
                <span>{time}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="schedule-section">
          <h3>Days of the Week</h3>
          <div className="days-grid">
            {daysOfWeek.map(day => (
              <button
                key={day}
                className={`day-btn ${schedule.daysOfWeek.includes(day) ? 'selected' : ''}`}
                onClick={() => toggleDay(day)}
              >
                {day.substring(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {(schedule.timePreferences.length > 0 || schedule.daysOfWeek.length > 0) && (
          <div className="schedule-summary">
            <h4>Your Schedule</h4>
            <div className="summary-content">
              {schedule.timePreferences.length > 0 && (
                <div className="summary-item">
                  <strong>Time:</strong> {schedule.timePreferences.join(', ')}
                </div>
              )}
              {schedule.daysOfWeek.length > 0 && (
                <div className="summary-item">
                  <strong>Days:</strong> {schedule.daysOfWeek.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="onboarding-actions">
          <button className="btn btn-outline" onClick={handleBack}>
            Back
          </button>
          <button
            className="btn btn-primary"
            onClick={handleComplete}
            disabled={loading}
          >
            {loading ? 'Completing...' : 'Complete Setup'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep3;
