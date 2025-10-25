import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { getInitials } from '../utils/helpers';
import './Leaderboard.css';

const Leaderboard = ({ user }) => {
  const [leaderboard, setLeaderboard] = useState({ teaching: [], learning: [] });
  const [activeTab, setActiveTab] = useState('teaching');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await userAPI.getLeaderboard();
      setLeaderboard(response.data.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayedList = activeTab === 'teaching' ? leaderboard.teaching : leaderboard.learning;

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <h1>🏆 Leaderboard</h1>
        <p>Top teachers and learners in the community</p>
      </div>

      <div className="leaderboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'teaching' ? 'active' : ''}`}
          onClick={() => setActiveTab('teaching')}
        >
          Top Teachers
        </button>
        <button
          className={`tab-btn ${activeTab === 'learning' ? 'active' : ''}`}
          onClick={() => setActiveTab('learning')}
        >
          Top Learners
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="leaderboard-list">
          {displayedList.map((person, index) => {
            const isCurrentUser = person._id === user?._id;
            const hours = activeTab === 'teaching' 
              ? person.stats.totalHoursTaught 
              : person.stats.totalHoursLearned;

            return (
              <div
                key={person._id}
                className={`leaderboard-item ${isCurrentUser ? 'current-user' : ''}`}
              >
                <div className="rank-badge">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && `#${index + 1}`}
                </div>

                <div className="person-avatar">
                  {person.profileImage ? (
                    <img src={person.profileImage} alt={person.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {getInitials(person.name)}
                    </div>
                  )}
                </div>

                <div className="person-info">
                  <h3>{person.name} {isCurrentUser && '(You)'}</h3>
                  <p>
                    <span className="level-tag" style={{
                      background: person.level === 'Expert' ? '#EF4444' :
                                 person.level === 'Intermediate' ? '#F59E0B' : '#10B981'
                    }}>
                      {person.level}
                    </span>
                    <span className="city-tag">📍 {person.city}</span>
                  </p>
                </div>

                <div className="person-stats">
                  <div className="stat-value">{hours}h</div>
                  <div className="stat-label">
                    {activeTab === 'teaching' ? 'Taught' : 'Learned'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
