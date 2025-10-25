import React, { useState, useEffect, useRef } from 'react';
import { authAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import DashboardHome from '../components/DashboardHome';
import Chat from '../components/Chat';
import Profile from '../components/Profile';
import SearchUsers from '../components/SearchUsers';
import Sessions from '../components/Sessions';
import Quizzes from '../components/Quizzes';
import Courses from '../components/Courses';
import Leaderboard from '../components/Leaderboard';
import Notifications from '../components/Notifications';
import './Dashboard.css';

const Dashboard = ({ user, setUser }) => {
  const [currentView, setCurrentView] = useState('home');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const hasFetched = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Absolutely only fetch once
    if (hasFetched.current) {
      console.log('Already fetched, skipping...');
      return;
    }
    
    console.log('Fetching user data...');
    hasFetched.current = true;

    const fetchUserData = async () => {
      try {
        const response = await authAPI.getMe();
        console.log('User data fetched successfully');
        
        if (isMounted.current) {
          setUserData(response.data.data);
          // DON'T call setUser here - it causes re-render loop
          localStorage.setItem('user', JSON.stringify(response.data.data));
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartChat = (user) => {
    setSelectedChatUser(user);
    setCurrentView('chat');
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <DashboardHome user={userData} />;
      case 'chat':
        return <Chat user={userData} selectedChatUser={selectedChatUser} />;
      case 'profile':
        return <Profile user={userData} />;
      case 'search':
        return <SearchUsers user={userData} onStartChat={handleStartChat} />;
      case 'sessions':
        return <Sessions user={userData} />;
      case 'quizzes':
        return <Quizzes user={userData} />;
      case 'courses':
        return <Courses user={userData} />;
      case 'leaderboard':
        return <Leaderboard user={userData} />;
      case 'notifications':
        return <Notifications user={userData} />;
      default:
        return <DashboardHome user={userData} />;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar
        user={userData}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
      <div className="dashboard-main">
        {renderView()}
      </div>
    </div>
  );
};

export default Dashboard;
