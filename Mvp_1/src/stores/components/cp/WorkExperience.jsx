import React, { useState } from 'react';
import { FaSuitcase } from 'react-icons/fa'; // Icon for Work Experience
import './WorkExperience.css';

const WorkExperience = ({ workExperience }) => {
  if (!workExperience || workExperience.length === 0) {
    return <p className="cp_no-experience">No work experience details available.</p>;
  }

  return (
    <div className="cp_work-experience-wrapper">
      <h3 className="cp_section-title">
        💼 Work Experience
      </h3>
      {workExperience.map((exp, index) => (
        <ExperienceCard key={exp.job_title + index} experience={exp} />
      ))}
    </div>
  );
};

const ExperienceCard = ({ experience }) => {
  const [showFullDetails, setShowFullDetails] = useState(false);

  const toggleDetails = () => {
    setShowFullDetails(!showFullDetails);
  };

  const hasHighlightsContent = experience.highlights && experience.highlights.length > 0 && experience.highlights[0] !== "";
  const hasAchievementsContent = experience.achievements && experience.achievements.length > 0 && experience.achievements[0] !== "";

  const shouldShowToggleButton = hasHighlightsContent || hasAchievementsContent;

  return (
    <div className="cp_experience-card">
      <div className="cp_experience-header">
        <div>
          <h4 className="cp_job-title">{experience.job_title}</h4>
          <p className="cp_company-info">
            {experience.company} <span className="cp_duration"> | {experience.duration}</span>
          </p>
        </div>
        {shouldShowToggleButton && (
          <button className="cp_toggle-button" onClick={toggleDetails}>
            {showFullDetails ? 'Show Less' : 'Show More'}
            <span className={`cp_arrow ${showFullDetails ? 'up' : 'down'}`}></span>
          </button>
        )}
      </div>

      {experience.technologies && experience.technologies.length > 0 && (
        <div className="cp_technologies-list">
          {experience.technologies.map((tech, idx) => (
            <span key={idx} className="cp_technology-tag">{tech}</span>
          ))}
        </div>
      )}

      {showFullDetails && (hasHighlightsContent || hasAchievementsContent) && (
        <div className="cp_expanded-details-section">
          {hasHighlightsContent && (
            <div className="cp_key-highlights">
              <strong>Key Highlights:</strong>
              <ul>
                {experience.highlights.map((highlight, idx) => (
                  <li key={idx}>{highlight}</li>
                ))}
              </ul>
            </div>
          )}

          {hasAchievementsContent && (
            <div className="cp_additional-achievements">
              <strong>Additional Achievements:</strong>
              <ul>
                {experience.achievements.map((achievement, idx) => (
                  <li key={idx}>{achievement}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkExperience;