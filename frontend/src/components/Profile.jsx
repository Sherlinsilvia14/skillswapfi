import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { showToast, getInitials } from '../utils/helpers';
import './Profile.css';

const Profile = ({ user, refreshUser = () => {} }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    contactNumber: user?.contactNumber || '',
    city: user?.city || '',
    bio: user?.bio || '',
    profileImage: user?.profileImage || ''
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || '');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    setUploadingImage(true);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagePreview(base64String);
        setFormData({
          ...formData,
          profileImage: base64String
        });
        setUploadingImage(false);
        showToast('Image uploaded! Click Save Changes to update.', 'success');
      };
      reader.onerror = () => {
        showToast('Failed to read image file', 'error');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Image upload error:', error);
      showToast('Failed to upload image', 'error');
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setFormData({
      ...formData,
      profileImage: ''
    });
    showToast('Image removed', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.updateProfile(formData);
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
      if (refreshUser) refreshUser();
    } catch (error) {
      console.error('Update profile error:', error);
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        {!isEditing && (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-banner">
            <div className="profile-avatar-large">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} />
              ) : (
                <div className="avatar-placeholder-large">
                  {getInitials(user.name)}
                </div>
              )}
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group image-upload-section">
                <label>Profile Picture</label>
                <div className="image-upload-container">
                  <div className="image-preview">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Profile preview" />
                    ) : (
                      <div className="no-image-placeholder">
                        <span>📷</span>
                        <p>No image selected</p>
                      </div>
                    )}
                  </div>
                  <div className="image-upload-actions">
                    <label htmlFor="image-upload" className="btn btn-secondary">
                      {uploadingImage ? 'Uploading...' : '📁 Choose Image'}
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      disabled={uploadingImage}
                    />
                    {imagePreview && (
                      <button
                        type="button"
                        className="btn btn-danger-outline"
                        onClick={handleRemoveImage}
                      >
                        🗑️ Remove
                      </button>
                    )}
                  </div>
                  <p className="image-upload-hint">
                    Supported formats: JPG, PNG, GIF (any size)
                  </p>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    className="input-field"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    className="input-field"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    className="input-field"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    className="input-field"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  className="input-field"
                  rows="4"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                />
              </div>


              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <h2>{user.name}</h2>
              <p className="profile-level" style={{
                background: user.level === 'Expert' ? '#EF4444' :
                           user.level === 'Intermediate' ? '#F59E0B' : '#10B981'
              }}>
                {user.level}
              </p>

              {user.bio && <p className="profile-bio">{user.bio}</p>}

              <div className="profile-details">
                <div className="detail-item">
                  <span className="detail-icon">📧</span>
                  <span>{user.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📱</span>
                  <span>{user.contactNumber}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📍</span>
                  <span>{user.city}</span>
                </div>
              </div>

              <div className="profile-stats">
                <div className="stat-box">
                  <h3>{user.stats?.totalHoursTaught || 0}</h3>
                  <p>Hours Taught</p>
                </div>
                <div className="stat-box">
                  <h3>{user.stats?.totalHoursLearned || 0}</h3>
                  <p>Hours Learned</p>
                </div>
                <div className="stat-box">
                  <h3>{user.stats?.rating?.toFixed(1) || '0.0'}</h3>
                  <p>Rating</p>
                </div>
                <div className="stat-box">
                  <h3>{user.stats?.points || 0}</h3>
                  <p>Points</p>
                </div>
              </div>

              <div className="profile-section">
                <h3>Skills to Learn</h3>
                <div className="skills-display">
                  {user.skillsToLearn?.map((skill, index) => (
                    <span key={index} className="skill-badge learn">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="profile-section">
                <h3>Skills to Teach</h3>
                <div className="skills-display">
                  {user.skillsToTeach?.map((skill, index) => (
                    <span key={index} className="skill-badge teach">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="profile-section">
                <h3>Endorsements ({user.endorsements?.length || 0})</h3>
                {user.endorsements?.length > 0 ? (
                  <div className="endorsements-list">
                    {user.endorsements.map((endorsement, index) => (
                      <div key={index} className="endorsement-item">
                        <strong>{endorsement.skill}</strong>
                        <span>endorsed by {endorsement.endorsedBy?.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-text">No endorsements yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
