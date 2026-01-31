import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://skillswapfi-1.onrender.com/api';



// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// User API
export const userAPI = {
  completeOnboarding: (data) => api.post('/users/onboarding', data),
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  searchUsers: (data) => api.post('/users/search', data),
  followUser: (id) => api.post(`/users/${id}/follow`),
  unfollowUser: (id) => api.post(`/users/${id}/unfollow`),
  endorseSkill: (id, skill) => api.post(`/users/${id}/endorse`, { skill }),
  getLeaderboard: () => api.get('/users/leaderboard')
};

// Session API
export const sessionAPI = {
  createSession: (data) => api.post('/sessions', data),
  getUserSessions: () => api.get('/sessions'),
  updateSession: (id, data) => api.put(`/sessions/${id}`, data),
  completeSession: (id, data) => api.post(`/sessions/${id}/complete`, data),
  startSession: (id) => api.post(`/sessions/${id}/start`)
};

// Message API
export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getChatHistory: (userId) => api.get(`/messages/${userId}`),
  sendMessage: (data) => api.post('/messages', data),
  markAsRead: (userId) => api.put(`/messages/${userId}/read`)
};

// Quiz API
export const quizAPI = {
  getQuizzes: (skill) => api.get('/quizzes', { params: { skill } }),
  getQuizById: (id) => api.get(`/quizzes/${id}`),
  submitQuiz: (id, answers) => api.post(`/quizzes/${id}/submit`, { answers }),
  getUserResults: () => api.get('/quizzes/results')
};

// Course API
export const courseAPI = {
  getAllCourses: (params) => api.get('/courses', { params }),
  getCourseById: (id) => api.get(`/courses/${id}`),
  createCourse: (data) => api.post('/courses', data),
  enrollInCourse: (id) => api.post(`/courses/${id}/enroll`),
  updateProgress: (id, progress) => api.put(`/courses/${id}/progress`, { progress }),
  getMyCourses: () => api.get('/courses/my-courses')
};

// Notification API
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`)
};

export default api;
