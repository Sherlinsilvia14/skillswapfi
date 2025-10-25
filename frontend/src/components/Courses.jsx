import React, { useState, useEffect } from 'react';
import { courseAPI } from '../services/api';
import { showToast } from '../utils/helpers';
import './Courses.css';

const Courses = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
    fetchMyCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAllCourses();
      setCourses(response.data.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCourses = async () => {
    try {
      const response = await courseAPI.getMyCourses();
      setMyCourses(response.data.data);
    } catch (error) {
      console.error('Failed to fetch my courses:', error);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await courseAPI.enrollInCourse(courseId);
      showToast('Successfully enrolled in course!', 'success');
      fetchMyCourses();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to enroll', 'error');
    }
  };

  const displayedCourses = activeTab === 'all' ? courses : myCourses;

  return (
    <div className="courses-page">
      <div className="courses-header">
        <h1>Micro-Courses</h1>
        <p>Browse and enroll in structured learning content</p>
      </div>

      <div className="courses-tabs">
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Courses
        </button>
        <button
          className={`tab-btn ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
        >
          My Courses
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : displayedCourses.length > 0 ? (
        <div className="courses-grid">
          {displayedCourses.map(course => (
            <div key={course._id} className="course-card">
              <div className="course-header">
                <h3>{course.title}</h3>
                <span className={`level-badge ${course.level}`}>
                  {course.level}
                </span>
              </div>

              <p className="course-description">{course.description}</p>

              <div className="course-meta">
                <div className="meta-item">
                  <span>📚</span>
                  <span>{course.skill}</span>
                </div>
                <div className="meta-item">
                  <span>👨‍🏫</span>
                  <span>{course.instructor?.name}</span>
                </div>
                <div className="meta-item">
                  <span>📝</span>
                  <span>{course.content?.length || 0} lessons</span>
                </div>
                <div className="meta-item">
                  <span>⭐</span>
                  <span>{course.rating?.toFixed(1) || '0.0'}</span>
                </div>
              </div>

              {activeTab === 'my' && course.myProgress !== undefined && (
                <div className="course-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${course.myProgress}%` }}
                    ></div>
                  </div>
                  <p>{course.myProgress}% Complete</p>
                </div>
              )}

              <div className="course-actions">
                {activeTab === 'all' ? (
                  <button
                    className="btn btn-primary btn-full"
                    onClick={() => handleEnroll(course._id)}
                  >
                    Enroll Now
                  </button>
                ) : (
                  <button className="btn btn-primary btn-full">
                    Continue Learning
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>
            {activeTab === 'all' 
              ? 'No courses available yet' 
              : 'You haven\'t enrolled in any courses yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Courses;
