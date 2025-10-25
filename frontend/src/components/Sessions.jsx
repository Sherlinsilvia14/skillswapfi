import React, { useState, useEffect } from 'react';
import { sessionAPI } from '../services/api';
import { showToast, formatDateTime, getStatusColor } from '../utils/helpers';
import VideoCall from './VideoCall';
import './Sessions.css';

const Sessions = ({ user, refreshUser = () => {} }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [activeCall, setActiveCall] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await sessionAPI.getUserSessions();
      setSessions(response.data.data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      showToast('Failed to load sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (sessionId) => {
    try {
      await sessionAPI.updateSession(sessionId, { status: 'accepted' });
      showToast('Session accepted!', 'success');
      fetchSessions();
    } catch (error) {
      showToast('Failed to accept session', 'error');
    }
  };

  const handleReject = async (sessionId) => {
    try {
      await sessionAPI.updateSession(sessionId, { status: 'rejected' });
      showToast('Session rejected', 'info');
      fetchSessions();
    } catch (error) {
      showToast('Failed to reject session', 'error');
    }
  };

  const handleStartSession = async (session) => {
    try {
      await sessionAPI.startSession(session._id);
      showToast('Session started!', 'success');
      setActiveCall(session);
      fetchSessions();
    } catch (error) {
      showToast('Failed to start session', 'error');
    }
  };

  const handleCompleteSession = async (sessionId, duration) => {
    const rating = prompt('Rate this session (1-5):');
    if (!rating || rating < 1 || rating > 5) return;

    const feedback = prompt('Leave feedback (optional):');

    try {
      await sessionAPI.completeSession(sessionId, {
        rating: parseInt(rating),
        feedback: feedback || '',
        actualDuration: duration
      });
      showToast('Session completed! Thanks for teaching!', 'success');
      fetchSessions();
      if (refreshUser) refreshUser();
      setActiveCall(null);
    } catch (error) {
      showToast('Failed to complete session', 'error');
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    return session.status === filter;
  });

  const getSessionRole = (session) => {
    return session.teacher._id === user._id ? 'teacher' : 'learner';
  };

  if (activeCall) {
    return (
      <VideoCall
        session={activeCall}
        user={user}
        onEndCall={() => {
          setActiveCall(null);
          fetchSessions();
        }}
        onComplete={handleCompleteSession}
      />
    );
  }

  return (
    <div className="sessions-page">
      <div className="sessions-header">
        <h1>My Sessions</h1>
        <p>Manage your teaching and learning sessions</p>
      </div>

      <div className="sessions-filters">
        {['all', 'pending', 'accepted', 'completed'].map(status => (
          <button
            key={status}
            className={`filter-btn ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : filteredSessions.length > 0 ? (
        <div className="sessions-list">
          {filteredSessions.map(session => {
            const role = getSessionRole(session);
            const otherUser = role === 'teacher' ? session.learner : session.teacher;

            return (
              <div key={session._id} className="session-card">
                <div className="session-header">
                  <div className="session-user-info">
                    <div className="session-avatar">
                      {otherUser.profileImage ? (
                        <img src={otherUser.profileImage} alt={otherUser.name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {otherUser.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3>{otherUser.name}</h3>
                      <p className="session-role">
                        {role === 'teacher' ? '👨‍🎓 Student' : '👨‍🏫 Teacher'}
                      </p>
                    </div>
                  </div>
                  <span
                    className="session-status"
                    style={{ background: getStatusColor(session.status) }}
                  >
                    {session.status}
                  </span>
                </div>

                <div className="session-body">
                  <div className="session-detail">
                    <span className="detail-label">Skill:</span>
                    <span className="detail-value">{session.skill}</span>
                  </div>

                  {session.notes && (
                    <div className="session-detail">
                      <span className="detail-label">Notes:</span>
                      <span className="detail-value">{session.notes}</span>
                    </div>
                  )}

                  {session.scheduledDate && (
                    <div className="session-detail">
                      <span className="detail-label">Scheduled:</span>
                      <span className="detail-value">
                        {formatDateTime(session.scheduledDate)}
                      </span>
                    </div>
                  )}

                  {session.rating && (
                    <div className="session-detail">
                      <span className="detail-label">Rating:</span>
                      <span className="detail-value">
                        {'⭐'.repeat(session.rating)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="session-actions">
                  {session.status === 'pending' && role === 'teacher' && (
                    <>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleAccept(session._id)}
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleReject(session._id)}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {session.status === 'accepted' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleStartSession(session)}
                    >
                      Start Video Call
                    </button>
                  )}

                  {session.status === 'pending' && role === 'learner' && (
                    <p className="waiting-text">Waiting for teacher to accept...</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <p>No {filter !== 'all' ? filter : ''} sessions found</p>
          <p>Search for users to request learning sessions!</p>
        </div>
      )}
    </div>
  );
};

export default Sessions;
