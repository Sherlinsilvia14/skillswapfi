import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import OnboardingStep1 from './pages/OnboardingStep1';
import OnboardingStep2 from './pages/OnboardingStep2';
import OnboardingStep3 from './pages/OnboardingStep3';
import Dashboard from './pages/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [onboardingData, setOnboardingData] = useState({
    skillsToLearn: [],
    skillsToTeach: [],
    schedule: {
      timePreferences: [],
      daysOfWeek: []
    }
  });

  useEffect(() => {
    // Check if user is logged in - only run once on mount
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  const OnboardingRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token) {
      return <Navigate to="/login" />;
    }

    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.completedOnboarding) {
        return <Navigate to="/dashboard" />;
      }
    }

    return children;
  };

  const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.completedOnboarding) {
          return <Navigate to="/dashboard" replace />;
        } else {
          return <Navigate to="/onboarding/step1" replace />;
        }
      } catch (error) {
        // Invalid stored user, stay on public page
        console.error('Invalid stored user:', error);
      }
    }

    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login setUser={setUser} />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register setUser={setUser} />
            </PublicRoute>
          }
        />

        {/* Onboarding Routes */}
        <Route
          path="/onboarding/step1"
          element={
            <OnboardingRoute>
              <OnboardingStep1
                onboardingData={onboardingData}
                setOnboardingData={setOnboardingData}
              />
            </OnboardingRoute>
          }
        />
        <Route
          path="/onboarding/step2"
          element={
            <OnboardingRoute>
              <OnboardingStep2
                onboardingData={onboardingData}
                setOnboardingData={setOnboardingData}
              />
            </OnboardingRoute>
          }
        />
        <Route
          path="/onboarding/step3"
          element={
            <OnboardingRoute>
              <OnboardingStep3
                onboardingData={onboardingData}
                setOnboardingData={setOnboardingData}
                setUser={setUser}
              />
            </OnboardingRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard key="dashboard-main" user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
