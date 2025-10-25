import React, { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../services/api';
import { getInitials } from '../utils/helpers';
import './Sidebar.css';

const Sidebar = memo(({ user, currentView, setCurrentView }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    
    const fetchNotifications = async () => {
      try {
        const response = await notificationAPI.getNotifications();
        if (mounted && response.data.unreadCount !== undefined) {
          setUnreadCount(response.data.unreadCount);
        }
      } catch (error) {
        // Silently fail - notifications are not critical
        console.error('Failed to fetch notifications:', error);
      }
    };
    
    // Only fetch once on mount
    fetchNotifications();
    
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { id: 'home', icon: '🏠', label: 'Dashboard' },
    { id: 'search', icon: '🔍', label: 'Search Users' },
    { id: 'sessions', icon: '📅', label: 'Sessions' },
    { id: 'chat', icon: '💬', label: 'Chat' },
    { id: 'quizzes', icon: '📝', label: 'Quizzes' },
    { id: 'courses', icon: '📚', label: 'Courses' },
    { id: 'leaderboard', icon: '🏆', label: 'Leaderboard' },
    { id: 'notifications', icon: '🔔', label: 'Notifications', badge: unreadCount },
    { id: 'profile', icon: '👤', label: 'Profile' }
  ];

  return (
    <>
      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        ☰
      </button>

      <div className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">🔄</span>
            <span className="logo-text">SkillSwap</span>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.name} />
            ) : (
              <div className="avatar-placeholder">
                {getInitials(user?.name)}
              </div>
            )}
          </div>
          <div className="user-info">
            <h3>{user?.name}</h3>
            <span className="user-level" style={{ 
              background: user?.level === 'Expert' ? '#EF4444' : 
                         user?.level === 'Intermediate' ? '#F59E0B' : '#10B981' 
            }}>
              {user?.level}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => {
                setCurrentView(item.id);
                setIsMobileOpen(false);
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {isMobileOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
});

export default Sidebar;
