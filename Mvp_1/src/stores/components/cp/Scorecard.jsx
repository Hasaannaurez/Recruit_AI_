import React, { useState } from 'react';
import { FaChartBar } from 'react-icons/fa'; // Icon for Score Breakdown
import DetailedScoreModal from './DetailedScoreModal'; // Import the modal component
import './Scorecard.css'; // Make sure this path is correct

const Scorecard = ({ scoreDetails, scoresLookup }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!scoreDetails) {
    return <p className="cp_no-scorecard">No score details available.</p>;
  }

  // Get individual breakdown scores, excluding 'o_score'
  const breakdownScores = Object.entries(scoreDetails).filter(([key]) => key !== 'o_score');

  // Function to determine the bar color based on score (optimized for 40-80 range)
  const getBarColor = (score) => {
    if (score >= 85) return 'cp_score-bar-excellent';    // 85-100: Excellent (Bright Green)
    if (score >= 75) return 'cp_score-bar-good';         // 75-84: Good (Green)
    if (score >= 65) return 'cp_score-bar-above-avg';    // 65-74: Above Average (Light Green)
    if (score >= 55) return 'cp_score-bar-average';      // 55-64: Average (Yellow)
    if (score >= 45) return 'cp_score-bar-below-avg';    // 45-54: Below Average (Orange)
    if (score >= 35) return 'cp_score-bar-poor';         // 35-44: Poor (Red-Orange)
    return 'cp_score-bar-very-poor';                     // 0-34: Very Poor (Red)
  };

  return (
    <div className="cp_scorecard-wrapper">
      <div className="cp_scorecard-header">
        <h3 className="cp_scorecard-title">
          📊 Score Breakdown
        </h3>
        <button className="cp_view-details-button" onClick={() => setIsModalOpen(true)}>
          View Details
        </button>
      </div>

      <div className="cp_overall-score-section">
        <div className="cp_overall-score-value">
          {scoreDetails.o_score ? scoreDetails.o_score.toFixed(1) : 'N/A'}
        </div>
        <div className="cp_overall-score-label">Overall Score</div>
      </div>

      <div className="cp_score-breakdown-bars">
        {breakdownScores.map(([category, score]) => (
          <div key={category} className="cp_score-category">
            <div className="cp_score-category-label">{category}</div>
            <div className="cp_score-bar-container">
              <div className="cp_score-bar-background">
                <div
                  className={`cp_score-bar ${getBarColor(score)}`}
                  style={{ width: `${score}%` }}
                ></div>
              </div>
              <div className="cp_score-value">{score.toFixed(1)}</div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <DetailedScoreModal
          scoresLookup={scoresLookup}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Scorecard;