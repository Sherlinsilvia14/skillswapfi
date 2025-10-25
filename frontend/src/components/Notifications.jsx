import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import socketService from '../services/socket';
import { showToast, timeAgo } from '../utils/helpers';
import './Notifications.css';

const Notifications = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    
    fetchNotifications();
    
    // Setup socket
    socketService.connect(user._id);
    socketService.onNewNotification((notification) => {
      setNotifications(prev => [notification, ...prev]);
      showToast(notification.message, 'info');
    });

    return () => {
      socketService.removeAllListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getNotifications();
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      showToast('All notifications marked as read', 'success');
    } catch (error) {
      showToast('Failed to mark all as read', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications(notifications.filter(n => n._id !== id));
      showToast('Notification deleted', 'success');
    } catch (error) {
      showToast('Failed to delete notification', 'error');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message': return '💬';
      case 'session_request': return '📅';
      case 'session_accepted': return '✅';
      case 'session_rejected': return '❌';
      case 'session_started': return '🎥';
      case 'achievement': return '🏆';
      case 'endorsement': return '⭐';
      case 'follow': return '👥';
      default: return '🔔';
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <button className="btn btn-secondary btn-sm" onClick={handleMarkAllAsRead}>
            Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : notifications.length > 0 ? (
        <div className="notifications-list">
          {notifications.map(notification => (
            <div
              key={notification._id}
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>

              <div className="notification-content">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <span className="notification-time">{timeAgo(notification.createdAt)}</span>
              </div>

              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(notification._id);
                }}
              >
                ×
              </button>

              {!notification.isRead && <div className="unread-dot"></div>}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔔</div>
          <p>No notifications yet</p>
          <p>You'll see updates about sessions, messages, and achievements here</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
