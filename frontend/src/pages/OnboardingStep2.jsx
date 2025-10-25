import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { technicalSkills, nonTechnicalSkills } from '../utils/skillsData';
import './Onboarding.css';

const OnboardingStep2 = ({ onboardingData, setOnboardingData }) => {
  const [selectedSkills, setSelectedSkills] = useState(onboardingData.skillsToTeach || []);
  const [customSkill, setCustomSkill] = useState('');
  const navigate = useNavigate();

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleNext = () => {
    if (selectedSkills.length === 0) {
      alert('Please select at least one skill to teach');
      return;
    }

    setOnboardingData({
      ...onboardingData,
      skillsToTeach: selectedSkills
    });

    navigate('/onboarding/step3');
  };

  const handleBack = () => {
    navigate('/onboarding/step1');
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '66%' }}></div>
        </div>
        <div className="progress-steps">
          <div className="step completed">✓</div>
          <div className="step active">2</div>
          <div className="step">3</div>
        </div>
      </div>

      <div className="onboarding-content">
        <div className="onboarding-header">
          <h1>What can you teach?</h1>
          <p>Select skills you can share with others</p>
        </div>

        <div className="skills-section">
          <h3>Technical Skills</h3>
          <div className="skills-grid">
            {technicalSkills.map(skill => (
              <button
                key={skill}
                className={`skill-btn ${selectedSkills.includes(skill) ? 'selected' : ''}`}
                onClick={() => toggleSkill(skill)}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div className="skills-section">
          <h3>Non-Technical Skills</h3>
          <div className="skills-grid">
            {nonTechnicalSkills.map(skill => (
              <button
                key={skill}
                className={`skill-btn ${selectedSkills.includes(skill) ? 'selected' : ''}`}
                onClick={() => toggleSkill(skill)}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div className="custom-skill-section">
          <h3>Add Custom Skill</h3>
          <div className="custom-skill-input">
            <input
              type="text"
              className="input-field"
              placeholder="Enter a custom skill..."
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
            />
            <button className="btn btn-secondary" onClick={addCustomSkill}>
              Add
            </button>
          </div>
        </div>

        {selectedSkills.length > 0 && (
          <div className="selected-skills">
            <h4>Selected Skills ({selectedSkills.length})</h4>
            <div className="selected-skills-list">
              {selectedSkills.map(skill => (
                <div key={skill} className="selected-skill-tag">
                  <span>{skill}</span>
                  <button onClick={() => toggleSkill(skill)}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="onboarding-actions">
          <button className="btn btn-outline" onClick={handleBack}>
            Back
          </button>
          <button className="btn btn-primary" onClick={handleNext}>
            Next Step
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep2;
