import React, { useState, useEffect } from 'react';
import { userAPI, sessionAPI, messageAPI } from '../services/api';
import { showToast, getInitials } from '../utils/helpers';
import { allSkills, timePreferences, daysOfWeek } from '../utils/skillsData';
import './SearchUsers.css';

const SearchUsers = ({ user, onStartChat }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    skill: '',
    city: '',
    timePreference: '',
    dayOfWeek: ''
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [requestNote, setRequestNote] = useState('');

  useEffect(() => {
    searchUsers();
  }, []);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.searchUsers(filters);
      setUsers(response.data.data);
    } catch (error) {
      console.error('Search error:', error);
      showToast('Failed to search users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchUsers();
  };

  const handleRequestSession = async (teacherId, skill) => {
    try {
      await sessionAPI.createSession({
        teacherId,
        skill,
        notes: requestNote
      });
      showToast('Session request sent successfully!', 'success');
      setSelectedUser(null);
      setRequestNote('');
    } catch (error) {
      console.error('Request session error:', error);
      showToast(error.response?.data?.message || 'Failed to send request', 'error');
    }
  };

  const handleFollow = async (userId) => {
    try {
      await userAPI.followUser(userId);
      showToast('User followed successfully!', 'success');
      searchUsers();
    } catch (error) {
      console.error('Follow error:', error);
      showToast(error.response?.data?.message || 'Failed to follow user', 'error');
    }
  };

  const handleStartChat = (selectedUser) => {
    if (onStartChat) {
      onStartChat(selectedUser);
    }
  };

  return (
    <div className="search-users">
      <div className="search-header">
        <h1>Find Teachers & Learners</h1>
        <p>Search for people who can teach you new skills</p>
      </div>

      <form className="search-filters" onSubmit={handleSearch}>
        <div className="filter-group">
          <label>Skill</label>
          <select
            name="skill"
            value={filters.skill}
            onChange={handleFilterChange}
            className="input-field"
          >
            <option value="">All Skills</option>
            {allSkills.map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>City</label>
          <input
            type="text"
            name="city"
            value={filters.city}
            onChange={handleFilterChange}
            className="input-field"
            placeholder="Enter city"
          />
        </div>

        <div className="filter-group">
          <label>Time Preference</label>
          <select
            name="timePreference"
            value={filters.timePreference}
            onChange={handleFilterChange}
            className="input-field"
          >
            <option value="">Any Time</option>
            {timePreferences.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Day</label>
          <select
            name="dayOfWeek"
            value={filters.dayOfWeek}
            onChange={handleFilterChange}
            className="input-field"
          >
            <option value="">Any Day</option>
            {daysOfWeek.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      <div className="search-results">
        <h2>Results ({users.length})</h2>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : users.length > 0 ? (
          <div className="users-grid">
            {users.map(u => (
              <div key={u._id} className="user-card">
                <div className="user-card-header">
                  <div className="user-card-avatar">
                    {u.profileImage ? (
                      <img src={u.profileImage} alt={u.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {getInitials(u.name)}
                      </div>
                    )}
                  </div>
                  <span className="user-level-badge" style={{
                    background: u.level === 'Expert' ? '#EF4444' :
                               u.level === 'Intermediate' ? '#F59E0B' : '#10B981'
                  }}>
                    {u.level}
                  </span>
                </div>

                <div className="user-card-body">
                  <h3>{u.name}</h3>
                  <p className="user-city">📍 {u.city}</p>
                  {u.bio && <p className="user-bio">{u.bio}</p>}

                  <div className="user-stats-mini">
                    <div className="stat-mini">
                      <span>⭐</span>
                      <span>{u.stats?.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className="stat-mini">
                      <span>📚</span>
                      <span>{u.stats?.totalHoursTaught || 0}h</span>
                    </div>
                    <div className="stat-mini">
                      <span>👥</span>
                      <span>{u.followers?.length || 0}</span>
                    </div>
                  </div>

                  <div className="user-skills-section">
                    <h4>Can Teach:</h4>
                    <div className="skills-mini">
                      {u.skillsToTeach?.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="skill-tag-mini">{skill}</span>
                      ))}
                      {u.skillsToTeach?.length > 3 && (
                        <span className="skill-more">+{u.skillsToTeach.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  <div className="user-card-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setSelectedUser(u)}
                    >
                      Request to Learn
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleStartChat(u)}
                      title="Send a message"
                    >
                      💬 Message
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleFollow(u._id)}
                    >
                      Follow
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No users found matching your criteria</p>
            <p>Try adjusting your filters</p>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Request Learning Session</h2>
            <p>Request a session with <strong>{selectedUser.name}</strong></p>

            <div className="form-group">
              <label>Select Skill</label>
              <select
                className="input-field"
                onChange={(e) => setRequestNote(e.target.value)}
              >
                <option value="">Choose a skill</option>
                {selectedUser.skillsToTeach?.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setSelectedUser(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleRequestSession(selectedUser._id, requestNote)}
                disabled={!requestNote}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchUsers;
