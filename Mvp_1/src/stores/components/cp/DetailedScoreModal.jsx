import React from 'react';
import './DetailedScoreModal.css';

const DetailedScoreModal = ({ scoresLookup, onClose }) => {
  // Function to determine the bar color based on score (same as Scorecard)
  const getBarColor = (score) => {
    if (score >= 85) return 'cp_score-bar-excellent';    // 85-100: Excellent (Bright Green)
    if (score >= 75) return 'cp_score-bar-good';         // 75-84: Good (Green)
    if (score >= 65) return 'cp_score-bar-above-avg';    // 65-74: Above Average (Light Green)
    if (score >= 55) return 'cp_score-bar-average';      // 55-64: Average (Yellow)
    if (score >= 45) return 'cp_score-bar-below-avg';    // 45-54: Below Average (Orange)
    if (score >= 35) return 'cp_score-bar-poor';         // 35-44: Poor (Red-Orange)
    return 'cp_score-bar-very-poor';                     // 0-34: Very Poor (Red)
  };

  // Function to get text color for score value
  const getScoreTextColor = (score) => {
    if (score >= 85) return '#16a34a'; // Green
    if (score >= 75) return '#16a34a'; // Green
    if (score >= 65) return '#65a30d'; // Dark Green
    if (score >= 55) return '#ca8a04'; // Dark Yellow
    if (score >= 45) return '#ea580c'; // Dark Orange
    if (score >= 35) return '#dc2626'; // Red
    return '#dc2626'; // Red
  };

  if (!scoresLookup) {
    return null;
  }

  // Convert scores_lookup object to array of entries
  const scoreEntries = Object.entries(scoresLookup);

  return (
    <div className="cp_modal-overlay" onClick={onClose}>
      <div className="cp_modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="cp_modal-header">
          <h2 className="cp_modal-title">Detailed Score Breakdown</h2>
          <button className="cp_modal-close-button" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="cp_modal-content">
          <div className="cp_detailed-scores-grid">
            {scoreEntries.map(([criterion, score], index) => (
              <div key={index} className="cp_score-item">
                <div className="cp_score-criterion">
                  {criterion}
                </div>
                <div className="cp_score-display">
                  <span 
                    className="cp_score-value"
                    style={{ color: getScoreTextColor(score) }}
                  >
                    {score}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedScoreModal;