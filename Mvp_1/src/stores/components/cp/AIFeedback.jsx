import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaBullseye } from 'react-icons/fa';
import './AIFeedback.css'

const AIFeedback = ({ feedback }) => {
  if (!feedback) {
    return <p className="no-feedback">No feedback available</p>;
  }

  return (
    <div className="ai-feedback-wrapper">
      <h3 className="feedback-title">
        📊 Recruiter Feedback
      </h3>

      <div className="fit-overview">
        <strong>Fit Overview</strong>
        <p>{feedback.fit_overview}</p>
      </div>

      <div className="feedback-columns">
        <div className="feedback-column strengths">
          <div className="column-header">
            <FaCheckCircle className="icon" />
            <span>Strengths</span>
          </div>
          <ul>
            {feedback.strengths?.map((point, idx) => (
              <li key={idx}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="feedback-column development">
          <div className="column-header">
            <FaExclamationTriangle className="icon" />
            <span>Development Areas</span>
          </div>
          <ul>
            {feedback.development_areas?.map((point, idx) => (
              <li key={idx}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="feedback-column recommendations">
          <div className="column-header">
            <FaBullseye className="icon" />
            <span>Recommendations</span>
          </div>
          <ul>
            {feedback.recommendations?.map((point, idx) => (
              <li key={idx}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIFeedback;