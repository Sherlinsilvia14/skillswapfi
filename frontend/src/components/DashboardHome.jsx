import React, { memo } from 'react';
import './DashboardHome.css';

const DashboardHome = memo(({ user }) => {
  if (!user) return null;

  const stats = [
    {
      icon: '📚',
      label: 'Hours Taught',
      value: user.stats?.totalHoursTaught || 0,
      color: '#4F46E5'
    },
    {
      icon: '🎓',
      label: 'Hours Learned',
      value: user.stats?.totalHoursLearned || 0,
      color: '#10B981'
    },
    {
      icon: '⭐',
      label: 'Rating',
      value: user.stats?.rating?.toFixed(1) || '0.0',
      color: '#F59E0B'
    },
    {
      icon: '🏆',
      label: 'Points',
      value: user.stats?.points || 0,
      color: '#EF4444'
    }
  ];

  return (
    <div className="dashboard-home">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user.name}! 👋</h1>
          <p>Here's what's happening with your learning journey</p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderTop: `4px solid ${stat.color}` }}>
            <div className="stat-icon" style={{ background: `${stat.color}20` }}>
              <span style={{ color: stat.color }}>{stat.icon}</span>
            </div>
            <div className="stat-info">
              <p className="stat-label">{stat.label}</p>
              <h2 className="stat-value">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="content-section">
          <h2>Skills to Learn</h2>
          <div className="skills-list">
            {user.skillsToLearn?.length > 0 ? (
              user.skillsToLearn.map((skill, index) => (
                <span key={index} className="skill-tag learn">{skill}</span>
              ))
            ) : (
              <p className="empty-state">No skills to learn yet</p>
            )}
          </div>
        </div>

        <div className="content-section">
          <h2>Skills to Teach</h2>
          <div className="skills-list">
            {user.skillsToTeach?.length > 0 ? (
              user.skillsToTeach.map((skill, index) => (
                <span key={index} className="skill-tag teach">{skill}</span>
              ))
            ) : (
              <p className="empty-state">No skills to teach yet</p>
            )}
          </div>
        </div>

        <div className="content-section">
          <h2>Achievements 🏆</h2>
          <div className="achievements-grid">
            {user.achievements?.length > 0 ? (
              user.achievements.map((achievement, index) => (
                <div key={index} className="achievement-card">
                  <div className="achievement-badge">{achievement.badge}</div>
                  <h3>{achievement.name}</h3>
                  <p>{achievement.description}</p>
                </div>
              ))
            ) : (
              <p className="empty-state">No achievements yet. Start teaching to earn badges!</p>
            )}
          </div>
        </div>

        <div className="content-section">
          <h2>Your Schedule</h2>
          <div className="schedule-info">
            <div className="schedule-item">
              <strong>Preferred Times:</strong>
              <div className="schedule-tags">
                {user.schedule?.timePreferences?.map((time, index) => (
                  <span key={index} className="schedule-tag">{time}</span>
                ))}
              </div>
            </div>
            <div className="schedule-item">
              <strong>Available Days:</strong>
              <div className="schedule-tags">
                {user.schedule?.daysOfWeek?.map((day, index) => (
                  <span key={index} className="schedule-tag">{day}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="content-section">
          <h2>Community Stats</h2>
          <div className="community-stats">
            <div className="community-stat">
              <span className="community-icon">👥</span>
              <div>
                <p className="community-label">Followers</p>
                <p className="community-value">{user.followers?.length || 0}</p>
              </div>
            </div>
            <div className="community-stat">
              <span className="community-icon">🤝</span>
              <div>
                <p className="community-label">Following</p>
                <p className="community-value">{user.following?.length || 0}</p>
              </div>
            </div>
            <div className="community-stat">
              <span className="community-icon">✅</span>
              <div>
                <p className="community-label">Endorsements</p>
                <p className="community-value">{user.endorsements?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DashboardHome;
