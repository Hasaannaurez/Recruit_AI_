import React, { useState } from 'react';
import './Education.css';

const Education = ({ candidate }) => {
  const [showHighlights, setShowHighlights] = useState({});

  const toggleHighlights = (index) => {
    setShowHighlights(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="cp_e_education-section cp_e_section-box">
      <div className="cp_e_section-header">
        <h3 className="cp_e_section-title">🎓 Education</h3>
      </div>
      
      <div className="cp_e_highest-degree-badge">
        <span className="cp_e_badge-text">Highest Degree: {candidate.general_details?.highest_degree || 'Bachelor of Technology'}</span>
      </div>
      
      <div className="cp_e_education-list">
        {candidate.general_details?.education?.map((edu, index) => (
          <div key={index} className="cp_e_education-item">
            <div className="cp_e_degree-header">
              <h4 className="cp_e_degree-title">{edu.degree}</h4>
              <button 
                className="cp_e_show-more-btn"
                onClick={() => toggleHighlights(index)}
              >
                {showHighlights[index] ? 'Show Less' : 'Show More'}
                <svg 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className={`cp_e_rotate ${showHighlights[index] ? 'cp_e_rotate-up' : 'cp_e_rotate-down'}`}
                >
                  <polyline points="6,9 12,15 18,9"/>
                </svg>
              </button>
            </div>
            
            <div className="cp_e_edu-main-content">
              <div className="cp_e_edu-info">
                <p className="cp_e_institution">{edu.institution}</p>
                <div className="cp_e_edu-year">{edu.graduation_year}</div>
              </div>
              <div className="cp_e_grade-info">
                <span className="cp_e_grade-label">Grade:</span>
                <span className="cp_e_grade-value">{edu.grade}</span>
              </div>
            </div>
            
            {edu.highlights && showHighlights[index] && (
              <div className="cp_e_highlights cp_e_education-highlights">
                <h5 className="cp_e_highlights-title">Highlights:</h5>
                <ul className="cp_e_highlights-list">
                  {edu.highlights.map((highlight, idx) => (
                    <li key={idx} className="cp_e_highlight-item">{highlight}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )) || (
          // Fallback for when no education data is present
          <div className="cp_e_education-item">
            <div className="cp_e_degree-header">
              <h4 className="cp_e_degree-title">Bachelor of Technology in Computer Science</h4>
              <button 
                className="cp_e_show-more-btn"
                onClick={() => toggleHighlights(0)} // Use index 0 for fallback
              >
                {showHighlights[0] ? 'Show Less' : 'Show More'}
                <svg 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className={`cp_e_rotate ${showHighlights[0] ? 'cp_e_rotate-up' : 'cp_e_rotate-down'}`}
                >
                  <polyline points="6,9 12,15 18,9"/>
                </svg>
              </button>
            </div>
            
            <div className="cp_e_edu-main-content">
              <div className="cp_e_edu-info">
                <p className="cp_e_institution">Engineering College</p>
                <div className="cp_e_edu-year">2024</div>
              </div>
              <div className="cp_e_grade-info">
                <span className="cp_e_grade-label">Grade:</span>
                <span className="cp_e_grade-value">8.5</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Education;